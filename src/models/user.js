const { Model } = require('objection');
const db = require('../common/db');

Model.knex(db);

const User = class extends Model {
  static get tableName() {
    return 'users';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['userId', 'password'],

      properties: {
        id: { type: 'integer' },
        userId: { type: 'string' },
        password: { type: 'string' },
        tokens: { type: 'string' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
      }
    };
  }
};

module.exports = User;
