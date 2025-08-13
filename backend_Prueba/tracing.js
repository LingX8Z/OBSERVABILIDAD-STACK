// tracing.js
'use strict';

const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'api-logger',
    [SemanticResourceAttributes.SERVICE_NAMESPACE]: 'demo',         // opcional
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',          // opcional
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development', // opcional
  }),
  traceExporter: new OTLPTraceExporter({
    // tu collector escucha OTLP/HTTP en 4318
    url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || 'http://otel-collector:4318/v1/traces',
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start().catch((err) => console.error('Error starting OTel SDK', err));

// (opcional) cierre limpio
process.on('SIGTERM', () => sdk.shutdown().finally(() => process.exit(0)));
process.on('SIGINT', () => sdk.shutdown().finally(() => process.exit(0)));
