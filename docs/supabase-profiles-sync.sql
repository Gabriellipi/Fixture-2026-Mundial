-- Ensure every authenticated user gets a public profile row for Ranking
-- Run this in the Supabase SQL editor.

alter table public.profiles enable row level security;

-- Public read access so the community leaderboard can list users.
drop policy if exists "profiles_are_readable_for_ranking" on public.profiles;
create policy "profiles_are_readable_for_ranking"
on public.profiles
for select
to anon, authenticated
using (true);

-- Owners can insert/update their own row.
drop policy if exists "users_manage_own_profile" on public.profiles;
create policy "users_manage_own_profile"
on public.profiles
for all
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Auto-create a public profile whenever a new auth user is created.
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    email,
    favorite_team,
    avatar_url,
    reminder_opt_in
  )
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      new.raw_user_meta_data ->> 'user_name',
      split_part(coalesce(new.email, ''), '@', 1),
      'Fan'
    ),
    coalesce(new.email, ''),
    null,
    coalesce(
      new.raw_user_meta_data ->> 'avatar_url',
      new.raw_user_meta_data ->> 'picture',
      new.raw_user_meta_data ->> 'photo_url'
    ),
    true
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    email = excluded.email,
    avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute procedure public.handle_new_user_profile();

-- Backfill existing auth users that still do not have a public profile row.
insert into public.profiles (
  id,
  full_name,
  email,
  favorite_team,
  avatar_url,
  reminder_opt_in
)
select
  au.id,
  coalesce(
    au.raw_user_meta_data ->> 'full_name',
    au.raw_user_meta_data ->> 'name',
    au.raw_user_meta_data ->> 'user_name',
    split_part(coalesce(au.email, ''), '@', 1),
    'Fan'
  ) as full_name,
  coalesce(au.email, '') as email,
  null as favorite_team,
  coalesce(
    au.raw_user_meta_data ->> 'avatar_url',
    au.raw_user_meta_data ->> 'picture',
    au.raw_user_meta_data ->> 'photo_url'
  ) as avatar_url,
  true as reminder_opt_in
from auth.users au
left join public.profiles p on p.id = au.id
where p.id is null;
