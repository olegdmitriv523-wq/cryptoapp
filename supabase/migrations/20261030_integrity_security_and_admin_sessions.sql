-- Keep the public schema server-only. The Express API uses the Supabase secret key.
alter table public.users enable row level security;
alter table public.signals enable row level security;
alter table public.settings enable row level security;
alter table public.transactions enable row level security;
alter table public.verifications enable row level security;

revoke all on table public.users, public.signals, public.settings, public.transactions, public.verifications from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

-- One active request per user/type. These indexes make repeated clicks idempotent.
create unique index if not exists signals_pending_wallet_create_unique
  on public.signals (user_id)
  where status = 'pending' and type in ('wallet_create', 'withdraw_wallet');

create unique index if not exists signals_pending_profile_unique
  on public.signals (user_id, type)
  where status = 'pending' and type in ('profile_update', 'email_update');

drop index if exists public.idx_signals_user_id;

create table if not exists public.rate_limit_buckets (
  key text primary key,
  window_started_at timestamptz not null default now(),
  hit_count integer not null default 0
);

create table if not exists public.admin_sessions (
  jti text primary key,
  admin_id text not null,
  role text not null,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.rate_limit_buckets enable row level security;
alter table public.admin_sessions enable row level security;
revoke all on table public.rate_limit_buckets, public.admin_sessions from anon, authenticated;

create or replace function public.consume_rate_limit(p_key text, p_window_seconds integer, p_max integer)
returns jsonb language plpgsql security invoker set search_path = public as $$
declare bucket public.rate_limit_buckets%rowtype; current_count integer;
begin
  if p_key is null or length(p_key) = 0 or p_window_seconds <= 0 or p_max <= 0 then
    return jsonb_build_object('allowed', true, 'remaining', p_max);
  end if;

  select * into bucket from public.rate_limit_buckets where key = p_key for update;
  if not found then
    insert into public.rate_limit_buckets (key, window_started_at, hit_count)
    values (left(p_key, 240), now(), 1)
    returning * into bucket;
  elsif bucket.window_started_at <= now() - make_interval(secs => p_window_seconds) then
    update public.rate_limit_buckets
    set window_started_at = now(), hit_count = 1
    where key = bucket.key
    returning * into bucket;
  else
    update public.rate_limit_buckets
    set hit_count = hit_count + 1
    where key = bucket.key
    returning * into bucket;
  end if;

  current_count := bucket.hit_count;
  return jsonb_build_object(
    'allowed', current_count <= p_max,
    'remaining', greatest(p_max - current_count, 0),
    'retry_after', greatest(ceil(extract(epoch from (bucket.window_started_at + make_interval(secs => p_window_seconds) - now())))::integer, 1)
  );
end;
$$;

create or replace function public.create_deposit_request(p_user_id bigint, p_amount numeric, p_wallet text)
returns jsonb language plpgsql security invoker set search_path = public as $$
declare request_count integer; new_id bigint;
begin
  perform 1 from public.users where id = p_user_id for update;
  if not found then return jsonb_build_object('ok', false, 'message', 'User not found'); end if;
  if p_amount is null or p_amount <= 0 then return jsonb_build_object('ok', false, 'message', 'Invalid amount'); end if;

  select count(*) into request_count
  from public.signals
  where user_id = p_user_id and type = 'deposit' and status in ('pending', 'approved');
  if request_count >= 2 then return jsonb_build_object('ok', false, 'message', 'Deposit limit reached'); end if;

  insert into public.signals (user_id, type, amount, wallet, status)
  values (p_user_id, 'deposit', round(p_amount, 2), p_wallet, 'pending')
  returning id into new_id;
  return jsonb_build_object('ok', true, 'id', new_id);
end;
$$;

create or replace function public.admin_adjust_balance(p_user_id bigint, p_amount numeric, p_mode text)
returns jsonb language plpgsql security invoker set search_path = public as $$
declare v_user public.users%rowtype; new_balance numeric; delta numeric;
begin
  select * into v_user from public.users where id = p_user_id for update;
  if not found then return jsonb_build_object('ok', false, 'message', 'User not found'); end if;
  if p_amount is null or p_amount < -1000000 or p_amount > 1000000 then return jsonb_build_object('ok', false, 'message', 'Invalid amount'); end if;

  if p_mode = 'set' then new_balance := round(p_amount, 2);
  elsif p_mode = 'add' then new_balance := round(coalesce(v_user.balance, 0) + p_amount, 2);
  else return jsonb_build_object('ok', false, 'message', 'Invalid mode'); end if;
  if new_balance < 0 then return jsonb_build_object('ok', false, 'message', 'Balance cannot be negative'); end if;

  delta := round(new_balance - coalesce(v_user.balance, 0), 2);
  update public.users set balance = new_balance where id = p_user_id;
  insert into public.signals (user_id, type, amount, wallet, status)
  values (p_user_id, 'admin_balance_adjustment', delta,
    jsonb_build_object('previous_balance', coalesce(v_user.balance, 0), 'new_balance', new_balance)::text,
    'approved');
  return jsonb_build_object('ok', true, 'balance', new_balance);
end;
$$;

create or replace function public.admin_update_user(
  p_user_id bigint, p_fullname text, p_nickname text, p_country text, p_phone text,
  p_email text, p_wallet_address text, p_balance numeric, p_deposit numeric, p_referrer_id bigint
)
returns jsonb language plpgsql security invoker set search_path = public as $$
declare v_user public.users%rowtype; old_referrer bigint; has_cycle boolean;
begin
  select * into v_user from public.users where id = p_user_id for update;
  if not found then return jsonb_build_object('ok', false, 'message', 'User not found'); end if;
  if p_deposit < 0 or p_balance < 0 or p_deposit > p_balance then
    return jsonb_build_object('ok', false, 'message', 'Invalid balance or deposit');
  end if;
  if p_referrer_id = p_user_id then return jsonb_build_object('ok', false, 'message', 'Referrer cannot be the same user'); end if;
  if p_referrer_id is not null and not exists (select 1 from public.users where id = p_referrer_id) then
    return jsonb_build_object('ok', false, 'message', 'Referrer not found');
  end if;

  if p_referrer_id is not null then
    with recursive referral_chain(id, visited) as (
      select p_referrer_id, array[p_referrer_id]
      union all
      select u.referrer_id, referral_chain.visited || u.referrer_id
      from referral_chain
      join public.users u on u.id = referral_chain.id
      where u.referrer_id is not null and not (u.referrer_id = any(referral_chain.visited))
    )
    select exists(select 1 from referral_chain where p_user_id = any(visited)) into has_cycle;
    if has_cycle then return jsonb_build_object('ok', false, 'message', 'Referrer cycle detected'); end if;
  end if;

  old_referrer := v_user.referrer_id;
  update public.users set
    fullname = p_fullname, nickname = p_nickname, country = p_country, phone = p_phone,
    email = p_email, wallet_address = nullif(p_wallet_address, ''), balance = round(p_balance, 2),
    deposit = round(p_deposit, 2), referrer_id = p_referrer_id
  where id = p_user_id;

  insert into public.signals (user_id, type, amount, wallet, status)
  values (p_user_id, 'admin_user_update', round(p_balance - coalesce(v_user.balance, 0), 2),
    jsonb_build_object(
      'changed_fields', jsonb_build_array('fullname','nickname','country','phone','email','wallet_address','balance','deposit','referrer_id'),
      'previous_balance', coalesce(v_user.balance, 0), 'new_balance', p_balance,
      'previous_deposit', coalesce(v_user.deposit, 0), 'new_deposit', p_deposit
    )::text, 'approved');

  if old_referrer is not null then
    update public.users set satellites = (select count(*) from public.users where referrer_id = old_referrer) where id = old_referrer;
  end if;
  if p_referrer_id is not null and p_referrer_id <> old_referrer then
    update public.users set satellites = (select count(*) from public.users where referrer_id = p_referrer_id) where id = p_referrer_id;
  end if;
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.admin_set_wallet(p_signal_id bigint, p_wallet text)
returns jsonb language plpgsql security invoker set search_path = public as $$
declare signal_row public.signals%rowtype; wallet_value text;
begin
  select * into signal_row from public.signals where id = p_signal_id for update;
  if not found or signal_row.status <> 'pending' then return jsonb_build_object('ok', false, 'message', 'Request unavailable'); end if;
  if signal_row.type <> 'wallet_create' and not (signal_row.type = 'withdraw_wallet' and coalesce(signal_row.wallet, '') like '%wallet_create_request%') then
    return jsonb_build_object('ok', false, 'message', 'Request unavailable');
  end if;
  perform 1 from public.users where id = signal_row.user_id for update;
  if not found then return jsonb_build_object('ok', false, 'message', 'User not found'); end if;
  wallet_value := case when signal_row.type = 'withdraw_wallet'
    then jsonb_build_object('kind', 'wallet_create_request', 'wallet', p_wallet)::text
    else p_wallet end;
  update public.users set wallet_address = p_wallet where id = signal_row.user_id;
  update public.signals set wallet = wallet_value, status = 'approved' where id = p_signal_id;
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.admin_manual_wallet(p_user_id bigint, p_wallet text)
returns jsonb language plpgsql security invoker set search_path = public as $$
begin
  perform 1 from public.users where id = p_user_id for update;
  if not found then return jsonb_build_object('ok', false, 'message', 'User not found'); end if;
  update public.users set wallet_address = p_wallet where id = p_user_id;
  update public.signals set wallet = case when type = 'withdraw_wallet'
    then jsonb_build_object('kind', 'wallet_create_request', 'wallet', p_wallet)::text else p_wallet end,
    status = 'approved'
  where user_id = p_user_id and status = 'pending'
    and (type = 'wallet_create' or (type = 'withdraw_wallet' and coalesce(wallet, '') like '%wallet_create_request%'));
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.admin_approve_profile_signal(p_signal_id bigint)
returns jsonb language plpgsql security invoker set search_path = public as $$
declare signal_row public.signals%rowtype; payload jsonb;
begin
  select * into signal_row from public.signals where id = p_signal_id for update;
  if not found or signal_row.status <> 'pending' or signal_row.type not in ('profile_update', 'email_update') then
    return jsonb_build_object('ok', false, 'message', 'Request unavailable');
  end if;
  begin payload := signal_row.wallet::jsonb; exception when others then return jsonb_build_object('ok', false, 'message', 'Invalid profile data'); end;
  perform 1 from public.users where id = signal_row.user_id for update;
  if not found then return jsonb_build_object('ok', false, 'message', 'User not found'); end if;
  if signal_row.type = 'email_update' then
    update public.users set email = payload->>'email', email_verified = true where id = signal_row.user_id;
  else
    update public.users set fullname = payload->>'fullname', nickname = payload->>'nickname', country = payload->>'country', phone = payload->>'phone' where id = signal_row.user_id;
  end if;
  update public.signals set status = 'approved' where id = p_signal_id;
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.admin_reject_signal(p_signal_id bigint)
returns jsonb language plpgsql security invoker set search_path = public as $$
declare signal_row public.signals%rowtype; payload jsonb; candidate text; current_wallet text;
begin
  select * into signal_row from public.signals where id = p_signal_id for update;
  if not found or signal_row.status <> 'pending' then return jsonb_build_object('ok', false, 'message', 'Request unavailable'); end if;
  if signal_row.type = 'wallet_create' or (signal_row.type = 'withdraw_wallet' and coalesce(signal_row.wallet, '') like '%wallet_create_request%') then
    candidate := case when signal_row.type = 'withdraw_wallet' then coalesce((signal_row.wallet::jsonb)->>'wallet', '') else signal_row.wallet end;
    select wallet_address into current_wallet from public.users where id = signal_row.user_id for update;
    if current_wallet = candidate then update public.users set wallet_address = null where id = signal_row.user_id; end if;
  end if;
  update public.signals set status = 'rejected' where id = p_signal_id;
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.admin_delete_user(p_user_id bigint)
returns jsonb language plpgsql security invoker set search_path = public as $$
declare old_referrer bigint;
begin
  select referrer_id into old_referrer from public.users where id = p_user_id for update;
  if not found then return jsonb_build_object('ok', false, 'message', 'User not found'); end if;
  update public.users set referrer_id = null where referrer_id = p_user_id;
  delete from public.signals where user_id = p_user_id;
  delete from public.users where id = p_user_id;
  if old_referrer is not null then
    update public.users set satellites = (select count(*) from public.users where referrer_id = old_referrer) where id = old_referrer;
  end if;
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.consume_pending_verification(
  p_token_hash text, p_purpose text, p_code_hash text, p_expected_user_id bigint default null
)
returns jsonb language plpgsql security invoker set search_path = public as $$
declare verification_row public.verifications%rowtype;
begin
  select * into verification_row from public.verifications
  where token_hash = p_token_hash and purpose = p_purpose for update;
  if not found or verification_row.consumed_at is not null then return jsonb_build_object('ok', false, 'message', 'Invalid code'); end if;
  if p_expected_user_id is not null and verification_row.user_id <> p_expected_user_id then return jsonb_build_object('ok', false, 'message', 'Invalid code'); end if;
  if verification_row.expires_at <= now() then return jsonb_build_object('ok', false, 'message', 'Code expired'); end if;
  if verification_row.attempts >= 5 then return jsonb_build_object('ok', false, 'message', 'Code expired'); end if;
  if verification_row.code_hash <> p_code_hash then
    update public.verifications set attempts = attempts + 1 where id = verification_row.id;
    return jsonb_build_object('ok', false, 'message', 'Invalid code');
  end if;
  update public.verifications set consumed_at = now() where id = verification_row.id;
  return jsonb_build_object('ok', true, 'record', to_jsonb(verification_row));
end;
$$;

revoke all on function public.consume_rate_limit(text, integer, integer) from public, anon, authenticated;
revoke all on function public.create_deposit_request(bigint, numeric, text) from public, anon, authenticated;
revoke all on function public.admin_adjust_balance(bigint, numeric, text) from public, anon, authenticated;
revoke all on function public.admin_update_user(bigint, text, text, text, text, text, text, numeric, numeric, bigint) from public, anon, authenticated;
revoke all on function public.admin_set_wallet(bigint, text) from public, anon, authenticated;
revoke all on function public.admin_manual_wallet(bigint, text) from public, anon, authenticated;
revoke all on function public.admin_approve_profile_signal(bigint) from public, anon, authenticated;
revoke all on function public.admin_reject_signal(bigint) from public, anon, authenticated;
revoke all on function public.admin_delete_user(bigint) from public, anon, authenticated;
revoke all on function public.consume_pending_verification(text, text, text, bigint) from public, anon, authenticated;

grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;
grant execute on function public.create_deposit_request(bigint, numeric, text) to service_role;
grant execute on function public.admin_adjust_balance(bigint, numeric, text) to service_role;
grant execute on function public.admin_update_user(bigint, text, text, text, text, text, text, numeric, numeric, bigint) to service_role;
grant execute on function public.admin_set_wallet(bigint, text) to service_role;
grant execute on function public.admin_manual_wallet(bigint, text) to service_role;
grant execute on function public.admin_approve_profile_signal(bigint) to service_role;
grant execute on function public.admin_reject_signal(bigint) to service_role;
grant execute on function public.admin_delete_user(bigint) to service_role;
grant execute on function public.consume_pending_verification(text, text, text, bigint) to service_role;
