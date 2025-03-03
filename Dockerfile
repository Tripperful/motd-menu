FROM node:22.8.0 as server

COPY ./packages/server/dist /motd-menu/packages/server/dist
COPY ./packages/client/dist /motd-menu/packages/client/dist
COPY ./node_modules/geoip-lite/data /motd-menu/packages/server/data

WORKDIR /motd-menu

ENTRYPOINT [ "node", "--enable-source-maps", "./packages/server/dist/index.js" ]
