import { Knex } from "knex";

export async function up(knex: Knex): Promise<any> {
  await knex.schema.createTable("roles", (table: Knex.TableBuilder) => {
    table.increments("id").primary();
    table.string("name");

    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<any> {
  await knex.schema.dropTable("roles");
}
