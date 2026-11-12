-- Deposits are limited by the minimum amount in the application, not by count.
create or replace function public.create_deposit_request(p_user_id bigint, p_amount numeric, p_wallet text)
returns jsonb language plpgsql security invoker set search_path = public as $$
declare new_id bigint;
begin
  perform 1 from public.users where id = p_user_id for update;
  if not found then return jsonb_build_object('ok', false, 'message', 'User not found'); end if;
  if p_amount is null or p_amount < 250 then return jsonb_build_object('ok', false, 'message', 'Minimum deposit is $250'); end if;

  insert into public.signals (user_id, type, amount, wallet, status)
  values (p_user_id, 'deposit', round(p_amount, 2), p_wallet, 'pending')
  returning id into new_id;
  return jsonb_build_object('ok', true, 'id', new_id);
end;
$$;

revoke all on function public.create_deposit_request(bigint, numeric, text) from public, anon, authenticated;
grant execute on function public.create_deposit_request(bigint, numeric, text) to service_role;
