#!/bin/bash

# Replace placeholders with actual environment variable values
sed -i "s/%API%/$(echo $API | sed 's/\//\\\//g')/g" /usr/share/nginx/html/index.html
sed -i "s/%THEME%/$(echo $THEME | sed 's/\//\\\//g')/g" /usr/share/nginx/html/index.html
sed -i "s/%LTAPI%/$(echo $LTAPI | sed 's/\//\\\//g')/g" /usr/share/nginx/html/index.html
sed -i "s/%OLLAMA_MODEL%/$(echo $OLLAMA_MODEL | sed 's/\//\\\//g')/g" /usr/share/nginx/html/index.html
sed -i "s/%OLLAMA_API%/$(echo $OLLAMA_API | sed 's/\//\\\//g')/g" /usr/share/nginx/html/index.html