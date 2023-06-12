import { Model } from "objection";

// https://vincit.github.io/objection.js/guide/models.html

class Code extends Model {
  id!: number;
  hash!: string;
  email!: string;
  code!: string;
  expiredAt!: string;
  type!: string;

  static get tableName() {
    return "codes";
  }

  static get idColumn() {
    return "id";
  }
}

export default Code;
