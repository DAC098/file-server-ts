\connect file_server_d

CREATE TABLE users (
    id          SERIAL PRIMARY KEY,
    username    VARCHAR(25) NOT NULL UNIQUE,
    password    VARCHAR NOT NULL,
    email       VARCHAR UNIQUE,
    salt        VARCHAR NOT NULL,
    fname       VARCHAR,
    lname       VARCHAR
);