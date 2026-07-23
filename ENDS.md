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
