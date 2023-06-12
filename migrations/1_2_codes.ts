import { Knex } from "knex";

export async function up(knex: Knex): Promise<any> {
  await knex.schema.createTable("codes", (table: Knex.TableBuilder) => {
    table.increments("id").primary();

    table.string("hash").notNullable();
    table.string("email").notNullable();
    table.string("code").notNullable();
    table.string("type").defaultTo("requestLogin");

    table.timestamp("expired_at").defaultTo(knex.fn.now());
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<any> {
  await knex.schema.dropTable("codes");
}
