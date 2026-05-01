import { useEffect, useMemo, useRef, useState } from "react";
import {
  getMatchCenterEvents,
  getMatchCenterState,
  isInternalMatchCenterEnabled,
  subscribeMatchCenter,
} from "../services/matchCenterApi";

const POLL_INTERVAL_MS = 60_000;

export function useLiveMatchFeed(matchId, { enabled = true } = {}) {
  const [match, setMatch] = useState(null);
  const [events, setEvents] = useState([]);
  const [lastGoal, setLastGoal] = useState(null);
  const [error, setError] = useState(null);
  const latestGoalId = useRef(null);

  useEffect(() => {
    if (!enabled || !matchId || !isInternalMatchCenterEnabled()) {
      return undefined;
    }

    let cancelled = false;

    const sync = async () => {
      try {
        const [nextMatch, nextEvents] = await Promise.all([
          getMatchCenterState(matchId),
          getMatchCenterEvents(matchId),
        ]);

        if (cancelled) {
          return;
        }

        setMatch(nextMatch);
        setEvents(nextEvents.events ?? []);
        const goal = (nextEvents.events ?? []).filter((event) => event.is_goal).at(-1) ?? null;
        if (goal && latestGoalId.current !== goal.id) {
          latestGoalId.current = goal.id;
          setLastGoal(goal);
        }
      } catch (nextError) {
        if (!cancelled) {
          setError(nextError);
        }
      }
    };

    sync();
    const pollId = window.setInterval(sync, POLL_INTERVAL_MS);
    const unsubscribe = subscribeMatchCenter(matchId, {
      onMessage: (payload) => {
        if (payload.kind === "snapshot" && payload.match) {
          setMatch(payload.match);
        }

        if (payload.kind === "goal" && payload.event) {
          latestGoalId.current = payload.event.id;
          setLastGoal(payload.event);
          setEvents((current) => {
            if (current.some((event) => event.id === payload.event.id)) {
              return current;
            }
            return [...current, payload.event];
          });
          setMatch((current) =>
            current
              ? {
                  ...current,
                  goals_home: payload.score?.home ?? current.goals_home,
                  goals_away: payload.score?.away ?? current.goals_away,
                  minute: payload.minute ?? current.minute,
                  status: payload.status ?? current.status,
                }
              : current,
          );
        }
      },
      onError: (streamError) => setError(streamError),
    });

    return () => {
      cancelled = true;
      window.clearInterval(pollId);
      unsubscribe();
    };
  }, [enabled, matchId]);

  return useMemo(
    () => ({
      match,
      events,
      lastGoal,
      error,
      enabled: isInternalMatchCenterEnabled(),
    }),
    [error, events, lastGoal, match],
  );
}
