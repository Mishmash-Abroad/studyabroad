#!/usr/bin/bash
set -m

# Wait for database to be ready
echo "Waiting for MySQL to be ready..."
sleep 150
# Start cron service
service cron start
# Verify cron is running
if pgrep cron > /dev/null; then
    echo "Cron is running successfully"
else
    echo "Failed to start cron"
    exit 1
fi

# Start Gunicorn server
exec gunicorn --bind 0.0.0.0:8000 --workers 4 --threads 4 mishmash.wsgi:application