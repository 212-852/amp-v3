insert into public.inbox_mailboxes (address, mailbox_type, owner_user_uuid)
select 'm.okino@wandanya.com', 'personal', account.user_uuid
from public.accounts account
where lower(account.email) = 'm.okino@wandanya.com'
order by account.created_at
limit 1
on conflict (address) do update set
  mailbox_type = excluded.mailbox_type,
  owner_user_uuid = excluded.owner_user_uuid;
