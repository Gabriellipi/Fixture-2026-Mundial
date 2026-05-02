import { CheckCircle2, ChevronDown, Clock3, Copy, FolderHeart, LockKeyhole, Share2, Target, TrendingUp, Trophy } from "lucide-react";
import { useMemo, useState } from "react";
import ScoringRulesModal from "./ScoringRulesModal";
import SectionTitle from "./SectionTitle";
import { formatDateLabel, formatMatchTime, getCountryName, getGroupLabel, useAppLocale } from "../context/AppLocaleContext";
import { formatUserTimeZoneLabel } from "../utils/dateTime";
import {
  canReopenPrediction,
  getPredictionPhase,
  hasPredictionScore,
  isPredictionEditable,
} from "../utils/predictions";

function isMatchFinished(match) {
  return match?.status === "FINISHED" || match?.status === "FT" || match?.status === "AET";
}

function getScoredResult(match, prediction) {
  if (!isMatchFinished(match) || !match?.score || !hasPredictionScore(prediction)) {
    return null;
  }

  const ph = Number(prediction.home);
  const pa = Number(prediction.away);
  const ah = Number(match.score.home ?? 0);
  const aa = Number(match.score.away ?? 0);

  if (ph === ah && pa === aa) {
    return { result: "exact", points: 3 };
  }

  const predictedSign = ph > pa ? "H" : ph < pa ? "A" : "D";
  const actualSign = ah > aa ? "H" : ah < aa ? "A" : "D";

  if (predictedSign === actualSign) {
    return { result: "partial", points: 1 };
  }

  return { result: "miss", points: 0 };
}

function ShareButton({ onClick, icon: Icon, label, tone = "default" }) {
  const toneClass =
    tone === "emerald"
      ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
      : tone === "sky"
        ? "border-sky-400/20 bg-sky-500/10 text-sky-200"
        : "border-white/10 bg-white/5 text-white";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] transition hover:brightness-110 ${toneClass}`}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}

function StatusBadge({ phase }) {
  const { t } = useAppLocale();
  const styles =
    phase === "submitted"
      ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
      : phase === "locked"
        ? "border-red-400/20 bg-red-500/10 text-red-200"
        : "border-gold-300/20 bg-gold-300/10 text-gold-300";

  const label =
    phase === "submitted" ? t("pick_status_submitted") : phase === "locked" ? t("pick_status_locked") : t("pick_status_draft");

  return (
    <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${styles}`}>
      {label}
    </span>
  );
}

function SummaryCard({ label, value, tone = "default", icon: Icon }) {
  const toneClass =
    tone === "emerald"
      ? "text-emerald-300"
      : tone === "gold"
        ? "text-gold-300"
        : tone === "red"
          ? "text-red-200"
          : "text-white";

  return (
    <div className="panel-soft px-4 py-4">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] uppercase tracking-[0.2em] text-slate-500">{label}</p>
          <p className={`mt-2 text-2xl font-extrabold ${toneClass}`}>{value}</p>
        </div>
        <div className="shrink-0 rounded-2xl bg-white/5 p-2.5 text-slate-300">
          <Icon size={17} />
        </div>
      </div>
    </div>
  );
}

function getShareCapabilities() {
  if (typeof window === "undefined") {
    return { native: false, clipboard: false };
  }

  return {
    native: typeof navigator !== "undefined" && typeof navigator.share === "function",
    clipboard: typeof navigator !== "undefined" && Boolean(navigator.clipboard?.writeText),
  };
}

function PredictionRow({ match, prediction, onReopenPrediction, onGoToPredictionCenter }) {
  const { t, language, timeZone } = useAppLocale();
  const [expanded, setExpanded] = useState(false);
  const phase = getPredictionPhase(match, prediction);
  const editable = isPredictionEditable(match, prediction);
  const reopenable = canReopenPrediction(match, prediction);
  const homeTeamName = getCountryName(match.homeTeam, t);
  const awayTeamName = getCountryName(match.awayTeam, t);
  const displayTime = formatMatchTime(match, language, timeZone);

  const statusStyles =
    phase === "submitted"
      ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
      : phase === "locked"
        ? "border-red-400/20 bg-red-500/10 text-red-200"
        : "border-gold-300/20 bg-gold-300/10 text-gold-300";

  const statusLabel =
    phase === "submitted"
      ? t("pick_status_submitted")
      : phase === "locked"
        ? t("pick_status_locked")
        : t("pick_status_draft");
  const rowTone =
    phase === "submitted"
      ? "border-emerald-400/20 bg-[linear-gradient(135deg,rgba(16,185,129,0.12),rgba(15,23,42,0.18))]"
      : phase === "locked"
        ? "border-red-400/20 bg-[linear-gradient(135deg,rgba(239,68,68,0.1),rgba(15,23,42,0.18))]"
        : "border-gold-300/20 bg-[linear-gradient(135deg,rgba(250,204,21,0.1),rgba(15,23,42,0.18))]";
  const scored = getScoredResult(match, prediction);
  const scoredTone =
    scored?.result === "exact"
      ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
      : scored?.result === "partial"
        ? "border-gold-300/20 bg-gold-300/10 text-gold-300"
        : scored?.result === "miss"
          ? "border-red-400/20 bg-red-500/10 text-red-200"
          : null;
  const scoredLabel =
    scored?.result === "exact"
      ? t("match_pointsCorrect")
      : scored?.result === "partial"
        ? t("match_pointsPartial")
        : scored?.result === "miss"
          ? t("match_pointsWrong")
          : null;

  return (
    <div className={`border-b border-white/5 last:border-b-0 ${rowTone}`}>
      {/* ── Compact row ── */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left transition hover:bg-white/[0.03]"
      >
        {/* Group pill */}
        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/10 text-[9px] font-extrabold text-slate-400">
          {match.groupId}
        </span>

        {/* Teams */}
        <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
          <img src={match.homeTeam.flag} alt="" aria-hidden="true" className="h-[18px] w-[18px] shrink-0 rounded-full border border-white/10 object-cover" />
          <span className="w-[72px] shrink-0 truncate text-[12px] font-semibold text-white">{homeTeamName}</span>
          <span className="shrink-0 text-[10px] text-slate-500">vs</span>
          <span className="w-[72px] shrink-0 truncate text-[12px] font-semibold text-white">{awayTeamName}</span>
          <img src={match.awayTeam.flag} alt="" aria-hidden="true" className="h-[18px] w-[18px] shrink-0 rounded-full border border-white/10 object-cover" />
          <span className="mx-0.5 hidden shrink-0 text-[10px] text-slate-600 sm:inline">·</span>
          <span className="hidden min-w-0 truncate text-[10px] text-slate-500 sm:inline">
            {displayTime} · {match.venue}
          </span>
        </div>

        {/* Right: status + score + chevron */}
        <div className="flex shrink-0 items-center gap-2">
          {scoredLabel ? (
            <span className={`hidden rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] lg:inline-block ${scoredTone}`}>
              {scoredLabel}
            </span>
          ) : null}
          <span className={`hidden rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] sm:inline-block ${statusStyles}`}>
            {statusLabel}
          </span>
          <div className="flex h-7 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[13px] font-black text-white">
            {prediction.home}-{prediction.away}
          </div>
          <ChevronDown
            size={14}
            className={`shrink-0 text-slate-500 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {/* ── Accordion detail ── */}
      {expanded ? (
        <div className="border-t border-white/5 bg-white/[0.025] px-3 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
                {getGroupLabel(match.groupId, t)}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <img src={match.homeTeam.flag} alt={homeTeamName} className="h-6 w-6 rounded-full border border-white/10 object-cover" />
                <span className="text-sm font-bold text-white">{homeTeamName}</span>
                <span className="text-[11px] text-slate-500">vs</span>
                <span className="text-sm font-bold text-white">{awayTeamName}</span>
                <img src={match.awayTeam.flag} alt={awayTeamName} className="h-6 w-6 rounded-full border border-white/10 object-cover" />
              </div>
              <p className="mt-1.5 text-[11px] text-slate-400">
                {formatDateLabel(match.dateIso, language, timeZone)} · {displayTime} · {match.venue}
              </p>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-emerald-300/70">
                {formatUserTimeZoneLabel(timeZone)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <StatusBadge phase={phase} />
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-center">
                <p className="text-[9px] uppercase tracking-[0.18em] text-slate-500">{t("your_pick")}</p>
                <p className="mt-1 font-display text-xl font-black text-white">
                  {prediction.home} - {prediction.away}
                </p>
              </div>
              {scoredLabel ? (
                <div className={`rounded-2xl border px-4 py-2.5 text-center ${scoredTone}`}>
                  <p className="text-[9px] uppercase tracking-[0.18em] opacity-80">{t("my_picks_accuracy")}</p>
                  <p className="mt-1 text-sm font-black">{scoredLabel}</p>
                </div>
              ) : null}
            </div>
          </div>

          {(reopenable || editable) ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {reopenable ? (
                <button
                  onClick={() => onReopenPrediction(match.id)}
                  className="rounded-full border border-red-400/20 bg-red-500 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white transition hover:bg-red-400"
                >
                  {t("my_picks_reopen")}
                </button>
              ) : null}
              {editable ? (
                <button
                  onClick={onGoToPredictionCenter}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white transition hover:border-emerald-400/30 hover:bg-white/10"
                >
                  {t("my_picks_continue")}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function MyPredictionsScreen({
  matches,
  predictions,
  onReopenPrediction,
  onGoToPredictionCenter,
}) {
  const { t, language, timeZone } = useAppLocale();
  const [statusFilter, setStatusFilter] = useState("todas");
  const [rulesOpen, setRulesOpen] = useState(false);
  const [shareState, setShareState] = useState("idle");
  const shareCapabilities = getShareCapabilities();

  const savedPredictions = useMemo(
    () =>
      matches
        .map((match) => ({
          match,
          prediction: predictions[match.id],
          phase: getPredictionPhase(match, predictions[match.id]),
        }))
        .filter(({ prediction }) => hasPredictionScore(prediction))
        .sort((firstItem, secondItem) => {
          if (firstItem.match.dateIso !== secondItem.match.dateIso) {
            return firstItem.match.dateIso.localeCompare(secondItem.match.dateIso);
          }

          return firstItem.match.time.localeCompare(secondItem.match.time);
        }),
    [matches, predictions],
  );

  const counts = useMemo(
    () => ({
      total: savedPredictions.length,
      draft: savedPredictions.filter((item) => item.phase === "draft").length,
      submitted: savedPredictions.filter((item) => item.phase === "submitted").length,
      locked: savedPredictions.filter((item) => item.phase === "locked").length,
    }),
    [savedPredictions],
  );

  const filteredPredictions = useMemo(
    () =>
      savedPredictions.filter((item) => {
        if (statusFilter === "todas") {
          return true;
        }

        return item.phase === statusFilter;
      }),
    [savedPredictions, statusFilter],
  );

  const groupedByDate = useMemo(
    () =>
      filteredPredictions.reduce((acc, item) => {
        const label = formatDateLabel(item.match.dateIso, language, timeZone);

        if (!acc[label]) {
          acc[label] = [];
        }

        acc[label].push(item);
        return acc;
      }, {}),
    [filteredPredictions, language, timeZone],
  );
  const progress = useMemo(() => {
    const totalMatches = matches.length;
    const submittedCount = savedPredictions.filter((item) => item.phase === "submitted" || item.phase === "locked").length;
    const draftCount = savedPredictions.filter((item) => item.phase === "draft").length;

    return {
      totalMatches,
      submittedCount,
      draftCount,
      percent: totalMatches > 0 ? Math.round((submittedCount / totalMatches) * 100) : 0,
    };
  }, [matches.length, savedPredictions]);
  const analytics = useMemo(() => {
    const evaluated = savedPredictions
      .map(({ match, prediction }) => getScoredResult(match, prediction))
      .filter(Boolean);
    const exact = evaluated.filter((item) => item.result === "exact").length;
    const partial = evaluated.filter((item) => item.result === "partial").length;
    const miss = evaluated.filter((item) => item.result === "miss").length;
    const points = evaluated.reduce((sum, item) => sum + item.points, 0);
    const accuracy = evaluated.length > 0 ? Math.round(((exact + partial) / evaluated.length) * 100) : 0;

    let currentStreak = 0;
    const evaluatedOrdered = savedPredictions
      .map(({ match, prediction }) => ({ match, result: getScoredResult(match, prediction) }))
      .filter((item) => item.result)
      .sort((a, b) => `${b.match.dateIso}${b.match.time}`.localeCompare(`${a.match.dateIso}${a.match.time}`));
    for (const item of evaluatedOrdered) {
      if (item.result.points > 0) {
        currentStreak += 1;
      } else {
        break;
      }
    }

    const lastFive = evaluatedOrdered.slice(0, 5);
    const lastFiveAccuracy =
      lastFive.length > 0
        ? Math.round((lastFive.filter((item) => item.result.points > 0).length / lastFive.length) * 100)
        : 0;

    let analysisKey = "my_picks_analysis_start";
    if (evaluated.length === 0) {
      analysisKey = "my_picks_analysis_pending";
    } else if (exact >= 3 && accuracy >= 60) {
      analysisKey = "my_picks_analysis_sharp";
    } else if (partial >= exact && accuracy >= 50) {
      analysisKey = "my_picks_analysis_solid";
    } else if (lastFiveAccuracy > accuracy && lastFive.length >= 3) {
      analysisKey = "my_picks_analysis_improving";
    } else if (miss > exact + partial) {
      analysisKey = "my_picks_analysis_recover";
    }

    return {
      evaluated: evaluated.length,
      exact,
      partial,
      miss,
      points,
      accuracy,
      currentStreak,
      lastFiveAccuracy,
      analysisKey,
    };
  }, [savedPredictions]);

  const shareText = useMemo(
    () =>
      t("my_picks_share_text", {
        points: analytics.points,
        accuracy: analytics.accuracy,
        exact: analytics.exact,
      }),
    [analytics.accuracy, analytics.exact, analytics.points, t],
  );

  const APP_URL = "https://fixture-2026-mundial.vercel.app";

  const handleShare = async (mode) => {
    try {
      if (mode === "native" && shareCapabilities.native) {
        // Try to share with the app icon so it appears alongside the message
        try {
          const response = await fetch("/icons/icon-512x512.png");
          const blob = await response.blob();
          const file = new File([blob], "fixture-digital-2026.png", { type: "image/png" });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], text: shareText, url: APP_URL });
            return;
          }
        } catch {
          // File sharing not supported — fall back to text + URL
        }
        await navigator.share({ text: shareText, url: APP_URL });
      } else if (mode === "whatsapp") {
        // Including the URL in the text triggers WhatsApp's OG preview (shows the app logo)
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank", "noopener,noreferrer");
      } else if (mode === "telegram") {
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent(APP_URL)}&text=${encodeURIComponent(shareText)}`,
          "_blank",
          "noopener,noreferrer",
        );
      } else if (mode === "x") {
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(APP_URL)}`,
          "_blank",
          "noopener,noreferrer",
        );
      } else if (shareCapabilities.clipboard) {
        await navigator.clipboard.writeText(shareText);
        setShareState("copied");
        window.setTimeout(() => setShareState("idle"), 2200);
      } else {
        throw new Error("clipboard_unavailable");
      }
    } catch {
      setShareState("error");
      window.setTimeout(() => setShareState("idle"), 2200);
    }
  };

  return (
    <section className="mt-8">
      <div className="panel overflow-hidden p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="chip">{t("my_picks_badge")}</span>
            <h2 className="mt-4 font-display text-3xl font-bold text-white">
              {t("my_picks_title")}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">{t("my_picks_description")}</p>
          </div>

          <div className="hidden rounded-3xl bg-emerald-400/10 p-4 text-emerald-300 sm:block">
            <FolderHeart size={24} />
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label={t("my_picks_total")} value={counts.total} icon={FolderHeart} />
          <SummaryCard label={t("my_picks_drafts")} value={counts.draft} tone="gold" icon={Clock3} />
          <SummaryCard label={t("my_picks_submitted")} value={counts.submitted} tone="emerald" icon={CheckCircle2} />
          <SummaryCard label={t("my_picks_locked")} value={counts.locked} tone="red" icon={LockKeyhole} />
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
          <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(16,185,129,0.14),rgba(15,23,42,0.55))] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-300">
                  {t("my_picks_accuracy_badge")}
                </p>
                <h3 className="mt-2 font-display text-2xl font-bold text-white">{t("my_picks_accuracy_title")}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {t(analytics.analysisKey, {
                    accuracy: analytics.accuracy,
                    points: analytics.points,
                    streak: analytics.currentStreak,
                    exact: analytics.exact,
                  })}
                </p>
              </div>
              <div className="rounded-3xl border border-emerald-400/20 bg-black/20 px-4 py-3 text-right">
                <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">{t("my_picks_accuracy")}</p>
                <p className="mt-1 text-4xl font-black text-white">{analytics.accuracy}%</p>
              </div>
            </div>

            <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/8">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-gold-300 to-emerald-300" style={{ width: `${analytics.accuracy}%` }} />
            </div>

            <div className="mt-5 grid gap-3 grid-cols-2 sm:grid-cols-4">
              <SummaryCard label={t("my_picks_points")} value={analytics.points} tone="emerald" icon={Trophy} />
              <SummaryCard label={t("my_picks_exact")} value={analytics.exact} tone="emerald" icon={Target} />
              <SummaryCard label={t("my_picks_partial")} value={analytics.partial} tone="gold" icon={TrendingUp} />
              <SummaryCard label={t("my_picks_streak")} value={analytics.currentStreak} tone="default" icon={CheckCircle2} />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[22px] border border-white/10 bg-black/20 px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{t("my_picks_evaluated")}</p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <p className="text-3xl font-black text-white">{analytics.evaluated}</p>
                  <p className="text-xs text-slate-400">{t("my_picks_missed")}: {analytics.miss}</p>
                </div>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-black/20 px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{t("my_picks_recent_form")}</p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <p className="text-3xl font-black text-white">{analytics.lastFiveAccuracy}%</p>
                  <p className="text-xs text-slate-400">{t("my_picks_last_five")}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.78),rgba(2,6,23,0.96))] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-300">
              {t("my_picks_share_badge")}
            </p>
            <h3 className="mt-2 font-display text-2xl font-bold text-white">{t("my_picks_share_title")}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">{t("my_picks_share_desc")}</p>

            <div className="mt-4 overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(145deg,rgba(16,185,129,0.16),rgba(255,255,255,0.03))]">
              <div className="border-b border-white/10 px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">{t("my_picks_share_preview")}</p>
              </div>
              <div className="px-4 py-4">
                {/* App logo header — mirrors what recipients see when the link unfurls */}
                <div className="mb-4 flex items-center gap-3">
                  <img
                    src="/icons/icon-512x512.png"
                    alt="Fixture Digital 2026"
                    className="h-10 w-10 rounded-xl object-cover shadow-md"
                  />
                  <div>
                    <p className="text-xs font-bold text-white">Fixture Digital 2026</p>
                    <p className="text-[10px] text-slate-400">fixture-2026-mundial.vercel.app</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-center">
                    <p className="text-[9px] uppercase tracking-[0.18em] text-slate-500">{t("my_picks_points")}</p>
                    <p className="mt-1 text-2xl font-black text-white">{analytics.points}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-center">
                    <p className="text-[9px] uppercase tracking-[0.18em] text-slate-500">{t("my_picks_accuracy")}</p>
                    <p className="mt-1 text-2xl font-black text-white">{analytics.accuracy}%</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-center">
                    <p className="text-[9px] uppercase tracking-[0.18em] text-slate-500">{t("my_picks_exact")}</p>
                    <p className="mt-1 text-2xl font-black text-white">{analytics.exact}</p>
                  </div>
                </div>

                <p className="mt-4 whitespace-pre-line text-sm leading-6 text-white">{shareText}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {shareCapabilities.native ? (
                <ShareButton onClick={() => handleShare("native")} icon={Share2} label={t("my_picks_share_native")} tone="emerald" />
              ) : null}
              <ShareButton onClick={() => handleShare("whatsapp")} icon={Share2} label={t("my_picks_share_whatsapp")} tone="emerald" />
              <ShareButton onClick={() => handleShare("telegram")} icon={Share2} label={t("my_picks_share_telegram")} tone="sky" />
              <ShareButton onClick={() => handleShare("x")} icon={TrendingUp} label={t("my_picks_share_x")} tone="sky" />
              {shareCapabilities.clipboard ? (
                <ShareButton onClick={() => handleShare("copy")} icon={Copy} label={t("my_picks_share_copy")} />
              ) : null}
            </div>

            {shareState !== "idle" ? (
              <p className={`mt-3 text-xs ${shareState === "copied" ? "text-emerald-300" : "text-red-200"}`}>
                {shareState === "copied" ? t("my_picks_share_copied") : t("my_picks_share_error")}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-6 rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(16,185,129,0.12),rgba(15,23,42,0.45))] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-300">
                {t("my_picks_progress_title")}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {t("my_picks_progress_desc", {
                  submitted: progress.submittedCount,
                  total: progress.totalMatches,
                  draft: progress.draftCount,
                })}
              </p>
            </div>
            <div className="rounded-3xl border border-emerald-400/20 bg-black/20 px-4 py-3 text-right">
              <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">{t("my_picks_progress_completed")}</p>
              <p className="mt-1 text-3xl font-black text-white">{progress.percent}%</p>
            </div>
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/8">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-gold-300 to-emerald-300" style={{ width: `${progress.percent}%` }} />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => setRulesOpen(true)}
            className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition hover:bg-white/10 sm:w-auto"
          >
            {t("rules_card_button")}
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {[
            ["todas", t("my_picks_all")],
            ["draft", t("my_picks_drafts")],
            ["submitted", t("my_picks_submitted")],
            ["locked", t("my_picks_locked")],
          ].map(([value, label]) => {
            const active = statusFilter === value;

            return (
              <button
                key={value}
                onClick={() => setStatusFilter(value)}
                className={`rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] transition ${
                  active
                    ? "border border-emerald-400/20 bg-emerald-500/12 text-emerald-300"
                    : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        <SectionTitle
          title={t("my_picks_saved_matches")}
          description={
            counts.total === 0
              ? t("my_picks_none")
              : t("my_picks_visible", { count: filteredPredictions.length })
          }
        />

        {counts.total === 0 ? (
          <div className="panel mt-4 p-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-400/10 text-emerald-300">
              <Target size={22} />
            </div>
            <h3 className="mt-4 font-display text-2xl font-bold text-white">
              {t("my_picks_empty_title")}
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">{t("my_picks_empty_description")}</p>
            <button
              onClick={onGoToPredictionCenter}
              className="mt-5 rounded-2xl border border-emerald-400/30 bg-emerald-500 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400"
            >
              {t("my_picks_go_predictions")}
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {Object.entries(groupedByDate).map(([date, items]) => (
              <div key={date}>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-400">
                    {date}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                    {t("ui.label.matchesCount", { count: items.length })}
                  </p>
                </div>

                <div className="panel overflow-hidden">
                  {items.map(({ match, prediction }) => (
                    <PredictionRow
                      key={match.id}
                      match={match}
                      prediction={prediction}
                      onReopenPrediction={onReopenPrediction}
                      onGoToPredictionCenter={onGoToPredictionCenter}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ScoringRulesModal open={rulesOpen} onClose={() => setRulesOpen(false)} />
    </section>
  );
}

export default MyPredictionsScreen;
