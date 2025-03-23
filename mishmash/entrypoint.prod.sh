#!/usr/bin/bash
set -m
# Start Gunicorn server
exec gunicorn --bind 0.0.0.0:8000 --workers 4 --threads 4 mishmash.wsgi:application &
# # Wait for database to be ready
# echo "Waiting for MySQL to be ready..."
# COUNTER=0
# MAX_TRIES=30
# while ! python -c "import MySQLdb; MySQLdb.connect(host=\"db\", user=\"root\", passwd=\"root\", db=\"mishmash\", port=3306)" 2>/dev/null; do
#     COUNTER=$((COUNTER+1))
#     if [ $COUNTER -ge $MAX_TRIES ]; then
#         echo "Could not connect to MySQL after $MAX_TRIES attempts - continuing anyway"
#         break
#     fi
#     echo "MySQL not ready yet... waiting 5 seconds ($COUNTER/$MAX_TRIES)"
#     sleep 5
# done
# echo "MySQL is ready or max retries reached"
# # Start cron service
# service cron start
# # Verify cron is running
# if pgrep cron > /dev/null; then
#     echo "Cron is running successfully"
# else
#     echo "Failed to start cron"
#     exit 1
# fi

fg