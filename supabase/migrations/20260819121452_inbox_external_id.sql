create unique index if not exists inbox_messages_external_id_idx
on public.inbox_messages (external_id)
where external_id is not null;
