import { Knex } from "knex";

export async function up(knex: Knex): Promise<any> {
  await knex.schema.createTable("users", (table: Knex.TableBuilder) => {
    table.increments("id").primary();

    table.string("first_name").nullable();
    table.string("last_name").nullable();
    table.string("password").nullable();
    table.string("email").notNullable();
    table.string("phone_number");

    table.boolean("is_active").defaultTo(true);
    table.integer("role_id").notNullable();

    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    table.foreign("role_id").references("roles.id").onDelete("CASCADE");
  });
}

export async function down(knex: Knex): Promise<any> {
  await knex.schema.alterTable("users", (table: Knex.TableBuilder) => {
    table.dropForeign("role_id");
  });

  await knex.schema.dropTable("users");
}
