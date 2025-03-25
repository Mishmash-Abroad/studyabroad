#!/usr/bin/bash

OUTPUT=$(hashdeep -r -a -k /home/vcm/hash_values.txt /home/vcm/studyabroad/mishmash/ /home/vcm/studyabroad/nginx/ /home/vcm/studyabroad/docker-compose.dev.yml /home/vcm/studyabroad/docker-compose.prod.yml /home/vcm/studyabroad/docker-compose.yml /home/vcm/studyabroad/docker-compose.test.yml /home/vcm/studyabroad/package.json /home/vcm/studyabroad/package-lock.json)


echo $OUTPUT >> /var/log/file_monitoring.log

if [[ $OUTPUT == *"fail"* ]]; then
        curl -X POST \
              -H "Content-Type: application/json" \
              -d "{\"value1\":\"$ERROR_MESSAGE\",\"value2\":\"bruh\",\"value3\":\"summ happened in monitoring\"}" \
                "https://maker.ifttt.com/trigger/Filemonitorfail/with/key/gxWFYRMC0fqf9Sl96i10YELsVXAywAZJqmd9LnWZhI2"
fi