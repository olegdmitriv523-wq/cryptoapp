create table if not exists public.settings (
  id bigint generated always as identity primary key,
  key text not null unique,
  value text,
  created_at timestamptz not null default now()
);

create table if not exists public.verifications (
  id bigint generated always as identity primary key,
  token_hash text not null,
  purpose text not null,
  email text not null,
  user_id bigint,
  payload text,
  password_hash text,
  code_hash text not null,
  attempts integer not null default 0,
  consumed_at timestamptz,
  expires_at timestamptz not null,
  ip text,
  created_at timestamptz not null default now()
);

create index if not exists signals_user_id_idx on public.signals (user_id);
create index if not exists signals_type_status_created_idx on public.signals (type, status, created_at desc);
create index if not exists users_referrer_id_idx on public.users (referrer_id);
create index if not exists verifications_token_purpose_idx on public.verifications (token_hash, purpose);
create index if not exists verifications_expires_at_idx on public.verifications (expires_at);

alter table public.settings enable row level security;
alter table public.verifications enable row level security;
