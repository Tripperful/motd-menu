FROM alpine:3.22.2 AS telegram-api

COPY ./docker/scripts/tg-api-build.sh /build.sh
RUN chmod +x /build.sh
RUN /build.sh

ENTRYPOINT exec telegram-bot-api --api-id="$TELEGRAM_API_ID" --api-hash="$TELEGRAM_API_HASH"