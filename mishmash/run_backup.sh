#!/usr/bin/bash
cd /app
export DATABASE_HOST=db
export DATABASE_NAME=mishmash
export DATABASE_USER=root
export DATABASE_PORT=3306
export DEBUG=1

if /usr/local/bin/python /app/manage.py backup_db --aes-key=$AES_CIPHER_KEY >> /var/log/cron.log 2>&1; then
    echo "Exit code of 0, success" >> /var/log/cron.log
    curl -X POST \
      -H "Content-Type: application/json" \
      -d "{\"value1\":\"encrypted_backup\",\"value2\":\"$(hostname)\",\"value3\":\"$(date)\"}" \
      "https://maker.ifttt.com/trigger/Backups_good/json/with/key/gxWFYRMC0fqf9Sl96i10YELsVXAywAZJqmd9LnWZhI2"

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