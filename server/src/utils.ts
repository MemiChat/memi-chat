import { Context } from "hono";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { drizzle } from "drizzle-orm/postgres-js";
import { chat, chatMessage, userMemories } from "./db/schema";
import { eq } from "drizzle-orm";
import {
  ALL_MARKDOWN_URL_REGEX,
  GENERATE_PERSONA_PROMPT,
  NEW_CHAT_TITLE_PROMPT,
  SYSTEM_ROLE,
  USER_ROLE,
  AGENT_HEADER_REGEX,
  AGENT_HEADER_REGEX_GLOBAL,
} from "./helper";
import striptags from "striptags";
import { marked } from "marked";
import { Resend } from "resend";

export function getSelectedAI(ai: string) {
  if (ai === "Think More") {
    return "gemini-2.5-pro-exp-03-25";
  } else if (ai === "Think Fast") {
    return "gemini-2.0-flash-thinking-exp";
  } else {
    return "gemini-2.0-flash";
  }
}

export function appendAgentHeader(result: string, agentName: string) {
  // First ensure newlines before all headers if needed
  result = result.replace(
    AGENT_HEADER_REGEX_GLOBAL,
    (match, capture, offset) => {
      // If not at beginning and no newline before it, add one
      return offset > 0 && result[offset - 1] !== "\n" ? "\n" + match : match;
    }
  );

  // Then handle the agent name replacement only for the first occurrence
  if (AGENT_HEADER_REGEX.test(result)) {
    // Replace only first occurrence with current agent's name
    result = result.replace(AGENT_HEADER_REGEX, `### ***${agentName}***`);
  } else {
    // No header exists, add new one at beginning
    result = `### ***${agentName}***\n${result}`;
  }

  return result;
}

export function normalizeString(str: string) {
  return str.toLowerCase().trim();
}

export async function getUserMemory(c: Context, userId: number | string) {
  const db = drizzle(c.env.HYPERDRIVE.connectionString);
  const userMemory = await db
    .select()
    .from(userMemories)
    .where(eq(userMemories.userId, Number(userId)))
    .limit(1);
  if (userMemory.length > 0) {
    return userMemory[0].memory;
  }
  return null;
}

export async function generateMemory(
  c: Context,
  history: any[],
  userId: number | string
) {
  const db = drizzle(c.env.HYPERDRIVE.connectionString);
  const genAI = new GoogleGenerativeAI(c.env.GEMINI_API_KEY);
  let userMemory = "We currently have no memory of the user.";
  let userMemoryId = null;
  try {
    const currentUserMemory = await db
      .select()
      .from(userMemories)
      .where(eq(userMemories.userId, Number(userId)))
      .limit(1);
    if (currentUserMemory.length > 0) {
      userMemory = currentUserMemory[0].memory;
      userMemoryId = currentUserMemory[0].id;
      const currentUserMemoryUpdatedAt = currentUserMemory[0].updatedAt;
      if (Date.now() - currentUserMemoryUpdatedAt.getTime() < 1000 * 60 * 5) {
        // less 5 minutes skip
        return;
      }
    }
  } catch (error) {
    console.log(`Error fetching user memory: ${error}`);
  }
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-thinking-exp",
    systemInstruction: `Reflect back on chat history and construct user memory. This should include who is the user, what user likes, dislikes and thinks. Consider current user memory and give updated memory. Current user memory: ${userMemory}. Do not include chat history in memory. Reply only with memory in markdown format or plain text.`,
  });
  const chat = model.startChat({
    history: history.filter((h) => h.role === USER_ROLE),
  });
  const contents: any[] = [{ text: "" }];
  try {
    const result = await chat.sendMessage(contents);
    const newUserMemory = result.response.text();
    if (userMemoryId) {
      await db
        .update(userMemories)
        .set({
          memory: newUserMemory,
          updatedAt: new Date(),
        })
        .where(eq(userMemories.id, userMemoryId));
    } else {
      await db.insert(userMemories).values({
        userId: Number(userId),
        memory: newUserMemory,
        updatedAt: new Date(),
      });
    }
  } catch (error) {
    console.log(`Error generating user memory: ${error}`);
  }
}

export function truncateMessage(message: string) {
  let result = message.length > 450 ? message.slice(0, 450) : message;
  if (!result.endsWith(".")) {
    const lastDotIndex = result.lastIndexOf(".");
    if (lastDotIndex !== -1) {
      result = result.substring(0, lastDotIndex + 1);
    } else {
      result += ".";
    }
  }

  return result;
}

export function extractYouTubeURL(str: string) {
  const match = str.match(/https:\/\/www\.youtube\.com\/watch\?v=\S+/);
  return match ? match[0] : null;
}

export function extractAllUrlsFromMarkdownMessage(
  text: string,
  apiUrl: string
) {
  const urls: string[] = [];
  let match;

  while ((match = ALL_MARKDOWN_URL_REGEX.exec(text)) !== null) {
    const url = match[2];
    if (url.includes(apiUrl)) {
      urls.push(url);
    }
  }

  return urls;
}

async function removeMarkdown(markdown: string) {
  const html = await marked(markdown);
  const plainText = striptags(html);
  return plainText.replaceAll("&#39;", "'").replaceAll("&quot;", "");
}

export async function updateMessageText(
  c: Context,
  messageId: string,
  text: string
) {
  const db = drizzle(c.env.HYPERDRIVE.connectionString);
  const message = await db
    .select()
    .from(chatMessage)
    .where(eq(chatMessage.id, messageId));
  if (message.length === 0) {
    return;
  }
  await db
    .update(chatMessage)
    .set({
      text: message[0].text + text,
    })
    .where(eq(chatMessage.id, messageId));
}

export async function saveSystemMessage(
  c: Context,
  chatId: string,
  messageId: string
) {
  const db = drizzle(c.env.HYPERDRIVE.connectionString);
  await db.insert(chatMessage).values({
    id: messageId,
    chatId: chatId,
    role: SYSTEM_ROLE,
    text: "",
  });
}

export async function saveUserMessage(
  c: Context,
  chatId: string,
  messageId: string,
  text: string
) {
  const db = drizzle(c.env.HYPERDRIVE.connectionString);
  await db.insert(chatMessage).values({
    id: messageId,
    chatId: chatId,
    role: USER_ROLE,
    text: text,
  });
}

export async function saveMessage(
  c: Context,
  chatId: string,
  messageId: string,
  role: string,
  text: string
) {
  const db = drizzle(c.env.HYPERDRIVE.connectionString);
  await db.insert(chatMessage).values({
    id: messageId,
    chatId: chatId,
    role: role,
    text: text,
  });
}

export async function generateChatTitle(
  c: Context,
  chatId: string,
  prompt: string
) {
  const genAI = new GoogleGenerativeAI(c.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-lite",
    systemInstruction: NEW_CHAT_TITLE_PROMPT,
    generationConfig: {
      responseMimeType: "text/plain",
    },
  });
  try {
    const result = await model.generateContent({
      contents: [
        {
          role: USER_ROLE,
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: 24,
      },
    });
    const db = drizzle(c.env.HYPERDRIVE.connectionString);
    const title = await removeMarkdown(result.response.text());
    await db
      .update(chat)
      .set({
        title: title,
      })
      .where(eq(chat.id, chatId));
  } catch (error) {
    console.log(`Error generating chat title: ${error}`);
  }
}

export async function generatePersona(c: Context, persona: string) {
  const genAI = new GoogleGenerativeAI(c.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: GENERATE_PERSONA_PROMPT,
    generationConfig: {
      responseMimeType: "text/plain",
    },
  });
  const result = await model.generateContent({
    contents: [
      {
        role: USER_ROLE,
        parts: [
          {
            text: persona,
          },
        ],
      },
    ],
  });
  const generatedPersona = await removeMarkdown(result.response.text());
  return generatedPersona;
}

export function formatValidationErrors(result: any, c: Context) {
  if (!result.success) {
    const errors = result.error.errors.map((err: any) => err.message);
    return c.json({ errors }, 400);
  }
}

export function getClientIp(c: Context) {
  const clientIp =
    c.req.header("cf-connecting-ip") ||
    String(c.req.header("x-forwarded-for"))?.split(",")[0] ||
    c.req.header("x-real-ip") ||
    "unknown";

  return String(clientIp);
}

export function getErrorMessage(error: any) {
  return error.message || "An unknown error occurred";
}

export function getSixDigitCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOneTimeCodeEmail(
  c: Context,
  email: string,
  code: string
) {
  const resend = new Resend(c.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "Memi Chat <support@updates.memichat.com>",
    to: [email],
    subject: `${code} - Verify Your Memi Chat Account`,
    html: oneTimeCodeEmail(code),
  });
}

export function oneTimeCodeEmail(
  code: string,
  action: string = "finish creating your account"
) {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">

  <head>
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" /><!--$-->
  </head>

  <body style="background-color:#ffffff;font-family:HelveticaNeue,Helvetica,Arial,sans-serif">
    <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:360px;background-color:#ffffff;border:1px solid #eee;border-radius:5px;box-shadow:0 5px 10px rgba(20,50,70,.2);margin-top:20px;margin:0 auto;padding:68px 0 130px">
      <tbody>
        <tr style="width:100%">
          <td>
            <p style="font-size:11px;line-height:16px;margin:16px 8px 8px 8px;color:#0a85ea;font-weight:700;font-family:HelveticaNeue,Helvetica,Arial,sans-serif;height:16px;letter-spacing:0;text-transform:uppercase;text-align:center">Verify Your Memi Chat Account</p>
            <h1 style="color:#000;display:inline-block;font-family:HelveticaNeue-Medium,Helvetica,Arial,sans-serif;font-size:20px;font-weight:500;line-height:24px;margin-bottom:0;margin-top:0;text-align:center">Enter the following code to ${action}.</h1>
            <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="background:rgba(0,0,0,.05);border-radius:4px;margin:16px auto 14px;vertical-align:middle;width:280px">
              <tbody>
                <tr>
                  <td>
                    <p style="font-size:32px;line-height:40px;margin:0 auto;color:#000;display:inline-block;font-family:HelveticaNeue-Bold;font-weight:700;letter-spacing:6px;padding-bottom:8px;padding-top:8px;width:100%;text-align:center">${code}</p>
                  </td>
                </tr>
              </tbody>
            </table>
            <p style="font-size:15px;line-height:23px;margin:0;color:#444;font-family:HelveticaNeue,Helvetica,Arial,sans-serif;letter-spacing:0;padding:0 40px;text-align:center">Not expecting this email?</p>
            <p style="font-size:15px;line-height:23px;margin:0;color:#444;font-family:HelveticaNeue,Helvetica,Arial,sans-serif;letter-spacing:0;padding:0 40px;text-align:center">Contact<!-- --> <a href="mailto:support@memichat.com" style="color:#444;text-decoration:underline" target="_blank">support@memichat.com</a> <!-- -->if you did not request this code.</p>
          </td>
        </tr>
      </tbody>
    </table>
    <p style="font-size:12px;line-height:23px;margin:0;color:#000;font-weight:800;letter-spacing:0;margin-top:20px;font-family:HelveticaNeue,Helvetica,Arial,sans-serif;text-align:center;text-transform:uppercase">Memi Chat</p><!--/$-->
  </body>

</html>`;
}
