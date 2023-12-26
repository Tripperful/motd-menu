FROM node:20.10.0 as server

ADD . /motd-menu

WORKDIR /motd-menu

RUN \
  npm ci && \
  npm run build

ENTRYPOINT [ "node", "/motd-menu/packages/server/dist/index.js" ]
