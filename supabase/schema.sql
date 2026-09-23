-- ============================================================
-- BodasEditor V2 - Supabase
-- Ejecuta este archivo en Supabase > SQL Editor
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique,
  groom text not null default 'Ruddy',
  bride text not null default 'Alan',
  announcement text not null default '¡Nos casamos!',
  subtitle text not null default 'Y queremos que formes parte de este día tan especial',
  dedication text not null default '',
  date_iso timestamptz not null default now(),
  date_label text not null default 'Sábado 15 de mayo de 2027',
  time_label text not null default '18:00',
  ceremony text not null default '',
  reception text not null default '',
  address text not null default '',
  maps_url text not null default 'https://maps.google.com/',
  dress_code text not null default 'Formal',
  phone text not null default '',
  hero_image text not null default '',
  gallery jsonb not null default '[]'::jsonb,
  music_url text not null default '',
  template text not null default 'botanical',
  accent text not null default '#7f8f73',
  background text not null default '#f8f5ef',
  is_published boolean not null default false,
  views integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.invitations enable row level security;

drop policy if exists "users can view own invitations" on public.invitations;
create policy "users can view own invitations"
on public.invitations for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "users can insert own invitations" on public.invitations;
create policy "users can insert own invitations"
on public.invitations for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "users can update own invitations" on public.invitations;
create policy "users can update own invitations"
on public.invitations for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "users can delete own invitations" on public.invitations;
create policy "users can delete own invitations"
on public.invitations for delete
to authenticated
using (auth.uid() = user_id);

-- Lectura pública solamente de invitaciones publicadas.
drop policy if exists "public can view published invitations" on public.invitations;
create policy "public can view published invitations"
on public.invitations for select
to anon, authenticated
using (is_published = true);

-- Bucket para fotografías y música.
insert into storage.buckets (id, name, public)
values ('invitation-media', 'invitation-media', true)
on conflict (id) do nothing;

drop policy if exists "authenticated upload invitation media" on storage.objects;
create policy "authenticated upload invitation media"
on storage.objects for insert
to authenticated
with check (bucket_id = 'invitation-media');

drop policy if exists "public read invitation media" on storage.objects;
create policy "public read invitation media"
on storage.objects for select
to public
using (bucket_id = 'invitation-media');

-- IMPORTANTE:
-- El contador de visitas de esta V2 se actualiza desde el cliente.
-- Para un sistema comercial puedes sustituirlo posteriormente por una
-- función RPC segura en PostgreSQL.
