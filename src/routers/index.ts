import * as core from "express-serve-static-core";
import express from "express";

// Routes
import pingRouter from "./ping";
import authRouter from "./auth";
import userRouter from "./user";

import roleRouter from "./role";

// Middlewares
import errorMiddlewares from "./middlewares/error";
import staticPathMiddlewares from "./middlewares/static-path";

const baseApi = express.Router();

export default function routes(app: core.Express) {
  baseApi.use("/ping", pingRouter);

  app.use("/api/v1", baseApi);
  baseApi.use("/auth", authRouter);
  baseApi.use("/user", userRouter);

  baseApi.use("/role", roleRouter);

  staticPathMiddlewares(app);

  errorMiddlewares(app);
}
