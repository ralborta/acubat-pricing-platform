-- Migración para convertir config en singleton real
-- Ejecutar en Supabase SQL Editor

begin;

-- 1) Quedarse con la última fila y borrar el resto
delete from config
where id not in (
  select id
  from config
  order by updated_at desc nulls last, id desc
  limit 1
);

-- 2) Forzar id = 1 para el registro sobreviviente
update config set id = 1;

-- 3) Primary key + "singleton" garantizado
alter table config drop constraint if exists config_pkey;
alter table config add constraint config_pkey primary key (id);

alter table config drop constraint if exists config_singleton_chk;
alter table config add constraint config_singleton_chk check (id = 1);

-- 4) Trigger de updated_at
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_config_updated_at on config;
create trigger trg_config_updated_at
before update on config
for each row execute function set_updated_at();

-- 5) Fila base por si acaso
insert into config (id, config_data)
values (1, '{}'::jsonb)
on conflict (id) do nothing;

commit;
