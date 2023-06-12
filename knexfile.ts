// @ts-ignore
import dotenv from "dotenv";
dotenv.config();
// Update with your config settings.

// Create a migration file for a table:
// knex migrate:make users

// Run migrations
// knex migrate:latest

const configs = {
  client: "postgres",
  // connection: process.env.PG_CONNECTION_STRING,
  connection: {
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DB,
  },
  searchPath: ["knex", "public"],
};

export default configs;
