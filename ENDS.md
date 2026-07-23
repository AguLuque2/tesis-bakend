## Documento

`Documento` incluye siempre `creadoEn`, `creadoPor`, `actualizadoEn`, `actualizadoPor`. Es la lista general de documentación de una obra (planos, contratos, etc.) — distinta de `etapa_archivo`, que es específico de excels por etapa. **Acá sí hay upload real**: el archivo se sube a un bucket privado de Supabase Storage (`documento_storage_bucket.sql`), nunca queda expuesto por URL pública; para descargarlo hay que pedir la URL firmada (expira en `DOCUMENTO_URL_DESCARGA_EXPIRA_SEGUNDOS`, default 300s).

En Postman: el POST **no es JSON**, es `form-data`. `tipoArchivo` y `tamano` los calcula el backend a partir del archivo subido (nunca confiar en lo que mande el cliente); no se piden en el body.

### GET /obras/:obraId/documentos
- **Auth**: cualquier usuario autenticado
- **Query**: `estado?` (`vigente`|`revision`|`obsoleto`), `page`, `pageSize`
- **Responde**: `{ data: Documento[], meta: { total, page, pageSize } }`

### POST /obras/:obraId/documentos
- **Auth**: `admin`, `jefe_obra`
- **Body**: `form-data` (no JSON), campos:
  - `archivo` → tipo **File** (el binario real)
  - `nombre` → texto, opcional (si no se manda, usa el nombre original del archivo)
  - `categoria` → texto, opcional (ej: "plano", "contrato")
  - `fechaSubida` → texto, opcional (`YYYY-MM-DD`, default hoy)
- **Responde**: `{ data: Documento }` (201)

### GET /documentos/:id
- **Auth**: cualquier usuario autenticado
- **Responde**: `{ data: Documento }` — 404 si no existe

### GET /documentos/:id/descargar
- **Auth**: cualquier usuario autenticado
- **Responde**: `{ data: { url, expiraEnSegundos } }` — la `url` es la signed URL de Supabase Storage, para abrir/descargar directo desde el navegador o el dispositivo del usuario. 404 si el documento no existe (o no es visible para el usuario según RLS)

### PATCH /documentos/:id
- **Auth**: `admin`, `jefe_obra`
- **Body**: JSON normal (esto no reemplaza el archivo, solo metadata)
```json
{
  "nombre": "Plano eléctrico rev. B",
  "categoria": "plano",
  "estado": "revision"
}
```
- **Responde**: `{ data: Documento }` — 404 si no existe

### DELETE /documentos/:id
- **Auth**: `admin` (jefe_obra no puede borrar — mismo criterio que `delete_solo_admin` de la base)
- **Responde**: 204 sin body — 404 si no existe. Borra la fila y el objeto en Storage.

---

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

## Actividad

`Actividad` incluye siempre `creadoEn`, `creadoPor`, `actualizadoEn`, `actualizadoPor`. Cuelga de `etapa` (no de `obra` directo). `tipoActividadId` referencia a `tipo_actividad` (catálogo ya existente en el schema, sin módulo propio en el backend todavía — necesitás un `id` real de esa tabla para crear una actividad). `estado` arranca en `pendiente` (default de la base, no se manda en el POST) y es texto libre, sin enum ni historial de estado como `obra`/`certificacion`.

### GET /etapas/:etapaId/actividades
- **Auth**: cualquier usuario autenticado
- **Query**: `page`, `pageSize`
- **Responde**: `{ data: Actividad[], meta: { total, page, pageSize } }`

### POST /etapas/:etapaId/actividades
- **Auth**: `admin`, `jefe_obra`
- **Body**:
```json
{
  "tipoActividadId": "00000000-0000-0000-0000-000000000000",
  "identificador": "P-001",
  "fecha": "2026-08-05"
}
```
- **Nota**: reemplazá `tipoActividadId` por un `id` real de `tipo_actividad` (FK obligatoria)
- **Responde**: `{ data: Actividad }` (201)

### GET /actividades/:id
- **Auth**: cualquier usuario autenticado
- **Responde**: `{ data: Actividad }` — 404 si no existe

### PATCH /actividades/:id
- **Auth**: `admin`, `jefe_obra`
- **Body**: mismos campos que POST, todos opcionales, más `estado` (texto libre)
```json
{
  "estado": "completada",
  "fecha": "2026-08-06"
}
```
- **Responde**: `{ data: Actividad }` — 404 si no existe

### DELETE /actividades/:id
- **Auth**: `admin` (jefe_obra no puede borrar — mismo criterio que `delete_cascada` de la base)
- **Responde**: 204 sin body — 404 si no existe

---

## Archivo de etapa

`EtapaArchivo` incluye siempre `creadoEn`, `creadoPor`, `actualizadoEn`, `actualizadoPor`. Cuelga de `etapa` (excel original de piquetes/estructuras, etc.). No hay upload de binarios en el backend todavía — `archivo` es una referencia (URL o path a donde esté guardado el archivo real), no el contenido. `fechaSubida` es opcional, default `current_date` en la base si no se manda.

### GET /etapas/:etapaId/archivos
- **Auth**: cualquier usuario autenticado
- **Query**: `page`, `pageSize`
- **Responde**: `{ data: EtapaArchivo[], meta: { total, page, pageSize } }`

### POST /etapas/:etapaId/archivos
- **Auth**: `admin`, `jefe_obra`
- **Body**:
```json
{
  "tipo": "excel_piquetes",
  "nombreArchivo": "piquetes_tramo1.xlsx",
  "archivo": "https://storage.ejemplo.com/obras/piquetes_tramo1.xlsx",
  "fechaSubida": "2026-08-05"
}
```
- **Responde**: `{ data: EtapaArchivo }` (201)

### GET /etapa-archivos/:id
- **Auth**: cualquier usuario autenticado
- **Responde**: `{ data: EtapaArchivo }` — 404 si no existe

### PATCH /etapa-archivos/:id
- **Auth**: `admin`, `jefe_obra`
- **Body**: mismos campos que POST, todos opcionales
```json
{
  "nombreArchivo": "piquetes_tramo1_v2.xlsx"
}
```
- **Responde**: `{ data: EtapaArchivo }` — 404 si no existe

### DELETE /etapa-archivos/:id
- **Auth**: `admin` (jefe_obra no puede borrar — mismo criterio que `delete_cascada` de la base)
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
