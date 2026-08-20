create table if not exists public.orders (
  order_uuid uuid primary key default gen_random_uuid(),
  order_code text not null unique,
  title text not null,
  customer_name text not null default '',
  customer_email text not null default '',
  status text not null default 'draft' check (status in ('draft', 'open', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  scheduled_at timestamptz,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.inbox_message_shares
add column if not exists order_uuid uuid references public.orders(order_uuid) on delete set null;

create index if not exists orders_updated_idx
on public.orders (updated_at desc);

create index if not exists orders_status_scheduled_idx
on public.orders (status, scheduled_at);

create index if not exists inbox_message_shares_order_idx
on public.inbox_message_shares (order_uuid, created_at desc)
where order_uuid is not null;

alter table public.orders enable row level security;

revoke all on table public.orders from anon, authenticated, service_role;
grant select, insert, update, delete on table public.orders to service_role;
