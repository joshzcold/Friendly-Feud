FROM node:24-alpine AS base
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

FROM base AS builder

COPY package-lock.json package.json /app/
WORKDIR /app
RUN npm install

FROM base AS dev
RUN apk add curl
COPY --from=builder /app/node_modules/ /app/node_modules/
COPY . /app/
WORKDIR /app
CMD ["npm", "run", "dev"]

FROM base AS app
COPY --from=builder /app/node_modules/ /app/node_modules/
COPY . /app/
WORKDIR /app
RUN npm run build
COPY --chmod=775 docker/frontend-start.sh /app/start.sh

CMD ["/app/start.sh"]
