import { Hono } from "hono";
import { Env, generatePersonaSchema, newAgentSchema } from "../../validator";
import { rateLimiter } from "../../middleware";
import ms from "ms";
import { zValidator } from "@hono/zod-validator";
import { formatValidationErrors, generatePersona } from "../../utils";
import { GENERIC_SUCCESS_MESSAGE } from "../../helper";
import { drizzle } from "drizzle-orm/postgres-js";
import { agent } from "../../db/schema";
import { eq, desc, and } from "drizzle-orm";

const app = new Hono<Env>()
  .use(
    rateLimiter({
      windowMs: ms("10 minutes"),
      max: 100,
    })
  )
  .post(
    "/generate/persona",
    zValidator("json", generatePersonaSchema, formatValidationErrors),
    async (c) => {
      const data = c.req.valid("json");
      const persona = await generatePersona(c, data.persona);
      return c.json({
        message: GENERIC_SUCCESS_MESSAGE,
        persona: persona,
      });
    }
  )
  .post(
    "/new",
    zValidator("json", newAgentSchema, formatValidationErrors),
    async (c) => {
      const userPayload = c.get("jwtPayload");
      const data = c.req.valid("json");
      const db = drizzle(c.env.HYPERDRIVE.connectionString);
      const newAgent = await db
        .insert(agent)
        .values({
          name: data.name,
          description: data.description,
          prompt: data.prompt,
          userId: userPayload.id,
        })
        .returning();
      return c.json({
        message: GENERIC_SUCCESS_MESSAGE,
        agent: newAgent[0],
      });
    }
  )
  .post(
    "/update/:id",
    zValidator("json", newAgentSchema, formatValidationErrors),
    async (c) => {
      const userPayload = c.get("jwtPayload");
      const data = c.req.valid("json");
      const id = c.req.param("id");
      const db = drizzle(c.env.HYPERDRIVE.connectionString);
      const updatedAgent = await db
        .update(agent)
        .set({
          name: data.name,
          description: data.description,
          prompt: data.prompt,
        })
        .where(
          and(eq(agent.id, parseInt(id)), eq(agent.userId, userPayload.id))
        )
        .returning();
      return c.json({
        message: GENERIC_SUCCESS_MESSAGE,
        agent: updatedAgent[0],
      });
    }
  )
  .delete("/delete/:id", async (c) => {
    const userPayload = c.get("jwtPayload");
    const id = c.req.param("id");
    const db = drizzle(c.env.HYPERDRIVE.connectionString);
    await db
      .update(agent)
      .set({ deleted: true })
      .where(and(eq(agent.id, parseInt(id)), eq(agent.userId, userPayload.id)));
    return c.json({
      message: GENERIC_SUCCESS_MESSAGE,
    });
  })
  .get("/", async (c) => {
    const userPayload = c.get("jwtPayload");
    const db = drizzle(c.env.HYPERDRIVE.connectionString);
    const agents = await db
      .select()
      .from(agent)
      .where(and(eq(agent.userId, userPayload.id), eq(agent.deleted, false)))
      .orderBy(desc(agent.createdAt));
    return c.json({
      message: GENERIC_SUCCESS_MESSAGE,
      agents: agents,
    });
  });

export default app;
