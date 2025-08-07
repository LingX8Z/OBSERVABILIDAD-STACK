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
```
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
```

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
    ```
### Accede a los servicios

- **Grafana:** [http://localhost:3000](http://localhost:3000)  
  *Usuario/contraseña por defecto:* `admin` / `admin`

---

### Inicia el backend de prueba (si no se inicia automáticamente)

Desde la carpeta `backend_Prueba`:

```bash
npm install
node app.js
```
### Lanza la app Angular de prueba (opcional)

Para enviar eventos simulados desde el frontend.

---

## Consultar y visualizar en Grafana

### 1. Métricas

En **Grafana**, ve a la sección **Explore** o crea un panel.

Selecciona **Prometheus** como datasource.

Ejemplo de consulta:

```promql
acciones
```

### 2. Logs

En **Grafana**, sección **Explore**, selecciona **Loki**.

Consulta básica:

```logql
{}
```

Esto mostrará todos los logs almacenados. Puedes filtrar por contenido o nivel.

---

### 3. Trazas

En **Grafana**, ve a la sección **Traces** o usa **Tempo** como datasource en Explore.

Allí puedes buscar por **traceId**, ver el recorrido de una petición y analizar latencias y cuellos de botella.

---

## Explicación detallada de las métricas

| **Nombre de la métrica**                  | **Tipo**   | **¿Qué mide?**                                                                                   |
|-------------------------------------------|------------|--------------------------------------------------------------------------------------------------|
| process_cpu_user_seconds_total            | Counter    | Tiempo total de CPU (usuario) usado por el proceso Node, en segundos.                            |
| process_cpu_system_seconds_total          | Counter    | Tiempo total de CPU (sistema) usado por el proceso Node, en segundos.                            |
| process_cpu_seconds_total                 | Counter    | Tiempo total de CPU (usuario + sistema) usado por el proceso Node, en segundos.                  |
| process_start_time_seconds                | Gauge      | Timestamp en el que inició el proceso Node.                                                      |
| process_resident_memory_bytes             | Gauge      | Memoria RAM utilizada actualmente por el proceso Node.                                           |
| process_virtual_memory_bytes              | Gauge      | Memoria virtual usada por el proceso Node.                                                       |
| process_heap_bytes                        | Gauge      | Memoria heap usada actualmente.                                                                  |
| process_heap_used_bytes                   | Gauge      | Memoria heap efectivamente utilizada.                                                            |
| process_open_fds                         | Gauge      | Número de “file descriptors” abiertos (en Linux).                                                |
| process_max_fds                          | Gauge      | Número máximo de “file descriptors” permitidos (en Linux).                                       |
| process_uptime_seconds                    | Gauge      | Tiempo (en segundos) desde que el proceso fue iniciado.                                          |
| nodejs_eventloop_lag_seconds              | Gauge      | Cuánto tarda el event loop de Node en reaccionar (latencia interna).                             |
| nodejs_active_handles_total               | Gauge      | Número de handles activos (como conexiones abiertas, timers, etc).                               |
| nodejs_active_requests_total              | Gauge      | Número de requests internos activos (como peticiones HTTP, archivos, etc).                       |
| nodejs_heap_size_total_bytes              | Gauge      | Tamaño total del heap de Node.                                                                   |
| nodejs_heap_size_used_bytes               | Gauge      | Tamaño del heap realmente usado.                                                                 |
| nodejs_external_memory_bytes              | Gauge      | Memoria usada fuera del heap de Node.                                                            |
| nodejs_heap_space_size_total_bytes        | Gauge      | Tamaño total de las zonas (espacios) del heap de Node (por tipo: new, old, code, map, etc.).     |
| nodejs_heap_space_size_used_bytes         | Gauge      | Tamaño usado de cada espacio del heap.                                                           |
| nodejs_heap_space_size_available_bytes    | Gauge      | Espacio disponible por cada zona del heap.                                                       |


---

## Diagrama del flujo de observabilidad

```mermaid
graph TD
  A[App Angular] -->|OTLP HTTP 4318| B[OpenTelemetry Collector]
 
  subgraph Collector Pipelines
    B --> C1[Exporta Métricas ➔ Prometheus]
    B --> C2[Exporta Logs ➔ Loki]
    B --> C3[Exporta Trazas ➔ Tempo]
  end
 
  C1 --> D[Grafana]
  C2 --> D
  C3 --> D
 
  subgraph Opcional
    B --> E[Elasticsearch]
    E --> F[Kibana]
  end

  ```

---

## Créditos

- [Grafana](https://grafana.com/)
- [Prometheus](https://prometheus.io/)
- [Loki](https://grafana.com/oss/loki/)
- [Tempo](https://grafana.com/oss/tempo/)
- [OpenTelemetry](https://opentelemetry.io/)
- [prom-client para Node.js](https://github.com/siimon/prom-client)
