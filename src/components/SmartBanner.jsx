import { useEffect, useMemo, useState } from "react";
import { getCountryName, useAppLocale } from "../context/AppLocaleContext";

const TOURNAMENT_START = new Date("2026-06-11T19:00:00Z"); // México vs Sudáfrica UTC
const TOURNAMENT_END = new Date("2026-07-19T23:59:00Z");

function pad(n) {
  return String(n).padStart(2, "0");
}

function getCountdownTo(target, now = new Date()) {
  const diff = Math.max(0, target.getTime() - now.getTime());
  const total = Math.floor(diff / 1000);
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
    over: diff === 0,
  };
}

function getDayKey(date, timeZone) {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

function getPhase(enrichedMatches, now, timeZone) {
  if (now >= TOURNAMENT_START) {
    if (now > TOURNAMENT_END) return "FINISHED";
    const liveCount = enrichedMatches.filter(
      (m) => m.status === "LIVE" || m.status === "HT" || m.status === "1H" || m.status === "2H"
    ).length;
    if (liveCount > 0) return "LIVE";
    const todayKey = getDayKey(now, timeZone);
    const todayCount = enrichedMatches.filter(
      (m) => m.kickoffUtc && getDayKey(new Date(m.kickoffUtc), timeZone) === todayKey
    ).length;
    if (todayCount > 0) return "TODAY";
    return "BETWEEN_DAYS";
  }
  // Before tournament starts: check if today is opening day (Jun 11 UTC)
  const isOpeningDay =
    now.getUTCFullYear() === 2026 &&
    now.getUTCMonth() === 5 &&
    now.getUTCDate() === 11;
  if (isOpeningDay) return "OPENING_DAY";
  return "PRE";
}

function formatMatchTime(kickoffUtc, timeZone, language) {
  if (!kickoffUtc) return "";
  try {
    return new Date(kickoffUtc).toLocaleTimeString(language, {
      hour: "2-digit",
      minute: "2-digit",
      timeZone,
    });
  } catch {
    return "";
  }
}

function formatMatchDate(dateIso, language) {
  if (!dateIso) return "";
  try {
    const [y, m, d] = dateIso.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(language, {
      day: "numeric",
      month: "short",
    });
  } catch {
    return dateIso;
  }
}

function getMatchLabel(match, t) {
  const home = getCountryName(match.homeTeam, t) || match.homeTeam?.name || "?";
  const away = getCountryName(match.awayTeam, t) || match.awayTeam?.name || "?";
  return { home, away };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CountdownUnits({ countdown, showDays = true }) {
  const { t } = useAppLocale();
  const units = showDays
    ? [
        { value: countdown.days, label: t("countdown_days") },
        { value: pad(countdown.hours), label: t("countdown_hours") },
        { value: pad(countdown.minutes), label: t("countdown_minutes") },
        { value: pad(countdown.seconds), label: t("countdown_seconds") },
      ]
    : [
        { value: pad(countdown.hours), label: t("countdown_hours") },
        { value: pad(countdown.minutes), label: t("countdown_minutes") },
        { value: pad(countdown.seconds), label: t("countdown_seconds") },
      ];

  return (
    <div className={`grid gap-2 sm:gap-3 ${showDays ? "grid-cols-4" : "grid-cols-3"}`}>
      {units.map(({ value, label }) => (
        <div
          key={label}
          className="flex min-w-[56px] flex-col items-center rounded-2xl bg-black/10 px-2 py-2 sm:min-w-[78px] sm:px-3 sm:py-2.5"
        >
          <span className="font-display text-2xl font-bold tabular-nums text-white md:text-4xl">
            {value}
          </span>
          <span className="mt-1 text-[9px] uppercase tracking-[0.24em] text-white/60 sm:text-xs sm:tracking-[0.28em]">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

function LiveMatchPills({ liveMatches }) {
  const { t } = useAppLocale();
  if (liveMatches.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {liveMatches.map((m) => {
        const { home, away } = getMatchLabel(m, t);
        const sh = m.score?.home ?? 0;
        const sa = m.score?.away ?? 0;
        return (
          <span
            key={m.id}
            className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold text-white"
          >
            {home} {sh}–{sa} {away}
          </span>
        );
      })}
    </div>
  );
}

// ─── Main SmartBanner ─────────────────────────────────────────────────────────

export default function SmartBanner({ enrichedMatches = [], champion = null, nowOverride = null }) {
  const { language, timeZone, t } = useAppLocale();
  const [now, setNow] = useState(() => (nowOverride ? new Date(nowOverride) : new Date()));
  const [countdown, setCountdown] = useState(() =>
    getCountdownTo(TOURNAMENT_START, nowOverride ? new Date(nowOverride) : new Date()),
  );
  const [showKickoffBurst, setShowKickoffBurst] = useState(false);

  useEffect(() => {
    setNow(nowOverride ? new Date(nowOverride) : new Date());
    setCountdown(getCountdownTo(TOURNAMENT_START, nowOverride ? new Date(nowOverride) : new Date()));

    const id = setInterval(() => {
      setNow((current) => {
        const next = nowOverride ? new Date(current.getTime() + 1000) : new Date();
        setCountdown(getCountdownTo(TOURNAMENT_START, next));
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [nowOverride]);

  useEffect(() => {
    const crossedKickoff =
      now.getTime() >= TOURNAMENT_START.getTime() &&
      now.getTime() < TOURNAMENT_START.getTime() + 12_000;

    setShowKickoffBurst(crossedKickoff);
  }, [now]);

  const phase = getPhase(enrichedMatches, now, timeZone);
  const todayKey = getDayKey(now, timeZone);

  const liveMatches = enrichedMatches.filter(
    (m) => m.status === "LIVE" || m.status === "HT" || m.status === "1H" || m.status === "2H"
  );

  const todayScheduled = enrichedMatches
    .filter((m) => m.kickoffUtc && getDayKey(new Date(m.kickoffUtc), timeZone) === todayKey && m.status === "SCHEDULED")
    .sort((a, b) => new Date(a.kickoffUtc) - new Date(b.kickoffUtc));

  const nextMatch = enrichedMatches
    .filter((m) => m.status === "SCHEDULED" && m.kickoffUtc && new Date(m.kickoffUtc) > now)
    .sort((a, b) => new Date(a.kickoffUtc) - new Date(b.kickoffUtc))[0];

  const nextTodaySummary = useMemo(() => {
    const next = todayScheduled[0];
    if (!next) return null;
    const { home, away } = getMatchLabel(next, t);
    return {
      time: formatMatchTime(next.kickoffUtc, timeZone, language),
      label: `${home} vs ${away}`,
    };
  }, [todayScheduled, t, timeZone, language]);

  const nextMatchSummary = useMemo(() => {
    if (!nextMatch) return null;
    const { home, away } = getMatchLabel(nextMatch, t);
    return {
      date: formatMatchDate(nextMatch.dateIso, language),
      time: formatMatchTime(nextMatch.kickoffUtc, timeZone, language),
      label: `${home} vs ${away}`,
    };
  }, [nextMatch, t, language, timeZone]);

  // ── PHASE: PRE ─────────────────────────────────────────────────────────────
  if (phase === "PRE") {
    return (
      <div className="sticky top-[68px] z-30 -mx-4 mt-4 border-y border-emerald-300/20 bg-[#16a34a] text-white shadow-[0_16px_35px_rgba(22,163,74,0.28)] backdrop-blur-md sm:-mx-6 lg:-mx-6">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <p className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/75">
            {t("countdown_label")}
          </p>
          {countdown.over ? (
            <p className="font-display text-xl font-bold text-white sm:text-2xl">{t("smartBanner_worldCupStarted")}</p>
          ) : (
            <CountdownUnits countdown={countdown} showDays />
          )}
        </div>
      </div>
    );
  }

  // ── PHASE: OPENING_DAY ──────────────────────────────────────────────────────
  if (phase === "OPENING_DAY") {
    return (
      <div className="sticky top-[68px] z-30 -mx-4 mt-4 border-y border-emerald-300/20 text-white shadow-[0_16px_35px_rgba(22,163,74,0.28)] backdrop-blur-md sm:-mx-6 lg:-mx-6">
        <div
          className="relative overflow-hidden"
          style={{ background: "#16a34a" }}
        >
          {/* Pulsing brightness overlay — on the background, not the text */}
          <div className="animate-pulse absolute inset-0 bg-white/5 pointer-events-none" />
          <div className="relative mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <p className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/75">
              {t("smartBanner_todayStarts")}
            </p>
            <CountdownUnits countdown={countdown} showDays={false} />
          </div>
        </div>
      </div>
    );
  }

  // ── PHASE: LIVE ─────────────────────────────────────────────────────────────
  if (phase === "LIVE") {
    return (
      <div className="sticky top-[68px] z-30 -mx-4 mt-4 border-y border-red-500/40 bg-[#dc2626] text-white shadow-[0_16px_35px_rgba(220,38,38,0.35)] backdrop-blur-md sm:-mx-6 lg:-mx-6">
        <div className="relative overflow-hidden">
          {showKickoffBurst ? (
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="kickoff-fifa-glow" />
              <div className="kickoff-fifa-sheen" />
              {[...Array(10)].map((_, index) => (
                <span
                  key={index}
                  className="kickoff-fifa-spark"
                  style={{
                    left: `${8 + index * 8.5}%`,
                    animationDelay: `${index * 90}ms`,
                    animationDuration: `${1150 + (index % 3) * 160}ms`,
                  }}
                />
              ))}
              {[...Array(4)].map((_, index) => (
                <span
                  key={`beam-${index}`}
                  className="kickoff-fifa-beam"
                  style={{
                    left: `${18 + index * 18}%`,
                    animationDelay: `${220 + index * 120}ms`,
                  }}
                />
              ))}
            </div>
          ) : null}
          <div className="animate-pulse absolute inset-0 bg-white/5 pointer-events-none" />
          <div className="relative mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-2 shrink-0">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
              </span>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/90">
                {t("smartBanner_liveNow")} · {liveMatches.length}
              </p>
            </div>
            <LiveMatchPills liveMatches={liveMatches} />
          </div>
        </div>
      </div>
    );
  }

  // ── PHASE: TODAY (matches today but none live right now) ───────────────────
  if (phase === "TODAY") {
    return (
      <div className="sticky top-[68px] z-30 -mx-4 mt-4 border-y border-blue-700/30 bg-[#1e3a5f] text-white shadow-[0_16px_35px_rgba(30,58,95,0.4)] backdrop-blur-md sm:-mx-6 lg:-mx-6">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <p className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/75">
            {t("smartBanner_todayPlays")}
          </p>
          {nextTodaySummary ? (
            <p className="text-[11px] font-semibold text-white/90">
              {t("smartBanner_nextPrefix")}:{" "}
              <span className="text-white font-bold">
                {nextTodaySummary.time} · {nextTodaySummary.label}
              </span>
            </p>
          ) : (
            <p className="text-[11px] text-white/60">{t("smartBanner_allDoneToday")}</p>
          )}
        </div>
      </div>
    );
  }

  // ── PHASE: BETWEEN_DAYS ─────────────────────────────────────────────────────
  if (phase === "BETWEEN_DAYS") {
    return (
      <div className="sticky top-[68px] z-30 -mx-4 mt-4 border-y border-white/10 bg-gray-800 text-white shadow-[0_16px_35px_rgba(0,0,0,0.3)] backdrop-blur-md sm:-mx-6 lg:-mx-6">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <p className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/75">
            {t("smartBanner_nextMatch")}
          </p>
          {nextMatchSummary ? (
            <p className="text-[11px] font-semibold text-white/90">
              <span className="text-white font-bold">
                {nextMatchSummary.date} · {nextMatchSummary.time} · {nextMatchSummary.label}
              </span>
            </p>
          ) : (
            <p className="text-[11px] text-white/50">{t("smartBanner_noScheduled")}</p>
          )}
        </div>
      </div>
    );
  }

  // ── PHASE: FINISHED (post-tournament) ────────────────────────────────────────
  if (!champion?.name) {
    return null;
  }

  return (
    <div className="sticky top-[68px] z-30 -mx-4 mt-4 border-y border-yellow-300/30 bg-yellow-600 text-white shadow-[0_16px_35px_rgba(202,138,4,0.28)] backdrop-blur-md sm:-mx-6 lg:-mx-6">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <p className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/80">
          {t("smartBanner_worldChampion")}
        </p>
        <p className="text-sm font-bold text-white">
          {champion.flag ? `${champion.flag} ` : ""}
          {champion.name}
        </p>
      </div>
    </div>
  );
}
