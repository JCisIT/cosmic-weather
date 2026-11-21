-- Cosmic Weather database. Paste into Supabase > SQL Editor and run once.
-- Every table is locked so a signed-in person can only read and write their own rows.

create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  name text,
  hd_type text,
  hd_profile text,
  authority text,
  defined_centers text[] default '{}',
  tier text not null default 'member',
  created_at timestamptz not null default now()
);

create table if not exists journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  entry_date date not null,
  slot text not null,
  prompt text,
  body text,
  updated_at timestamptz not null default now(),
  unique (user_id, entry_date, slot)
);

create table if not exists todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  title text not null,
  source text not null default 'self',
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists checkins (
  user_id uuid not null references auth.users on delete cascade,
  entry_date date not null,
  feel text not null,
  primary key (user_id, entry_date)
);

alter table profiles enable row level security;
alter table journal_entries enable row level security;
alter table todos enable row level security;
alter table checkins enable row level security;

create policy "own profile" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own entries" on journal_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own todos" on todos for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own checkins" on checkins for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
