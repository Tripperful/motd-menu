#!/bin/sh

cd /

if [ ! -d "/motd-menu" ]; then
  git clone --recursive https://github.com/Tripperful/motd-menu.git
  cd /motd-menu
  npm ci
  npm run build
fi

cd /motd-menu
cp ./start.sh /start.sh

node ./packages/server/dist/index.js &

while :; do
  sleep 10
  git fetch

  UPSTREAM=${1:-'@{u}'}
  LOCAL=$(git rev-parse @)
  REMOTE=$(git rev-parse "$UPSTREAM")
  BASE=$(git merge-base @ "$UPSTREAM")

  if [ $LOCAL != $REMOTE ]; then
    echo "Remote changed, pulling changes and re-building"
    git reset --hard origin/master
    npm ci
    npm run build
    echo "Restarting node.js server"
    pkill node
  fi

  if ! pgrep -x "node" > /dev/null
  then
    node ./packages/server/dist/index.js &
  fi
done
