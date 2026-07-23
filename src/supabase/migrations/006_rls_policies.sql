-- =========================================================
-- Políticas de RLS — Sistema AMPER
-- Requiere 005_rls_functions.sql aplicado antes.
-- Criterio de roles:
--   admin      -> acceso total a todo
--   jefe_obra  -> lee y escribe solo en las obras que tiene asignadas
--   empleado   -> lee lo de sus obras asignadas; escribe solo sus
--                 propios registros de jornada laboral y uso de vehículo
--   mecanico   -> acceso total a vehículos/mantenimiento, nada de obras
-- =========================================================

-- Por las dudas (si se corre esta migración desde cero en otro entorno)
do $$
declare
  t text;
begin
  for t in
    select table_name from information_schema.tables
    where table_schema = 'public' and table_type = 'BASE TABLE'
  loop
    execute format('alter table %I enable row level security;', t);
  end loop;
end $$;

-- ---------------------------------------------------------
-- GRUPO A — Tablas con obra_id directo.
-- select: admin o asignado a esa obra.
-- insert/update: admin o jefe_obra asignado a esa obra.
-- delete: solo admin.
-- ---------------------------------------------------------
do $$
declare
  t text;
  tablas text[] := array[
    'etapa', 'item_obra', 'avance_diario', 'certificacion',
    'asignacion_personal', 'jornada_laboral', 'asignacion_vehiculo',
    'uso_vehiculo', 'documento', 'partida_presupuestaria',
    'orden_compra', 'uso_material', 'stock_obra', 'alerta', 'novedad'
  ];
begin
  foreach t in array tablas loop
    execute format($f$
      create policy select_por_obra on %I
      for select
      using ( public.es_admin() or obra_id in (select public.obras_asignadas_actual()) );
    $f$, t);

    execute format($f$
      create policy insert_admin_o_jefe on %I
      for insert
      with check (
        public.es_admin()
        or (public.rol_actual() = 'jefe_obra' and obra_id in (select public.obras_asignadas_actual()))
      );
    $f$, t);

    execute format($f$
      create policy update_admin_o_jefe on %I
      for update
      using (
        public.es_admin()
        or (public.rol_actual() = 'jefe_obra' and obra_id in (select public.obras_asignadas_actual()))
      )
      with check (
        public.es_admin()
        or (public.rol_actual() = 'jefe_obra' and obra_id in (select public.obras_asignadas_actual()))
      );
    $f$, t);

    execute format($f$
      create policy delete_solo_admin on %I
      for delete
      using ( public.es_admin() );
    $f$, t);
  end loop;
end $$;

-- ---------------------------------------------------------
-- GRUPO B — Tablas "hijas" que dependen de una tabla del grupo A
-- (no tienen obra_id directo). La visibilidad se resuelve en cascada:
-- si la fila padre es visible (porque su propia política ya lo filtró),
-- la fila hija también lo es. Evita repetir la lógica de obra_id.
-- ---------------------------------------------------------

-- certificacion_item, certificacion_liquidacion, certificacion_archivo -> certificacion
create policy select_cascada on certificacion_item for select
  using ( exists (select 1 from certificacion c where c.id = certificacion_item.certificacion_id) );
create policy insert_cascada on certificacion_item for insert
  with check ( public.es_admin() or public.rol_actual() = 'jefe_obra' );
create policy update_cascada on certificacion_item for update
  using ( exists (select 1 from certificacion c where c.id = certificacion_item.certificacion_id) )
  with check ( public.es_admin() or public.rol_actual() = 'jefe_obra' );
create policy delete_cascada on certificacion_item for delete using ( public.es_admin() );

create policy select_cascada on certificacion_liquidacion for select
  using ( exists (select 1 from certificacion c where c.id = certificacion_liquidacion.certificacion_id) );
create policy insert_cascada on certificacion_liquidacion for insert
  with check ( public.es_admin() or public.rol_actual() = 'jefe_obra' );
create policy update_cascada on certificacion_liquidacion for update
  using ( exists (select 1 from certificacion c where c.id = certificacion_liquidacion.certificacion_id) )
  with check ( public.es_admin() or public.rol_actual() = 'jefe_obra' );
create policy delete_cascada on certificacion_liquidacion for delete using ( public.es_admin() );

create policy select_cascada on certificacion_archivo for select
  using ( exists (select 1 from certificacion c where c.id = certificacion_archivo.certificacion_id) );
create policy insert_cascada on certificacion_archivo for insert
  with check ( public.es_admin() or public.rol_actual() = 'jefe_obra' );
create policy update_cascada on certificacion_archivo for update
  using ( exists (select 1 from certificacion c where c.id = certificacion_archivo.certificacion_id) )
  with check ( public.es_admin() or public.rol_actual() = 'jefe_obra' );
create policy delete_cascada on certificacion_archivo for delete using ( public.es_admin() );

-- recepcion_material -> orden_compra
create policy select_cascada on recepcion_material for select
  using ( exists (select 1 from orden_compra o where o.id = recepcion_material.orden_compra_id) );
create policy insert_cascada on recepcion_material for insert
  with check ( public.es_admin() or public.rol_actual() = 'jefe_obra' );
create policy update_cascada on recepcion_material for update
  using ( exists (select 1 from orden_compra o where o.id = recepcion_material.orden_compra_id) )
  with check ( public.es_admin() or public.rol_actual() = 'jefe_obra' );
create policy delete_cascada on recepcion_material for delete using ( public.es_admin() );

-- gasto -> partida_presupuestaria
create policy select_cascada on gasto for select
  using ( exists (select 1 from partida_presupuestaria p where p.id = gasto.partida_presupuestaria_id) );
create policy insert_cascada on gasto for insert
  with check ( public.es_admin() or public.rol_actual() = 'jefe_obra' );
create policy update_cascada on gasto for update
  using ( exists (select 1 from partida_presupuestaria p where p.id = gasto.partida_presupuestaria_id) )
  with check ( public.es_admin() or public.rol_actual() = 'jefe_obra' );
create policy delete_cascada on gasto for delete using ( public.es_admin() );

-- etapa_archivo, actividad -> etapa
create policy select_cascada on etapa_archivo for select
  using ( exists (select 1 from etapa e where e.id = etapa_archivo.etapa_id) );
create policy insert_cascada on etapa_archivo for insert
  with check ( public.es_admin() or public.rol_actual() = 'jefe_obra' );
create policy update_cascada on etapa_archivo for update
  using ( exists (select 1 from etapa e where e.id = etapa_archivo.etapa_id) )
  with check ( public.es_admin() or public.rol_actual() = 'jefe_obra' );
create policy delete_cascada on etapa_archivo for delete using ( public.es_admin() );

create policy select_cascada on actividad for select
  using ( exists (select 1 from etapa e where e.id = actividad.etapa_id) );
create policy insert_cascada on actividad for insert
  with check ( public.es_admin() or public.rol_actual() = 'jefe_obra' );
create policy update_cascada on actividad for update
  using ( exists (select 1 from etapa e where e.id = actividad.etapa_id) )
  with check ( public.es_admin() or public.rol_actual() = 'jefe_obra' );
create policy delete_cascada on actividad for delete using ( public.es_admin() );

-- actividad_dato -> actividad (que a su vez ya cascadea a etapa)
create policy select_cascada on actividad_dato for select
  using ( exists (select 1 from actividad a where a.id = actividad_dato.actividad_id) );
create policy insert_cascada on actividad_dato for insert
  with check ( public.es_admin() or public.rol_actual() = 'jefe_obra' );
create policy update_cascada on actividad_dato for update
  using ( exists (select 1 from actividad a where a.id = actividad_dato.actividad_id) )
  with check ( public.es_admin() or public.rol_actual() = 'jefe_obra' );
create policy delete_cascada on actividad_dato for delete using ( public.es_admin() );

-- ---------------------------------------------------------
-- GRUPO C — Catálogos globales (no dependen de una obra).
-- select: cualquier usuario activo. escritura: solo admin.
-- ---------------------------------------------------------
do $$
declare
  t text;
  tablas text[] := array['empleado', 'material', 'proveedor', 'tipo_actividad', 'campo_plantilla'];
begin
  foreach t in array tablas loop
    execute format($f$
      create policy select_activos on %I
      for select
      using ( public.usuario_activo() );
    $f$, t);

    execute format($f$
      create policy escritura_solo_admin on %I
      for all
      using ( public.es_admin() )
      with check ( public.es_admin() );
    $f$, t);
  end loop;
end $$;

-- ---------------------------------------------------------
-- GRUPO D — Casos particulares
-- ---------------------------------------------------------

-- OBRA: no tiene obra_id (es ella misma). Solo admin la crea.
create policy select_obra on obra for select
  using ( public.es_admin() or id in (select public.obras_asignadas_actual()) );
create policy insert_obra on obra for insert
  with check ( public.es_admin() );
create policy update_obra on obra for update
  using ( public.es_admin() or (public.rol_actual() = 'jefe_obra' and id in (select public.obras_asignadas_actual())) )
  with check ( public.es_admin() or (public.rol_actual() = 'jefe_obra' and id in (select public.obras_asignadas_actual())) );
create policy delete_obra on obra for delete using ( public.es_admin() );

-- USUARIO: cada quien ve su propia fila; el admin gestiona todo
-- (aprobar pendientes, asignar roles). El alta de un usuario nuevo
-- se hace vía backend con la service_role key (bypasea RLS), como
-- parte del flujo de invitación — no vía insert directo del cliente.
create policy select_propio_o_admin on usuario for select
  using ( public.es_admin() or auth_user_id = auth.uid() );
create policy admin_gestiona_usuarios on usuario for all
  using ( public.es_admin() )
  with check ( public.es_admin() );

-- VEHICULO: cualquier usuario activo lo ve. Solo admin o mecánico lo editan.
create policy select_vehiculo on vehiculo for select
  using ( public.usuario_activo() );
create policy escritura_vehiculo on vehiculo for all
  using ( public.es_admin() or public.rol_actual() = 'mecanico' )
  with check ( public.es_admin() or public.rol_actual() = 'mecanico' );

-- MANTENIMIENTO: mismo criterio que vehículo.
create policy select_mantenimiento on mantenimiento for select
  using ( public.usuario_activo() );
create policy escritura_mantenimiento on mantenimiento for all
  using ( public.es_admin() or public.rol_actual() = 'mecanico' )
  with check ( public.es_admin() or public.rol_actual() = 'mecanico' );

-- HISTORIAL_ESTADO_EMPLEADO: no depende de obra_id. Admin y jefe de
-- obra pueden ver y registrar cambios de estado; solo admin edita/borra.
create policy select_historial on historial_estado_empleado for select
  using ( public.es_admin() or public.rol_actual() = 'jefe_obra' );
create policy insert_historial on historial_estado_empleado for insert
  with check ( public.es_admin() or public.rol_actual() = 'jefe_obra' );
create policy update_historial on historial_estado_empleado for update
  using ( public.es_admin() )
  with check ( public.es_admin() );
create policy delete_historial on historial_estado_empleado for delete
  using ( public.es_admin() );

-- ---------------------------------------------------------
-- GRUPO E — Extras de autoservicio (se suman a las del Grupo A,
-- las políticas permisivas se combinan con OR entre sí).
-- ---------------------------------------------------------

-- Un empleado siempre puede ver y cargar sus PROPIAS jornadas laborales,
-- aunque su jefe de obra sea quien tiene la visión completa de la obra.
create policy select_propia_jornada on jornada_laboral for select
  using ( empleado_id = public.empleado_actual_id() );
create policy insert_propia_jornada on jornada_laboral for insert
  with check ( empleado_id = public.empleado_actual_id() );

-- Un empleado siempre puede ver y cargar su PROPIO uso de vehículo
-- (el flujo de "entro al vehículo que estoy usando y cargo las horas").
create policy select_propio_uso_vehiculo on uso_vehiculo for select
  using ( empleado_id = public.empleado_actual_id() );
create policy insert_propio_uso_vehiculo on uso_vehiculo for insert
  with check ( empleado_id = public.empleado_actual_id() );

-- El mecánico necesita ver qué vehículo está en qué obra y quién lo usa,
-- sin estar restringido a las obras que él tenga asignadas (no suele
-- tener ninguna, su alcance es la flota, no las obras).
create policy select_mecanico_asignacion_vehiculo on asignacion_vehiculo for select
  using ( public.rol_actual() = 'mecanico' );
create policy select_mecanico_uso_vehiculo on uso_vehiculo for select
  using ( public.rol_actual() = 'mecanico' );