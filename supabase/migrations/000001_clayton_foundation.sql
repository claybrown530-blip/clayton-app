create extension if not exists pgcrypto;

create table if not exists public.artist_projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  format text not null,
  phase text not null default 'idea',
  logline text,
  cover_asset_path text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.artist_tracks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.artist_projects(id) on delete cascade,
  title text not null,
  kind text not null default 'demo',
  version_label text,
  bpm text,
  musical_key text,
  notes text,
  audio_asset_path text,
  duration_seconds numeric,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.artist_assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.artist_projects(id) on delete set null,
  title text not null,
  asset_type text not null,
  storage_path text not null,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.artist_projects enable row level security;
alter table public.artist_tracks enable row level security;
alter table public.artist_assets enable row level security;

create policy "Owner can manage artist projects"
  on public.artist_projects
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Owner can manage artist tracks"
  on public.artist_tracks
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Owner can manage artist assets"
  on public.artist_assets
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
