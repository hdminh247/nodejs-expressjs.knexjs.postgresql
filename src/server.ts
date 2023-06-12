import express from "express";
import "reflect-metadata";
// @ts-ignore
import dotenv from "dotenv";
import * as http from "http";

import middlewares from "./config/middlewares";
import i18n from "./config/i18n";
import database from "./config/database";
import swagger from "./config/swagger";
import routes from "./routers";
import { cleanUpFilesDirectory } from "./utils/file";

cleanUpFilesDirectory();

// Load environment variables from .env file
dotenv.config();

// Initialize database
database.init();

// Initialize i18n
i18n();

// Create Express server
const app = express();

// Middlewares
middlewares(app);

// Swagger routes
swagger(app);

// Add app routes.
routes(app);

// Cron jobs
//Create http server with express
const httpServer = http.createServer(app);

// Start Express server
httpServer.listen(process.env.PORT || 3000, () => {
  console.log("  App is running at http://localhost:%d in %s mode", process.env.PORT || 3000, app.get("env"));
  console.log("  Press CTRL-C to stop\n");
});
