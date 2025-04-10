#!/bin/sh

echo $SSL_KEY | base64 -d > /etc/nginx/ssl/key.pem
echo $SSL_CRT | base64 -d > /etc/nginx/ssl/cert.pem

mkdir /etc/apache2
htpasswd -b -c /etc/apache2/.htpasswd $DEFAULT_USER $DEFAULT_PASS

exec nginx -g "daemon off;"