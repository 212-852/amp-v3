create index if not exists inbox_mailboxes_owner_idx
on public.inbox_mailboxes (owner_user_uuid)
where owner_user_uuid is not null;

create index if not exists inbox_threads_mailbox_idx
on public.inbox_threads (mailbox_uuid);

create unique index if not exists inbox_messages_external_id_idx
on public.inbox_messages (external_id)
where external_id is not null;
