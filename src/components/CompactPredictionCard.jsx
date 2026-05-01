import { canReopenPrediction, getPredictionPhase, isPredictionEditable } from "../utils/predictions";
import { getGroupLabel, useAppLocale } from "../context/AppLocaleContext";
import { useLocalizedMatch } from "../hooks/useLocalizedMatch";

function MiniScoreInput({ value, onChange, label, disabled = false }) {
  return (
    <label className="flex flex-col items-center gap-0.5">
      <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</span>
      <input
        type="text"
        inputMode="numeric"
        maxLength={2}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="h-8 w-8 rounded-lg border border-white/10 bg-white/5 text-center font-display text-sm font-bold text-white transition-all duration-300 placeholder:text-slate-600 disabled:cursor-not-allowed disabled:opacity-45 focus:border-emerald-400 focus:bg-slate-900/90 focus:ring-2 focus:ring-emerald-500/35 sm:h-9 sm:w-9"
        placeholder="0"
      />
    </label>
  );
}

function TeamLabel({ team, teamName, side = "start", onSelect }) {
  const { t } = useAppLocale();
  const isRight = side === "end";

  return (
    <button
      type="button"
      onClick={() => onSelect?.(team)}
      className={`group flex items-center gap-1.5 rounded-xl px-1 py-1 transition hover:bg-white/5 ${isRight ? "justify-end" : ""}`}
    >
      {!isRight && (
        <img
          src={team.flag}
          alt={t("ui.label.flagOf", { team: teamName })}
          className="h-7 w-7 rounded-full border border-white/10 object-cover transition group-hover:border-emerald-400/40"
        />
      )}
      <div className={isRight ? "text-right" : "text-start"}>
        <p className="text-[13px] font-semibold leading-[1.1] text-white transition group-hover:text-emerald-300">{teamName}</p>
        <p className="text-[8px] uppercase tracking-[0.12em] text-slate-500">{team.fifaCode}</p>
      </div>
      {isRight && (
        <img
          src={team.flag}
          alt={t("ui.label.flagOf", { team: teamName })}
          className="h-7 w-7 rounded-full border border-white/10 object-cover transition group-hover:border-emerald-400/40"
        />
      )}
    </button>
  );
}

function getCompactStateLabel(phase, saveState, t) {
  if (phase === "submitted") {
    return t("pick_status_submitted");
  }

  if (phase === "locked") {
    return t("pick_status_locked");
  }

  if (saveState === "saving") {
    return t("ui.status.saving");
  }

  if (saveState === "saved") {
    return t("ui.status.readyToSend");
  }

  if (saveState === "error") {
    return "Error";
  }

  if (saveState === "pending") {
    return t("ui.status.unsaved");
  }

  return t("ui.status.new");
}

function CompactPredictionCard({
  match,
  prediction,
  saveState,
  onPredictionChange,
  onSaveDraft,
  onReopenPrediction,
  onSubmitPrediction,
  onTeamSelect,
}) {
  const { t } = useAppLocale();
  const {
    homeTeamName,
    awayTeamName,
    displayDate,
    displayTime,
    tzLabel,
    localBroadcasters,
    audienceRegionName,
    watchGuideUrl,
  } = useLocalizedMatch(match);
  const phase = getPredictionPhase(match, prediction);
  const editable = isPredictionEditable(match, prediction);
  const canReopen = canReopenPrediction(match, prediction);

  if (!match.homeTeam || !match.awayTeam) {
    return null;
  }

  return (
    <article className="panel premium-card overflow-hidden p-2.5 sm:p-3">
      <div className="-mx-2.5 -mt-2.5 mb-2.5 h-1 bg-[linear-gradient(90deg,rgba(16,185,129,0.92),rgba(34,211,238,0.86),rgba(251,191,36,0.68))] sm:-mx-3 sm:-mt-3" />
      <div className="flex items-start justify-between gap-2.5">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-emerald-400">
            {getGroupLabel(match.groupId, t)}
          </p>
          <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {displayDate}
          </p>
          <p className="mt-0.5 text-[8px] uppercase tracking-[0.16em] text-emerald-300/70">
            {tzLabel}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/10 px-2.5 py-1.5 text-right">
          <p className="font-display text-lg font-black leading-none text-white">{displayTime}</p>
          <p className="mt-0.5 text-[8px] font-semibold uppercase tracking-[0.14em] text-emerald-300">
            {tzLabel}
          </p>
        </div>
      </div>

      <div className="mt-2.5 grid grid-cols-[1fr_auto_1fr] items-center gap-1.5 rounded-xl border border-white/10 bg-slate-800/45 p-2">
        <TeamLabel team={match.homeTeam} teamName={homeTeamName} onSelect={onTeamSelect} />

        <div className="flex items-center gap-1">
          <MiniScoreInput
            label={t("ui.label.home").slice(0, 1)}
            value={prediction.home}
            disabled={!editable}
            onChange={(event) => onPredictionChange(match.id, "home", event.target.value)}
          />
          <span className="mt-3 text-xs font-black text-emerald-400/70">-</span>
          <MiniScoreInput
            label={t("ui.label.away").slice(0, 1)}
            value={prediction.away}
            disabled={!editable}
            onChange={(event) => onPredictionChange(match.id, "away", event.target.value)}
          />
        </div>

        <TeamLabel
          team={match.awayTeam}
          teamName={awayTeamName}
          side="end"
          onSelect={onTeamSelect}
        />
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 px-0.5">
        <p className="truncate text-[9px] uppercase tracking-[0.12em] text-slate-500">{match.venue}</p>
        <p className="shrink-0 text-[8px] font-semibold uppercase tracking-[0.14em] text-emerald-300">
          {getCompactStateLabel(phase, saveState, t)}
        </p>
      </div>

      <div className="mt-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-2">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[8px] uppercase tracking-[0.12em] text-cyan-100/80">{t("ui.watch.label")}</p>
            <p className="mt-0.5 text-[10px] text-white/90">{t("ui.watch.countryDetected", { country: audienceRegionName })}</p>
          </div>
          {localBroadcasters.length > 0 ? (
            <p className="text-right text-[10px] font-semibold text-cyan-50">{localBroadcasters.join(" · ")}</p>
          ) : (
            <a
              href={watchGuideUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-cyan-200/20 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.1em] text-cyan-50 transition hover:bg-cyan-300/10"
            >
              {t("ui.watch.openGuide")}
            </a>
          )}
        </div>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-1.5">
        <button
          onClick={() => onSaveDraft(match.id)}
          disabled={!editable}
          className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white disabled:cursor-not-allowed disabled:opacity-45"
        >
          {phase === "draft" ? t("ui.button.save") : t("ui.button.saveDraft")}
        </button>
        <button
          onClick={() => (canReopen ? onReopenPrediction(match.id) : onSubmitPrediction(match.id))}
          disabled={!editable && !canReopen}
          className="rounded-full border border-red-400/30 bg-red-500 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white disabled:cursor-not-allowed disabled:opacity-45"
        >
          {phase === "submitted" ? t("ui.button.reopen") : t("ui.button.send")}
        </button>
      </div>
    </article>
  );
}

export default CompactPredictionCard;
