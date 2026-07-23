-- =========================================================
-- Historial de estados — Obra y Certificación
-- Se completa SOLO, vía trigger, cada vez que cambia el
-- campo `estado` en `obra` o `certificacion`. Nadie escribe
-- estas tablas a mano ni desde el backend — por eso no tienen
-- política de INSERT para usuarios: el trigger corre como
-- SECURITY DEFINER (dueño de la función = rol `postgres`,
-- que en Supabase bypasea RLS), así que inserta sin
-- depender de qué política tenga el usuario que hizo el UPDATE.
-- =========================================================

-- ---------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------
create table historial_estado_obra (
  id uuid primary key default gen_random_uuid(),
  obra_id uuid not null references obra(id) on delete cascade,
  estado_anterior text,
  estado_nuevo text not null,
  fecha timestamptz not null default now(),
  cambiado_por uuid references auth.users(id),
  creado_en timestamptz not null default now(),
  creado_por uuid references auth.users(id),
  actualizado_en timestamptz not null default now(),
  actualizado_por uuid references auth.users(id)
);

create table historial_estado_certificacion (
  id uuid primary key default gen_random_uuid(),
  certificacion_id uuid not null references certificacion(id) on delete cascade,
  estado_anterior text,
  estado_nuevo text not null,
  fecha timestamptz not null default now(),
  cambiado_por uuid references auth.users(id),
  creado_en timestamptz not null default now(),
  creado_por uuid references auth.users(id),
  actualizado_en timestamptz not null default now(),
  actualizado_por uuid references auth.users(id)
);

create index idx_historial_estado_obra_obra on historial_estado_obra(obra_id);
create index idx_historial_estado_certificacion_certificacion on historial_estado_certificacion(certificacion_id);

-- ---------------------------------------------------------
-- Triggers de auditoría genérica (actualizado_en), mismo
-- mecanismo que el resto de las tablas (ver 003_triggers.sql)
-- ---------------------------------------------------------
create trigger trg_set_actualizado_en
  before update on historial_estado_obra
  for each row execute function set_actualizado_en();

create trigger trg_set_actualizado_en
  before update on historial_estado_certificacion
  for each row execute function set_actualizado_en();

-- ---------------------------------------------------------
-- Funciones + triggers que registran el cambio de estado
-- ---------------------------------------------------------
create or replace function registrar_historial_estado_obra()
returns trigger
security definer
language plpgsql
as $$
begin
  if old.estado is distinct from new.estado then
    insert into historial_estado_obra (obra_id, estado_anterior, estado_nuevo, cambiado_por, creado_por, actualizado_por)
    values (new.id, old.estado, new.estado, new.actualizado_por, new.actualizado_por, new.actualizado_por);
  end if;
  return new;
end;
$$;

create trigger trg_historial_estado_obra
  after update on obra
  for each row execute function registrar_historial_estado_obra();

create or replace function registrar_historial_estado_certificacion()
returns trigger
security definer
language plpgsql
as $$
begin
  if old.estado is distinct from new.estado then
    insert into historial_estado_certificacion (certificacion_id, estado_anterior, estado_nuevo, cambiado_por, creado_por, actualizado_por)
    values (new.id, old.estado, new.estado, new.actualizado_por, new.actualizado_por, new.actualizado_por);
  end if;
  return new;
end;
$$;

create trigger trg_historial_estado_certificacion
  after update on certificacion
  for each row execute function registrar_historial_estado_certificacion();

-- ---------------------------------------------------------
-- RLS: solo lectura para Admin / Jefe de obra. Sin política de
-- escritura a propósito — nadie inserta acá salvo el trigger.
-- ---------------------------------------------------------
alter table historial_estado_obra enable row level security;
alter table historial_estado_certificacion enable row level security;

create policy select_historial_estado_obra on historial_estado_obra for select
  using (
    public.es_admin()
    or exists (
      select 1 from obra o
      where o.id = historial_estado_obra.obra_id
    )
  );

create policy select_historial_estado_certificacion on historial_estado_certificacion for select
  using (
    public.es_admin()
    or exists (
      select 1 from certificacion c
      where c.id = historial_estado_certificacion.certificacion_id
    )
  );