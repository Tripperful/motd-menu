FROM certbot/certbot:v5.1.0 AS certbot

RUN apk add --no-cache py3-certbot-dns-cloudflare

COPY ./docker/entry/certbot.sh /start.sh
RUN chmod +x /start.sh

ENTRYPOINT [ "/start.sh" ]
