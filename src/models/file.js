const { Model } = require('objection');
const db = require('../common/db');

Model.knex(db);

const File = class extends Model {
  static get tableName() {
    return 'files';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'extension', 'mimeType', 'size', 'uploadedAt'],

      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
        extension: { type: 'string', minLength: 1, maxLength: 255 },
        mimeType: { type: 'string', minLength: 1, maxLength: 255 },
        size: { type: 'integer' },
        uploadedAt: { type: 'string' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
      }
    };
  }
};

module.exports = File;
