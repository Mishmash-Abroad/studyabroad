#!/usr/bin/bash

# Run hashdeep and capture output
OUTPUT=$(hashdeep -vv -r -a -k /home/vcm/hash_values.txt /home/vcm/studyabroad)

# Log full output
echo "$OUTPUT" >> /var/log/file_monitoring.log

# Check for failure
if echo "$OUTPUT" | grep -q "hashdeep: Audit failed"; then
    # Escape the output using Python to ensure safe JSON
    ESCAPED_OUTPUT=$(python3 -c "import json, sys; print(json.dumps(sys.stdin.read()))" <<< "$OUTPUT")

    # Format payload with bruh and message
    JSON_PAYLOAD=$(python3 -c "import json; print(json.dumps({
        'value1': $ESCAPED_OUTPUT,
        'value2': 'bruh',
        'value3': 'Audit failed in file monitoring'
    }))")

    # Send the curl request
    curl -X POST \
        -H "Content-Type: application/json" \
        -d "$JSON_PAYLOAD" \
        "https://maker.ifttt.com/trigger/File_monitor_fail/with/key/gxWFYRMC0fqf9Sl96i10YELsVXAywAZJqmd9LnWZhI2"
fi
