FROM certbot/certbot:v5.1.0 as certbot

COPY ./entry/certbot.sh /start.sh

WORKDIR /

ENTRYPOINT [ "/start.sh" ]
