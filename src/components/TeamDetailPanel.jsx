import { X, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getCountryName, getGroupLabel, useAppLocale } from "../context/AppLocaleContext";

function MatchSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex animate-pulse items-center gap-3 rounded-2xl bg-white/5 px-4 py-3">
          <div className="w-14 shrink-0 space-y-1.5">
            <div className="h-2.5 w-10 rounded bg-white/10" />
            <div className="h-3 w-12 rounded bg-white/10" />
          </div>
          <div className="h-6 w-6 shrink-0 rounded-full bg-white/10" />
          <div className="h-3 flex-1 rounded bg-white/10" />
          <div className="h-2.5 w-16 shrink-0 rounded bg-white/10" />
        </div>
      ))}
    </div>
  );
}

function MatchStatusBadge({ match }) {
  const now = new Date();
  const kickoff = new Date(match.kickoffUtc);
  const diffMs = kickoff - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (match.status === "LIVE" || match.status === "1H" || match.status === "2H" || match.status === "HT") {
    return (
      <span className="shrink-0 rounded-full bg-emerald-400/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-300">
        Live
      </span>
    );
  }
  if (match.status === "FT" || match.status === "FINISHED" || match.status === "AET") {
    return (
      <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        FT
      </span>
    );
  }
  if (diffDays <= 0) {
    return (
      <span className="shrink-0 rounded-full bg-amber-400/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-amber-300">
        Today
      </span>
    );
  }
  return null;
}

function MatchRow({ match, teamCode, t, language, timeZone }) {
  const isHome = match.homeTeam?.code === teamCode;
  const opponent = isHome ? match.awayTeam : match.homeTeam;
  const opponentName = getCountryName(opponent, t);

  const kickoffDate = new Date(match.kickoffUtc);
  const displayDate = new Intl.DateTimeFormat(language, {
    day: "numeric",
    month: "short",
    timeZone,
  }).format(kickoffDate);
  const displayTime = new Intl.DateTimeFormat(language, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  }).format(kickoffDate);

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 transition hover:bg-white/8">
      <div className="w-14 shrink-0 text-start">
        <p className="text-[10px] font-medium text-slate-400">{displayDate}</p>
        <p className="mt-0.5 text-xs font-bold text-white">{displayTime}</p>
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="shrink-0 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-500">
          {isHome ? "vs" : "@"}
        </span>
        <img
          src={opponent?.flag}
          alt={opponentName}
          className="h-6 w-6 shrink-0 rounded-full border border-white/10 object-cover"
        />
        <p className="min-w-0 truncate text-sm font-semibold text-white">{opponentName}</p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <MatchStatusBadge match={match} />
        <div className="flex items-center gap-1 text-slate-500">
          <MapPin size={9} />
          <p className="text-[9px] leading-none">{match.venue}</p>
        </div>
      </div>
    </div>
  );
}

function TeamDetailPanel({ team, matches, groupId, onClose }) {
  const { t, language, timeZone } = useAppLocale();
  const [loading, setLoading] = useState(true);

  const teamName = getCountryName(team, t);

  const teamMatches = [...matches]
    .filter((m) => m.homeTeam?.code === team.code || m.awayTeam?.code === team.code)
    .sort((a, b) => new Date(a.kickoffUtc) - new Date(b.kickoffUtc));

  useEffect(() => {
    const raf = requestAnimationFrame(() => setLoading(false));
    return () => cancelAnimationFrame(raf);
  }, [team.code]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const panel = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel — bottom sheet on mobile, right drawer on md+ */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={teamName}
        className="fixed bottom-0 left-0 right-0 z-50 flex max-h-[88vh] flex-col overflow-hidden rounded-t-[28px] border-t border-white/10 bg-slate-900/95 shadow-[0_-24px_80px_rgba(0,0,0,0.6)] backdrop-blur-xl md:bottom-auto md:right-0 md:top-0 md:h-full md:max-h-full md:w-[min(26rem,100vw)] md:rounded-l-[28px] md:rounded-t-none md:border-l md:border-t-0 md:shadow-[-24px_0_80px_rgba(0,0,0,0.5)]"
      >
        {/* Drag handle (mobile only) */}
        <div className="flex justify-center pt-3 md:hidden">
          <div className="h-1 w-10 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <img
              src={team.flag}
              alt={teamName}
              className="h-11 w-11 rounded-full border border-white/15 object-cover shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
            />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-400">
                {getGroupLabel(groupId, t)}
              </p>
              <h2 className="mt-0.5 font-display text-xl font-bold text-white">{teamName}</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Scrollable match list */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            {t("my_team_matches")}
          </p>

          {loading ? (
            <MatchSkeleton />
          ) : teamMatches.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-8 text-center text-sm text-slate-400">
              {t("nav_searchNoResults")}
            </div>
          ) : (
            <div className="space-y-2">
              {teamMatches.map((match) => (
                <MatchRow
                  key={match.id}
                  match={match}
                  teamCode={team.code}
                  t={t}
                  language={language}
                  timeZone={timeZone}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );

  return createPortal(panel, document.body);
}

export default TeamDetailPanel;
