const dotenv = require('dotenv');
const path = require('path');
const { FsMigrations } = require('knex/lib/migrate/sources/fs-migrations');

dotenv.config({ path: path.resolve('config/.env') });

module.exports = {
  client: 'mysql',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  migrations: {
    tableName: 'knex_migrations',
    migrationSource: new FsMigrations(path.resolve('db-migrations'), false)
  },
};
