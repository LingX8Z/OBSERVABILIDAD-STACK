// tracing.js
'use strict';

const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');

// 👇 Añadimos ExpressInstrumentation para renombrar spans
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');

// --- Nombres de negocio por ruta (ajusta a tu lógica) ---
const businessNames = new Map([
  ['/api/log',        'backend-procesar-log'],
  ['/api/log/flujo',  'backend-flujo-completo'],
  ['/metrics',        'exponer-metricas'],
]);

const sdk = new NodeSDK({
  resource: new Resource({
    // ⬇️ fuerza demo-app salvo que lo sobrescribas por env
    [SemanticResourceAttributes.SERVICE_NAME]:
      process.env.OTEL_SERVICE_NAME || 'demo-app',
    [SemanticResourceAttributes.SERVICE_NAMESPACE]: 'demo',              // opcional
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',               // opcional
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]:
      process.env.NODE_ENV || 'development',                             // opcional
  }),

  traceExporter: new OTLPTraceExporter({
    // Collector OTLP/HTTP
    url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT
      || 'http://otel-collector:4318/v1/traces',
  }),

  instrumentations: [
    // Auto-instrumentación (http, express, fs,…)
    getNodeAutoInstrumentations({
      // Descomenta si quieres reducir ruido en rutas estáticas
      // '@opentelemetry/instrumentation-fs': { enabled: false },
    }),

    // Hook específico de Express para renombrar spans
    new ExpressInstrumentation({
      requestHook: (span, info) => {
        const route = info.request?.route?.path || info.request?.url || '';
        const name = businessNames.get(route);
        if (name) {
          span.updateName(name);
        } else if (route) {
          // Nombre más compacto por defecto
          span.updateName(`api ${info.request.method} ${route}`);
        }
      },
    }),
  ],
});

// Arranque del SDK
sdk.start().catch((err) => console.error('Error starting OTel SDK', err));

// Cierre limpio
process.on('SIGTERM', () => sdk.shutdown().finally(() => process.exit(0)));
process.on('SIGINT',  () => sdk.shutdown().finally(() => process.exit(0)));
