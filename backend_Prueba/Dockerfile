FROM node:20-alpine
WORKDIR /app
COPY . .
EXPOSE 3001
ENV OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=http://otel-collector:4318/v1/traces
CMD ["node", "server.js"]
