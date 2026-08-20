alter table public.orders
add column if not exists business_unit text not null default 'wandanya'
check (business_unit in ('pawsflight', 'wandanya', 'airport', 'tokyo')),
add column if not exists work_type text not null default 'charter'
check (work_type in ('transport', 'charter', 'airport_shuttle', 'air_transport', 'quarantine', 'other'));

update public.orders
set business_unit = case when service_type = 'flight' then 'pawsflight' else 'wandanya' end,
    work_type = case when service_type = 'flight' then 'air_transport' else 'charter' end;

create index if not exists orders_business_work_idx
on public.orders (business_unit, work_type, updated_at desc);
