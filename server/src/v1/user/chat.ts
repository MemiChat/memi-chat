import { Hono } from "hono";
import {
  addChatMessageSchema,
  Env,
  newAgentsChatMessageSchema,
  newChatMessageSchema,
  newChatSchema,
  updateMemorySchema,
} from "../../validator";
import { rateLimiter } from "../../middleware";
import ms from "ms";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { streamSSE } from "hono/streaming";
import {
  formatValidationErrors,
  generateChatTitle,
  saveSystemMessage,
  saveUserMessage,
  updateMessageText,
  extractAllUrlsFromMarkdownMessage,
  saveMessage,
  extractYouTubeURL,
  truncateMessage,
  generateMemory,
  getUserMemory,
  appendAgentHeader,
  getSelectedAI,
} from "../../utils";
import { zValidator } from "@hono/zod-validator";
import {
  GENERIC_ERROR_MESSAGE,
  GENERIC_SUCCESS_MESSAGE,
  STREAM_ERROR,
  AGENT_CONSECUTIVE_STREAM_ERROR,
  AGENT_STREAM_ERROR,
} from "../../helper";
import { drizzle } from "drizzle-orm/postgres-js";
import { chat, chatMessage } from "../../db/schema";
import { and, asc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";

const app = new Hono<Env>()
  .use(
    rateLimiter({
      windowMs: ms("10 minutes"),
      max: 100,
    })
  )
  .get("/all", async (c) => {
    const userPayload = c.get("jwtPayload");
    const db = drizzle(c.env.HYPERDRIVE.connectionString);
    const chats = await db
      .select({
        id: chat.id,
        title: chat.title,
        createdAt: chat.createdAt,
      })
      .from(chat)
      .orderBy(asc(chat.createdAt)) // we reverse the order in the client
      .where(eq(chat.userId, userPayload.id));

    return c.json({ message: GENERIC_SUCCESS_MESSAGE, chats }, 200);
  })
  .get("/:chatId/messages", async (c) => {
    const chatId = c.req.param("chatId");
    const db = drizzle(c.env.HYPERDRIVE.connectionString);
    const messages = await db
      .select()
      .from(chatMessage)
      .orderBy(asc(chatMessage.createdAt))
      .where(eq(chatMessage.chatId, chatId));

    return c.json({ message: GENERIC_SUCCESS_MESSAGE, messages }, 200);
  })
  .delete("/:chatId", async (c) => {
    const userPayload = c.get("jwtPayload");
    const chatId = c.req.param("chatId");
    const db = drizzle(c.env.HYPERDRIVE.connectionString);
    await db
      .delete(chat)
      .where(and(eq(chat.id, chatId), eq(chat.userId, userPayload.id)));
    return c.json({ message: GENERIC_SUCCESS_MESSAGE }, 200);
  })
  .get("/:chatId/title", async (c) => {
    const userPayload = c.get("jwtPayload");
    const chatId = c.req.param("chatId");
    const db = drizzle(c.env.HYPERDRIVE.connectionString);
    const title = await db
      .select()
      .from(chat)
      .where(and(eq(chat.id, chatId), eq(chat.userId, userPayload.id)));
    if (title.length === 0) {
      return c.json({ message: GENERIC_ERROR_MESSAGE }, 404);
    }
    return c.json(
      { message: GENERIC_SUCCESS_MESSAGE, title: title[0].title },
      200
    );
  })
  .post(
    "/new",
    zValidator("json", newChatSchema, formatValidationErrors),
    async (c) => {
      const userPayload = c.get("jwtPayload");
      const data = c.req.valid("json");
      const prompt = data.prompt;
      const chatId = data.chatId;

      const db = drizzle(c.env.HYPERDRIVE.connectionString);
      await db.insert(chat).values({
        id: chatId,
        userId: userPayload.id,
        title: "New Chat",
      });
      c.executionCtx.waitUntil(generateChatTitle(c, chatId, prompt));

      return c.json({ message: GENERIC_SUCCESS_MESSAGE, chat: chatId }, 200);
    }
  )
  .post(
    "/add/message",
    zValidator("json", addChatMessageSchema, formatValidationErrors),
    async (c) => {
      const data = c.req.valid("json");
      await saveMessage(c, data.chatId, data.id, data.role, data.text);
      return c.json({ message: GENERIC_SUCCESS_MESSAGE }, 200);
    }
  )
  .post(
    "/stream/message",
    zValidator("json", newChatMessageSchema, formatValidationErrors),
    async (c) => {
      //const userPayload = c.get("jwtPayload");
      const data = c.req.valid("json");
      const prompt = data.prompt;
      const youtubeUrl = extractYouTubeURL(prompt);
      //const userMemory = await getUserMemory(c, userPayload.id);

      let history: any[] = [];
      const contents: any[] = [];
      /*
      // doesnt work well
      // when model is supposed to generate image
      if (userMemory) {
        contents.push({
          text: `Do not mention user memory unless asked. ${userMemory}`,
        });
      }
      */
      contents.push({ text: prompt });
      const genAI = new GoogleGenerativeAI(c.env.GEMINI_API_KEY);
      let model = null;

      if (youtubeUrl) {
        model = genAI.getGenerativeModel({
          model: "gemini-2.0-flash",
        });
        contents.push({
          fileData: {
            fileUri: youtubeUrl,
          },
        });
      } else {
        const generationConfig = {
          responseModalities: ["Text", "Image"],
        } as any;
        model = genAI.getGenerativeModel({
          model: "gemini-2.0-flash-exp-image-generation",
          generationConfig,
        });
      }

      if (data.lastMessage && !youtubeUrl) {
        const urls = extractAllUrlsFromMarkdownMessage(
          data.lastMessage.text,
          c.env.API_URL
        );
        let addHistory = true;
        if (urls.length > 0) {
          const url = urls[urls.length - 1];
          const key = url.split("/").pop();
          if (key) {
            const object = await c.env.BUCKET.get(key);
            if (object) {
              addHistory = false;

              const headers = new Headers();
              object.writeHttpMetadata(headers);
              const mimeType = headers.get("content-type");

              const arrayBuffer = await object.arrayBuffer();
              const buffer = Buffer.from(arrayBuffer);

              contents.push({
                inlineData: {
                  mimeType: mimeType,
                  data: buffer.toString("base64"),
                },
              });
            }
          }
        }

        if (addHistory) {
          // model hallucinates that he is supposed to
          // add text instead of image then we end up
          // with fake url of an image and him showing it as markdown text
          // instead of actually generating an image
          history = data.history;
        }
      }
      const chat = model.startChat({
        history: history,
      });

      await saveUserMessage(c, data.chatId, data.userMessageId, prompt);
      await saveSystemMessage(c, data.chatId, data.systemMessageId);

      return streamSSE(c, async (stream) => {
        const abortController = new AbortController();
        const { signal } = abortController;
        stream.onAbort(() => {
          abortController.abort();
        });
        let result: any = { stream: [] };
        try {
          result = await chat.sendMessageStream(contents, { signal });
        } catch (error) {
          if (signal.aborted) {
            return;
          }
          const chunkText = STREAM_ERROR;
          await stream.writeSSE({
            data: chunkText,
          });
          c.executionCtx.waitUntil(
            updateMessageText(c, data.systemMessageId, chunkText)
          );
          return;
        }

        for await (const chunk of result.stream) {
          if (chunk.candidates) {
            const content = chunk.candidates[0].content;
            if (content.parts) {
              for (const part of content.parts) {
                if (part.inlineData) {
                  const imageData = part.inlineData.data;
                  const buffer = Buffer.from(imageData, "base64");
                  const key = `${nanoid()}.webp`;
                  await c.env.BUCKET.put(key, buffer, {
                    httpMetadata: {
                      contentType: "image/webp",
                    },
                  });
                  const chunkText = `\n![image](${c.env.API_URL}/v1/public/files/file/${key})\n`;
                  if (!signal.aborted) {
                    await stream.writeSSE({
                      data: chunkText,
                    });
                    c.executionCtx.waitUntil(
                      updateMessageText(c, data.systemMessageId, chunkText)
                    );
                  }
                } else {
                  const chunkText = part.text;
                  if (chunkText && !signal.aborted) {
                    c.executionCtx.waitUntil(
                      updateMessageText(c, data.systemMessageId, chunkText)
                    );
                    await stream.writeSSE({
                      data: chunkText,
                    });
                  }
                }
              }
            }
          } else {
            if (!signal.aborted) {
              const chunkText = STREAM_ERROR;
              await stream.writeSSE({
                data: chunkText,
              });
              c.executionCtx.waitUntil(
                updateMessageText(c, data.systemMessageId, chunkText)
              );
              return;
            }
          }
        }
      });
    }
  )
  .post(
    "/stream/agent/message",
    zValidator("json", newAgentsChatMessageSchema, formatValidationErrors),
    async (c) => {
      const userPayload = c.get("jwtPayload");
      const data = c.req.valid("json");
      const prompt = data.prompt;
      const agent = data.agent;
      const youtubeUrl = extractYouTubeURL(prompt);
      let userMemory = await getUserMemory(c, userPayload.id);
      if (userMemory) {
        userMemory = userMemory.replace(/^```markdown/, "").replace(/```$/, "");
      } else {
        userMemory = "We currently have no memory of the user";
      }

      const contents: any[] = [];
      contents.push({ text: prompt });
      const genAI = new GoogleGenerativeAI(c.env.GEMINI_API_KEY);
      let systemPrompt = `This is what you know about the user ${userMemory}. Do not include thoughts in your response. You are ${agent.name}. Act as ${agent.name}. Only reply as ${agent.name}. ${agent.prompt}`;
      if (agent.consecutiveReply) {
        systemPrompt =
          "Reflect back on chat history and give alternative response make sure it's different from the previous response. " +
          systemPrompt;
      }
      const model = genAI.getGenerativeModel({
        model: getSelectedAI(data.selectedAI),
        systemInstruction: systemPrompt,
        generationConfig: {
          responseMimeType: "text/plain",
        },
      });
      const chat = model.startChat({
        history: data.history,
      });

      if (youtubeUrl) {
        contents.push({
          fileData: {
            fileUri: youtubeUrl,
          },
        });
      }

      if (data.lastMessage && !youtubeUrl) {
        const urls = extractAllUrlsFromMarkdownMessage(
          data.lastMessage.text,
          c.env.API_URL
        );
        if (urls.length > 0) {
          const url = urls[urls.length - 1];
          const key = url.split("/").pop();
          if (key) {
            const object = await c.env.BUCKET.get(key);
            if (object) {
              const headers = new Headers();
              object.writeHttpMetadata(headers);
              const mimeType = headers.get("content-type");

              const arrayBuffer = await object.arrayBuffer();
              const buffer = Buffer.from(arrayBuffer);

              contents.push({
                inlineData: {
                  mimeType: mimeType,
                  data: buffer.toString("base64"),
                },
              });
            }
          }
        }
      }

      if (data.userMessageId) {
        await saveUserMessage(c, data.chatId, data.userMessageId, prompt);
      }
      await saveSystemMessage(c, data.chatId, data.systemMessageId);

      return streamSSE(c, async (stream) => {
        const abortController = new AbortController();
        const { signal } = abortController;
        stream.onAbort(() => {
          abortController.abort();
        });
        let result = "";
        try {
          let resp = await chat.sendMessage(contents, { signal });
          result = data.talkMore
            ? resp.response.text()
            : truncateMessage(resp.response.text());
          if (!result) {
            resp = await chat.sendMessage(contents, { signal });
            result = resp.response.text();
          }
          if (!result) {
            result = STREAM_ERROR;
          }
          // <ctrl3347> shows when its a thought
          if (result.includes("<ctrl3347>")) {
            if (agent.consecutiveReply) {
              result = AGENT_CONSECUTIVE_STREAM_ERROR;
            } else {
              result = AGENT_STREAM_ERROR;
            }
          }
          //if (result.includes("**Response:**")) {
          //  result = result.split("**Response:**")[1];
          //}
        } catch (error) {
          if (signal.aborted) {
            return;
          }
          if (agent.consecutiveReply) {
            result = AGENT_CONSECUTIVE_STREAM_ERROR;
          } else {
            result = AGENT_STREAM_ERROR;
          }
          console.log(error);
        }
        result = appendAgentHeader(result, agent.name);

        if (!signal.aborted) {
          c.executionCtx.waitUntil(
            updateMessageText(c, data.systemMessageId, result)
          );
          await stream.writeSSE({
            data: result,
          });
        }
      });
    }
  )
  .post(
    "/update/memory",
    zValidator("json", updateMemorySchema, formatValidationErrors),
    async (c) => {
      const userPayload = c.get("jwtPayload");
      const data = c.req.valid("json");
      await generateMemory(c, data.history, userPayload.id);

      return c.json({
        message: GENERIC_SUCCESS_MESSAGE,
      });
    }
  );

export default app;
