create table if not exists public.animals (
  animal_uuid uuid primary key default gen_random_uuid(),
  category text not null check (category in ('dog','cat','rabbit','bird','reptile','other')),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name jsonb not null default '{}'::jsonb check (jsonb_typeof(name) = 'object' and nullif(btrim(name->>'ja'), '') is not null),
  aliases jsonb not null default '{"ja":[],"en":[]}'::jsonb check (jsonb_typeof(aliases) = 'object'),
  summary jsonb not null default '{}'::jsonb check (jsonb_typeof(summary) = 'object'),
  transport jsonb not null default '{}'::jsonb check (jsonb_typeof(transport) = 'object'),
  crate_note jsonb not null default '{}'::jsonb check (jsonb_typeof(crate_note) = 'object'),
  image_url text,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_by uuid references public.users(user_uuid) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists animals_category_status_idx on public.animals (category, status);
create index if not exists animals_name_ja_idx on public.animals (lower(name->>'ja'));
create index if not exists animals_name_en_idx on public.animals (lower(name->>'en'));
create index if not exists animals_updated_idx on public.animals (updated_at desc);
create index if not exists animals_created_by_idx on public.animals (created_by);

alter table public.animals enable row level security;
revoke all on table public.animals from anon, authenticated;
grant select, insert, update, delete on table public.animals to service_role;
