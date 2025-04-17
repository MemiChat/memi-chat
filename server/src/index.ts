import { Hono } from "hono";
import { cors } from "hono/cors";
import { API_V1_PUBLIC_PREFIX, API_V1_USER_PREFIX } from "./helper";

import { Env, Bindings } from "./validator";
import ms from "ms";
import { jwt } from "hono/jwt";
import { rateLimiter } from "./middleware";

import publicRoutes from "./v1/public";
import userRoutes from "./v1/user";

import * as Sentry from "@sentry/cloudflare";

const app = new Hono<Env>();

app.use("*", async (c, next) => {
  const corsMiddlewareHandler = cors({
    origin: ["*"], //[c.env.CLIENT_URL],
    credentials: true,
  });
  return corsMiddlewareHandler(c, next);
});

// protected routes
app.use(`${API_V1_USER_PREFIX}/*`, async (c, next) => {
  const jwtMiddleware = jwt({
    secret: c.env.SECRET,
    cookie: "token",
  });

  try {
    await jwtMiddleware(c, next);
  } catch (err) {
    return c.json({ errors: ["Unauthorized"] }, 401);
  }
});

export const routes = app
  .route(API_V1_PUBLIC_PREFIX, publicRoutes)
  .route(API_V1_USER_PREFIX, userRoutes);

app
  .notFound((c) => {
    return c.json({ errors: ["Not Found"] }, 404);
  })
  .use(
    rateLimiter({
      windowMs: ms("10 minutes"),
      max: 2,
    })
  );

app.onError((err, c) => {
  console.error(`${err}`);
  Sentry.captureException(err);
  return c.json({ errors: ["Internal Server Error"] }, 500);
});

export default Sentry.withSentry(
  (env) => ({
    dsn: (env as Bindings).SENTRY_DSN,
    tracesSampleRate: 1.0,
  }),
  app
);
