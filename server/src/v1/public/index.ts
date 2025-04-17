import { Hono } from "hono";
import { Env } from "../../validator";
import system from "./system";
import files from "./files";
import auth from "./auth";

const routes = new Hono<Env>()
  .route("/system", system)
  .route("/files", files)
  .route("/auth", auth);

export default routes;
