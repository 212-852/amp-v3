alter table public.accounts
add column if not exists provider_display_name text;

alter table public.accounts
add column if not exists picture_url text;

alter table public.users
add column if not exists language text;

update public.users
set language = 'ja'
where language is null;

alter table public.users
alter column language set default 'ja',
alter column language set not null;

alter table public.users
drop constraint if exists users_language_check;

alter table public.users
add column if not exists notification jsonb not null default '{"primary":"push","push":true,"line":true,"email":true,"marketing":false}'::jsonb,
add column if not exists push jsonb not null default '[]'::jsonb;

alter table public.users
drop constraint if exists users_notification_object_check,
drop constraint if exists users_push_array_check;

alter table public.users
add constraint users_notification_object_check
check (jsonb_typeof(notification) = 'object'),
add constraint users_push_array_check
check (jsonb_typeof(push) = 'array');

create table if not exists public.configs (
  config_id smallint primary key default 1 check (config_id = 1),
  languages jsonb not null default '[]'::jsonb,
  company jsonb not null default '{}'::jsonb,
  copyright jsonb not null default '{"startYear":2006,"services":{"main":{"ja":"PET TAXI","en":"PET TAXI"},"tokyo":{"ja":"ペットタクシー東京","en":"PET TAXI TOKYO"},"airport":{"ja":"PET TAXI AIRPORT","en":"PET TAXI AIRPORT"},"corporate":{"ja":"PET TAXI","en":"PET TAXI"},"flight":{"ja":"PawsFlight Japan","en":"PawsFlight Japan"}}}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.configs (config_id, languages, company)
values (
  1,
  '[{"code":"ja","name":"日本語"},{"code":"en","name":"English"}]'::jsonb,
  '{"name":{"ja":"Wan Da Nya Inc.","en":"Wan Da Nya Inc."},"address":{"prefectureCode":"","cityCode":"","detail":""}}'::jsonb
)
on conflict (config_id) do nothing;

alter table public.configs
add column if not exists copyright jsonb not null
default '{"startYear":2006,"services":{"main":{"ja":"PET TAXI","en":"PET TAXI"},"tokyo":{"ja":"ペットタクシー東京","en":"PET TAXI TOKYO"},"airport":{"ja":"PET TAXI AIRPORT","en":"PET TAXI AIRPORT"},"corporate":{"ja":"PET TAXI","en":"PET TAXI"},"flight":{"ja":"PawsFlight Japan","en":"PawsFlight Japan"}}}'::jsonb;

alter table public.configs
add column if not exists structured jsonb not null default '{}'::jsonb;

create table if not exists public.notifications (
  notification_uuid uuid primary key default gen_random_uuid(),
  user_uuid uuid not null references public.users(user_uuid) on delete cascade,
  kind text not null check (
    kind in ('critical', 'booking', 'message', 'service', 'marketing')
  ),
  importance text not null default 'normal' check (
    importance in ('normal', 'important', 'urgent')
  ),
  title jsonb not null default '{}'::jsonb check (jsonb_typeof(title) = 'object'),
  body jsonb not null default '{}'::jsonb check (jsonb_typeof(body) = 'object'),
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
  action_url text,
  external_required boolean not null default false,
  read_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_created_idx
on public.notifications (user_uuid, created_at desc);

create index if not exists notifications_user_unread_idx
on public.notifications (user_uuid, created_at desc)
where read_at is null;

alter table public.notifications enable row level security;

revoke all on table public.notifications from anon, authenticated, service_role;
grant select, insert, update, delete on table public.notifications to service_role;
