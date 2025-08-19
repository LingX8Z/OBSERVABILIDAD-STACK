// tracing.js
'use strict';

const { NodeSDK } = require('@opentelemetry/sdk-node');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { Resource } = require('@opentelemetry/resources');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-http');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');
const { logs, LoggerProvider } = require('@opentelemetry/api-logs');
const { SimpleLogRecordProcessor, LoggerProvider: SDKLoggerProvider } = require('@opentelemetry/sdk-logs');

// ========= Resource =========
const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: 'demo-app',
});

// ========= Exporters =========
const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318';
const traceExporter = new OTLPTraceExporter({
  url: `${otlpEndpoint}/v1/traces`,
});

// (Opcional) Logs por OTLP (para /api/log/otlp)
const logExporter = new OTLPLogExporter({
  url: `${otlpEndpoint}/v1/logs`,
});

// ========= Instrumentations =========
// IMPORTANTÍSIMO: ignoramos las rutas que no deben crear span HTTP de servidor
const httpInstrumentation = new HttpInstrumentation({
  ignoreIncomingPaths: [
    /^\/api\/log$/,        // traza simple -> 0 spans en server
    /^\/api\/log\/flujo$/  // flujo completo -> evitamos el span HTTP extra
  ],
  // Puedes dejar outgoing por defecto; si quieres ignorar llamadas salientes específicas, añade ignoreOutgoingUrls.
});

const expressInstrumentation = new ExpressInstrumentation();

// ========= SDK Node (traces) =========
const sdk = new NodeSDK({
  resource,
  traceExporter,
  instrumentations: [httpInstrumentation, expressInstrumentation],
});

// ========= Logs SDK (opcional, solo si usas logs.getLogger) =========
const loggerProvider = new SDKLoggerProvider({ resource });
loggerProvider.addLogRecordProcessor(new SimpleLogRecordProcessor(logExporter));
logs.setGlobalLoggerProvider(loggerProvider);

// ========= Start / Graceful shutdown =========
sdk.start()
  .then(() => {
    console.log('[OTel] Tracing iniciado');
  })
  .catch((err) => {
    console.error('[OTel] Error iniciando tracing', err);
  });

process.on('SIGTERM', async () => {
  try {
    await sdk.shutdown();
    await loggerProvider.shutdown?.();
  } finally {
    process.exit(0);
  }
});
