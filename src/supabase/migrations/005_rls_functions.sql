-- =========================================================
-- Funciones helper para RLS
-- SECURITY DEFINER: corren con privilegios del dueño (bypasean
-- RLS de `usuario`/`asignacion_personal` para poder resolverlas),
-- pero solo devuelven info del usuario autenticado actual — nunca
-- reciben parámetros externos, así que no hay riesgo de fuga.
-- =========================================================

-- Fila de `usuario` vinculada al auth.uid() actual (o vacío si no existe)
create or replace function public.usuario_actual()
returns table (id uuid, empleado_id uuid, rol text, estado text)
language sql security definer stable
as $$
  select id, empleado_id, rol, estado
  from public.usuario
  where auth_user_id = auth.uid()
  limit 1;
$$;

-- ¿El usuario actual existe y está activo? (no pendiente, no suspendido)
create or replace function public.usuario_activo()
returns boolean
language sql security definer stable
as $$
  select coalesce((select estado from public.usuario_actual()) = 'activo', false);
$$;

-- Rol del usuario actual, solo si está activo (si no, null -> no matchea ninguna política de rol)
create or replace function public.rol_actual()
returns text
language sql security definer stable
as $$
  select case when public.usuario_activo() then (select rol from public.usuario_actual()) else null end;
$$;

create or replace function public.es_admin()
returns boolean
language sql security definer stable
as $$
  select public.rol_actual() = 'admin';
$$;

-- empleado_id vinculado al usuario actual (null si no está activo o no tiene empleado vinculado)
create or replace function public.empleado_actual_id()
returns uuid
language sql security definer stable
as $$
  select case when public.usuario_activo() then (select empleado_id from public.usuario_actual()) else null end;
$$;

-- Obras a las que el usuario actual (jefe de obra / empleado) está asignado
create or replace function public.obras_asignadas_actual()
returns setof uuid
language sql security definer stable
as $$
  select obra_id from public.asignacion_personal
  where empleado_id = public.empleado_actual_id()
    and public.empleado_actual_id() is not null;
$$;