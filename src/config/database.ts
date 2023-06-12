import { Model, knexSnakeCaseMappers } from "objection";
import Knex from "knex";

let knexConnection;

const database = {
  init: async () => {
    console.log(`Initialize DB`);
    try {
      const connection = Knex({
        client: "postgres",
        // connection: process.env.PG_CONNECTION_STRING,
        connection: {
          host: process.env.PG_HOST,
          user: process.env.PG_USER,
          password: process.env.PG_PASSWORD,
          database: process.env.PG_DB,
        },
        searchPath: ["knex", "public"],
        ...knexSnakeCaseMappers(),
        // pool: { min: 0, max: 1 },
      });

      knexConnection = connection;

      // @ts-ignore
      if (connection) {
        console.log("[DB] Initialized successfully!");
      } else {
        console.log("[DB] No connection found");
      }

      Model.knex(connection);

      return true;
    } catch (e) {
      console.log("[DB] Catch error");
      console.log(e);
      return false;
    }
  },
  connection: knexConnection,
};

export default database;
