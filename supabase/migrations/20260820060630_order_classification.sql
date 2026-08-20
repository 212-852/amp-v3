alter table public.orders
add column if not exists intake_type text not null default 'headquarters'
check (intake_type in ('headquarters', 'external')),
add column if not exists service_type text not null default 'transport'
check (service_type in ('transport', 'flight')),
add column if not exists source_channel text not null default 'email'
check (source_channel in ('flight', 'phone', 'email', 'chat', 'app')),
add column if not exists commission_amount numeric(12, 0)
check (commission_amount is null or commission_amount >= 0);

create index if not exists orders_active_updated_idx
on public.orders (updated_at desc)
where status not in ('completed', 'cancelled');

create index if not exists orders_classification_idx
on public.orders (intake_type, service_type, source_channel);
