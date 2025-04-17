import { Hono } from "hono";
import { rateLimiter } from "../../middleware";
import ms from "ms";
import { drizzle } from "drizzle-orm/postgres-js";
import { users, agent, chat, chatMessage } from "../../db/schema";
import { eq } from "drizzle-orm";
import { Env } from "../../validator";
import { GENERIC_SUCCESS_MESSAGE } from "../../helper";

const app = new Hono<Env>()
  .use(
    rateLimiter({
      windowMs: ms("10 minutes"),
      max: 100,
    })
  )
  .get("/me", async (c) => {
    const userPayload = c.get("jwtPayload");
    const db = drizzle(c.env.HYPERDRIVE.connectionString);
    const user = await db
      .select({
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, userPayload.id));
    return c.json({ user: user[0] });
  })
  .delete("/me", async (c) => {
    const userPayload = c.get("jwtPayload");
    const db = drizzle(c.env.HYPERDRIVE.connectionString);
    await db
      .update(users)
      .set({ deleted: true })
      .where(eq(users.id, userPayload.id));
    await db.delete(agent).where(eq(agent.userId, userPayload.id));
    await db.delete(chat).where(eq(chat.userId, userPayload.id));
    return c.json({ message: GENERIC_SUCCESS_MESSAGE });
  });

export default app;
