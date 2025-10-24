FROM certbot/certbot:v5.1.0 AS certbot

COPY ./docker/entry/certbot.sh /start.sh
RUN chmod +x /start.sh

ENTRYPOINT [ "/start.sh" ]
