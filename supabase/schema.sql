-- ============================================================
-- GARAGEM 617 — Esquema do banco (Supabase / PostgreSQL)
-- Cole tudo no SQL Editor do Supabase e clique em RUN.
-- ============================================================

create extension if not exists pgcrypto;

-- Usuários administrativos (senha criptografada fica no Supabase Auth)
create table if not exists admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  created_at timestamptz default now()
);

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  whatsapp text,
  email text,
  created_at timestamptz default now()
);

create table if not exists vehicles (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  brand text, model text, year text, plate text,
  created_at timestamptz default now()
);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  vehicle_id uuid references vehicles(id) on delete cascade,
  service text not null,
  date date not null,
  time time not null,
  description text,
  photos text[] default '{}',
  status text not null default 'pendente'
    check (status in ('pendente','confirmado','em_atendimento','finalizado','cancelado')),
  created_at timestamptz default now()
);
-- impede dois agendamentos ativos no mesmo horário
create unique index if not exists appointments_slot_unique
  on appointments(date, time) where status <> 'cancelado';

create table if not exists quotes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  vehicle_id uuid references vehicles(id) on delete cascade,
  service text,
  description text,
  photos text[] default '{}',
  status text not null default 'pendente' check (status in ('pendente','respondido')),
  created_at timestamptz default now()
);

create table if not exists works (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  vehicle text,
  service text,
  description text,
  photos text[] default '{}',
  before text,
  after text,
  video_url text,
  ba boolean default false,
  created_at timestamptz default now()
);

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  icon text default 'wrench',
  category text,
  position int default 99,
  created_at timestamptz default now()
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  stars int default 5 check (stars between 1 and 5),
  comment text,
  avatar text,
  created_at timestamptz default now()
);

create table if not exists settings (
  key text primary key,
  value jsonb
);

-- ---------- Segurança (RLS) ----------
create or replace function is_admin() returns boolean
language sql security definer set search_path = public as
$$ select exists (select 1 from admin_users where id = auth.uid()) $$;

alter table admin_users  enable row level security;
alter table clients      enable row level security;
alter table vehicles     enable row level security;
alter table appointments enable row level security;
alter table quotes       enable row level security;
alter table works        enable row level security;
alter table services     enable row level security;
alter table reviews      enable row level security;
alter table settings     enable row level security;

-- Admin faz tudo
do $$
declare t text;
begin
  foreach t in array array['admin_users','clients','vehicles','appointments','quotes','works','services','reviews','settings']
  loop
    execute format('drop policy if exists "admin_all" on %I', t);
    execute format('create policy "admin_all" on %I for all to authenticated using (is_admin()) with check (is_admin())', t);
  end loop;
end $$;

-- Público só LÊ conteúdo do site
drop policy if exists "public_read" on works;
drop policy if exists "public_read" on services;
drop policy if exists "public_read" on reviews;
drop policy if exists "public_read" on settings;
create policy "public_read" on works    for select to anon, authenticated using (true);
create policy "public_read" on services for select to anon, authenticated using (true);
create policy "public_read" on reviews  for select to anon, authenticated using (true);
create policy "public_read" on settings for select to anon, authenticated using (true);

-- ---------- Funções públicas seguras ----------
-- Horários ocupados (sem expor dados de clientes)
create or replace function booked_slots(p_date date)
returns setof time language sql security definer set search_path = public as
$$ select time from appointments where date = p_date and status <> 'cancelado' $$;
grant execute on function booked_slots(date) to anon, authenticated;

-- Criar agendamento (valida e grava cliente + veículo + agendamento)
create or replace function create_booking(
  p_name text, p_phone text, p_email text, p_brand text, p_model text, p_year text, p_plate text,
  p_service text, p_date date, p_time time, p_description text, p_photos text[]
) returns uuid language plpgsql security definer set search_path = public as $$
declare cid uuid; vid uuid; aid uuid;
begin
  if length(trim(coalesce(p_name,''))) < 3 or length(regexp_replace(coalesce(p_phone,''),'\D','','g')) < 10 then
    raise exception 'Dados inválidos';
  end if;
  if p_date < current_date or extract(dow from p_date) = 0 then
    raise exception 'Data indisponível';
  end if;
  if p_time not in ('08:00','09:00','10:00','11:00','13:00','14:00','15:00','16:00','17:00') then
    raise exception 'Horário inválido';
  end if;
  if exists (select 1 from appointments where date = p_date and time = p_time and status <> 'cancelado') then
    raise exception 'Horário ocupado';
  end if;
  if coalesce(array_length(p_photos,1),0) > 8 then raise exception 'Fotos demais'; end if;

  insert into clients(name, phone, whatsapp, email)
    values (left(trim(p_name),120), left(p_phone,30), left(p_phone,30), left(coalesce(p_email,''),160)) returning id into cid;
  insert into vehicles(client_id, brand, model, year, plate)
    values (cid, left(p_brand,60), left(p_model,60), left(p_year,10), left(coalesce(p_plate,''),12)) returning id into vid;
  insert into appointments(client_id, vehicle_id, service, date, time, description, photos)
    values (cid, vid, left(p_service,80), p_date, p_time, left(coalesce(p_description,''),2000), coalesce(p_photos,'{}')) returning id into aid;
  return aid;
end $$;
grant execute on function create_booking(text,text,text,text,text,text,text,text,date,time,text,text[]) to anon, authenticated;

-- Criar pedido de orçamento
create or replace function create_quote(
  p_name text, p_phone text, p_vehicle text, p_year text, p_service text, p_description text, p_photos text[]
) returns uuid language plpgsql security definer set search_path = public as $$
declare cid uuid; vid uuid; qid uuid;
begin
  if length(trim(coalesce(p_name,''))) < 3 or length(regexp_replace(coalesce(p_phone,''),'\D','','g')) < 10 then
    raise exception 'Dados inválidos';
  end if;
  if coalesce(array_length(p_photos,1),0) > 8 then raise exception 'Fotos demais'; end if;
  insert into clients(name, phone, whatsapp) values (left(trim(p_name),120), left(p_phone,30), left(p_phone,30)) returning id into cid;
  insert into vehicles(client_id, brand, year) values (cid, left(coalesce(p_vehicle,''),100), left(coalesce(p_year,''),10)) returning id into vid;
  insert into quotes(client_id, vehicle_id, service, description, photos)
    values (cid, vid, left(coalesce(p_service,''),80), left(coalesce(p_description,''),2000), coalesce(p_photos,'{}')) returning id into qid;
  return qid;
end $$;
grant execute on function create_quote(text,text,text,text,text,text,text[]) to anon, authenticated;

-- ---------- Armazenamento de imagens ----------
insert into storage.buckets (id, name, public) values ('site', 'site', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('requests', 'requests', false) on conflict (id) do nothing;

-- site: todos veem, só admin envia/apaga
drop policy if exists "site_read" on storage.objects;
drop policy if exists "site_admin_write" on storage.objects;
create policy "site_read" on storage.objects for select using (bucket_id = 'site');
create policy "site_admin_write" on storage.objects for all to authenticated
  using (bucket_id = 'site' and is_admin()) with check (bucket_id = 'site' and is_admin());

-- requests (fotos de clientes): qualquer um ENVIA (só jpg/png/webp na pasta req/), só admin LÊ
drop policy if exists "req_insert" on storage.objects;
drop policy if exists "req_admin_read" on storage.objects;
create policy "req_insert" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'requests' and name like 'req/%' and lower(storage.extension(name)) in ('jpg','jpeg','png','webp'));
create policy "req_admin_read" on storage.objects for all to authenticated
  using (bucket_id = 'requests' and is_admin()) with check (bucket_id = 'requests' and is_admin());

-- ============================================================
-- DEPOIS DE CRIAR SEU USUÁRIO em Authentication → Users,
-- rode (trocando o e-mail) para torná-lo administrador:
--
-- insert into admin_users (id, name, email)
-- select id, 'Administrador', email from auth.users where email = 'SEU-EMAIL@exemplo.com';
-- ============================================================
