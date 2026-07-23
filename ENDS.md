## Obra

`Obra` incluye siempre `creadoEn`, `creadoPor`, `actualizadoEn`, `actualizadoPor`.

### GET /obras
- **Auth**: cualquier usuario autenticado
- **Query**: `estado?`, `page` (default 1), `pageSize` (default 20, max 100)
- **Responde**: `{ data: Obra[], meta: { total, page, pageSize } }`

### GET /obras/:id
- **Auth**: cualquier usuario autenticado
- **Responde**: `{ data: Obra }` — 404 si no existe

### POST /obras
- **Auth**: `admin`
- **Body**:
```json
{
  "codigo": "OBR-001",
  "nombre": "Tendido eléctrico Ruta 5",
  "cliente": "Municipalidad de Ejemplo",
  "tipoObra": "tendido_electrico",
  "ubicacion": "Ruta 5 km 12, Ejemplo",
  "fechaInicioPlanificada": "2026-08-01",
  "fechaFinPlanificada": "2026-12-15",
  "responsable": "Juan Pérez",
  "descripcion": "Instalación de tendido eléctrico de media tensión"
}
```
- **Responde**: `{ data: Obra }` (201)

### PATCH /obras/:id
- **Auth**: `admin`, `jefe_obra`
- **Body**: mismos campos que POST, todos opcionales
- **Responde**: `{ data: Obra }` — 404 si no existe

---

## Etapa

`Etapa` incluye siempre `creadoEn`, `creadoPor`, `actualizadoEn`, `actualizadoPor`. `numero` es autoincremental por obra (lo calcula el backend con `max(numero)+1`, nunca se manda en el body) y `nombre` es único dentro de la misma obra — requiere correr `etapa_unicidad.sql` en la base (agrega `unique(obra_id, numero)` y `unique(obra_id, nombre)`; si ya tenés etapas duplicadas de antes, borrá una primero o la migración va a fallar).

### GET /obras/:obraId/etapas
- **Auth**: cualquier usuario autenticado
- **Query**: `page`, `pageSize`
- **Responde**: `{ data: Etapa[], meta: { total, page, pageSize } }`

### POST /obras/:obraId/etapas
- **Auth**: `admin`, `jefe_obra`
- **Body** (sin `numero`, se asigna solo):
```json
{
  "nombre": "Fundaciones",
  "empresaEjecutora": "AMPER S.A.",
  "fechaInicioPlanificada": "2026-08-01",
  "fechaFinPlanificada": "2026-09-15",
  "porcentajeAvance": 0,
  "presupuestoAsignado": 2500000,
  "gastoReal": 0
}
```
- **Responde**: `{ data: Etapa }` (201) — 409 si ya existe una etapa con ese `nombre` en la obra

### GET /etapas/:id
- **Auth**: cualquier usuario autenticado
- **Responde**: `{ data: Etapa }` — 404 si no existe

### PATCH /etapas/:id
- **Auth**: `admin`, `jefe_obra`
- **Body**: mismos campos que POST, todos opcionales
```json
{
  "porcentajeAvance": 35,
  "gastoReal": 900000
}
```
- **Responde**: `{ data: Etapa }` — 404 si no existe — 409 si el `nombre` nuevo choca con otra etapa de la misma obra

### DELETE /etapas/:id
- **Auth**: `admin` (jefe_obra no puede borrar — mismo criterio que `delete_solo_admin` de la base)
- **Responde**: 204 sin body — 404 si no existe

---

## Ítem de obra

`ItemObra` incluye siempre `creadoEn`, `creadoPor`, `actualizadoEn`, `actualizadoPor`. Es el catálogo de ítems licitados de una obra (de acá salen los `itemObraId` que pide `certificacion_item`).

### GET /obras/:obraId/items
- **Auth**: cualquier usuario autenticado
- **Query**: `page`, `pageSize`
- **Responde**: `{ data: ItemObra[], meta: { total, page, pageSize } }`

### POST /obras/:obraId/items
- **Auth**: `admin`, `jefe_obra`
- **Body**:
```json
{
  "tramo": "Tramo 1",
  "nroItem": "1.1",
  "descripcion": "Excavación de zanja para tendido subterráneo",
  "unidad": "m",
  "precioUnitario": 5000,
  "cantidadContratada": 200
}
```
- **Responde**: `{ data: ItemObra }` (201)

### GET /items/:id
- **Auth**: cualquier usuario autenticado
- **Responde**: `{ data: ItemObra }` — 404 si no existe

### PATCH /items/:id
- **Auth**: `admin`, `jefe_obra`
- **Body**: mismos campos que POST, todos opcionales
```json
{
  "precioUnitario": 5500,
  "cantidadContratada": 220
}
```
- **Responde**: `{ data: ItemObra }` — 404 si no existe

### DELETE /items/:id
- **Auth**: `admin` (jefe_obra no puede borrar — mismo criterio que `delete_solo_admin` de la base)
- **Responde**: 204 sin body — 404 si no existe

---
## Certificación

`Certificacion` incluye siempre `creadoEn`, `creadoPor`, `actualizadoEn`, `actualizadoPor`.

### GET /obras/:obraId/certificaciones
- **Auth**: `admin`, `jefe_obra`
- **Query**: `estado?`, `page`, `pageSize`
- **Responde**: `{ data: Certificacion[], meta: { total, page, pageSize } }`

### GET /certificaciones/:id
- **Auth**: `admin`, `jefe_obra`
- **Responde**: `{ data: Certificacion }` — 404 si no existe

### POST /obras/:obraId/certificaciones
- **Auth**: `admin`, `jefe_obra`
- **Body**:
```json
{
  "numero": "CERT-001",
  "periodoDesde": "2026-07-01",
  "periodoHasta": "2026-07-31",
  "fechaEmision": "2026-08-05",
  "montoBrutoCertificado": 1500000,
  "porcentajeAvanceMes": 25,
  "montoAcumulado": 4500000
}
```
- **Nota**: siempre arranca en estado `borrador`
- **Responde**: `{ data: Certificacion }` (201)

### PATCH /certificaciones/:id
- **Auth**: `admin`, `jefe_obra`
- **Body**: mismos campos que POST, todos opcionales — no incluye `estado` (se maneja en otro endpoint)
```json
{
  "numero": "CERT-001-B",
  "montoBrutoCertificado": 1600000,
  "porcentajeAvanceMes": 30,
  "montoAcumulado": 4800000
}
```
- **Responde**: `{ data: Certificacion }` — 404 si no existe

---

## Certificación-item

`CertificacionItem` incluye siempre `creadoEn`, `creadoPor`, `actualizadoEn`, `actualizadoPor`. `itemObraId` referencia a `item_obra` (tabla ya existente, sin módulo propio todavía).

### GET /certificaciones/:certificacionId/items
- **Auth**: `admin`, `jefe_obra`
- **Query**: `page`, `pageSize`
- **Responde**: `{ data: CertificacionItem[], meta: { total, page, pageSize } }`

### POST /certificaciones/:certificacionId/items
- **Auth**: `admin`, `jefe_obra`
- **Body**:
```json
{
  "itemObraId": "00000000-0000-0000-0000-000000000000",
  "cantidadAnterior": 10,
  "cantidadPresente": 5,
  "cantidadAcumulada": 15,
  "porcentajeAnterior": 20,
  "porcentajePresente": 10,
  "porcentajeAcumulado": 30,
  "montoAnterior": 100000,
  "montoPresente": 50000,
  "montoAcumulado": 150000
}
```
- **Nota**: reemplazá `itemObraId` por un `id` real de la tabla `item_obra` (FK obligatoria)
- **Responde**: `{ data: CertificacionItem }` (201)

### GET /certificacion-items/:id
- **Auth**: `admin`, `jefe_obra`
- **Responde**: `{ data: CertificacionItem }` — 404 si no existe

### PATCH /certificacion-items/:id
- **Auth**: `admin`, `jefe_obra`
- **Body**: mismos campos que POST, todos opcionales
```json
{
  "cantidadPresente": 8,
  "porcentajePresente": 16,
  "montoPresente": 80000
}
```
- **Responde**: `{ data: CertificacionItem }` — 404 si no existe

### DELETE /certificacion-items/:id
- **Auth**: `admin` (jefe_obra no puede borrar — mismo criterio que la política `delete_cascada` de la base)
- **Responde**: 204 sin body — 404 si no existe

---

## Historial de estado

Solo lectura — se llena solo vía trigger cada vez que cambia `estado` en `obra` o `certificacion`. No hay POST/PATCH.

### GET /obras/:obraId/historial-estados
- **Auth**: cualquier usuario autenticado
- **Query**: `page`, `pageSize`
- **Responde**: `{ data: HistorialEstadoObra[], meta: { total, page, pageSize } }`, ordenado por `fecha` descendente
  - `HistorialEstadoObra`: `{ id, obraId, estadoAnterior, estadoNuevo, fecha, cambiadoPor, creadoEn, creadoPor, actualizadoEn, actualizadoPor }`

### GET /certificaciones/:certificacionId/historial-estados
- **Auth**: `admin`, `jefe_obra`
- **Query**: `page`, `pageSize`
- **Responde**: `{ data: HistorialEstadoCertificacion[], meta: { total, page, pageSize } }`, ordenado por `fecha` descendente
  - `HistorialEstadoCertificacion`: `{ id, certificacionId, estadoAnterior, estadoNuevo, fecha, cambiadoPor, creadoEn, creadoPor, actualizadoEn, actualizadoPor }`
