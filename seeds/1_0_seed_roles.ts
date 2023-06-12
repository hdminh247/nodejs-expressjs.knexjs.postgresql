import { Knex } from "knex";

export async function seed(knex: Knex) {
  return knex("roles").then(function () {
    // Inserts seed entries
    return knex("roles").insert([{ name: "Admin" }, { name: "Agent" }, { name: "Provider" }, { name: "User" }]);
  });
}
