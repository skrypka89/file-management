exports.up = knex => knex.raw(`
  CREATE TABLE users (
    id SMALLINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id TEXT NOT NULL,
    password TEXT NOT NULL,
    tokens TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
  );
`);

exports.down = knex => knex.raw(`
  DROP TABLE IF EXISTS users;
`);
