import { Next, Context } from "hono";
import { RateLimitConfig } from "./validator";
import { getClientIp } from "./utils";

export const rateLimiter = (config: RateLimitConfig) => {
  return async (c: Context, next: Next) => {
    const ip = getClientIp(c);

    // Use provided route prefix or fall back to full path
    const key = `ratelimit:${ip}:${config.routePrefix ?? c.req.path}`;

    // if user is premium, then increase the limit
    // this is just an example, you can do anything here
    // you can also check c.req.path or config.routePrefix
    //const user = c.get("user");
    //if (user && user.tier === "premium") {
    //  config.max = 1000;
    //}

    const now = Date.now();
    // Get existing record
    const record = await c.env.KV.get(key);
    // const record = await getKeyValue(key);
    const currentRecord = record
      ? JSON.parse(record)
      : {
          count: 0,
          resetTime: now + config.windowMs,
        };
    //console.log("currentRecord", JSON.stringify(currentRecord, null, 2));

    // Reset if window has expired
    if (now > currentRecord.resetTime) {
      currentRecord.count = 0;
      currentRecord.resetTime = now + config.windowMs;
    }

    // Increment count
    currentRecord.count += 1;

    // Store updated record
    await c.env.KV.put(key, JSON.stringify(currentRecord));
    //await setKeyValue(key, JSON.stringify(currentRecord));
    //console.log("newRecord", JSON.stringify(currentRecord, null, 2));

    // Check if over limit
    if (currentRecord.count > config.max) {
      const retryAfterSeconds = Math.ceil(
        (currentRecord.resetTime - now) / 1000
      );
      const retryAfterMinutes = Math.ceil(retryAfterSeconds / 60);
      return c.json(
        {
          errors: [
            `Too many requests. Please try again in ${retryAfterMinutes} minute${
              retryAfterMinutes === 1 ? "" : "s"
            }`,
          ],
          retryAfter: retryAfterSeconds,
        },
        429
      );
    }

    // Add rate limit info to headers
    c.header("X-RateLimit-Limit", config.max.toString());
    c.header(
      "X-RateLimit-Remaining",
      (config.max - currentRecord.count).toString()
    );
    c.header(
      "X-RateLimit-Reset",
      Math.ceil(currentRecord.resetTime / 1000).toString()
    );

    await next();
  };
};
