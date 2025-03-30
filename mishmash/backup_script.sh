#!/usr/bin/bash

# THIS SCRIPT GOES IN THE BACKUP SERVER
# Check if backup path is provided as an argument
if [ $# -lt 1 ]; then
  echo "Usage: $0 <destination_path> <server_to_backup> <num_files_to_keep>"
  echo "Example: $0 /home/vcm/dev_backups/daily_backups dev-mishmash.colab.duke.edu 7"
  exit 1
fi

# Get the destination path from the first argument
DEST_PATH="$1"
SRC_SERVER="$2"
NUM_TO_KEEP="$3"

# Make sure the destination directory exists
mkdir -p "$DEST_PATH"

# Transfer backups
scp -r backup_admin@$SRC_SERVER:/home/vcm/backups/* "$DEST_PATH"

# Check the exit status
if [ $? -eq 0 ]; then
    echo "SCP transfer succeeded to $DEST_PATH"

    # Count the number of backup files
    BACKUP_COUNT=$(find "$DEST_PATH" -type f | wc -l)

    # If there are NUM_TO_KEEP or more backup files, delete the oldest one
    if [ $BACKUP_COUNT -gt $NUM_TO_KEEP ]; then
        # Find the oldest backup file based on modification time
        OLDEST_FILE=$(find "$DEST_PATH" -type f -printf "%T+ %p\n" | sort | head -n 1 | awk '{print $2}')

        if [ -n "$OLDEST_FILE" ]; then
            echo "Removing oldest backup file: $OLDEST_FILE"
            rm "$OLDEST_FILE"
        fi
    fi
else
    EXIT_CODE=$?
    ERROR_MESSAGE="Backup failed with exit code $EXIT_CODE"
    echo "$ERROR_MESSAGE" >> /var/log/cron.log

    # Send webhook notification using curl
    curl -X POST \
      -H "Content-Type: application/json" \
      -d "{\"value1\":\"$ERROR_MESSAGE\",\"value2\":\"$(hostname)\",\"value3\":\"$(date)\"}" \
      "https://maker.ifttt.com/trigger/Backup_server_failure/with/key/gxWFYRMC0fqf9Sl96i10YELsVXAywAZJqmd9LnWZhI2"
fi