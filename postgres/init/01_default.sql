CREATE USER file_server;

CREATE DATABASE file_server_d;

GRANT ALL PRIVILEGES ON DATABASE file_server_d TO file_server;
ALTER USER file_server WITH PASSWORD 'file_server_password';

ALTER DEFAULT PRIVILEGES FOR USER file_server IN SCHEMA public GRANT SELECT, UPDATE, INSERT, DELETE ON TABLES TO file_server;

