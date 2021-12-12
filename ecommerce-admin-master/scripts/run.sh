#!/bin/bash
echo '[INFO] - Config nginx'
envsubst '${API_STORAGE} ${API_URL}' </etc/nginx/conf.d/nginx.conf.template >/etc/nginx/conf.d/default.conf

nginx -t
nginx -g "daemon off;"
