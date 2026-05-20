#!/bin/sh

set -eu

# Create Cloudflare credentials file
mkdir -p /etc/letsencrypt
cat > /etc/letsencrypt/cloudflare.ini <<EOF
dns_cloudflare_api_token = ${CLOUDFLARE_API_TOKEN}
EOF

# Restrict permissions (required by certbot)
chmod 600 /etc/letsencrypt/cloudflare.ini

# Request initial certificate if it does not exist
if [ ! -d "/etc/letsencrypt/live/${MOTD_DOMAIN}" ]; then
  certbot certonly \
    --dns-cloudflare \
    --dns-cloudflare-credentials /etc/letsencrypt/cloudflare.ini \
    -d "${MOTD_DOMAIN}" \
    --email "${MOTD_EMAIL}" \
    --agree-tos \
    --no-eff-email \
    --non-interactive
fi

# Renew certificates forever
while :; do
  certbot renew \
    --dns-cloudflare \
    --dns-cloudflare-credentials /etc/letsencrypt/cloudflare.ini

  sleep 12h & wait $!
done