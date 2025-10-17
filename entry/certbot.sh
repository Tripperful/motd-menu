#!/bin/sh

if [ ! -d "/etc/letsencrypt/live/${MOTD_DOMAIN}" ]; then
  certbot certonly --standalone -d "${MOTD_DOMAIN}" --email "${MOTD_EMAIL}" --agree-tos --no-eff-email --non-interactive
fi
while :; do
  certbot renew
  sleep 12h & wait $!
done