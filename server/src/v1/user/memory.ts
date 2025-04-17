import { Hono } from "hono";
import { Env } from "../../validator";
import { rateLimiter } from "../../middleware";
import ms from "ms";
import { zValidator } from "@hono/zod-validator";
import { formatValidationErrors, getUserMemory } from "../../utils";
import { GENERIC_SUCCESS_MESSAGE } from "../../helper";
import { drizzle } from "drizzle-orm/postgres-js";
import { userMemories } from "../../db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const app = new Hono<Env>()
  .use(
    rateLimiter({
      windowMs: ms("10 minutes"),
      max: 100,
    })
  )
  .get("/", async (c) => {
    const userPayload = c.get("jwtPayload");
    const userMemory = await getUserMemory(c, userPayload.id);

    return c.json({
      message: GENERIC_SUCCESS_MESSAGE,
      memory: userMemory,
    });
  })
  .post(
    "/change",
    zValidator(
      "json",
      z.object({ memory: z.string() }),
      formatValidationErrors
    ),
    async (c) => {
      const data = c.req.valid("json");
      const userPayload = c.get("jwtPayload");
      const db = drizzle(c.env.HYPERDRIVE.connectionString);
      const userMemory = await db
        .select()
        .from(userMemories)
        .where(eq(userMemories.userId, Number(userPayload.id)))
        .limit(1);

      if (userMemory.length > 0) {
        await db
          .update(userMemories)
          .set({ memory: data.memory })
          .where(eq(userMemories.userId, Number(userPayload.id)));
      } else {
        await db
          .insert(userMemories)
          .values({ userId: userPayload.id, memory: data.memory });
      }

      return c.json({
        message: GENERIC_SUCCESS_MESSAGE,
      });
    }
  );

export default app;
