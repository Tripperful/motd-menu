#!/bin/sh

# Telegram Bot API Build Script for Alpine Linux

apk update
apk upgrade
apk add alpine-sdk linux-headers git zlib-dev openssl-dev gperf cmake
git clone --recursive https://github.com/tdlib/telegram-bot-api.git
cd telegram-bot-api
rm -rf build
mkdir build
cd build
cmake -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX:PATH=/usr/local ..
cmake --build . --target install
