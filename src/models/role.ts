import { Model } from "objection";

// https://vincit.github.io/objection.js/guide/models.html

class Role extends Model {
  static get tableName() {
    return "roles";
  }

  static get idColumn() {
    return "id";
  }
}

export default Role;
