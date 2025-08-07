# Proyecto de Observabilidad con Grafana, Prometheus, Loki, Tempo y OpenTelemetry

## Descripción

Este es un **proyecto de prueba** diseñado para **comprobar y aprender la funcionalidad de Grafana** en la observabilidad de aplicaciones modernas. El objetivo es desplegar, usando Docker Compose, un entorno completo de monitorización que integre:

- **Grafana**: visualización centralizada de datos.
- **Prometheus**: recolección y almacenamiento de métricas.
- **Loki**: gestión y consulta de logs.
- **Tempo**: almacenamiento y consulta de trazas distribuidas.
- **OpenTelemetry Collector**: recolección y exportación de telemetría (logs, métricas y trazas) de aplicaciones.

Además, incluye una **aplicación Angular** de ejemplo que simula el envío de logs, métricas y trazas al sistema, usando un backend Node.js.

---

## Objetivos

- Aprender a desplegar un stack de observabilidad moderno usando Docker.
- Entender los conceptos y diferencias entre **métricas, logs y trazas**.
- Visualizar, consultar y analizar la información enviada por una aplicación en tiempo real desde Grafana.
- Probar la integración entre aplicaciones y el stack de observabilidad.

---

## Estructura del proyecto

OBSERVABILIDAD-STACK/
├── backend_Prueba/
├── grafana/
│   ├── dashboards/
│   └── provisioning/
│       ├── datasources/
│       │   └── datasources.yml
│       └── dashboards.yml
├── loki/
│   ├── loki-data/
│   ├── storage/
│   └── local-config.yaml
├── telemetri_Angular/
├── tempo/
│   └── tempo-config.yaml
├── .gitignore
├── docker-compose.yml
├── EjercicioOpenTelemetry.pdf
├── otel-collector-config.yml
├── prometheus.yml
└── README.md


---

## Servicios incluidos

- **Grafana** (http://localhost:3000): Visualización de métricas, logs y trazas.
- **Prometheus** (http://localhost:9090): Almacenamiento y consulta de métricas.
- **Loki** (http://localhost:3100): Almacenamiento y consulta de logs.
- **Tempo** (http://localhost:3200): Almacenamiento y consulta de trazas distribuidas.
- **OTel Collector** (http://localhost:4318): Recepción y exportación de telemetría.
- **Backend de prueba** (http://localhost:3001): Recibe peticiones de la app Angular y expone métricas y logs.

---

## ¿Qué son métricas, logs y trazas?

### Métricas
- Son **valores numéricos** recogidos periódicamente.
- Permiten monitorizar el estado, rendimiento y salud de un sistema.
- Ejemplos: uso de CPU, memoria, número de peticiones, acciones de usuario.

### Logs
- Son **registros de eventos** ocurridos en la aplicación.
- Permiten analizar errores, advertencias y actividad relevante.
- Ejemplo: “Usuario realizó login”, “Error conectando a base de datos”.

### Trazas
- Permiten seguir el **recorrido completo de una petición** a través de múltiples servicios.
- Son esenciales para analizar aplicaciones distribuidas y detectar cuellos de botella.
- Ejemplo: una traza muestra cómo una petición pasa por el frontend, backend y base de datos.

---

## ¿Cómo ejecutar el proyecto?

1. **Clona este repositorio** y accede a la carpeta raíz del proyecto.
2. **Asegúrate de tener Docker y Docker Compose instalados.**
3. **Levanta el stack**:
   ```bash
   docker-compose up --build
