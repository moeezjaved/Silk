-- Silk initial schema
-- A "document" is the scene-graph JSON for a video. A template is just a
-- document with is_template = true; "use template" copies it into a user's row.

create extension if not exists "pgcrypto";

create table if not exists public.documents (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid references auth.users (id) on delete cascade,
  name         text not null default 'Untitled',
  doc          jsonb not null,                 -- the SceneDoc
  is_template  boolean not null default false,
  category     text,                           -- for the template gallery
  thumbnail_url text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists documents_owner_idx    on public.documents (owner_id);
create index if not exists documents_template_idx on public.documents (is_template) where is_template;

create table if not exists public.assets (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid references auth.users (id) on delete cascade,
  url        text not null,
  kind       text not null default 'image',    -- image | video | logo | audio
  width      int,
  height     int,
  created_at timestamptz not null default now()
);

create index if not exists assets_owner_idx on public.assets (owner_id);

-- keep updated_at fresh
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists documents_touch on public.documents;
create trigger documents_touch before update on public.documents
  for each row execute function public.touch_updated_at();

-- ── Row Level Security ──────────────────────────────────────────────────────
alter table public.documents enable row level security;
alter table public.assets    enable row level security;

-- owners manage their own documents
drop policy if exists "own documents" on public.documents;
create policy "own documents" on public.documents
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- anyone (incl. anon) can read templates for the public gallery
drop policy if exists "read templates" on public.documents;
create policy "read templates" on public.documents
  for select using (is_template = true);

-- owners manage their own assets
drop policy if exists "own assets" on public.assets;
create policy "own assets" on public.assets
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
