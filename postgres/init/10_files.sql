\connect file_server_d

CREATE TABLE file_item (
    id     SERIAL PRIMARY KEY,
    name   VARCHAR NOT NULL,
    owner  INT NOT NULL REFERENCES users(ID),
    exists BOOLEAN DEFAULT true
);

CREATE TABLE directories (
    path   VARCHAR NOT NULL,
    root   VARCHAR NOT NULL,
    locked BOOLEAN DEFAULT false,
    parent INT REFERENCES directories(id),
    UNIQUE (name, path, root)
) INHERITS (file_item);

CREATE TABLE files (
    directory INT NOT NULL REFERENCES directories(id),
    UNIQUE (name, directory)
) INHERITS (file_item);

CREATE TABLE file_item_tags (
    id        SERIAL PRIMARY KEY,
    name      VARCHAR NOT NULL,
    file_item INT NOT NULL REFERENCES file_item(id)
);

CREATE TABLE allowed_access (
    id         SERIAL PRIMARY KEY,
    file_item  INT NOT NULL REFERENCES file_item(id),
    permission INT DEFAULT 0
);