create index if not exists inbox_message_shares_user_idx
on public.inbox_message_shares (shared_by_user_uuid, created_at desc);
