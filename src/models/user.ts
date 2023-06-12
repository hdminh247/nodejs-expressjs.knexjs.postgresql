import { Model } from "objection";

import Role from "./role";

// https://vincit.github.io/objection.js/guide/models.html

class User extends Model {
  id!: number;
  email!: string;
  roleId!: number;
  providerId!: number | null;
  firstName!: string;
  lastName!: string;
  phoneNumber!: string;
  jobTitle!: string;
  password!: string;
  updatedAt!: string;
  isActive!: boolean;
  uuid!: string;

  static get tableName() {
    return "users";
  }

  static get idColumn() {
    return "id";
  }

  static get relationMappings() {
    return {
      role: {
        relation: Model.HasOneRelation,
        modelClass: Role,
        join: {
          from: "users.roleId",
          to: "roles.id",
        },
      },
    };
  }
}

export default User;
