require("./tracing"); // ¡Muy importante, antes que cualquier require de Express!

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { trace, context, propagation } = require("@opentelemetry/api");
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const client = require("prom-client");

// Métrica simple
const register = client.register;
client.collectDefaultMetrics();

// Counter con nombre canónico y etiquetas
const accionesCounter = new client.Counter({
  name: "app_acciones_total", // terminar en _total
  help: "Acciones realizadas desde el frontend",
  labelNames: ["action_type"], // añade contexto
});

// Incremento con etiqueta (ejemplo)
app.post("/api/incrementa-accion", (req, res) => {
  const tipo = req.body?.type || "generic";
  accionesCounter.inc({ action_type: tipo });
  res.sendStatus(200);
});

// /metrics
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

// --------- ENDPOINT CON FLUJO COMPLETO ---------
app.post('/api/log/flujo', (req, res) => {
  const tracer = trace.getTracer('demo-app');

  // Propaga la traza del front si llega header traceparent:
  const tp = req.headers['traceparent'];
  let ctx = context.active();
  if (tp) ctx = propagation.extract(context.active(), { traceparent: tp });

  tracer.startActiveSpan('inicio', {}, ctx, (s1) => {
    // ... trabajo 1 ...
    s1.end();

    tracer.startActiveSpan('proceso-intermedio', {}, context.active(), (s2) => {
      // ... trabajo 2 ...
      s2.end();

      tracer.startActiveSpan('fin', {}, context.active(), (s3) => {
        // ... trabajo 3 ...
        s3.end();

        res.status(201).json({ ok: true });
      });
    });
  });
});


// --------- ENDPOINT LOG INDIVIDUAL ---------
app.post("/api/log", (req, res) => {
  const logMessage = `[${new Date().toISOString()}] ${
    req.body.level || "info"
  }: ${req.body.message}\n`;
  fs.appendFileSync(path.join(__dirname, "simulado.log"), logMessage);
  res.status(201).send({ ok: true });
});

// --- Utilidad: mapear nivel a severidad OTel
const severityMap = {
  trace: { text: "TRACE", num: 1 },
  debug: { text: "DEBUG", num: 5 },
  info: { text: "INFO", num: 9 },
  warn: { text: "WARN", num: 13 },
  error: { text: "ERROR", num: 17 },
  fatal: { text: "FATAL", num: 21 },
};

// --------- NUEVO ENDPOINT: log interceptado por OTLP (sin escribir .log)
app.post("/api/log/otlp", (req, res) => {
  const { level = "info", message = "", tags = {} } = req.body || {};
  const sev = severityMap[level] || severityMap.info;

  // extrae contexto de traza (para correlación)
  const traceparent = req.headers["traceparent"];
  let ctx = context.active();
  if (traceparent) {
    ctx = propagation.extract(context.active(), { traceparent });
  }

  const tracer = trace.getTracer("demo-app");
  const logger = logs.getLogger("demo-app-logger");

  tracer.startActiveSpan("log-otlp", {}, ctx, (span) => {
    // correlación: usa el contexto activo al emitir el log
    context.with(context.active(), () => {
      logger.emit({
        body: message,
        severityText: sev.text,
        severityNumber: sev.num,
        attributes: {
          ...tags,
          origin: tags.origin || "backend",
          transport: "otlp-http",
          component: "logger-api",
        },
      });
    });

    span.end();
    res.status(201).send({ ok: true });
  });
});

app.listen(PORT, () => console.log(`Logger API running on port ${PORT}`));
