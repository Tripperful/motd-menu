FROM node:20.10.0 as server

ADD ./start.sh /start.sh

ENTRYPOINT [ "/start.sh" ]
