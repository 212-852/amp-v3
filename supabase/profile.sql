alter table public.accounts
add column if not exists provider_display_name text;

alter table public.accounts
add column if not exists picture_url text;
