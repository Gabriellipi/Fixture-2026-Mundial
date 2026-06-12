import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Goal, Radio } from "lucide-react";
import { useAppLocale } from "../context/AppLocaleContext";
import { getLiveWorldCupFixtures, getWorldCupFixturesByDate } from "../services/apiSports";
import { useMatchStatus } from "../hooks/useMatchStatus";
import { upcomingMatches } from "../data/worldCup2026";

const LIVE_STATUSES = new Set(["1H", "2H", "HT", "ET", "BT", "P", "LIVE"]);
const UPCOMING_STATUSES = new Set(["NS", "TBD"]);
const FINISHED_STATUSES = new Set(["FT", "AET", "PEN", "FINISHED"]);
const POLL_INTERVAL_MS = 60_000;
const COUNTDOWN_THRESHOLD_MS = 60 * 60 * 1000;

function getTodayKey(timeZone) {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

function getCompetitionLabel(round, name, t) {
  if (round) {
    const groupMatch = round.match(/Group Stage - (.+)/);
    if (groupMatch) return t("live_group_label", { id: groupMatch[1] });
    return round;
  }

  return name ?? "Mundial 2026";
}

function parseStatValue(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number.parseInt(value.replace("%", ""), 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function mapStatistics(stats = []) {
  const lookup = new Map(stats.map((item) => [item.type, item]));

  return {
    possession: {
      home: parseStatValue(lookup.get("Ball Possession")?.home),
      away: parseStatValue(lookup.get("Ball Possession")?.away),
    },
    shots: {
      home: parseStatValue(lookup.get("Shots on Goal")?.home),
      away: parseStatValue(lookup.get("Shots on Goal")?.away),
    },
    totalShots: {
      home: parseStatValue(lookup.get("Total Shots")?.home),
      away: parseStatValue(lookup.get("Total Shots")?.away),
    },
  };
}

function normalizeFixture(fixture, t) {
  return {
    id: String(fixture.fixture?.id ?? fixture.id),
    fixtureId: fixture.fixture?.id ?? fixture.id ?? null,
    competition: getCompetitionLabel(fixture.league?.round, fixture.league?.name, t),
    kickoff: fixture.fixture?.date ? new Date(fixture.fixture.date) : null,
    status: fixture.fixture?.status?.short ?? "NS",
    minute: fixture.fixture?.status?.elapsed ?? null,
    homeTeam: {
      name: fixture.teams?.home?.name ?? t("live_fallback_home"),
      crest: fixture.teams?.home?.logo ?? "",
    },
    awayTeam: {
      name: fixture.teams?.away?.name ?? t("live_fallback_away"),
      crest: fixture.teams?.away?.logo ?? "",
    },
    score: {
      home: fixture.goals?.home ?? fixture.score?.fulltime?.home ?? 0,
      away: fixture.goals?.away ?? fixture.score?.fulltime?.away ?? 0,
    },
    stats: mapStatistics(fixture.statistics),
    events: [],
  };
}

function buildLocalTodayMatches(timeZone, t) {
  const todayKey = getTodayKey(timeZone);

  return upcomingMatches
    .filter((match) => {
      if (!match.kickoffUtc) return false;
      try {
        return new Intl.DateTimeFormat("en-CA", {
          timeZone,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date(match.kickoffUtc)) === todayKey;
      } catch {
        return match.kickoffUtc.slice(0, 10) === todayKey;
      }
    })
    .map((match) => ({
      id: String(match.id),
      fixtureId: null,
      competition: t("live_group_label", { id: match.groupId }),
      kickoff: match.kickoffUtc ? new Date(match.kickoffUtc) : null,
      status: "NS",
      minute: null,
      homeTeam: {
        name: match.homeTeam?.aliases?.[0] ?? match.homeTeam?.name ?? t("live_fallback_home"),
        crest: match.homeTeam?.flag ?? "",
      },
      awayTeam: {
        name: match.awayTeam?.aliases?.[0] ?? match.awayTeam?.name ?? t("live_fallback_away"),
        crest: match.awayTeam?.flag ?? "",
      },
      score: { home: 0, away: 0 },
      stats: {
        possession: { home: 0, away: 0 },
        shots: { home: 0, away: 0 },
        totalShots: { home: 0, away: 0 },
      },
      events: [],
    }))
    .sort((a, b) => (a.kickoff?.getTime() ?? Infinity) - (b.kickoff?.getTime() ?? Infinity));
}

function normalizeName(name = "") {
  return String(name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
}

function getMatchKey(match) {
  const date = match.kickoff ? match.kickoff.toISOString().slice(0, 10) : "";
  return `${date}-${normalizeName(match.homeTeam?.name)}-${normalizeName(match.awayTeam?.name)}`;
}

function mergeTodayMatches(localMatches, officialMatches) {
  const byKey = new Map(localMatches.map((match) => [getMatchKey(match), match]));

  officialMatches.forEach((match) => {
    byKey.set(getMatchKey(match), { ...byKey.get(getMatchKey(match)), ...match });
  });

  return [...byKey.values()].sort((a, b) => (a.kickoff?.getTime() ?? Infinity) - (b.kickoff?.getTime() ?? Infinity));
}

function TeamCell({ team, reverse = false }) {
  return (
    <div className={`flex min-w-0 items-center gap-2 ${reverse ? "flex-row-reverse text-right" : ""}`}>
      {team.crest ? (
        <img
          src={team.crest}
          alt={team.name}
          className="h-9 w-9 shrink-0 rounded-full border border-white/10 bg-slate-950/60 object-cover"
        />
      ) : (
        <div className="h-9 w-9 shrink-0 rounded-full border border-white/10 bg-slate-950/60" />
      )}
      <span className="truncate text-sm font-semibold text-white">{team.name}</span>
    </div>
  );
}

function CompetitionBadge({ label }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300">
      {label}
    </span>
  );
}

function StatusBadge({ match }) {
  const { t } = useAppLocale();
  const isLive = LIVE_STATUSES.has(match.status);
  const isFinished = FINISHED_STATUSES.has(match.status);

  if (isFinished) {
    return (
      <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-300">
        {t("match_finished")}
      </span>
    );
  }

  if (isLive) {
    return (
      <span className="flex items-center gap-1 rounded-full border border-red-500/25 bg-red-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-red-300">
        <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-red-500" />
        {match.status === "HT" ? "HT" : `${match.minute ?? 0}'`}
      </span>
    );
  }

  return null;
}

function Countdown({ kickoff, language, timeZone }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const remaining = kickoff.getTime() - Date.now();
    if (remaining > COUNTDOWN_THRESHOLD_MS || remaining <= 0) return undefined;

    const intervalId = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, [kickoff]);

  const remaining = kickoff.getTime() - now;
  const isSoon = remaining > 0 && remaining <= COUNTDOWN_THRESHOLD_MS;

  if (isSoon) {
    const minutes = Math.floor(remaining / 60_000);
    const seconds = Math.floor((remaining % 60_000) / 1000);
    return (
      <span className="font-mono text-sm font-bold tabular-nums text-amber-300">
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
    );
  }

  return (
    <span className="text-sm font-semibold text-slate-200">
      {new Intl.DateTimeFormat(language, { hour: "2-digit", minute: "2-digit", timeZone }).format(kickoff)}
    </span>
  );
}

function StatBar({ label, home, away, suffix = "" }) {
  const total = Math.max(home + away, 1);
  const homeWidth = Math.max(8, Math.round((home / total) * 100));

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span className="font-semibold text-white">{home}{suffix}</span>
        <span className="uppercase tracking-[0.18em]">{label}</span>
        <span className="font-semibold text-white">{away}{suffix}</span>
      </div>
      <div className="flex h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <div className="rounded-full bg-emerald-400/75" style={{ width: `${homeWidth}%` }} />
      </div>
    </div>
  );
}

function InlineStats({ stats }) {
  const { t } = useAppLocale();

  return (
    <div className="space-y-3 border-t border-white/8 px-4 py-4">
      <StatBar label={t("live_stat_possession")} home={stats.possession.home} away={stats.possession.away} suffix="%" />
      <StatBar label={t("live_stat_shots")} home={stats.shots.home} away={stats.shots.away} />
      <StatBar label={t("live_stat_total_shots")} home={stats.totalShots.home} away={stats.totalShots.away} />
    </div>
  );
}

function MatchRow({ match, language, timeZone }) {
  const [expanded, setExpanded] = useState(false);
  const { matchData } = useMatchStatus(match.fixtureId, match);
  const resolvedMatch = matchData
    ? {
        ...match,
        status: matchData.rawStatus ?? match.status,
        minute: matchData.minute ?? match.minute,
        score: matchData.score ?? match.score,
        stats: matchData.stats
          ? {
              possession: matchData.stats.possession ?? match.stats.possession,
              shots: matchData.stats.shotsOnTarget ?? match.stats.shots,
              totalShots: match.stats.totalShots,
            }
          : match.stats,
        events: matchData.events ?? [],
      }
    : match;
  const isUpcoming = UPCOMING_STATUSES.has(resolvedMatch.status);
  const isFinished = FINISHED_STATUSES.has(resolvedMatch.status);
  const isLive = LIVE_STATUSES.has(resolvedMatch.status);
  const leftBorder = isFinished ? "border-l-slate-500" : isLive ? "border-l-red-500" : "border-l-emerald-400/55";

  return (
    <article className={`overflow-hidden rounded-[24px] border border-white/8 border-l-4 ${leftBorder} bg-slate-900/80 shadow-[0_16px_40px_rgba(2,6,23,0.32)]`}>
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="flex w-full flex-col gap-3 px-4 py-4 text-left sm:flex-row sm:items-center"
        aria-expanded={expanded}
      >
        <div className="flex items-center justify-between gap-3 sm:min-w-[5.5rem] sm:flex-col sm:items-start">
          {isUpcoming && resolvedMatch.kickoff ? (
            <Countdown kickoff={resolvedMatch.kickoff} language={language} timeZone={timeZone} />
          ) : (
            <StatusBadge match={resolvedMatch} />
          )}
          <CompetitionBadge label={resolvedMatch.competition} />
        </div>

        <div className="grid flex-1 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
          <TeamCell team={resolvedMatch.homeTeam} />
          <div className="text-center">
            {isUpcoming ? (
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">vs</div>
            ) : (
              <div className="font-display text-2xl font-bold text-white">
                {resolvedMatch.score.home} - {resolvedMatch.score.away}
              </div>
            )}
          </div>
          <TeamCell team={resolvedMatch.awayTeam} reverse />
        </div>

        <ChevronDown size={16} className={`ml-auto text-slate-500 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && !isUpcoming ? (
        <>
          <InlineStats stats={resolvedMatch.stats} />
          {resolvedMatch.events?.length ? (
            <div className="space-y-2 border-t border-white/8 px-4 py-4">
              {resolvedMatch.events.map((event) => (
                <div key={event.id ?? `${event.type}-${event.minute}-${event.player}`} className="flex items-center gap-3 rounded-2xl border border-white/6 bg-white/[0.03] px-3 py-3">
                  <Goal size={15} className="text-emerald-300" />
                  <span className="text-sm font-semibold text-white">{event.minute ?? "?"}' {event.player ?? event.detail ?? "Gol"}</span>
                </div>
              ))}
            </div>
          ) : null}
        </>
      ) : null}
    </article>
  );
}

function LiveScreen({ isActive = false }) {
  const { t, language, timeZone } = useAppLocale();
  const [activeSubTab, setActiveSubTab] = useState("live");
  const [liveMatches, setLiveMatches] = useState([]);
  const [todayMatches, setTodayMatches] = useState(() => buildLocalTodayMatches(timeZone, t));
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (!isActive) return undefined;

    let cancelled = false;

    const loadMatches = async () => {
      setLoading(true);

      try {
        const today = getTodayKey(timeZone);
        const localTodayMatches = buildLocalTodayMatches(timeZone, t);
        const [liveResponse, todayResponse] = await Promise.all([
          getLiveWorldCupFixtures({ season: 2026 }),
          getWorldCupFixturesByDate({ season: 2026, date: today }),
        ]);

        if (cancelled) return;

        const normalizedToday = (todayResponse.response ?? []).map((fixture) => normalizeFixture(fixture, t));
        const normalizedLive = (liveResponse.response ?? [])
          .filter((fixture) => LIVE_STATUSES.has(fixture.fixture?.status?.short ?? ""))
          .map((fixture) => normalizeFixture(fixture, t));
        const activeFromToday = normalizedToday.filter((match) => LIVE_STATUSES.has(match.status));

        setLiveMatches(normalizedLive.length > 0 ? normalizedLive : activeFromToday);
        setTodayMatches(mergeTodayMatches(localTodayMatches, normalizedToday));
        setLastUpdated(new Date());
      } catch {
        if (!cancelled) {
          setLiveMatches([]);
          setTodayMatches(buildLocalTodayMatches(timeZone, t));
          setLastUpdated(new Date());
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadMatches();
    const intervalId = window.setInterval(loadMatches, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [isActive, timeZone, t]);

  const visibleTodayMatches = useMemo(() => todayMatches, [todayMatches]);

  return (
    <section className="mt-8 space-y-4 pb-6">
      <div className="panel overflow-hidden p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="chip flex items-center gap-1.5">
              <Radio size={11} className="text-red-400" />
              {t("nav_live")}
            </span>
            <h2 className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl">{t("nav_live")}</h2>
            <p className="mt-1 text-sm text-slate-400">{t("live_subtitle")}</p>
          </div>

          {lastUpdated ? (
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
              {new Intl.DateTimeFormat(language, { hour: "2-digit", minute: "2-digit", timeZone }).format(lastUpdated)}
            </p>
          ) : null}
        </div>

        <div className="mt-5 flex items-center gap-2">
          {[
            { id: "live", label: t("live_tab_live") },
            { id: "today", label: t("live_tab_today") },
          ].map((tab) => {
            const isActiveTab = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id)}
                className={`rounded-full px-4 py-2 text-[12px] font-bold uppercase tracking-[0.22em] transition ${
                  isActiveTab
                    ? "bg-emerald-500/18 text-emerald-300 ring-1 ring-emerald-400/30"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            );
          })}

          {loading ? (
            <span className="ml-auto text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              {t("live_updating")}
            </span>
          ) : null}
        </div>
      </div>

      {activeSubTab === "live" ? (
        liveMatches.length > 0 ? (
          <div className="space-y-3">
            {liveMatches.map((match) => (
              <MatchRow key={match.id} match={match} language={language} timeZone={timeZone} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="panel p-5 text-sm text-slate-300">{t("live_empty")}</div>
            {visibleTodayMatches.map((match) => (
              <MatchRow key={match.id} match={match} language={language} timeZone={timeZone} />
            ))}
          </div>
        )
      ) : visibleTodayMatches.length > 0 ? (
        <div className="space-y-3">
          {visibleTodayMatches.map((match) => (
            <MatchRow key={match.id} match={match} language={language} timeZone={timeZone} />
          ))}
        </div>
      ) : (
        <div className="panel p-5 text-sm text-slate-300">{t("live_no_today")}</div>
      )}
    </section>
  );
}

export default LiveScreen;
