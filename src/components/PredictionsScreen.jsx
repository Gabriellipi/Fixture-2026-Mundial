import { useEffect, useMemo, useState, useCallback } from "react";
import UpcomingMatchCard from "./UpcomingMatchCard";
import ScoringRulesModal from "./ScoringRulesModal";
import SectionTitle from "./SectionTitle";
import {
  DEFAULT_FIXTURE_COUNTRY,
  FIXTURE_COUNTRY_STORAGE_KEY,
  detectFixtureCountry,
  getBroadcasterCountryOptions,
  getCountryTimeZone,
} from "../data/broadcasters";
import { getGroupLabel, useAppLocale } from "../context/AppLocaleContext";
import { getMatchKickoffDate } from "../utils/dateTime";
import { getPredictionPhase, hasPredictionScore } from "../utils/predictions";


function formatDateHeader(date, language, timeZone) {
  return new Intl.DateTimeFormat(language, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone,
  })
    .format(date)
    .toLowerCase();
}

function FixtureCountrySelector({ selectedCountry, onSelect }) {
  const { t } = useAppLocale();
  const countries = getBroadcasterCountryOptions();

  return (
    <div className="panel-soft mb-6 px-4 py-4 sm:px-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">
        {t("ui.watch.label")}
      </p>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {countries.map((country) => {
          const active = country.code === selectedCountry;

          return (
            <button
              key={country.code}
              type="button"
              data-value={country.code}
              data-testid={`country-select-${country.code}`}
              onClick={() => onSelect(country.code)}
              className={`shrink-0 rounded-full border px-3 py-2 text-sm transition ${
                active
                  ? "border-emerald-300/40 bg-white/10 text-white shadow-[0_0_0_1px_rgba(110,231,183,0.16)]"
                  : "border-white/10 bg-transparent text-slate-300 hover:bg-white/10"
              }`}
            >
              <span className="mr-2">{country.flag}</span>
              <span className="font-semibold">{country.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ProgressPanel({ title, description, percent, submittedCount, draftCount, totalCount }) {
  const { t } = useAppLocale();
  return (
    <div className="mt-6 rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(16,185,129,0.12),rgba(15,23,42,0.5))] p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-300">
            {title}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
        </div>
        <div className="rounded-3xl border border-emerald-400/20 bg-black/20 px-4 py-3 text-right">
          <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">{t("predictions_progress_label")}</p>
          <p className="mt-1 text-3xl font-black text-white">{percent}%</p>
        </div>
      </div>

      <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/8">
        <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-gold-300 to-emerald-300" style={{ width: `${percent}%` }} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-400/15 bg-emerald-500/10 px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-200">{t("predictions_submitted_label")}</p>
          <p className="mt-1 text-xl font-extrabold text-white">{submittedCount}</p>
        </div>
        <div className="rounded-2xl border border-gold-300/15 bg-gold-300/10 px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-gold-200">{t("predictions_draft_label")}</p>
          <p className="mt-1 text-xl font-extrabold text-white">{draftCount}</p>
        </div>
        <div className="col-span-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 sm:col-span-1">
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{t("predictions_total_label")}</p>
          <p className="mt-1 text-xl font-extrabold text-white">{submittedCount}/{totalCount}</p>
        </div>
      </div>
    </div>
  );
}

const ONBOARDING_KEY = "wc2026-predictions-onboarding-dismissed";

function OnboardingCard({ onDismiss }) {
  const { t } = useAppLocale();
  const steps = [
    { icon: "🎯", text: t("onboarding_step1") },
    { icon: "💾", text: t("onboarding_step2") },
    { icon: "🔒", text: t("onboarding_step3") },
  ];
  return (
    <div className="mb-6 rounded-[28px] border border-emerald-400/20 bg-[linear-gradient(135deg,rgba(16,185,129,0.10),rgba(15,23,42,0.6))] p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-emerald-300">
        {t("onboarding_title")}
      </p>
      <p className="mt-1 text-sm font-semibold text-white">{t("onboarding_desc")}</p>
      <div className="mt-4 space-y-3">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm">
              {step.icon}
            </span>
            <p className="mt-0.5 text-sm text-slate-300">{step.text}</p>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="mt-5 w-full rounded-full border border-emerald-400/30 bg-emerald-500 px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-950 transition hover:bg-emerald-400"
      >
        {t("onboarding_dismiss")}
      </button>
    </div>
  );
}

function PredictionsScreen({
  matches,
  predictions,
  saveStates,
  communityStats = {},
  focusedMatchId = null,
  onPredictionChange,
  onSaveDraft,
  onReopenPrediction,
  onSubmitPrediction,
  onTeamSelect,
  onGoToGroups,
}) {
  const { language, timeZone, setTimeZone, t } = useAppLocale();
  const [selectedCountry, setSelectedCountry] = useState(() => {
    try {
      const stored = window.localStorage.getItem(FIXTURE_COUNTRY_STORAGE_KEY);
      return stored || detectFixtureCountry(window.navigator.language);
    } catch {
      return DEFAULT_FIXTURE_COUNTRY;
    }
  });
  const [rulesOpen, setRulesOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try {
      return !window.localStorage.getItem(ONBOARDING_KEY);
    } catch {
      return false;
    }
  });

  const handleDismissOnboarding = () => {
    try {
      window.localStorage.setItem(ONBOARDING_KEY, "1");
    } catch {}
    setShowOnboarding(false);
  };

  useEffect(() => {
    if (!focusedMatchId) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const target = document.getElementById(`prediction-match-${focusedMatchId}`);
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [focusedMatchId]);

  const handleCountrySelect = (code) => {
    setSelectedCountry(code);
    setTimeZone(getCountryTimeZone(code));
  };

  useEffect(() => {
    const storedCountry = window.localStorage.getItem(FIXTURE_COUNTRY_STORAGE_KEY);
    const nextCountry = storedCountry || detectFixtureCountry(window.navigator.language);
    setTimeZone(getCountryTimeZone(nextCountry));
  }, [setTimeZone]);

  useEffect(() => {
    window.localStorage.setItem(FIXTURE_COUNTRY_STORAGE_KEY, selectedCountry);
  }, [selectedCountry]);

  const sortedMatches = useMemo(
    () =>
      [...matches].sort((firstMatch, secondMatch) => {
        const firstKickoff = getMatchKickoffDate(firstMatch).getTime();
        const secondKickoff = getMatchKickoffDate(secondMatch).getTime();

        if (firstKickoff !== secondKickoff) {
          return firstKickoff - secondKickoff;
        }

        return firstMatch.groupId.localeCompare(secondMatch.groupId);
      }),
    [matches],
  );

  const groupedByDate = useMemo(
    () =>
      sortedMatches.reduce((acc, match) => {
        const dateKey = match.dateIso;

        if (!acc[dateKey]) {
          const kickoffDate = getMatchKickoffDate(match);

          acc[dateKey] = {
            key: dateKey,
            label: formatDateHeader(kickoffDate, language, timeZone),
            matches: [],
          };
        }

        acc[dateKey].matches.push(match);
        return acc;
      }, {}),
    [language, sortedMatches, timeZone],
  );

  const dateGroups = Object.values(groupedByDate);

  // Weighted random: goals follow a realistic distribution (0-4, avg ~1.3)
  const randomGoals = () => {
    const r = Math.random();
    if (r < 0.22) return "0";
    if (r < 0.50) return "1";
    if (r < 0.76) return "2";
    if (r < 0.91) return "3";
    return "4";
  };

  const handleRandomFill = useCallback(() => {
    const editableMatches = sortedMatches.filter((match) => {
      const phase = getPredictionPhase(match, predictions[match.id]);
      return phase === "draft" || phase === "empty";
    });
    editableMatches.forEach((match) => {
      onPredictionChange(match.id, "home", randomGoals());
      onPredictionChange(match.id, "away", randomGoals());
    });
  }, [sortedMatches, predictions, onPredictionChange]);

  const editableCount = useMemo(
    () => sortedMatches.filter((m) => {
      const phase = getPredictionPhase(m, predictions[m.id]);
      return phase === "draft" || phase === "empty";
    }).length,
    [sortedMatches, predictions],
  );

  const progress = useMemo(() => {
    const totals = matches.reduce(
      (acc, match) => {
        const prediction = predictions[match.id];
        const phase = getPredictionPhase(match, prediction);

        if (phase === "submitted" || phase === "locked") {
          acc.submitted += 1;
        } else if (hasPredictionScore(prediction)) {
          acc.draft += 1;
        }

        return acc;
      },
      { submitted: 0, draft: 0 },
    );

    return {
      ...totals,
      total: matches.length,
      percent: matches.length > 0 ? Math.round((totals.submitted / matches.length) * 100) : 0,
    };
  }, [matches, predictions]);

  return (
    <section className="mt-6">
      <div className="panel overflow-hidden p-4 sm:p-6">
        <span className="chip">{t("predictions_badge")}</span>
        <h2 className="mt-3 font-display text-2xl font-bold text-white sm:mt-4 sm:text-3xl">
          {t("predictions_title")}
        </h2>
        <p className="mt-2 max-w-2xl text-[13px] leading-5 text-slate-300 sm:mt-3 sm:text-sm sm:leading-6">
          {t("predictions_description")}
        </p>
        <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-300">
                {t("rules_card_badge")}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">{t("rules_card_summary")}</p>
            </div>
            <div className="flex gap-2 flex-col sm:flex-row lg:flex-col xl:flex-row">
              {editableCount > 0 && (
                <button
                  type="button"
                  onClick={handleRandomFill}
                  className="flex items-center justify-center gap-2 w-full rounded-full border border-violet-400/30 bg-violet-500/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-violet-300 transition hover:bg-violet-500/20 lg:w-auto"
                >
                  🎲 {t("predictions_random_fill")}
                </button>
              )}
              <button
                type="button"
                onClick={() => setRulesOpen(true)}
                className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition hover:bg-white/10 lg:w-auto"
              >
                {t("rules_card_button")}
              </button>
            </div>
          </div>
        </div>

        <ProgressPanel
          title={t("predictions_progress_title")}
          description={t("predictions_progress_desc", {
            submitted: progress.submitted,
            total: progress.total,
            draft: progress.draft,
          })}
          percent={progress.percent}
          submittedCount={progress.submitted}
          draftCount={progress.draft}
          totalCount={progress.total}
        />
      </div>

      <div className="mt-6">
        <SectionTitle
          title={t("available_matches")}
          description={`${matches.length} ${t("stat_matches")}`}
        />

        <div className="mt-4">
          {showOnboarding && (
            <OnboardingCard onDismiss={handleDismissOnboarding} />
          )}
          <FixtureCountrySelector selectedCountry={selectedCountry} onSelect={handleCountrySelect} />

          <div className="space-y-6">
            {dateGroups.map((group, index) => (
              <div key={group.key}>
                {index > 0 ? <div className="mb-6 border-t border-white/5" /> : null}

                <div className="flex items-center justify-between gap-3 px-1 pb-2 pt-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">
                    {group.label}
                  </p>
                  <button
                    type="button"
                    onClick={onGoToGroups}
                    className="text-xs uppercase tracking-[0.18em] text-slate-500 transition hover:text-white"
                  >
                    {t("nav_groups")}
                  </button>
                </div>

                <div className="space-y-3">
                  {group.matches.map((match) => (
                    <div
                      key={match.id}
                      id={`prediction-match-${match.id}`}
                      className={focusedMatchId === match.id ? "rounded-[28px] ring-2 ring-gold-300/50 ring-offset-2 ring-offset-slate-950" : ""}
                    >
                    <UpcomingMatchCard
                      match={match}
                      prediction={predictions[match.id]}
                      saveState={saveStates[match.id]}
                      selectedCountryCode={selectedCountry}
                      communityStats={communityStats[match.id] ?? null}
                      onPredictionChange={onPredictionChange}
                      onSaveDraft={onSaveDraft}
                      onReopenPrediction={onReopenPrediction}
                      onSubmitPrediction={onSubmitPrediction}
                      onTeamSelect={onTeamSelect}
                    />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ScoringRulesModal open={rulesOpen} onClose={() => setRulesOpen(false)} />
    </section>
  );
}

export default PredictionsScreen;
