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
