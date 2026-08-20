create table if not exists public.inbox_attachments (
  attachment_uuid uuid primary key default gen_random_uuid(),
  message_uuid uuid not null references public.inbox_messages(message_uuid) on delete cascade,
  external_id text not null,
  filename text not null,
  content_type text not null default 'application/octet-stream',
  content_disposition text not null default 'attachment' check (content_disposition in ('inline', 'attachment')),
  content_id text,
  size_bytes bigint not null default 0 check (size_bytes >= 0),
  storage_path text not null unique,
  created_at timestamptz not null default now(),
  unique (message_uuid, external_id)
);

create table if not exists public.inbox_message_shares (
  share_uuid uuid primary key default gen_random_uuid(),
  message_uuid uuid not null references public.inbox_messages(message_uuid) on delete cascade,
  shared_by_user_uuid uuid not null references public.users(user_uuid) on delete cascade,
  target_type text not null check (target_type in ('order', 'workspace')),
  target_reference text not null,
  include_body boolean not null default true,
  include_attachments boolean not null default true,
  shared_datetime timestamptz,
  note text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists inbox_attachments_message_idx
on public.inbox_attachments (message_uuid);

create index if not exists inbox_message_shares_message_idx
on public.inbox_message_shares (message_uuid, created_at desc);

create index if not exists inbox_message_shares_target_idx
on public.inbox_message_shares (target_type, target_reference, created_at desc);

insert into storage.buckets (id, name, public, file_size_limit)
values ('inbox-attachments', 'inbox-attachments', false, 41943040)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit;

alter table public.inbox_attachments enable row level security;
alter table public.inbox_message_shares enable row level security;

revoke all on table public.inbox_attachments, public.inbox_message_shares from anon, authenticated, service_role;
grant select, insert, update, delete on table public.inbox_attachments, public.inbox_message_shares to service_role;
