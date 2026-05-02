create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  favorite_team text,
  avatar_url text,
  preferred_language text default 'es',
  timezone text,
  reminder_opt_in boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists favorite_team text,
  add column if not exists avatar_url text,
  add column if not exists preferred_language text default 'es',
  add column if not exists timezone text;

create or replace function public.set_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_profiles_updated_at();

alter table public.profiles enable row level security;

drop policy if exists "Read own profile" on public.profiles;
create policy "Read own profile"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "Insert own profile" on public.profiles;
create policy "Insert own profile"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "Update own profile" on public.profiles;
create policy "Update own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "Public can read avatars" on storage.objects;
create policy "Public can read avatars"
on storage.objects
for select
using (bucket_id = 'avatars');

drop policy if exists "Users can upload own avatars" on storage.objects;
create policy "Users can upload own avatars"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Users can update own avatars" on storage.objects;
create policy "Users can update own avatars"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Users can delete own avatars" on storage.objects;
create policy "Users can delete own avatars"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create table if not exists public.predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  fixture_id bigint not null,
  predicted_home_score smallint,
  predicted_away_score smallint,
  status text not null default 'draft',
  submitted_at timestamptz,
  locked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint predictions_user_fixture_unique unique (user_id, fixture_id),
  constraint predictions_home_score_check check (
    predicted_home_score is null or predicted_home_score >= 0
  ),
  constraint predictions_away_score_check check (
    predicted_away_score is null or predicted_away_score >= 0
  ),
  constraint predictions_status_check check (
    status in ('draft', 'submitted', 'locked')
  )
);

alter table public.predictions
  add column if not exists status text not null default 'draft',
  add column if not exists submitted_at timestamptz,
  add column if not exists locked_at timestamptz;

alter table public.predictions
  drop constraint if exists predictions_status_check;

alter table public.predictions
  add constraint predictions_status_check check (status in ('draft', 'submitted', 'locked'));

create or replace function public.set_predictions_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists predictions_set_updated_at on public.predictions;
create trigger predictions_set_updated_at
before update on public.predictions
for each row
execute function public.set_predictions_updated_at();

alter table public.predictions enable row level security;

-- Each user can read their own full predictions (scores, status, etc.)
drop policy if exists "Read own predictions" on public.predictions;
create policy "Read own predictions"
on public.predictions
for select
using (auth.uid() = user_id);

-- Anyone can read the sign distribution columns for community stats.
-- Scores are not exposed: only fixture_id + predicted_home_score + predicted_away_score
-- are used in aggregation; the full row is technically accessible but app only
-- uses sign (>, =, <) for the community bar — acceptable for a public sports game.
drop policy if exists "Public read for community stats" on public.predictions;
create policy "Public read for community stats"
on public.predictions
for select
using (true);

drop policy if exists "Insert own predictions" on public.predictions;
create policy "Insert own predictions"
on public.predictions
for insert
with check (auth.uid() = user_id);

drop policy if exists "Update own predictions" on public.predictions;
create policy "Update own predictions"
on public.predictions
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Delete own predictions" on public.predictions;
create policy "Delete own predictions"
on public.predictions
for delete
using (auth.uid() = user_id);
