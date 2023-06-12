import * as core from "express-serve-static-core";
import express from "express";
import path from "path";

export default function staticPathMiddlewares(app: core.Express) {
  app.use(express.static(path.resolve("public")));

  app.use("/files/", express.static(path.resolve("public/files")));
}
