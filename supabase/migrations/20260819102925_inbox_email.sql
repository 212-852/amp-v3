create table if not exists public.inbox_mailboxes (
  mailbox_uuid uuid primary key default gen_random_uuid(),
  address text not null unique check (address = lower(address)),
  mailbox_type text not null check (mailbox_type in ('shared', 'personal')),
  owner_user_uuid uuid references public.users(user_uuid) on delete cascade,
  created_at timestamptz not null default now(),
  check (
    (mailbox_type = 'shared' and owner_user_uuid is null)
    or (mailbox_type = 'personal' and owner_user_uuid is not null)
  )
);

create table if not exists public.inbox_threads (
  thread_uuid uuid primary key default gen_random_uuid(),
  mailbox_uuid uuid not null references public.inbox_mailboxes(mailbox_uuid),
  channel text not null default 'email' check (channel in ('email', 'line', 'chat', 'group')),
  subject text not null,
  sender_name text not null,
  sender_address text not null,
  preview text not null default '',
  status text not null default 'open' check (status in ('open', 'closed', 'spam')),
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.inbox_messages (
  message_uuid uuid primary key default gen_random_uuid(),
  thread_uuid uuid not null references public.inbox_threads(thread_uuid) on delete cascade,
  direction text not null check (direction in ('inbound', 'outbound')),
  sender_address text not null,
  recipient_addresses text[] not null default '{}',
  subject text not null,
  body_text text not null,
  body_html text,
  external_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.inbox_recipients (
  thread_uuid uuid not null references public.inbox_threads(thread_uuid) on delete cascade,
  user_uuid uuid not null references public.users(user_uuid) on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (thread_uuid, user_uuid)
);

create index if not exists inbox_threads_last_message_idx
on public.inbox_threads (last_message_at desc);

create index if not exists inbox_messages_thread_created_idx
on public.inbox_messages (thread_uuid, created_at);

create index if not exists inbox_recipients_user_unread_idx
on public.inbox_recipients (user_uuid, created_at desc)
where read_at is null;

insert into public.inbox_mailboxes (address, mailbox_type)
values
  ('mail@wan.da-nya.com', 'shared'),
  ('info@paws-flight.com', 'shared')
on conflict (address) do update set
  mailbox_type = excluded.mailbox_type,
  owner_user_uuid = null;

alter table public.inbox_mailboxes enable row level security;
alter table public.inbox_threads enable row level security;
alter table public.inbox_messages enable row level security;
alter table public.inbox_recipients enable row level security;

revoke all on table public.inbox_mailboxes, public.inbox_threads, public.inbox_messages, public.inbox_recipients from anon, authenticated, service_role;
grant select, insert, update, delete on table public.inbox_mailboxes, public.inbox_threads, public.inbox_messages, public.inbox_recipients to service_role;
