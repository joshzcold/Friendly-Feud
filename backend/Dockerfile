FROM golang:1.23.3-alpine AS base
RUN mkdir -p /src
WORKDIR /src

FROM base AS dev
ENV CGO_ENABLED 1
ENV GOCACHE=/src/.cache/go-build
ENV GOMODCACHE=/src/.cache/go-mod
RUN apk add gcc musl-dev sqlite curl
RUN go install github.com/air-verse/air@latest
COPY --from=games . /src/games/
COPY . .
RUN mkdir -p .cache/go-build .cache/go-mod && \
    go mod download
CMD ["air", "--build.cmd", "go build .", "--build.bin", "/src/Cold-Friendly-Feud"]

FROM base AS builder
ENV CGO_ENABLED 1
RUN apk add gcc musl-dev
COPY . .
RUN go build .

FROM base AS app
RUN mkdir -p /src
WORKDIR /src
COPY --from=games . /src/games/
COPY --from=builder --chmod=755 /src/Cold-Friendly-Feud /src/Cold-Friendly-Feud
CMD ["/src/Cold-Friendly-Feud"]
