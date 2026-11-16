-- =====================================================
-- Supabase setup para app de archivos + verificación
-- =====================================================

-- 1) Tabla de perfiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  avatar_url text,
  is_verified boolean not null default false,
  verification_status text not null default 'pending'
    check (verification_status in ('pending', 'review', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Tabla de verificación de usuarios
create table if not exists public.user_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  document_type text,
  document_url text,
  status text not null default 'pending'
    check (status in ('pending', 'review', 'approved', 'rejected')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3) Tabla de archivos del usuario
create table if not exists public.file_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  original_name text not null,
  file_type text not null check (file_type in ('pdf', 'image', 'video', 'audio', 'document')),
  storage_bucket text not null,
  storage_path text not null,
  file_size bigint default 0,
  mime_type text,
  url text,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4) Índices útiles
create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_user_verifications_user_id on public.user_verifications(user_id);
create index if not exists idx_file_records_user_id on public.file_records(user_id);
create index if not exists idx_file_records_file_type on public.file_records(file_type);

-- 5) Trigger: crear perfil automáticamente cuando se registra un usuario
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- 6) Trigger: actualizar updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists set_verifications_updated_at on public.user_verifications;
create trigger set_verifications_updated_at
before update on public.user_verifications
for each row execute procedure public.set_updated_at();

drop trigger if exists set_file_records_updated_at on public.file_records;
create trigger set_file_records_updated_at
before update on public.file_records
for each row execute procedure public.set_updated_at();

-- 7) Habilitar RLS
alter table public.profiles enable row level security;
alter table public.user_verifications enable row level security;
alter table public.file_records enable row level security;

-- 8) Políticas de acceso por usuario
create policy "Users can view own profile"
on public.profiles
for select
using (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles
for update
using (auth.uid() = id);

create policy "Users can view own verification"
on public.user_verifications
for select
using (auth.uid() = user_id);

create policy "Users can insert own verification"
on public.user_verifications
for insert
with check (auth.uid() = user_id);

create policy "Users can update own verification"
on public.user_verifications
for update
using (auth.uid() = user_id);

create policy "Users can view own files"
on public.file_records
for select
using (auth.uid() = user_id);

create policy "Users can insert own files"
on public.file_records
for insert
with check (auth.uid() = user_id);

create policy "Users can update own files"
on public.file_records
for update
using (auth.uid() = user_id);

create policy "Users can delete own files"
on public.file_records
for delete
using (auth.uid() = user_id);

-- 9) Acceso privado a los buckets Docs, Video y PDF.
-- Docs: imgane/<user_id>/{image|audio}/<archivo>
-- Video y PDF: <carpeta>/<user_id>/<archivo>
drop policy if exists "Users can view own project images" on storage.objects;
drop policy if exists "Users can upload own project images" on storage.objects;
drop policy if exists "Users can view own project files" on storage.objects;
drop policy if exists "Users can upload own project files" on storage.objects;
drop policy if exists "Users can view own media files" on storage.objects;
drop policy if exists "Users can upload own media files" on storage.objects;
create policy "Users can view own media files"
on storage.objects
for select
to authenticated
using (
  (
    bucket_id = 'Docs'
    and (storage.foldername(name))[1] = 'imgane'
    and (storage.foldername(name))[2] = auth.uid()::text
    and (storage.foldername(name))[3] in ('image', 'audio')
  )
  or (
    bucket_id = 'Video'
    and (storage.foldername(name))[1] = 'video'
    and (storage.foldername(name))[2] = auth.uid()::text
  )
  or (
    bucket_id = 'PDF'
    and (storage.foldername(name))[1] = 'documents'
    and (storage.foldername(name))[2] = auth.uid()::text
  )
);

create policy "Users can upload own media files"
on storage.objects
for insert
to authenticated
with check (
  (
    bucket_id = 'Docs'
    and (storage.foldername(name))[1] = 'imgane'
    and (storage.foldername(name))[2] = auth.uid()::text
    and (storage.foldername(name))[3] in ('image', 'audio')
  )
  or (
    bucket_id = 'Video'
    and (storage.foldername(name))[1] = 'video'
    and (storage.foldername(name))[2] = auth.uid()::text
  )
  or (
    bucket_id = 'PDF'
    and (storage.foldername(name))[1] = 'documents'
    and (storage.foldername(name))[2] = auth.uid()::text
  )
);

-- 10) Agenda de actividades
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null default '',
  scheduled_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.activities enable row level security;

drop policy if exists "Users can view own activities" on public.activities;
create policy "Users can view own activities"
on public.activities
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create own activities" on public.activities;
create policy "Users can create own activities"
on public.activities
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own activities" on public.activities;
create policy "Users can update own activities"
on public.activities
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own activities" on public.activities;
create policy "Users can delete own activities"
on public.activities
for delete
to authenticated
using (auth.uid() = user_id);

-- =====================================================
-- Fin del setup
-- =====================================================
