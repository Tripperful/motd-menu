FROM node:20.10.0 as server

RUN \
  git clone -b docker https://github.com/Tripperful/motd-menu.git --recursive && \
  cd "./motd-menu" && \
  npm ci && \
  npm run build

ENTRYPOINT [ "node", "/motd-menu/packages/server/dist/index.js" ]
