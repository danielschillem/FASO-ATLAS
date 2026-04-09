#!/bin/sh
set -e

# Run SQL migrations/seed only once — skip if data already exists
echo "Running database seed..."
./seed -dir=migrations || echo "Seed skipped or already applied"

# Start the API server
exec ./server
