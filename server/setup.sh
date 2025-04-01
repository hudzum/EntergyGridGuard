#!/bin/sh

mkdir /etc/nginx/ssl/
echo $SSL_KEY | base64 -d > /etc/nginx/ssl/key.key
echo $SSL_CRT | base64 -d > /etc/nginx/ssl/key.crt
echo $SSL_KEY > /etc/nginx/ssl/test.txt
echo "asdf" > /etc/nginx/ssl/test2.txt

mkdir /etc/apache2
htpasswd -b -c /etc/apache2/.htpasswd $DEFAULT_USER $DEFAULT_PASS

exec nginx -g "daemon off;"