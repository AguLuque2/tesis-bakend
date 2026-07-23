-- =========================================================
-- Índices sobre columnas de FK (mejoran los JOIN / filtros
-- por obra, que van a ser la consulta más frecuente)
-- =========================================================

create index idx_etapa_obra on etapa(obra_id);
create index idx_item_obra_obra on item_obra(obra_id);
create index idx_avance_diario_obra on avance_diario(obra_id);
create index idx_certificacion_obra on certificacion(obra_id);
create index idx_certificacion_item_certificacion on certificacion_item(certificacion_id);
create index idx_certificacion_item_item_obra on certificacion_item(item_obra_id);
create index idx_certificacion_liquidacion_certificacion on certificacion_liquidacion(certificacion_id);
create index idx_certificacion_archivo_certificacion on certificacion_archivo(certificacion_id);
create index idx_asignacion_personal_obra on asignacion_personal(obra_id);
create index idx_asignacion_personal_empleado on asignacion_personal(empleado_id);
create index idx_jornada_laboral_obra on jornada_laboral(obra_id);
create index idx_jornada_laboral_empleado on jornada_laboral(empleado_id);
create index idx_historial_estado_empleado_empleado on historial_estado_empleado(empleado_id);
create index idx_asignacion_vehiculo_obra on asignacion_vehiculo(obra_id);
create index idx_asignacion_vehiculo_vehiculo on asignacion_vehiculo(vehiculo_id);
create index idx_uso_vehiculo_obra on uso_vehiculo(obra_id);
create index idx_uso_vehiculo_vehiculo on uso_vehiculo(vehiculo_id);
create index idx_mantenimiento_vehiculo on mantenimiento(vehiculo_id);
create index idx_orden_compra_obra on orden_compra(obra_id);
create index idx_orden_compra_proveedor on orden_compra(proveedor_id);
create index idx_recepcion_material_orden_compra on recepcion_material(orden_compra_id);
create index idx_recepcion_material_material on recepcion_material(material_id);
create index idx_uso_material_obra on uso_material(obra_id);
create index idx_uso_material_material on uso_material(material_id);
create index idx_stock_obra_obra on stock_obra(obra_id);
create index idx_alerta_obra on alerta(obra_id);
create index idx_novedad_obra on novedad(obra_id);
create index idx_campo_plantilla_tipo_actividad on campo_plantilla(tipo_actividad_id);
create index idx_actividad_etapa on actividad(etapa_id);
create index idx_actividad_tipo_actividad on actividad(tipo_actividad_id);
create index idx_actividad_dato_actividad on actividad_dato(actividad_id);
create index idx_etapa_archivo_etapa on etapa_archivo(etapa_id);
create index idx_documento_obra on documento(obra_id);
create index idx_partida_presupuestaria_obra on partida_presupuestaria(obra_id);
create index idx_gasto_partida on gasto(partida_presupuestaria_id);
create index idx_usuario_empleado on usuario(empleado_id);