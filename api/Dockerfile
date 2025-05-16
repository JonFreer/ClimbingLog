FROM python:3.13-alpine as main

RUN apk add build-base libpq libpq-dev ffmpeg

ENV FORWARDED_ALLOW_IPS="*" \
    PYTHONPATH=/app

WORKDIR /app
COPY ./requirements.txt /app/

# Create necessary directories in a single RUN command to reduce image layers
RUN mkdir -p ./imgs/routes/full ./imgs/routes/thumb ./imgs/cover_photos ./imgs/profile_photos ./videos/raw ./videos/processed ./videos/thub \
    && pip install --no-cache-dir -r requirements.txt

WORKDIR /app
COPY ./ /app/

FROM main AS test
CMD pytest

FROM main AS dev
CMD PORT=80 sh ./prestart.sh

FROM main AS prod
CMD PORT=80 sh ./prestart.sh