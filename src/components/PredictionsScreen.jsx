import { useEffect, useMemo, useState } from "react";
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
          <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Progreso</p>
          <p className="mt-1 text-3xl font-black text-white">{percent}%</p>
        </div>
      </div>

      <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/8">
        <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-gold-300 to-emerald-300" style={{ width: `${percent}%` }} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-400/15 bg-emerald-500/10 px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-200">Enviadas</p>
          <p className="mt-1 text-xl font-extrabold text-white">{submittedCount}</p>
        </div>
        <div className="rounded-2xl border border-gold-300/15 bg-gold-300/10 px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-gold-200">Borradores</p>
          <p className="mt-1 text-xl font-extrabold text-white">{draftCount}</p>
        </div>
        <div className="col-span-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 sm:col-span-1">
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Total</p>
          <p className="mt-1 text-xl font-extrabold text-white">{submittedCount}/{totalCount}</p>
        </div>
      </div>
    </div>
  );
}

function PredictionsScreen({
  matches,
  predictions,
  saveStates,
  onPredictionChange,
  onSaveDraft,
  onReopenPrediction,
  onSubmitPrediction,
  onTeamSelect,
  onGoToGroups,
}) {
  const { language, timeZone, setTimeZone, t } = useAppLocale();
  const [selectedCountry, setSelectedCountry] = useState(DEFAULT_FIXTURE_COUNTRY);
  const [rulesOpen, setRulesOpen] = useState(false);

  const handleCountrySelect = (code) => {
    setSelectedCountry(code);
    setTimeZone(getCountryTimeZone(code));
  };

  useEffect(() => {
    const storedCountry = window.localStorage.getItem(FIXTURE_COUNTRY_STORAGE_KEY);
    const nextCountry = storedCountry || detectFixtureCountry(window.navigator.language);
    setSelectedCountry(nextCountry);
    setTimeZone(getCountryTimeZone(nextCountry));
  }, []);

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
            <button
              type="button"
              onClick={() => setRulesOpen(true)}
              className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition hover:bg-white/10 lg:w-auto"
            >
              {t("rules_card_button")}
            </button>
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
                    <UpcomingMatchCard
                      key={match.id}
                      match={match}
                      prediction={predictions[match.id]}
                      saveState={saveStates[match.id]}
                      selectedCountryCode={selectedCountry}
                      onPredictionChange={onPredictionChange}
                      onSaveDraft={onSaveDraft}
                      onReopenPrediction={onReopenPrediction}
                      onSubmitPrediction={onSubmitPrediction}
                      onTeamSelect={onTeamSelect}
                    />
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
