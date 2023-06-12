import { Knex } from "knex";

import encryption from "../src/utils/encryption";

export async function seed(knex: Knex) {
  return knex("users").then(function () {
    // Inserts seed entries
    return knex("users").insert([
      {
        email: "admin@erc.com",
        password: encryption.hashPassword("Admin123@erc!^"),
        first_name: "Admin",
        last_name: "Admin",
        role_id: 1,
      },
    ]);
  });
}
