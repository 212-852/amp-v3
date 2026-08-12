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
