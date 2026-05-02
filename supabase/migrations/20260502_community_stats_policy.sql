-- Allow any authenticated or anonymous user to read predictions for community stats.
-- The "Read own predictions" policy only returns the current user's rows.
-- This policy makes ALL rows readable, which is needed for the community predictions bar.
-- Sports prediction scores are not sensitive data in a public competition game.

drop policy if exists "Public read for community stats" on public.predictions;
create policy "Public read for community stats"
on public.predictions
for select
using (true);
