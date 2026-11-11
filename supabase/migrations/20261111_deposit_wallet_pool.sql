-- Public deposit addresses imported from the local ODS source.
-- Only public addresses are stored here. No private keys or seed phrases belong in this table.
create table if not exists public.deposit_wallets (
  id bigint generated always as identity primary key,
  wallet_address text not null unique,
  source_row integer,
  source_label text not null default 'гаманці 1-1.ods',
  assigned_user_id bigint references public.users(id) on delete set null,
  assigned_display_id text,
  assigned_at timestamptz,
  created_at timestamptz not null default now(),
  constraint deposit_wallets_tron_address_check
    check (wallet_address ~ '^T[1-9A-HJ-NP-Za-km-z]{33}$')
);

alter table public.deposit_wallets enable row level security;
revoke all on table public.deposit_wallets from anon, authenticated;
revoke all on sequence public.deposit_wallets_id_seq from anon, authenticated;

create unique index if not exists deposit_wallets_assigned_user_unique
  on public.deposit_wallets (assigned_user_id)
  where assigned_user_id is not null;

create index if not exists deposit_wallets_available_idx
  on public.deposit_wallets (id)
  where assigned_user_id is null;

create or replace function public.assign_deposit_wallet(p_user_id bigint)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  user_row public.users%rowtype;
  wallet_row public.deposit_wallets%rowtype;
  display_id text;
begin
  select * into user_row
  from public.users
  where id = p_user_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'message', 'User not found');
  end if;

  if nullif(user_row.wallet_address, '') is not null then
    select * into wallet_row
    from public.deposit_wallets
    where assigned_user_id = p_user_id
    order by id
    limit 1;

    return jsonb_build_object(
      'ok', true,
      'wallet', user_row.wallet_address,
      'assigned_display_id', coalesce(wallet_row.assigned_display_id, '1568' || right(lpad(p_user_id::text, 4, '0'), 4)),
      'already_assigned', true
    );
  end if;

  select * into wallet_row
  from public.deposit_wallets
  where assigned_user_id is null
  order by id
  for update skip locked
  limit 1;

  if not found then
    return jsonb_build_object('ok', false, 'message', 'No free deposit wallet');
  end if;

  display_id := '1568' || right(lpad(p_user_id::text, 4, '0'), 4);

  update public.deposit_wallets
  set assigned_user_id = p_user_id,
      assigned_display_id = display_id,
      assigned_at = now()
  where id = wallet_row.id;

  update public.users
  set wallet_address = wallet_row.wallet_address
  where id = p_user_id;

  return jsonb_build_object(
    'ok', true,
    'wallet', wallet_row.wallet_address,
    'assigned_display_id', display_id,
    'already_assigned', false
  );
end;
$$;

revoke all on function public.assign_deposit_wallet(bigint) from public, anon, authenticated;
grant execute on function public.assign_deposit_wallet(bigint) to service_role;
