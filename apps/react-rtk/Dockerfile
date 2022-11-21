FROM node:18-bullseye-slim AS build

ARG API_URL

ENV VITE_API_URL=${API_URL}

WORKDIR /var/cache/backend

RUN chown node:node /var/cache/backend

USER node

COPY --chown=node:node package.json ./

RUN npm i

COPY --chown=node:node . .

RUN npm run build

FROM lkwg82/h2o-http2-server:v2.2.6 AS app

COPY --from=build /var/cache/backend/dist /var/www/html/

COPY h2o.conf /etc/h2o/h2o.conf
