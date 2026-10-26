create unique index if not exists signals_reward_once_unique
  on public.signals (user_id, type)
  where type like 'reward_%';

create unique index if not exists signals_quiz_once_unique
  on public.signals (user_id, type)
  where type like 'quiz_%' and status = 'rewarded';

create unique index if not exists signals_pending_trade_unique
  on public.signals (user_id, type)
  where type like 'trade_%' and status = 'pending';

create unique index if not exists signals_pending_withdraw_unique
  on public.signals (user_id)
  where type = 'withdraw' and status = 'pending';

create or replace function public.grant_reward_once(p_user_id bigint, p_type text, p_amount numeric, p_wallet text)
returns jsonb language plpgsql security invoker set search_path = public as $$
declare new_balance numeric;
begin
  if p_amount is null or p_amount <= 0 then
    return jsonb_build_object('ok', false, 'message', 'Invalid reward');
  end if;
  begin
    insert into public.signals (user_id, type, amount, wallet, status)
    values (p_user_id, p_type, round(p_amount, 2), p_wallet, 'rewarded');
  exception when unique_violation then
    return jsonb_build_object('ok', false, 'message', 'Reward already claimed');
  end;
  update public.users
  set balance = round(coalesce(balance, 0) + round(p_amount, 2), 2)
  where id = p_user_id
  returning balance into new_balance;
  if not found then raise exception 'User not found'; end if;
  return jsonb_build_object('ok', true, 'amount', round(p_amount, 2), 'balance', new_balance);
end;
$$;

create or replace function public.grant_quiz_once(p_user_id bigint, p_quiz_id integer, p_amount numeric, p_min_deposit numeric)
returns jsonb language plpgsql security invoker set search_path = public as $$
declare current_deposit numeric; new_balance numeric; quiz_type text := 'quiz_' || p_quiz_id::text;
begin
  select coalesce(deposit, 0) into current_deposit from public.users where id = p_user_id for update;
  if not found then return jsonb_build_object('ok', false, 'message', 'User not found'); end if;
  if current_deposit < p_min_deposit then return jsonb_build_object('ok', false, 'message', 'Learning locked'); end if;
  begin
    insert into public.signals (user_id, type, amount, wallet, status)
    values (p_user_id, quiz_type, round(p_amount, 2), 'quiz:' || p_quiz_id::text, 'rewarded');
  exception when unique_violation then
    return jsonb_build_object('ok', false, 'message', 'Already completed');
  end;
  update public.users
  set balance = round(coalesce(balance, 0) + round(p_amount, 2), 2)
  where id = p_user_id
  returning balance into new_balance;
  return jsonb_build_object('ok', true, 'reward', round(p_amount, 2), 'balance', new_balance);
end;
$$;

create or replace function public.settle_trade_once(p_trade_id bigint)
returns jsonb language plpgsql security invoker set search_path = public as $$
declare trade public.signals%rowtype; new_balance numeric;
begin
  select * into trade from public.signals
  where id = p_trade_id and status = 'pending' and type like 'trade_%' for update;
  if not found then return jsonb_build_object('ok', false, 'message', 'Trade already settled'); end if;
  update public.signals set status = 'rewarded' where id = trade.id;
  update public.users
  set balance = round(coalesce(balance, 0) + round(coalesce(trade.amount, 0), 2), 2)
  where id = trade.user_id
  returning balance into new_balance;
  if not found then raise exception 'User not found'; end if;
  return jsonb_build_object('ok', true, 'balance', new_balance);
end;
$$;

create or replace function public.approve_financial_signal(p_signal_id bigint)
returns jsonb language plpgsql security invoker set search_path = public as $$
declare signal_row public.signals%rowtype; amount numeric; gross numeric; payload jsonb := '{}'::jsonb;
  new_balance numeric; new_deposit numeric;
begin
  select * into signal_row from public.signals where id = p_signal_id for update;
  if not found or signal_row.status <> 'pending' then return jsonb_build_object('ok', false, 'message', 'Request unavailable'); end if;
  if signal_row.type not in ('deposit', 'withdraw') then return jsonb_build_object('ok', false, 'message', 'Unsupported financial request'); end if;
  if signal_row.type = 'deposit' then
    amount := round(coalesce(signal_row.amount, 0), 2);
    if amount <= 0 then return jsonb_build_object('ok', false, 'message', 'Invalid request'); end if;
    update public.users
    set balance = round(coalesce(balance, 0) + amount, 2), deposit = round(coalesce(deposit, 0) + amount, 2)
    where id = signal_row.user_id returning balance, deposit into new_balance, new_deposit;
  else
    begin
      if left(trim(coalesce(signal_row.wallet, '')), 1) = '{' then payload := signal_row.wallet::jsonb; end if;
      gross := round(coalesce(nullif(payload->>'gross_amount', '')::numeric, signal_row.amount, 0), 2);
    exception when others then gross := round(coalesce(signal_row.amount, 0), 2);
    end;
    if gross < 100 then return jsonb_build_object('ok', false, 'message', 'Minimum withdrawal is $100'); end if;
    update public.users
    set balance = round(coalesce(balance, 0) - gross, 2)
    where id = signal_row.user_id and coalesce(balance, 0) >= gross
      and coalesce(balance, 0) - coalesce(deposit, 0) >= gross
    returning balance, deposit into new_balance, new_deposit;
  end if;
  if not found then return jsonb_build_object('ok', false, 'message', 'Only earned funds are available for withdrawal'); end if;
  update public.signals set status = 'approved' where id = signal_row.id;
  return jsonb_build_object('ok', true, 'type', signal_row.type, 'amount', case when signal_row.type = 'deposit' then amount else gross end, 'balance', new_balance, 'deposit', new_deposit);
end;
$$;

revoke all on function public.grant_reward_once(bigint, text, numeric, text) from public, anon, authenticated;
revoke all on function public.grant_quiz_once(bigint, integer, numeric, numeric) from public, anon, authenticated;
revoke all on function public.settle_trade_once(bigint) from public, anon, authenticated;
revoke all on function public.approve_financial_signal(bigint) from public, anon, authenticated;
grant execute on function public.grant_reward_once(bigint, text, numeric, text) to service_role;
grant execute on function public.grant_quiz_once(bigint, integer, numeric, numeric) to service_role;
grant execute on function public.settle_trade_once(bigint) to service_role;
grant execute on function public.approve_financial_signal(bigint) to service_role;
