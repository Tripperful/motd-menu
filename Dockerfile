FROM node:22.8.0 as server

ADD ./start.sh /start.sh

ENTRYPOINT [ "bash", "/start.sh" ]
