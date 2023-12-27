#!/bin/sh

cd /

if [ ! -d "/motd-menu" ]; then
  git clone --recursive https://github.com/Tripperful/motd-menu.git
  cd /motd-menu
  npm ci
  npm run build
fi

cd /motd-menu

git fetch

UPSTREAM=${1:-'@{u}'}
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse "$UPSTREAM")
BASE=$(git merge-base @ "$UPSTREAM")

if [ $LOCAL = $REMOTE ]; then
    echo "Git repo is up-to-date"
elif [ $LOCAL = $BASE ]; then
    echo "Remote changed, pulling changes and re-building"
    git pull
    npm ci
    npm run build
fi

node ./packages/server/dist/index.js
