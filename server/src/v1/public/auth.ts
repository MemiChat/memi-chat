import { Hono } from "hono";
import { sendCodeSchema, Env, verifyCodeSchema } from "../../validator";
import { rateLimiter } from "../../middleware";
import ms from "ms";
import { zValidator } from "@hono/zod-validator";
import {
  formatValidationErrors,
  getSixDigitCode,
  normalizeString,
  sendOneTimeCodeEmail,
} from "../../utils";
import { GENERIC_SUCCESS_MESSAGE } from "../../helper";
import { drizzle } from "drizzle-orm/postgres-js";
import { agent, emailTokens, users } from "../../db/schema";
import { eq, and } from "drizzle-orm";
import { sign } from "hono/jwt";

const app = new Hono<Env>()
  .use(
    rateLimiter({
      windowMs: ms("10 minutes"),
      max: 5,
    })
  )
  .post(
    "/send/code",
    zValidator("json", sendCodeSchema, formatValidationErrors),
    async (c) => {
      const data = c.req.valid("json");
      const db = drizzle(c.env.HYPERDRIVE.connectionString);
      const normalizedEmail = normalizeString(data.email);
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, normalizedEmail));
      if (existingUser.length === 0) {
        const newUser = await db
          .insert(users)
          .values({
            email: normalizedEmail,
            name: normalizedEmail.split("@")[0],
            provider: "email",
            confirmed: false,
          })
          .returning();
        await db.insert(agent).values({
          name: "Memi",
          description: "Memi, a helpful assistant.",
          prompt:
            "You are Memi, a helpful assistant that can help with any questions.",
          userId: newUser[0].id,
        });
      } else {
        if (existingUser[0].deleted) {
          return c.json(
            {
              errors: ["Account deleted"],
            },
            400
          );
        }
      }
      let token = getSixDigitCode();
      if (normalizedEmail === "tester@memichat.com") {
        token = "000000";
      }
      await db.insert(emailTokens).values({
        email: normalizedEmail,
        token: token,
      });
      if (
        c.env.NODE_ENV !== "development" &&
        normalizedEmail !== "tester@memichat.com"
      ) {
        await sendOneTimeCodeEmail(c, normalizedEmail, token);
      }
      return c.json({
        message: GENERIC_SUCCESS_MESSAGE,
      });
    }
  )
  .post(
    "/verify/code",
    zValidator("json", verifyCodeSchema, formatValidationErrors),
    async (c) => {
      const data = c.req.valid("json");
      const db = drizzle(c.env.HYPERDRIVE.connectionString);
      const normalizedEmail = normalizeString(data.email);
      const token = await db
        .select()
        .from(emailTokens)
        .where(
          and(
            eq(emailTokens.token, data.code),
            eq(emailTokens.email, normalizedEmail)
          )
        );
      if (token.length === 0) {
        return c.json(
          {
            errors: ["Invalid code"],
          },
          400
        );
      }
      await db.delete(emailTokens).where(eq(emailTokens.token, data.code));
      const user = await db
        .update(users)
        .set({
          confirmed: true,
        })
        .where(eq(users.email, normalizedEmail))
        .returning();
      const jwtTokenExpiry = Date.now() + ms("1y");
      const jwtToken = await sign(
        {
          id: user[0].id,
          email: user[0].email,
          confirmed: user[0].confirmed,
          expiry: jwtTokenExpiry,
        },
        c.env.SECRET
      );
      return c.json({
        message: GENERIC_SUCCESS_MESSAGE,
        token: jwtToken,
        expiry: jwtTokenExpiry,
        email: user[0].email,
        name: user[0].name,
      });
    }
  );

export default app;
