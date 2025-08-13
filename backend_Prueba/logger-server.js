require('./tracing'); // ¡Muy importante, antes que cualquier require de Express!

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { trace, context, propagation } = require('@opentelemetry/api');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const client = require('prom-client');

// Métrica simple
const register = client.register;
client.collectDefaultMetrics();

// Counter con nombre canónico y etiquetas
const accionesCounter = new client.Counter({
  name: 'app_acciones_total',                // terminar en _total
  help: 'Acciones realizadas desde el frontend',
  labelNames: ['action_type']                // añade contexto
});

// Incremento con etiqueta (ejemplo)
app.post('/api/incrementa-accion', (req, res) => {
  const tipo = req.body?.type || 'generic';
  accionesCounter.inc({ action_type: tipo });
  res.sendStatus(200);
});

// /metrics
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});


app.post('/api/log/flujo', (req, res) => {
  // Lee la cabecera traceparent si existe
  const traceparent = req.headers['traceparent'];
  let ctx = context.active();
  if (traceparent) {
    ctx = propagation.extract(context.active(), { traceparent });
  }
  const tracer = trace.getTracer('demo-app');

  // Un solo span raíz "flujo-completo", con varios hijos dentro:
  tracer.startActiveSpan('flujo-completo', {}, ctx, (rootSpan) => {
    // Span hijo 1
    tracer.startActiveSpan('inicio', {}, context.active(), (span1) => {
      fs.appendFileSync(path.join(__dirname, 'simulado.log'), `[${new Date().toISOString()}] info: Inicio del flujo\n`);
      span1.end();
    });

    // Span hijo 2
    tracer.startActiveSpan('proceso-intermedio', {}, context.active(), (span2) => {
      fs.appendFileSync(path.join(__dirname, 'simulado.log'), `[${new Date().toISOString()}] info: Proceso intermedio\n`);
      span2.end();
    });

    // Span hijo 3
    tracer.startActiveSpan('fin', {}, context.active(), (span3) => {
      fs.appendFileSync(path.join(__dirname, 'simulado.log'), `[${new Date().toISOString()}] info: Fin del flujo\n`);
      span3.end();
    });

    rootSpan.end();
    res.status(201).send({ ok: true });
  });
});


app.post('/api/log', (req, res) => {
  // Lee la cabecera traceparent si existe (de Angular)
  const traceparent = req.headers['traceparent'];

  // Extrae contexto OTEL desde traceparent (si existe)
  let ctx = context.active();
  if (traceparent) {
    ctx = propagation.extract(context.active(), { traceparent });
  }

  const tracer = trace.getTracer('demo-app');

  // Inicia span como hijo del contexto recibido (si hay traceparent)
  tracer.startActiveSpan('procesar-log', {}, ctx, (span) => {
    const logMessage = `[${new Date().toISOString()}] ${req.body.level || 'info'}: ${req.body.message}\n`;
    fs.appendFileSync(path.join(__dirname, 'simulado.log'), logMessage);

    // Aquí podrías crear más spans hijos si quieres

    span.end();
    res.status(201).send({ ok: true });
  });
});



app.listen(PORT, () => console.log(`Logger API running on port ${PORT}`));
