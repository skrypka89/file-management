exports.up = knex => knex.raw(`
  CREATE TABLE files (
    id SMALLINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name TEXT NOT NULL,
    extension VARCHAR(255) NOT NULL,
    mime_type VARCHAR(255) NOT NULL,
    size BIGINT NOT NULL,
    uploaded_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
  );
`);

exports.down = knex => knex.raw(`
  DROP TABLE IF EXISTS files;
`);
