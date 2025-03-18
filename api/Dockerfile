FROM python:3.12 AS main

ENV FORWARDED_ALLOW_IPS="*"

COPY ./ /app/
WORKDIR "/app"
RUN mkdir -p ./imgs
RUN mkdir -p ./imgs/routes/
RUN mkdir -p ./imgs/routes/full
RUN mkdir -p ./imgs/routes/thumb
RUN mkdir -p ./imgs/cover_photos
RUN mkdir -p ./imgs/profile_photos

RUN pip install -r requirements.txt

FROM main AS test
ENV PYTHONPATH=$PWD
CMD pytest

FROM main AS dev
ENV PYTHONPATH=$PWD
CMD PORT=80 sh ./prestart.sh

FROM main AS prod
ENV PYTHONPATH=$PWD
CMD PORT=80 sh ./prestart.sh