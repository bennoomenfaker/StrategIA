#!/bin/bash
echo "Terminating active connections..."
psql "postgresql://root:root@localhost:5432/postgres" -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'strategia_db';"

echo "Dropping database..."
psql "postgresql://root:root@localhost:5432/postgres" -c "DROP DATABASE IF EXISTS strategia_db;"

echo "Creating database..."
psql "postgresql://root:root@localhost:5432/postgres" -c "CREATE DATABASE strategia_db;"

echo "Database reset complete!"
