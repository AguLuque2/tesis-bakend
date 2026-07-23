-- =========================================================
-- Sistema AMPER — Esquema de base de datos
-- Convención: id uuid PK, snake_case, campos de auditoría
-- en todas las tablas (creado_en/por, actualizado_en/por)
-- =========================================================

-- ---------------------------------------------------------
-- EMPLEADO
-- ---------------------------------------------------------
create table empleado (
  id uuid primary key default gen_random_uuid(),
  legajo text unique,
  nombre text not null,
  apellido text not null,
  dni text unique,
  email text unique,
  especialidad text,
  cargo text,
  estado text not null default 'activo',
  fecha_ingreso date,
  creado_en timestamptz not null default now(),
  creado_por uuid references auth.users(id),
  actualizado_en timestamptz not null default now(),
  actualizado_por uuid references auth.users(id)
);

-- ---------------------------------------------------------
-- USUARIO (identidad de acceso al sistema, vinculada a
-- Supabase Auth y opcionalmente a un EMPLEADO)
-- ---------------------------------------------------------
create table usuario (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  empleado_id uuid references empleado(id),
  nombre text not null,
  apellido text not null,
  dni text,
  email text not null unique,
  rol text not null default 'pendiente'
    check (rol in ('pendiente','admin','jefe_obra','empleado','mecanico')),
  estado text not null default 'pendiente_aprobacion'
    check (estado in ('pendiente_aprobacion','activo','suspendido')),
  telefono text,
  creado_en timestamptz not null default now(),
  creado_por uuid references auth.users(id),
  actualizado_en timestamptz not null default now(),
  actualizado_por uuid references auth.users(id)
);

-- ---------------------------------------------------------
-- OBRA
-- ---------------------------------------------------------
create table obra (
  id uuid primary key default gen_random_uuid(),
  codigo text unique,
  nombre text not null,
  cliente text,
  tipo_obra text,
  ubicacion text,
  estado text not null default 'en_ejecucion',
  fecha_inicio_planificada date,
  fecha_fin_planificada date,
  responsable text,
  descripcion text,
  creado_en timestamptz not null default now(),
  creado_por uuid references auth.users(id),
  actualizado_en timestamptz not null default now(),
  actualizado_por uuid references auth.users(id)
);

-- ---------------------------------------------------------
-- ETAPA
-- ---------------------------------------------------------
create table etapa (
  id uuid primary key default gen_random_uuid(),
  obra_id uuid not null references obra(id) on delete cascade,
  nombre text not null,
  numero int,
  empresa_ejecutora text,
  fecha_inicio_planificada date,
  fecha_fin_planificada date,
  porcentaje_avance numeric default 0,
  presupuesto_asignado numeric,
  gasto_real numeric default 0,
  creado_en timestamptz not null default now(),
  creado_por uuid references auth.users(id),
  actualizado_en timestamptz not null default now(),
  actualizado_por uuid references auth.users(id)
);

-- ---------------------------------------------------------
-- ITEM_OBRA (catálogo de ítems licitados)
-- ---------------------------------------------------------
create table item_obra (
  id uuid primary key default gen_random_uuid(),
  obra_id uuid not null references obra(id) on delete cascade,
  tramo text,
  nro_item text,
  descripcion text not null,
  unidad text,
  precio_unitario numeric,
  cantidad_contratada numeric,
  creado_en timestamptz not null default now(),
  creado_por uuid references auth.users(id),
  actualizado_en timestamptz not null default now(),
  actualizado_por uuid references auth.users(id)
);

-- ---------------------------------------------------------
-- AVANCE_DIARIO
-- ---------------------------------------------------------
create table avance_diario (
  id uuid primary key default gen_random_uuid(),
  obra_id uuid not null references obra(id) on delete cascade,
  fecha date not null,
  porcentaje_avance numeric,
  descripcion text,
  clima text,
  fotos text,
  creado_en timestamptz not null default now(),
  creado_por uuid references auth.users(id),
  actualizado_en timestamptz not null default now(),
  actualizado_por uuid references auth.users(id)
);

-- ---------------------------------------------------------
-- CERTIFICACION
-- ---------------------------------------------------------
create table certificacion (
  id uuid primary key default gen_random_uuid(),
  obra_id uuid not null references obra(id) on delete cascade,
  numero text,
  periodo_desde date,
  periodo_hasta date,
  fecha_emision date,
  estado text not null default 'borrador'
    check (estado in ('borrador','presentada','aprobada','observada','pagada')),
  monto_bruto_certificado numeric,
  porcentaje_avance_mes numeric,
  monto_acumulado numeric,
  creado_en timestamptz not null default now(),
  creado_por uuid references auth.users(id),
  actualizado_en timestamptz not null default now(),
  actualizado_por uuid references auth.users(id)
);

-- ---------------------------------------------------------
-- CERTIFICACION_ITEM
-- ---------------------------------------------------------
create table certificacion_item (
  id uuid primary key default gen_random_uuid(),
  certificacion_id uuid not null references certificacion(id) on delete cascade,
  item_obra_id uuid not null references item_obra(id),
  cantidad_anterior numeric default 0,
  cantidad_presente numeric default 0,
  cantidad_acumulada numeric default 0,
  porcentaje_anterior numeric default 0,
  porcentaje_presente numeric default 0,
  porcentaje_acumulado numeric default 0,
  monto_anterior numeric default 0,
  monto_presente numeric default 0,
  monto_acumulado numeric default 0,
  creado_en timestamptz not null default now(),
  creado_por uuid references auth.users(id),
  actualizado_en timestamptz not null default now(),
  actualizado_por uuid references auth.users(id)
);

-- ---------------------------------------------------------
-- CERTIFICACION_LIQUIDACION
-- ---------------------------------------------------------
create table certificacion_liquidacion (
  id uuid primary key default gen_random_uuid(),
  certificacion_id uuid not null references certificacion(id) on delete cascade,
  concepto text not null,
  monto numeric not null,
  creado_en timestamptz not null default now(),
  creado_por uuid references auth.users(id),
  actualizado_en timestamptz not null default now(),
  actualizado_por uuid references auth.users(id)
);

-- ---------------------------------------------------------
-- CERTIFICACION_ARCHIVO
-- ---------------------------------------------------------
create table certificacion_archivo (
  id uuid primary key default gen_random_uuid(),
  certificacion_id uuid not null references certificacion(id) on delete cascade,
  tipo text,
  nombre_archivo text not null,
  archivo text not null,
  fecha_subida date not null default current_date,
  creado_en timestamptz not null default now(),
  creado_por uuid references auth.users(id),
  actualizado_en timestamptz not null default now(),
  actualizado_por uuid references auth.users(id)
);

-- ---------------------------------------------------------
-- ASIGNACION_PERSONAL
-- ---------------------------------------------------------
create table asignacion_personal (
  id uuid primary key default gen_random_uuid(),
  obra_id uuid not null references obra(id) on delete cascade,
  empleado_id uuid not null references empleado(id) on delete cascade,
  rol_obra text,
  estado text not null default 'en_obra',
  fecha_asignacion date not null default current_date,
  creado_en timestamptz not null default now(),
  creado_por uuid references auth.users(id),
  actualizado_en timestamptz not null default now(),
  actualizado_por uuid references auth.users(id)
);

-- ---------------------------------------------------------
-- JORNADA_LABORAL
-- ---------------------------------------------------------
create table jornada_laboral (
  id uuid primary key default gen_random_uuid(),
  obra_id uuid not null references obra(id) on delete cascade,
  empleado_id uuid not null references empleado(id) on delete cascade,
  fecha date not null,
  hora_entrada time,
  hora_salida time,
  horas_normales numeric,
  horas_extra numeric,
  condicion text,
  creado_en timestamptz not null default now(),
  creado_por uuid references auth.users(id),
  actualizado_en timestamptz not null default now(),
  actualizado_por uuid references auth.users(id)
);

-- ---------------------------------------------------------
-- HISTORIAL_ESTADO_EMPLEADO
-- ---------------------------------------------------------
create table historial_estado_empleado (
  id uuid primary key default gen_random_uuid(),
  empleado_id uuid not null references empleado(id) on delete cascade,
  estado text not null,
  fecha date not null default current_date,
  motivo text,
  creado_en timestamptz not null default now(),
  creado_por uuid references auth.users(id),
  actualizado_en timestamptz not null default now(),
  actualizado_por uuid references auth.users(id)
);

-- ---------------------------------------------------------
-- VEHICULO
-- ---------------------------------------------------------
create table vehiculo (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  tipo text,
  marca text,
  modelo text,
  patente text unique,
  codigo_interno text,
  estado text not null default 'disponible',
  propio_o_alquilado text,
  fecha_proximo_mantenimiento date,
  km_proximo_mantenimiento numeric,
  creado_en timestamptz not null default now(),
  creado_por uuid references auth.users(id),
  actualizado_en timestamptz not null default now(),
  actualizado_por uuid references auth.users(id)
);

-- ---------------------------------------------------------
-- ASIGNACION_VEHICULO
-- ---------------------------------------------------------
create table asignacion_vehiculo (
  id uuid primary key default gen_random_uuid(),
  obra_id uuid not null references obra(id) on delete cascade,
  vehiculo_id uuid not null references vehiculo(id) on delete cascade,
  empleado_id uuid not null references empleado(id),
  fecha_inicio date not null default current_date,
  fecha_fin date,
  creado_en timestamptz not null default now(),
  creado_por uuid references auth.users(id),
  actualizado_en timestamptz not null default now(),
  actualizado_por uuid references auth.users(id)
);

-- ---------------------------------------------------------
-- USO_VEHICULO
-- ---------------------------------------------------------
create table uso_vehiculo (
  id uuid primary key default gen_random_uuid(),
  obra_id uuid not null references obra(id) on delete cascade,
  vehiculo_id uuid not null references vehiculo(id) on delete cascade,
  empleado_id uuid not null references empleado(id),
  fecha date not null,
  hora_inicio time,
  hora_fin time,
  observaciones text,
  creado_en timestamptz not null default now(),
  creado_por uuid references auth.users(id),
  actualizado_en timestamptz not null default now(),
  actualizado_por uuid references auth.users(id)
);

-- ---------------------------------------------------------
-- MANTENIMIENTO
-- ---------------------------------------------------------
create table mantenimiento (
  id uuid primary key default gen_random_uuid(),
  vehiculo_id uuid not null references vehiculo(id) on delete cascade,
  fecha_ingreso date,
  fecha_salida date,
  tipo text,
  descripcion text,
  costo_total numeric,
  taller text,
  creado_en timestamptz not null default now(),
  creado_por uuid references auth.users(id),
  actualizado_en timestamptz not null default now(),
  actualizado_por uuid references auth.users(id)
);

-- ---------------------------------------------------------
-- MATERIAL (catálogo)
-- ---------------------------------------------------------
create table material (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  categoria text,
  unidad_medida text,
  codigo_interno text,
  estado text not null default 'activo',
  creado_en timestamptz not null default now(),
  creado_por uuid references auth.users(id),
  actualizado_en timestamptz not null default now(),
  actualizado_por uuid references auth.users(id)
);

-- ---------------------------------------------------------
-- PROVEEDOR
-- ---------------------------------------------------------
create table proveedor (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  direccion text,
  mail text,
  cuit text unique,
  telefonos text,
  creado_en timestamptz not null default now(),
  creado_por uuid references auth.users(id),
  actualizado_en timestamptz not null default now(),
  actualizado_por uuid references auth.users(id)
);

-- ---------------------------------------------------------
-- ORDEN_COMPRA
-- ---------------------------------------------------------
create table orden_compra (
  id uuid primary key default gen_random_uuid(),
  obra_id uuid not null references obra(id) on delete cascade,
  proveedor_id uuid not null references proveedor(id),
  codigo text unique,
  concepto text,
  fecha_emision date,
  plazo text,
  fecha_vencimiento date,
  condicion_pago text,
  importe_ars numeric,
  importe_usd numeric,
  estado text not null default 'pendiente'
    check (estado in ('pendiente','entregado_parcial','entregado_completo','facturado','pagado','vencido','cancelado')),
  creado_en timestamptz not null default now(),
  creado_por uuid references auth.users(id),
  actualizado_en timestamptz not null default now(),
  actualizado_por uuid references auth.users(id)
);

-- ---------------------------------------------------------
-- RECEPCION_MATERIAL
-- ---------------------------------------------------------
create table recepcion_material (
  id uuid primary key default gen_random_uuid(),
  orden_compra_id uuid not null references orden_compra(id) on delete cascade,
  material_id uuid not null references material(id),
  fecha date not null default current_date,
  cantidad_recibida numeric,
  cantidad_rechazada numeric default 0,
  remito text,
  creado_en timestamptz not null default now(),
  creado_por uuid references auth.users(id),
  actualizado_en timestamptz not null default now(),
  actualizado_por uuid references auth.users(id)
);

-- ---------------------------------------------------------
-- USO_MATERIAL
-- ---------------------------------------------------------
create table uso_material (
  id uuid primary key default gen_random_uuid(),
  obra_id uuid not null references obra(id) on delete cascade,
  material_id uuid not null references material(id),
  fecha date not null default current_date,
  cantidad_usada numeric,
  tarea text,
  creado_en timestamptz not null default now(),
  creado_por uuid references auth.users(id),
  actualizado_en timestamptz not null default now(),
  actualizado_por uuid references auth.users(id)
);

-- ---------------------------------------------------------
-- STOCK_OBRA (se recalcula por trigger, no se carga a mano)
-- ---------------------------------------------------------
create table stock_obra (
  id uuid primary key default gen_random_uuid(),
  obra_id uuid not null references obra(id) on delete cascade,
  material_id uuid not null references material(id),
  cantidad_disponible numeric not null default 0,
  ultima_actualizacion timestamptz not null default now(),
  creado_en timestamptz not null default now(),
  creado_por uuid references auth.users(id),
  actualizado_en timestamptz not null default now(),
  actualizado_por uuid references auth.users(id),
  unique (obra_id, material_id)
);

-- ---------------------------------------------------------
-- ALERTA
-- ---------------------------------------------------------
create table alerta (
  id uuid primary key default gen_random_uuid(),
  obra_id uuid not null references obra(id) on delete cascade,
  tipo text,
  nivel_urgencia text,
  fecha_generacion timestamptz not null default now(),
  descripcion text,
  estado text not null default 'activa',
  creado_en timestamptz not null default now(),
  creado_por uuid references auth.users(id),
  actualizado_en timestamptz not null default now(),
  actualizado_por uuid references auth.users(id)
);

-- ---------------------------------------------------------
-- NOVEDAD
-- ---------------------------------------------------------
create table novedad (
  id uuid primary key default gen_random_uuid(),
  obra_id uuid not null references obra(id) on delete cascade,
  usuario_id uuid references usuario(id),
  fecha date not null default current_date,
  texto text not null,
  etiqueta text,
  archivos_adjuntos text,
  creado_en timestamptz not null default now(),
  creado_por uuid references auth.users(id),
  actualizado_en timestamptz not null default now(),
  actualizado_por uuid references auth.users(id)
);

-- ---------------------------------------------------------
-- TIPO_ACTIVIDAD (plantilla)
-- ---------------------------------------------------------
create table tipo_actividad (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  creado_en timestamptz not null default now(),
  creado_por uuid references auth.users(id),
  actualizado_en timestamptz not null default now(),
  actualizado_por uuid references auth.users(id)
);

-- ---------------------------------------------------------
-- CAMPO_PLANTILLA
-- ---------------------------------------------------------
create table campo_plantilla (
  id uuid primary key default gen_random_uuid(),
  tipo_actividad_id uuid not null references tipo_actividad(id) on delete cascade,
  nombre_campo text not null,
  orden int default 0,
  creado_en timestamptz not null default now(),
  creado_por uuid references auth.users(id),
  actualizado_en timestamptz not null default now(),
  actualizado_por uuid references auth.users(id)
);

-- ---------------------------------------------------------
-- ACTIVIDAD
-- ---------------------------------------------------------
create table actividad (
  id uuid primary key default gen_random_uuid(),
  etapa_id uuid not null references etapa(id) on delete cascade,
  tipo_actividad_id uuid not null references tipo_actividad(id),
  identificador text not null,
  fecha date,
  estado text default 'pendiente',
  creado_en timestamptz not null default now(),
  creado_por uuid references auth.users(id),
  actualizado_en timestamptz not null default now(),
  actualizado_por uuid references auth.users(id)
);

-- ---------------------------------------------------------
-- ACTIVIDAD_DATO
-- ---------------------------------------------------------
create table actividad_dato (
  id uuid primary key default gen_random_uuid(),
  actividad_id uuid not null references actividad(id) on delete cascade,
  campo_plantilla_id uuid not null references campo_plantilla(id),
  valor text,
  creado_en timestamptz not null default now(),
  creado_por uuid references auth.users(id),
  actualizado_en timestamptz not null default now(),
  actualizado_por uuid references auth.users(id),
  unique (actividad_id, campo_plantilla_id)
);

-- ---------------------------------------------------------
-- ETAPA_ARCHIVO (excel original de piquetes/estructuras, etc.)
-- ---------------------------------------------------------
create table etapa_archivo (
  id uuid primary key default gen_random_uuid(),
  etapa_id uuid not null references etapa(id) on delete cascade,
  tipo text,
  nombre_archivo text not null,
  archivo text not null,
  fecha_subida date not null default current_date,
  creado_en timestamptz not null default now(),
  creado_por uuid references auth.users(id),
  actualizado_en timestamptz not null default now(),
  actualizado_por uuid references auth.users(id)
);

-- ---------------------------------------------------------
-- DOCUMENTO
-- ---------------------------------------------------------
create table documento (
  id uuid primary key default gen_random_uuid(),
  obra_id uuid not null references obra(id) on delete cascade,
  nombre text not null,
  categoria text,
  tipo_archivo text,
  tamano text,
  archivo text not null,
  fecha_subida date not null default current_date,
  subido_por uuid references auth.users(id),
  estado text not null default 'vigente'
    check (estado in ('vigente','revision','obsoleto')),
  creado_en timestamptz not null default now(),
  creado_por uuid references auth.users(id),
  actualizado_en timestamptz not null default now(),
  actualizado_por uuid references auth.users(id)
);

-- ---------------------------------------------------------
-- PARTIDA_PRESUPUESTARIA
-- ---------------------------------------------------------
create table partida_presupuestaria (
  id uuid primary key default gen_random_uuid(),
  obra_id uuid not null references obra(id) on delete cascade,
  categoria text not null,
  monto_presupuestado numeric not null default 0,
  creado_en timestamptz not null default now(),
  creado_por uuid references auth.users(id),
  actualizado_en timestamptz not null default now(),
  actualizado_por uuid references auth.users(id)
);

-- ---------------------------------------------------------
-- GASTO
-- ---------------------------------------------------------
create table gasto (
  id uuid primary key default gen_random_uuid(),
  partida_presupuestaria_id uuid not null references partida_presupuestaria(id) on delete cascade,
  fecha date not null default current_date,
  concepto text,
  monto numeric not null,
  creado_en timestamptz not null default now(),
  creado_por uuid references auth.users(id),
  actualizado_en timestamptz not null default now(),
  actualizado_por uuid references auth.users(id)
);