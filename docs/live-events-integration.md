# Live Events Integration

## External API recommendation

Recommended provider: `API-Football` / `API-Sports`.

Why:
- It exposes fixture timeline events through `/fixtures/events`.
- Goal events include minute, team, player and assist fields.
- Match statistics are available through `/fixtures/statistics`.
- The same fixture id links score, events, stats and lineups.

Reference material:
- https://www.api-football.com/news/post/how-to-get-started-with-api-football-the-complete-beginners-guide
- https://www.api-football.com/coverage

## Internal flow

1. Frontend asks the internal backend for `/matches/:id`.
2. Backend fetches:
   - `/fixtures?id={fixtureId}`
   - `/fixtures/events?fixture={fixtureId}`
   - `/fixtures/statistics?fixture={fixtureId}`
3. Backend normalizes the payload and stores it in memory.
4. Backend exposes:
   - `GET /matches/:id`
   - `GET /matches/:id/events`
   - optional `GET /matches/:id/stream` via SSE
5. Frontend consumes internal endpoints instead of hitting API-Football directly.

## Event model

Goal events are identified when:
- `event.type === "Goal"`
- or `event.detail` includes goal/penalty semantics.

Normalized shape:

```json
{
  "id": "fixture-event-id",
  "minute": 67,
  "type": "goal",
  "team_side": "home",
  "team_name": "Mexico",
  "player_id": 123,
  "player_name": "Santiago Gimenez",
  "assist_player_name": "Edson Alvarez",
  "detail": "Normal Goal",
  "is_goal": true
}
```

## Backend endpoints

- `GET /matches/:id` -> current status, score, statistics, last goal.
- `GET /matches/:id/events` -> normalized events. Supports `?type=goal` and `?since=...`.
- `GET /matches/:id/stream` -> server-sent events for push updates.
- `POST /matches/:id/watch` -> optional polling bootstrap.

## Frontend example

- `src/services/matchCenterApi.js`
- `src/hooks/useLiveMatchFeed.js`
- `src/components/LiveGoalNotification.jsx`

## Suggested production evolution

- Replace memory store with PostgreSQL or Redis.
- Add per-match poll scheduler based on live status.
- Persist deduplicated event ids.
- Move from polling-only to SSE for clients while backend polls external provider.
