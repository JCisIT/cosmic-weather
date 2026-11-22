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

-- Studio: roles, birth details and session recaps (added in the second migration).
alter table profiles add column if not exists role text not null default 'member';
alter table profiles add column if not exists email text;
alter table profiles add column if not exists birth_date date;
alter table profiles add column if not exists birth_time time;
alter table profiles add column if not exists birth_place text;

-- People may only write their own design fields; role and tier are set by the project owner.
revoke insert, update on profiles from authenticated, anon;
grant insert (id, name, email, hd_type, hd_profile, authority, defined_centers, birth_date, birth_time, birth_place) on profiles to authenticated;
grant update (id, name, email, hd_type, hd_profile, authority, defined_centers, birth_date, birth_time, birth_place) on profiles to authenticated;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin')
$$;
revoke execute on function public.is_admin() from anon, public;
grant execute on function public.is_admin() to authenticated;

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references auth.users on delete cascade,
  session_date date not null,
  title text not null,
  recap text,
  created_by uuid references auth.users,
  created_at timestamptz not null default now()
);
alter table sessions enable row level security;

create policy "client reads own sessions" on sessions for select using (client_id = auth.uid());
create policy "admin manages sessions" on sessions for all using (public.is_admin()) with check (public.is_admin());
create policy "admin reads profiles" on profiles for select using (public.is_admin());
create policy "admin updates profiles" on profiles for update using (public.is_admin()) with check (public.is_admin());
create policy "admin reads todos" on todos for select using (public.is_admin());
create policy "admin adds todos" on todos for insert with check (public.is_admin());

-- To make someone an admin after they have signed in once:
--   update profiles set role = 'admin' where email = 'their@email.com';

-- Places and birth time zone (third migration).
alter table profiles add column if not exists birth_tz text;
alter table profiles add column if not exists home_place jsonb;
alter table profiles add column if not exists places jsonb not null default '[]'::jsonb;
grant insert (birth_tz, home_place, places) on profiles to authenticated;
grant update (birth_tz, home_place, places) on profiles to authenticated;
alter table checkins add column if not exists updated_at timestamptz not null default now();

-- Musical mantras (fourth migration). Recordings live in a private bucket at <client id>/<file>.
alter table profiles add column if not exists mantra_path text;
alter table profiles add column if not exists mantra_title text;
grant update (mantra_path, mantra_title) on profiles to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('mantras', 'mantras', false, 26214400, array['audio/mpeg','audio/mp4','audio/x-m4a','audio/aac','audio/wav','audio/x-wav','audio/ogg','audio/webm'])
on conflict (id) do nothing;

create policy "client reads own mantra" on storage.objects for select to authenticated
  using (bucket_id = 'mantras' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "admin reads mantras" on storage.objects for select to authenticated
  using (bucket_id = 'mantras' and public.is_admin());
create policy "admin adds mantras" on storage.objects for insert to authenticated
  with check (bucket_id = 'mantras' and public.is_admin());
create policy "admin replaces mantras" on storage.objects for update to authenticated
  using (bucket_id = 'mantras' and public.is_admin()) with check (bucket_id = 'mantras' and public.is_admin());
create policy "admin removes mantras" on storage.objects for delete to authenticated
  using (bucket_id = 'mantras' and public.is_admin());

-- Only an admin may change which recording a profile points to.
create or replace function public.guard_mantra() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (new.mantra_path is distinct from old.mantra_path or new.mantra_title is distinct from old.mantra_title) and not public.is_admin() then
    new.mantra_path := old.mantra_path;
    new.mantra_title := old.mantra_title;
  end if;
  return new;
end $$;
drop trigger if exists guard_mantra on profiles;
create trigger guard_mantra before update on profiles for each row execute function public.guard_mantra();
