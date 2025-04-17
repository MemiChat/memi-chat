import { Hono } from "hono";
import { Env } from "../../validator";
import ms from "ms";
import { rateLimiter } from "../../middleware";
import { nanoid } from "nanoid";
import { GENERIC_SUCCESS_MESSAGE } from "../../helper";

const app = new Hono<Env>()
  .use(
    rateLimiter({
      windowMs: ms("1 minute"),
      max: 100,
    })
  )

  .get("/file/:key", async (c) => {
    const key = c.req.param("key");
    const object = await c.env.BUCKET.get(key);

    if (!object) {
      return c.json({ message: "File not found" }, 404);
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);

    return new Response(object.body, {
      headers,
    });
  })

  .put("/file", async (c) => {
    const key = `${nanoid()}.webp`;
    const body = await c.req.json();
    const base64Data = body.base64Data;
    const mimeType = body.mimeType;
    if (!mimeType || !base64Data) {
      return c.json({ message: "No data provided" }, 400);
    }
    const bodyBuffer = Buffer.from(base64Data, "base64");
    await c.env.BUCKET.put(key, bodyBuffer, {
      httpMetadata: {
        contentType: mimeType,
      },
    });
    const url = `${c.env.API_URL}/v1/public/files/file/${key}`;
    return c.json(
      {
        message: GENERIC_SUCCESS_MESSAGE,
        url,
      },
      201
    );
  })

  .post("/file", async (c) => {
    const body = await c.req.parseBody();
    const file = body["file"];

    if (file && file instanceof File) {
      const mimeType = file.type;

      const fileName = file.name;
      const fileExtension = fileName.split(".").pop();

      const key = `${nanoid()}.${fileExtension}`;

      const arrayBuffer = await file.arrayBuffer();
      await c.env.BUCKET.put(key, arrayBuffer, {
        httpMetadata: {
          contentType: mimeType,
        },
      });

      const url = `${c.env.API_URL}/v1/public/files/file/${key}`;
      return c.json({ message: GENERIC_SUCCESS_MESSAGE, url }, 201);
    }

    return c.json({ message: "No file provided" }, 400);
  });

export default app;
