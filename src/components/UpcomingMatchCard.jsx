import { ArrowRightLeft, Clock, Goal, SquareStack, Tv } from "lucide-react";
import { useEffect, useState } from "react";
import {
  canReopenPrediction,
  getLockDeadline,
  getPredictionPhase,
  hasPredictionScore,
  isPredictionEditable,
} from "../utils/predictions";
import { getGroupLabel, useAppLocale } from "../context/AppLocaleContext";
import { useMatchStatus } from "../hooks/useMatchStatus";
import { useLocalizedMatch } from "../hooks/useLocalizedMatch";


function TeamCell({ team, teamName, align = "left", dim = false, onSelect }) {
  const { t } = useAppLocale();
  const rightAligned = align === "right";

  return (
    <button
      type="button"
      onClick={() => onSelect?.(team)}
      className={`flex min-w-0 items-center gap-2 rounded-2xl px-1 py-2 transition hover:bg-white/5 ${
        rightAligned ? "justify-end text-right" : "text-left"
      }`}
    >
      {!rightAligned && (
        <img
          src={team.flag}
          alt={t("ui.label.flagOf", { team: teamName })}
          className="h-6 w-6 rounded-full object-cover"
        />
      )}
      <div className="min-w-0">
        <p className={`truncate text-sm font-semibold sm:text-base ${dim ? "text-gray-500" : "text-white"}`}>
          {teamName}
        </p>
      </div>
      {rightAligned && (
        <img
          src={team.flag}
          alt={t("ui.label.flagOf", { team: teamName })}
          className="h-6 w-6 rounded-full object-cover"
        />
      )}
    </button>
  );
}

function ScoreInput({ value, onChange, onBlur, label, disabled = false }) {
  return (
    <label className="flex flex-col items-center gap-1">
      <span className="text-[10px] uppercase tracking-[0.22em] text-slate-500">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        min="0"
        max="99"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        className="h-11 w-11 rounded-2xl border border-white/10 bg-white/5 text-center font-display text-lg font-bold text-white transition placeholder:text-slate-600 disabled:cursor-not-allowed disabled:opacity-45 focus:border-emerald-400 focus:bg-slate-900/90 focus:ring-2 focus:ring-emerald-500/35 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        placeholder="0"
      />
    </label>
  );
}

function ChannelPill({ channel }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-200">
      {channel}
    </span>
  );
}

// ─── Badge components ─────────────────────────────────────────────────────────

function LiveBadge() {
  const { t } = useAppLocale();
  return (
    <div className="flex items-center gap-1.5 bg-red-600 rounded-full px-2.5 py-1 text-white text-[11px] font-bold uppercase tracking-widest">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
      </span>
      {t("match_live")}
    </div>
  );
}

function HalfTimeBadge() {
  const { t } = useAppLocale();
  return (
    <div className="bg-yellow-600/90 rounded-full px-2.5 py-1 text-white text-[11px] font-bold uppercase tracking-widest">
      {t("match_halftime")}
    </div>
  );
}

function FinishedBadge() {
  const { t } = useAppLocale();
  return (
    <div className="bg-white/10 rounded-full px-2.5 py-1 text-gray-400 text-[11px] font-medium uppercase tracking-widest">
      {t("match_finished")}
    </div>
  );
}

function DateBadge({ match, language, timeZone }) {
  if (!match.dateIso) return null;
  const [y, m, d] = match.dateIso.split("-").map(Number);
  const dateLabel = new Date(y, m - 1, d).toLocaleDateString(language, {
    day: "numeric",
    month: "short",
  });
  let timeLabel = "";
  if (match.kickoffUtc) {
    try {
      timeLabel = new Date(match.kickoffUtc).toLocaleTimeString(language, {
        hour: "2-digit",
        minute: "2-digit",
        timeZone,
      });
    } catch {}
  }
  return (
    <div className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-white/70">
      {`${dateLabel}${timeLabel ? ` · ${timeLabel}` : ""}`.toUpperCase()}
    </div>
  );
}

// ─── Live score display ───────────────────────────────────────────────────────

function LiveScore({ score, status, minute }) {
  const { t } = useAppLocale();
  const homeWinning = score.home > score.away;
  const awayWinning = score.away > score.home;
  const isHT = status === "HT";

  return (
    <div className="px-2 text-center">
      <div className="flex items-center justify-center gap-4">
        <span
          className={`text-5xl font-black tabular-nums font-display ${
            homeWinning ? "text-green-400" : awayWinning ? "text-red-400" : "text-white"
          }`}
        >
          {score.home}
        </span>
        <span className="text-gray-500 text-2xl font-light">—</span>
        <span
          className={`text-5xl font-black tabular-nums font-display ${
            awayWinning ? "text-green-400" : homeWinning ? "text-red-400" : "text-white"
          }`}
        >
          {score.away}
        </span>
      </div>
      <div className="flex items-center justify-center gap-1 mt-1">
        {!isHT && (
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        )}
        <span className={`text-xs font-bold tabular-nums ${isHT ? "text-yellow-400" : "text-red-400"}`}>
          {isHT ? t("match_halftime") : `${minute ?? "?"}'`}
        </span>
      </div>
    </div>
  );
}

function FinishedScore({ score }) {
  const homeWon = score.home > score.away;
  const awayWon = score.away > score.home;
  return (
    <div className="px-2 text-center">
      <div className="flex items-center justify-center gap-4">
        <span
          className={`text-4xl font-black tabular-nums font-display ${
            homeWon ? "text-white" : awayWon ? "text-gray-500" : "text-gray-300"
          }`}
        >
          {score.home}
        </span>
        <span className="text-gray-600 text-xl font-light">—</span>
        <span
          className={`text-4xl font-black tabular-nums font-display ${
            awayWon ? "text-white" : homeWon ? "text-gray-500" : "text-gray-300"
          }`}
        >
          {score.away}
        </span>
      </div>
    </div>
  );
}

// ─── Pre-match countdown badges ───────────────────────────────────────────────

function ProximoBadge() {
  const { t } = useAppLocale();
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-orange-400/30 bg-orange-500/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest text-orange-300">
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-400" />
      </span>
      {t("smartBanner_nextPrefix")}
    </div>
  );
}

function LiveSoonBadge() {
  const { t } = useAppLocale();
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest text-emerald-300">
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
      </span>
      {t("match_live")}
    </div>
  );
}

// ─── Scheduled center display ─────────────────────────────────────────────────

function ScheduledCenter({ displayTime, remaining, isNearKickoff, isPastKickoffLocally }) {
  if (isPastKickoffLocally) {
    return (
      <div className="px-2 text-center">
        <div className="flex items-center justify-center gap-3">
          <span className="font-display text-3xl font-black text-white">0</span>
          <span className="font-light text-slate-500">—</span>
          <span className="font-display text-3xl font-black text-white">0</span>
        </div>
      </div>
    );
  }

  if (isNearKickoff) {
    const mm = String(Math.floor(remaining / 60000)).padStart(2, "0");
    const ss = String(Math.floor((remaining % 60000) / 1000)).padStart(2, "0");
    return (
      <div className="px-2 text-center">
        <div className="flex items-center justify-center gap-1.5">
          <Clock size={14} className="shrink-0 animate-pulse text-orange-300" />
          <p className="font-display text-2xl font-black tabular-nums text-orange-300">
            {mm}:{ss}
          </p>
        </div>
        <p className="mt-0.5 text-[9px] uppercase tracking-[0.16em] text-slate-500">
          Comienza en
        </p>
      </div>
    );
  }

  return (
    <div className="px-2 text-center">
      <p className="font-display text-3xl font-black text-white">{displayTime}</p>
    </div>
  );
}

// ─── Pick display for live / finished ─────────────────────────────────────────

function getPickResult(prediction, score) {
  if (!prediction || prediction.home === "" || prediction.away === "") return null;
  const ph = Number(prediction.home);
  const pa = Number(prediction.away);
  const { home: ah, away: aa } = score;

  if (ph === ah && pa === aa) return "correct";
  const predDir = ph > pa ? "H" : pa > ph ? "A" : "D";
  const actDir = ah > aa ? "H" : aa > ah ? "A" : "D";
  if (predDir === actDir) return "partial";
  return "wrong";
}

function LivePickDisplay({ prediction, score }) {
  const { t } = useAppLocale();
  if (!prediction || (prediction.home === "" && prediction.away === "")) return null;
  const actDir = score.home > score.away ? "H" : score.away > score.home ? "A" : "D";
  const predDir =
    prediction.home === "" || prediction.away === ""
      ? null
      : Number(prediction.home) > Number(prediction.away)
      ? "H"
      : Number(prediction.away) > Number(prediction.home)
      ? "A"
      : "D";
  const isCorrectDir = predDir !== null && predDir === actDir;

  return (
    <div className="bg-white/5 rounded-lg px-4 py-3 mt-3">
      <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">{t("match_yourPrediction")}</p>
      <p className="text-white text-lg font-bold">
        {prediction.home || "?"} — {prediction.away || "?"}
      </p>
      <p className={`text-xs mt-1 ${isCorrectDir ? "text-green-400" : "text-gray-500"}`}>
        {isCorrectDir ? t("match_tracking") : t("match_waitFinal")}
      </p>
    </div>
  );
}

function FinishedPickDisplay({ prediction, score }) {
  const { t } = useAppLocale();
  if (!prediction || (prediction.home === "" && prediction.away === "")) return null;
  const result = getPickResult(prediction, score);

  const containerClass =
    result === "correct"
      ? "bg-green-900/30 border border-green-700/40"
      : result === "partial"
      ? "bg-yellow-900/20 border border-yellow-600/30"
      : "bg-red-900/20 border border-red-700/30";

  return (
    <div className={`rounded-lg px-4 py-3 mt-3 ${containerClass}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wide">{t("match_yourPrediction")}</p>
          <p className="text-white text-sm font-bold">
            {prediction.home} — {prediction.away}
          </p>
        </div>
        <div className="text-right">
          {result === "correct" && (
            <span className="text-green-400 text-sm font-bold">{t("match_pointsCorrect")}</span>
          )}
          {result === "partial" && (
            <span className="text-yellow-400 text-sm font-bold">{t("match_pointsPartial")}</span>
          )}
          {result === "wrong" && (
            <span className="text-red-400 text-sm font-bold">{t("match_pointsWrong")}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function getEventTone(type) {
  if (type === "goal") {
    return {
      icon: Goal,
      labelKey: "match_goal",
      iconClass: "text-emerald-300",
      badgeClass: "bg-emerald-500/12 text-emerald-200 border border-emerald-400/20",
    };
  }

  if (type === "yellow-card") {
    return {
      icon: SquareStack,
      labelKey: "match_yellowCard",
      iconClass: "text-yellow-300",
      badgeClass: "bg-yellow-500/12 text-yellow-100 border border-yellow-400/20",
    };
  }

  if (type === "red-card") {
    return {
      icon: SquareStack,
      labelKey: "match_redCard",
      iconClass: "text-red-300",
      badgeClass: "bg-red-500/12 text-red-100 border border-red-400/20",
    };
  }

  return {
    icon: ArrowRightLeft,
    labelKey: "match_substitution",
    iconClass: "text-sky-300",
    badgeClass: "bg-sky-500/12 text-sky-100 border border-sky-400/20",
  };
}

function LiveIncidentTimeline({ events = [], homeTeamName, awayTeamName }) {
  const { t } = useAppLocale();

  return (
    <div className="mt-4 rounded-2xl border border-white/8 bg-black/20 px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
          {t("match_incidents")}
        </p>
        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-600">
          {t("match_liveCenter")}
        </p>
      </div>

      {events.length > 0 ? (
        <div className="mt-3 space-y-2">
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
                      {t(tone.labelKey)}
                      {event.detail ? ` · ${event.detail}` : ""}
                    </p>
                    {event.assist ? (
                      <p className="mt-1 text-[11px] text-slate-400">
                        {t("match_assist")}: <span className="text-slate-200">{event.assist}</span>
                      </p>
                    ) : null}
                    {event.playerOut ? (
                      <p className="mt-1 text-[11px] text-slate-400">
                        {t("match_playerOut", { player: event.playerOut })}
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500">{t("match_noIncidents")}</p>
      )}
    </div>
  );
}

// ─── Community predictions bar ────────────────────────────────────────────────

function CommunityBar({ stats, homeTeamName, awayTeamName }) {
  const { t } = useAppLocale();
  if (!stats || stats.total < 1) return null;

  const { home, draw, away, total } = stats;

  // ensure segments are visible even when a % is very small
  const homeW = Math.max(home, home > 0 ? 8 : 0);
  const drawW = Math.max(draw, draw > 0 ? 8 : 0);
  const awayW = Math.max(away, away > 0 ? 8 : 0);
  const sum = homeW + drawW + awayW;

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] px-3 py-3">
      {/* Header */}
      <div className="mb-2.5 flex items-center justify-between">
        <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-slate-500">
          {t("community_title")}
        </p>
        <p className="text-[9px] tabular-nums text-slate-600">
          {total} {t("community_votes")}
        </p>
      </div>

      {/* Segmented bar */}
      <div className="flex h-8 w-full overflow-hidden rounded-xl gap-px">
        {home > 0 && (
          <div
            className="relative flex items-center justify-center bg-emerald-500/75 transition-all"
            style={{ width: `${(homeW / sum) * 100}%` }}
          >
            {home >= 10 && (
              <span className="text-[11px] font-extrabold text-white drop-shadow-sm">{home}%</span>
            )}
          </div>
        )}
        {draw > 0 && (
          <div
            className="relative flex items-center justify-center bg-amber-500/65 transition-all"
            style={{ width: `${(drawW / sum) * 100}%` }}
          >
            {draw >= 10 && (
              <span className="text-[11px] font-extrabold text-white drop-shadow-sm">{draw}%</span>
            )}
          </div>
        )}
        {away > 0 && (
          <div
            className="relative flex items-center justify-center bg-rose-500/75 transition-all"
            style={{ width: `${(awayW / sum) * 100}%` }}
          >
            {away >= 10 && (
              <span className="text-[11px] font-extrabold text-white drop-shadow-sm">{away}%</span>
            )}
          </div>
        )}
      </div>

      {/* Labels row */}
      <div className="mt-2 flex items-center justify-between gap-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="h-2 w-2 shrink-0 rounded-sm bg-emerald-500/75" />
          <span className="text-[10px] font-bold tabular-nums text-emerald-300">{home}%</span>
          <span className="truncate text-[9px] text-slate-500">{homeTeamName}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="h-2 w-2 shrink-0 rounded-sm bg-amber-500/65" />
          <span className="text-[10px] font-bold tabular-nums text-amber-300">{draw}%</span>
          <span className="text-[9px] text-slate-500">{t("community_draw")}</span>
        </div>
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="text-[9px] text-slate-500">{awayTeamName}</span>
          <span className="text-[10px] font-bold tabular-nums text-rose-300">{away}%</span>
          <span className="h-2 w-2 shrink-0 rounded-sm bg-rose-500/75" />
        </div>
      </div>
    </div>
  );
}

function LiveStats({ stats }) {
  const { t } = useAppLocale();
  if (!stats) return null;

  const items = [
    { key: "possession", label: t("match_possession"), value: `${stats.possession?.home ?? 0}% · ${stats.possession?.away ?? 0}%` },
    { key: "shotsOnTarget", label: t("match_shotsOnTarget"), value: `${stats.shotsOnTarget?.home ?? 0} · ${stats.shotsOnTarget?.away ?? 0}` },
    { key: "corners", label: t("match_corners"), value: `${stats.corners?.home ?? 0} · ${stats.corners?.away ?? 0}` },
  ];

  return (
    <div className="mt-4 grid gap-2 sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.key} className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
          <p className="mt-2 text-sm font-bold text-white">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function LineupColumn({ teamName, lineup }) {
  const { t } = useAppLocale();
  if (!lineup) return null;

  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-white">{teamName}</p>
        <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
          {t("match_formation")} · {lineup.formation ?? "-"}
        </span>
      </div>
      <div className="mt-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">{t("match_startingXI")}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {(lineup.starters ?? []).map((player) => (
            <span
              key={`${teamName}-starter-${player}`}
              className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-xs text-slate-200"
            >
              {player}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">{t("match_bench")}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {(lineup.bench ?? []).map((player) => (
            <span
              key={`${teamName}-bench-${player}`}
              className="rounded-full border border-white/8 bg-white/[0.02] px-2.5 py-1 text-xs text-slate-400"
            >
              {player}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function LiveLineups({ lineups, homeTeamName, awayTeamName }) {
  const { t } = useAppLocale();
  return (
    <div className="mt-4 rounded-2xl border border-white/8 bg-black/20 px-4 py-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">{t("match_lineups")}</p>
      {lineups?.home || lineups?.away ? (
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <LineupColumn teamName={homeTeamName} lineup={lineups?.home} />
          <LineupColumn teamName={awayTeamName} lineup={lineups?.away} />
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500">{t("match_lineupsPending")}</p>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

function UpcomingMatchCard({
  match,
  prediction,
  saveState,
  selectedCountryCode,
  communityStats = null,
  liveData = null,
  onPredictionChange,
  onSaveDraft,
  onReopenPrediction,
  onSubmitPrediction,
  onTeamSelect,
}) {
  const { language, timeZone, t } = useAppLocale();
  const {
    homeTeamName,
    awayTeamName,
    displayTime,
    tzLabel,
    kickoffDate,
    localBroadcasters,
    audienceRegionName,
  } = useLocalizedMatch(match, selectedCountryCode);

  const THRESHOLD = 30 * 60 * 1000;
  const kickoffMs = kickoffDate?.getTime() ?? Infinity;
  const [remaining, setRemaining] = useState(() => kickoffMs - Date.now());
  const withinThreshold = remaining <= THRESHOLD;

  useEffect(() => {
    if (kickoffMs === Infinity) return;
    if (!withinThreshold) {
      const msToThreshold = kickoffMs - Date.now() - THRESHOLD;
      if (msToThreshold <= 0) return;
      const tid = setTimeout(() => setRemaining(kickoffMs - Date.now()), msToThreshold);
      return () => clearTimeout(tid);
    }
    const id = setInterval(() => setRemaining(kickoffMs - Date.now()), 1000);
    return () => clearInterval(id);
  }, [kickoffMs, withinThreshold]);

  const isNearKickoff = remaining > 0 && withinThreshold;
  const isPastKickoffLocally = remaining <= 0;

  const phase = getPredictionPhase(match, prediction);
  const editable = isPredictionEditable(match, prediction);
  const canReopen = canReopenPrediction(match, prediction);
  const lockDeadline = getLockDeadline(match);
  const scheduledAccentClass =
    phase === "submitted"
      ? "ring-2 ring-emerald-400/45 bg-emerald-950/15"
      : phase === "locked"
        ? "ring-2 ring-red-400/35 bg-red-950/12"
        : hasPredictionScore(prediction)
          ? "ring-2 ring-gold-300/35 bg-gold-300/10"
          : "";

  if (!match.homeTeam || !match.awayTeam) return null;

  const { matchData: resolvedLiveData } = useMatchStatus(match.apiSportsFixtureId ?? null, liveData);
  const status = resolvedLiveData?.status ?? liveData?.status ?? "SCHEDULED";
  const isLive = status === "LIVE" || status === "1H" || status === "2H";
  const isHT = status === "HT";
  const isFinished = status === "FINISHED" || status === "FT" || status === "AET";
  const isActive = isLive || isHT;
  const score = resolvedLiveData?.score ?? liveData?.score ?? null;
  const events = resolvedLiveData?.events ?? liveData?.events ?? [];
  const stats = resolvedLiveData?.stats ?? liveData?.stats ?? null;
  const lineups = resolvedLiveData?.lineups ?? liveData?.lineups ?? null;

  const homeWon = isFinished && score && score.home > score.away;
  const awayWon = isFinished && score && score.away > score.home;

  // ── FINISHED state ──────────────────────────────────────────────────────────
  if (isFinished && score) {
    return (
      <article className="panel overflow-hidden px-4 py-4 sm:px-5 opacity-80 bg-gray-950/60">
        <div className="flex items-center justify-between mb-3">
          <FinishedBadge />
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-3">
          <TeamCell
            team={match.homeTeam}
            teamName={homeTeamName}
            onSelect={onTeamSelect}
            dim={awayWon}
          />
          <FinishedScore score={score} />
          <TeamCell
            team={match.awayTeam}
            teamName={awayTeamName}
            align="right"
            onSelect={onTeamSelect}
            dim={homeWon}
          />
        </div>

        <div className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">
          {t("tournament.stage.group")} · {getGroupLabel(match.groupId, t)} · {match.stadium}
        </div>

        {prediction && (prediction.home !== "" || prediction.away !== "") && (
          <FinishedPickDisplay prediction={prediction} score={score} />
        )}
      </article>
    );
  }

  // ── LIVE / HT state ─────────────────────────────────────────────────────────
  if (isActive && score) {
    const accentClass = isHT
      ? "ring-2 ring-yellow-500/50 bg-yellow-950/15"
      : "ring-2 ring-red-500/50 bg-red-950/20";
    const accentShadow = isHT
      ? "0 0 12px rgba(234,179,8,0.28)"
      : "0 0 12px rgba(239,68,68,0.3)";

    return (
      <article
        className={`panel overflow-hidden px-4 py-4 sm:px-5 ${accentClass}`}
        style={{ boxShadow: accentShadow }}
      >
        <div className="flex items-center justify-between mb-3">
          {isHT ? <HalfTimeBadge /> : <LiveBadge />}
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-3">
          <TeamCell team={match.homeTeam} teamName={homeTeamName} onSelect={onTeamSelect} />
          <LiveScore score={score} status={status} minute={resolvedLiveData?.minute ?? liveData?.minute} />
          <TeamCell team={match.awayTeam} teamName={awayTeamName} align="right" onSelect={onTeamSelect} />
        </div>

        <div className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">
          {t("tournament.stage.group")} · {getGroupLabel(match.groupId, t)} · {match.stadium}
        </div>

        <LiveStats stats={stats} />
        <LiveIncidentTimeline events={events} homeTeamName={homeTeamName} awayTeamName={awayTeamName} />
        <LiveLineups lineups={lineups} homeTeamName={homeTeamName} awayTeamName={awayTeamName} />

        {prediction && (prediction.home !== "" || prediction.away !== "") && (
          <LivePickDisplay prediction={prediction} score={score} />
        )}
      </article>
    );
  }

  // ── SCHEDULED state (default) ───────────────────────────────────────────────
  return (
    <article className={`panel overflow-hidden px-4 py-4 sm:px-5 ${scheduledAccentClass}`}>
      <div className="mb-1 flex min-h-[28px] items-center justify-between gap-3">
        <span
          className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
            phase === "submitted"
              ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
              : phase === "locked"
                ? "border-red-400/20 bg-red-500/10 text-red-200"
                : hasPredictionScore(prediction)
                  ? "border-gold-300/20 bg-gold-300/10 text-gold-300"
                  : "border-white/10 bg-white/5 text-slate-300"
          }`}
        >
          {phase === "submitted"
            ? t("pick_status_submitted")
            : phase === "locked"
              ? t("pick_status_locked")
              : hasPredictionScore(prediction)
                ? t("pick_status_draft")
                : t("ui.button.saveDraft")}
        </span>

        <div>
          {isNearKickoff ? (
            <ProximoBadge />
          ) : isPastKickoffLocally ? (
            <LiveSoonBadge />
          ) : (
            <DateBadge match={match} language={language} timeZone={timeZone} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-3">
        <TeamCell
          team={match.homeTeam}
          teamName={homeTeamName}
          onSelect={onTeamSelect}
          emphasize={phase !== "locked"}
        />
        <ScheduledCenter
          displayTime={displayTime}
          remaining={remaining}
          isNearKickoff={isNearKickoff}
          isPastKickoffLocally={isPastKickoffLocally}
        />
        <TeamCell
          team={match.awayTeam}
          teamName={awayTeamName}
          align="right"
          onSelect={onTeamSelect}
          emphasize={phase !== "locked"}
        />
      </div>

      <div className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">
        {t("tournament.stage.group")} · {getGroupLabel(match.groupId, t)} · {match.stadium}, {match.venue}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          <Tv size={14} className="text-emerald-300" />
          {t("ui.watch.label")}
        </span>
        {localBroadcasters.map((channel) => (
          <ChannelPill key={`${match.id}-${channel}`} channel={channel} />
        ))}
        <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">{audienceRegionName}</span>
      </div>

      <CommunityBar
        stats={communityStats}
        homeTeamName={homeTeamName}
        awayTeamName={awayTeamName}
      />

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-t border-white/5 pt-4">
        <div className="flex items-center gap-2">
          <ScoreInput
            label={t("ui.label.home")}
            value={prediction.home}
            disabled={!editable}
            onChange={(e) => onPredictionChange(match.id, "home", e.target.value)}
            onBlur={() => { if (prediction.home === "") onPredictionChange(match.id, "home", "0"); }}
          />
          <span className="pb-1 font-display text-xl font-black text-emerald-300/70">-</span>
          <ScoreInput
            label={t("ui.label.away")}
            value={prediction.away}
            disabled={!editable}
            onChange={(e) => onPredictionChange(match.id, "away", e.target.value)}
            onBlur={() => { if (prediction.away === "") onPredictionChange(match.id, "away", "0"); }}
          />
        </div>

        <div className="text-right">
          <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">{t("ui.label.close")}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
            {lockDeadline.toLocaleDateString(language, { day: "2-digit", month: "short", timeZone })} ·{" "}
            {lockDeadline.toLocaleTimeString(language, { hour: "2-digit", minute: "2-digit", timeZone })} · {tzLabel}
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-slate-500">
            {phase === "submitted"
              ? t("ui.status.submittedLocked")
              : phase === "locked"
              ? t("ui.status.draftClosed")
              : saveState === "saving"
              ? t("ui.status.saving")
              : saveState === "saved"
              ? t("ui.status.readyToSend")
              : t("pick_status_draft")}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => onSaveDraft(match.id)}
          disabled={!editable}
          className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {t("ui.button.saveDraft")}
        </button>
        <button
          onClick={() => (canReopen ? onReopenPrediction(match.id) : onSubmitPrediction(match.id))}
          disabled={!editable && !canReopen}
          className="flex-1 rounded-full border border-emerald-400/25 bg-emerald-500 px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {phase === "submitted" ? t("ui.button.reopen") : t("ui.button.send")}
        </button>
      </div>
    </article>
  );
}

export default UpcomingMatchCard;
