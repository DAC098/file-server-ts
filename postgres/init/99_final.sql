\connect file_server_d

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO file_server;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO file_server;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO file_server;