FROM golang:1.23-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o server ./cmd/server
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o seed ./cmd/seed

FROM alpine:3.20
ARG APP_VERSION=dev
ARG APP_COMMIT=unknown
ARG APP_BUILD_DATE=unknown
LABEL org.opencontainers.image.title="Faso Trip API" \
      org.opencontainers.image.description="REST API for the Faso Trip tourism platform" \
      org.opencontainers.image.source="https://github.com/danielschillem/FASO-ATLAS" \
      org.opencontainers.image.licenses="MIT" \
      org.opencontainers.image.vendor="Faso Trip" \
      org.opencontainers.image.version=${APP_VERSION} \
      org.opencontainers.image.revision=${APP_COMMIT} \
      org.opencontainers.image.created=${APP_BUILD_DATE}
RUN apk --no-cache add ca-certificates tzdata
RUN addgroup -S app && adduser -S app -G app
WORKDIR /app
COPY --from=builder /app/server .
COPY --from=builder /app/seed .
COPY --from=builder /app/openapi ./openapi
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/entrypoint.sh .
ENV APP_VERSION=${APP_VERSION}
ENV APP_COMMIT=${APP_COMMIT}
ENV APP_BUILD_DATE=${APP_BUILD_DATE}
USER app
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://localhost:8080/health || exit 1
CMD ["sh", "./entrypoint.sh"]
