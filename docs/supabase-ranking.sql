-- Ranking / community leaderboard support

alter table public.profiles enable row level security;
alter table public.predictions enable row level security;

drop policy if exists "profiles_are_readable_for_ranking" on public.profiles;
create policy "profiles_are_readable_for_ranking"
on public.profiles
for select
to anon, authenticated
using (true);

drop policy if exists "users_manage_own_profile" on public.profiles;
create policy "users_manage_own_profile"
on public.profiles
for all
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "submitted_predictions_are_readable_for_ranking" on public.predictions;
create policy "submitted_predictions_are_readable_for_ranking"
on public.predictions
for select
to anon, authenticated
using (status in ('submitted', 'locked'));

drop policy if exists "users_manage_own_predictions" on public.predictions;
create policy "users_manage_own_predictions"
on public.predictions
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create index if not exists idx_predictions_user_status on public.predictions(user_id, status);
create index if not exists idx_predictions_fixture_status on public.predictions(fixture_id, status);
