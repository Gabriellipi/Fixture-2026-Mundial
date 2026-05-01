import { useEffect, useMemo, useState } from "react";
import { ArrowRightLeft, ChevronDown, Goal, Radio, ShieldAlert, SquareStack, TimerReset } from "lucide-react";
import { useAppLocale } from "../context/AppLocaleContext";
import { getLiveWorldCupFixtures, getWorldCupFixturesByDate } from "../services/apiSports";
import { useMatchStatus } from "../hooks/useMatchStatus";
import { upcomingMatches } from "../data/worldCup2026";

const LIVE_STATUSES = new Set(["1H", "2H", "HT", "ET", "BT", "P", "LIVE"]);
const UPCOMING_STATUSES = new Set(["NS", "TBD"]);
const POLL_INTERVAL_MS = 60_000;
const COUNTDOWN_THRESHOLD_MS = 60 * 60 * 1000;
const API_KEY_PRESENT = Boolean(import.meta.env.VITE_API_SPORTS_KEY);

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

function getCompetitionLabel(round, name) {
  if (round) {
    return round.replace("Group Stage - ", "Grupo ");
  }

  return name ?? "Mundial 2026";
}

function parseStatValue(value) {
  if (typeof value === "number") {
    return value;
  }

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

function normalizeFixture(fixture) {
  return {
    id: String(fixture.fixture?.id ?? fixture.id),
    fixtureId: fixture.fixture?.id ?? fixture.id ?? null,
    competition: getCompetitionLabel(fixture.league?.round, fixture.league?.name),
    kickoff: fixture.fixture?.date ? new Date(fixture.fixture.date) : null,
    status: fixture.fixture?.status?.short ?? "NS",
    minute: fixture.fixture?.status?.elapsed ?? null,
    homeTeam: {
      name: fixture.teams?.home?.name ?? "Local",
      crest: fixture.teams?.home?.logo ?? "",
    },
    awayTeam: {
      name: fixture.teams?.away?.name ?? "Visitante",
      crest: fixture.teams?.away?.logo ?? "",
    },
    score: {
      home: fixture.goals?.home ?? 0,
      away: fixture.goals?.away ?? 0,
    },
    stats: mapStatistics(fixture.statistics),
  };
}

function buildOfficialTodayMatches(timeZone) {
  const todayKey = getTodayKey(timeZone);

  return upcomingMatches
    .filter((match) => {
      if (!match.kickoffUtc) {
        return false;
      }

      try {
        return (
          new Intl.DateTimeFormat("en-CA", {
            timeZone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }).format(new Date(match.kickoffUtc)) === todayKey
        );
      } catch {
        return match.kickoffUtc.slice(0, 10) === todayKey;
      }
    })
    .sort((a, b) => new Date(a.kickoffUtc) - new Date(b.kickoffUtc))
    .map((match) => ({
      id: String(match.id),
      fixtureId: null,
      competition: `Grupo ${match.groupId}`,
      kickoff: match.kickoffUtc ? new Date(match.kickoffUtc) : null,
      status: "NS",
      minute: null,
      homeTeam: {
        name: match.homeTeam?.aliases?.[0] ?? match.homeTeam?.name ?? "Local",
        crest: match.homeTeam?.flag ?? "",
      },
      awayTeam: {
        name: match.awayTeam?.aliases?.[0] ?? match.awayTeam?.name ?? "Visitante",
        crest: match.awayTeam?.flag ?? "",
      },
      score: {
        home: 0,
        away: 0,
      },
      stats: {
        possession: { home: 0, away: 0 },
        shots: { home: 0, away: 0 },
        totalShots: { home: 0, away: 0 },
      },
    }));
}

function getEventTone(type) {
  if (type === "yellow-card") {
    return {
      icon: SquareStack,
      label: "Amarilla",
      iconClass: "text-yellow-300",
      badgeClass: "bg-yellow-500/12 text-yellow-100 border border-yellow-400/20",
    };
  }

  if (type === "red-card") {
    return {
      icon: SquareStack,
      label: "Roja",
      iconClass: "text-red-300",
      badgeClass: "bg-red-500/12 text-red-100 border border-red-400/20",
    };
  }

  if (type === "substitution") {
    return {
      icon: ArrowRightLeft,
      label: "Cambio",
      iconClass: "text-sky-300",
      badgeClass: "bg-sky-500/12 text-sky-100 border border-sky-400/20",
    };
  }

  if (type === "penalty") {
    return {
      icon: ShieldAlert,
      label: "Penal",
      iconClass: "text-fuchsia-300",
      badgeClass: "bg-fuchsia-500/12 text-fuchsia-100 border border-fuchsia-400/20",
    };
  }

  if (type === "var") {
    return {
      icon: TimerReset,
      label: "VAR",
      iconClass: "text-amber-200",
      badgeClass: "bg-amber-500/12 text-amber-100 border border-amber-400/20",
    };
  }

  return {
    icon: Goal,
    label: "Gol",
    iconClass: "text-emerald-300",
    badgeClass: "bg-emerald-500/12 text-emerald-200 border border-emerald-400/20",
  };
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
  return (
    <div className="space-y-3 border-t border-white/8 px-4 py-4">
      <StatBar label="Posesión" home={stats.possession.home} away={stats.possession.away} suffix="%" />
      <StatBar label="Tiros" home={stats.shots.home} away={stats.shots.away} />
      <StatBar label="Remates" home={stats.totalShots.home} away={stats.totalShots.away} />
    </div>
  );
}

function IncidentList({ events, homeTeamName, awayTeamName }) {
  if (!events?.length) {
    return (
      <div className="border-t border-white/8 px-4 py-4">
        <p className="text-sm text-slate-500">Todavía no hay incidencias cargadas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 border-t border-white/8 px-4 py-4">
      {events
        .slice()
        .sort((a, b) => (b.minute ?? 0) - (a.minute ?? 0))
        .map((event) => {
          const tone = getEventTone(event.type);
          const Icon = tone.icon;
          const teamName = event.team === "home" ? homeTeamName : awayTeamName;

          return (
            <div
              key={event.id ?? `${event.type}-${event.minute}-${event.player}`}
              className="flex items-start gap-3 rounded-2xl border border-white/6 bg-white/[0.03] px-3 py-3"
            >
              <div className="flex w-10 shrink-0 flex-col items-center">
                <span className="font-display text-lg font-bold tabular-nums text-white">
                  {event.minute ?? "?"}'
                </span>
              </div>

              <div className={`mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${tone.badgeClass}`}>
                <Icon size={15} className={tone.iconClass} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-white">{event.player ?? teamName}</p>
                  <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">{teamName}</span>
                </div>
                <p className="mt-1 text-xs text-slate-300">
                  {tone.label}
                  {event.detail ? ` · ${event.detail}` : ""}
                </p>
                {event.assist ? (
                  <p className="mt-1 text-[11px] text-slate-400">Asistencia: <span className="text-slate-200">{event.assist}</span></p>
                ) : null}
                {event.playerOut ? (
                  <p className="mt-1 text-[11px] text-slate-400">Sale: <span className="text-slate-200">{event.playerOut}</span></p>
                ) : null}
              </div>
            </div>
          );
        })}
    </div>
  );
}

function LiveMinute({ minute, status }) {
  const label = status === "HT" ? "HT" : `${minute ?? 0}'`;

  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <span className="flex items-center gap-1 rounded-full border border-red-500/25 bg-red-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-red-300">
        <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-red-500" />
        LIVE
      </span>
      <span className="text-sm font-semibold text-white">{label}</span>
    </div>
  );
}

function Countdown({ kickoff, language, timeZone }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const remaining = kickoff.getTime() - Date.now();
    if (remaining > COUNTDOWN_THRESHOLD_MS || remaining <= 0) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

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
      {new Intl.DateTimeFormat(language, {
        hour: "2-digit",
        minute: "2-digit",
        timeZone,
      }).format(kickoff)}
    </span>
  );
}

function LiveMatchRow({ match }) {
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
  const leftBorder = resolvedMatch.status === "HT" ? "border-l-amber-400" : "border-l-red-500";

  return (
    <article className={`overflow-hidden rounded-[24px] border border-white/8 border-l-4 ${leftBorder} bg-slate-900/80 shadow-[0_16px_40px_rgba(2,6,23,0.32)]`}>
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="flex w-full flex-col gap-3 px-4 py-4 text-left sm:flex-row sm:items-center"
        aria-expanded={expanded}
      >
        <div className="flex items-center justify-between gap-3 sm:min-w-[5.5rem] sm:justify-center">
          <LiveMinute minute={resolvedMatch.minute} status={resolvedMatch.status} />
          <CompetitionBadge label={resolvedMatch.competition} />
        </div>

        <div className="grid flex-1 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
          <TeamCell team={resolvedMatch.homeTeam} />
          <div className="text-center">
            <div className="font-display text-2xl font-bold text-white">
              {resolvedMatch.score.home} - {resolvedMatch.score.away}
            </div>
          </div>
          <TeamCell team={resolvedMatch.awayTeam} reverse />
        </div>

        <div className="flex items-center justify-end">
          <ChevronDown
            size={16}
            className={`text-slate-500 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {expanded ? (
        <>
          <InlineStats stats={resolvedMatch.stats} />
          <IncidentList
            events={resolvedMatch.events ?? []}
            homeTeamName={resolvedMatch.homeTeam.name}
            awayTeamName={resolvedMatch.awayTeam.name}
          />
        </>
      ) : null}
    </article>
  );
}

function UpcomingMatchRow({ match, language, timeZone }) {
  return (
    <article className="rounded-[24px] border border-white/8 border-l-4 border-l-emerald-400/55 bg-slate-900/75 px-4 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center justify-between gap-3 sm:min-w-[5.5rem] sm:flex-col sm:items-start">
          {match.kickoff ? <Countdown kickoff={match.kickoff} language={language} timeZone={timeZone} /> : <span className="text-sm text-slate-200">--:--</span>}
          <CompetitionBadge label={match.competition} />
        </div>

        <div className="grid flex-1 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
          <TeamCell team={match.homeTeam} />
          <div className="text-center text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">vs</div>
          <TeamCell team={match.awayTeam} reverse />
        </div>
      </div>
    </article>
  );
}

function LiveScreen({ isActive = false }) {
  const { t, language, timeZone } = useAppLocale();
  const [activeSubTab, setActiveSubTab] = useState("live");
  const [liveMatches, setLiveMatches] = useState([]);
  const [todayMatches, setTodayMatches] = useState(() => buildOfficialTodayMatches(timeZone));
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (!isActive) {
      return undefined;
    }

    let cancelled = false;

    const loadMatches = async () => {
      setLoading(true);

      try {
        const today = getTodayKey(timeZone);
        const officialTodayMatches = buildOfficialTodayMatches(timeZone);
        const [liveResponse, todayResponse] = API_KEY_PRESENT
          ? await Promise.all([
              getLiveWorldCupFixtures({ season: 2026 }),
              getWorldCupFixturesByDate({ season: 2026, date: today }),
            ])
          : [{ response: [] }, { response: [] }];

        if (cancelled) {
          return;
        }

        const normalizedLive = (liveResponse.response ?? [])
          .filter((fixture) => LIVE_STATUSES.has(fixture.fixture?.status?.short ?? ""))
          .map(normalizeFixture);

        const normalizedToday = (todayResponse.response ?? [])
          .filter((fixture) => UPCOMING_STATUSES.has(fixture.fixture?.status?.short ?? ""))
          .map(normalizeFixture)
          .sort((a, b) => (a.kickoff?.getTime() ?? Infinity) - (b.kickoff?.getTime() ?? Infinity));

        setLiveMatches(normalizedLive);
        setTodayMatches(normalizedToday.length > 0 ? normalizedToday : officialTodayMatches);
        setLastUpdated(new Date());
      } catch {
        if (!cancelled) {
          setLiveMatches([]);
          setTodayMatches(buildOfficialTodayMatches(timeZone));
          setLastUpdated(new Date());
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadMatches();
    const intervalId = window.setInterval(loadMatches, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [isActive, timeZone]);

  const emptyLiveState = liveMatches.length === 0;
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
              {new Intl.DateTimeFormat(language, {
                hour: "2-digit",
                minute: "2-digit",
                timeZone,
              }).format(lastUpdated)}
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
        emptyLiveState ? (
          <div className="space-y-3">
            <div className="panel p-5 text-sm text-slate-300">{t("live_empty")}</div>
            {visibleTodayMatches.map((match) => (
              <UpcomingMatchRow key={match.id} match={match} language={language} timeZone={timeZone} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {liveMatches.map((match) => (
              <LiveMatchRow key={match.id} match={match} />
            ))}
          </div>
        )
      ) : visibleTodayMatches.length > 0 ? (
        <div className="space-y-3">
          {visibleTodayMatches.map((match) => (
            <UpcomingMatchRow key={match.id} match={match} language={language} timeZone={timeZone} />
          ))}
        </div>
      ) : (
        <div className="panel p-5 text-sm text-slate-300">{t("live_no_today")}</div>
      )}
    </section>
  );
}

export default LiveScreen;
