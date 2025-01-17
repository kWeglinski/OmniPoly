#!/bin/bash

sed -i "s/%THEME%/$(echo $THEME | sed 's/\//\\\//g')/g" /usr/share/nginx/html/index.html