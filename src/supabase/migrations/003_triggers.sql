-- =========================================================
-- Trigger genérico: actualiza actualizado_en automáticamente
-- en cada UPDATE, para todas las tablas del sistema.
-- =========================================================

create or replace function set_actualizado_en()
returns trigger as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$ language plpgsql;

do $$
declare
  t text;
begin
  for t in
    select table_name from information_schema.columns
    where table_schema = 'public' and column_name = 'actualizado_en'
  loop
    execute format(
      'create trigger trg_set_actualizado_en
       before update on %I
       for each row execute function set_actualizado_en();',
      t
    );
  end loop;
end $$;