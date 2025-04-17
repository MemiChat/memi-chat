import { Hono } from "hono";
import { Env } from "../../validator";
import chat from "./chat";
import agents from "./agents";
import auth from "./auth";
import memory from "./memory";

const routes = new Hono<Env>()
  .route("/chat", chat)
  .route("/agents", agents)
  .route("/auth", auth)
  .route("/memory", memory);

export default routes;
