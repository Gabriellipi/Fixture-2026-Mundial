import { Sparkles, Trophy } from "lucide-react";
import { useMemo } from "react";
import SectionTitle from "./SectionTitle";
import { getCountryName, useAppLocale } from "../context/AppLocaleContext";
import { knockoutRounds, placementMatches } from "../data/knockoutBracket";
import { buildRound32Assignments } from "../utils/knockout";

function formatBracketDate(dateIso, language, timeZone) {
  return new Intl.DateTimeFormat(language, {
    day: "numeric",
    month: "short",
    weekday: "short",
    timeZone,
  }).format(new Date(`${dateIso}T12:00:00Z`));
}

function formatSlotLabel(slot, t) {
  if (slot && typeof slot === "object") {
    return getCountryName(slot, t);
  }

  if (slot.startsWith("W")) {
    return t("ui.bracket.winnerOf", { match: slot.slice(1) });
  }

  if (slot.startsWith("L")) {
    return t("ui.bracket.loserOf", { match: slot.slice(1) });
  }

  return slot;
}

function TeamRow({ label, subtle = false }) {
  return (
    <div className={`rounded-lg border border-white/10 px-2 py-1.5 ${subtle ? "bg-white/[0.04]" : "bg-white/[0.06]"}`}>
      <p className="truncate text-[11px] font-semibold leading-tight text-white">{label}</p>
    </div>
  );
}

function BracketMatchCard({ match, language, timeZone, t, featured = false, compact = false }) {
  return (
    <article
      className={`relative overflow-hidden rounded-xl border px-2 py-2 ${
        featured
          ? "border-gold-300/35 bg-[linear-gradient(180deg,rgba(250,204,21,0.18),rgba(15,23,42,0.92))]"
          : "border-white/10 bg-slate-900/85"
      }`}
    >
      {featured ? (
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gold-300 via-yellow-300 to-amber-400" />
      ) : null}

      <div className="flex items-center justify-between gap-2">
        <p className={`truncate text-[8px] font-semibold uppercase tracking-[0.12em] ${featured ? "text-gold-200/80" : "text-slate-500"}`}>
          {formatBracketDate(match.dateIso, language, timeZone)}
        </p>
        <p className={`shrink-0 text-[8px] uppercase tracking-[0.1em] ${featured ? "text-gold-200/80" : "text-emerald-300/75"}`}>
          {match.id.toUpperCase()}
        </p>
      </div>

      <div className={`mt-2 space-y-1.5 ${compact ? "space-y-1" : ""}`}>
        <TeamRow label={formatSlotLabel(match.home, t)} subtle={compact} />
        <TeamRow label={formatSlotLabel(match.away, t)} subtle={compact} />
      </div>

      {featured ? (
        <p className="mt-2 rounded-full border border-gold-300/20 bg-gold-300/10 px-2 py-1 text-center text-[8px] font-bold uppercase tracking-[0.14em] text-gold-200">
          {t("tournament.stage.final")}
        </p>
      ) : null}
    </article>
  );
}

function RoundColumn({ round, language, timeZone, t }) {
  return (
    <div className="w-[156px] shrink-0 sm:w-[172px]">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/75 p-2">
        <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${round.accentClass}`} />
        <div className="flex items-start justify-between gap-2 pt-1">
          <div>
            <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              {t("ui.label.matchesCount", { count: round.matches.length })}
            </p>
            <h3 className="mt-1 font-display text-sm font-bold leading-tight text-white">{t(round.titleKey)}</h3>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.04] px-1.5 py-1 text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400">
            {round.id.toUpperCase()}
          </div>
        </div>

        <div className="mt-2 space-y-1.5">
          {round.matches.map((match) => (
            <BracketMatchCard
              key={match.id}
              match={match}
              language={language}
              timeZone={timeZone}
              t={t}
              featured={round.id === "final"}
              compact={round.id !== "final"}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TrophyLane({ t }) {
  return (
    <div className="w-[132px] shrink-0 sm:w-[148px]">
      <div className="relative flex h-full min-h-[240px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-gold-300/25 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.2),transparent_35%),linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.98))] p-3 text-center">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gold-300 via-yellow-300 to-amber-400" />
        <div className="absolute -top-8 h-24 w-24 rounded-full bg-gold-300/15 blur-3xl" />
        <div className="absolute bottom-8 h-24 w-24 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="relative z-10">
          <div className="mx-auto inline-flex h-8 w-8 items-center justify-center rounded-full border border-gold-300/20 bg-gold-300/10 text-gold-200">
            <Sparkles size={15} />
          </div>
          <p className="mt-3 text-[8px] font-semibold uppercase tracking-[0.18em] text-gold-200/80">
            {t("ui.bracket.badge")}
          </p>
          <h3 className="mt-1 font-display text-lg font-bold text-white">{t("tournament.stage.final")}</h3>
          <p className="mt-1 text-[10px] leading-4 text-slate-300">
            {t("ui.bracket.description")}
          </p>

          <div className="mt-3 rounded-2xl border border-gold-300/20 bg-white/[0.04] p-3">
            <img
              src="/image/trophy-2026-rose-gold.png"
              alt={t("tournament.stage.final")}
              className="mx-auto h-auto w-full max-w-[82px] object-contain drop-shadow-[0_12px_28px_rgba(255,255,255,0.14)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FinalShowcase({ finalMatch, language, timeZone, t }) {
  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-gold-300/25 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.18),transparent_34%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))] p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <span className="chip border-gold-300/20 bg-gold-300/10 text-gold-200">{t("tournament.stage.final")}</span>
          <h3 className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl">{t("ui.bracket.badge")}</h3>
          <p className="mt-2 text-sm leading-5 text-slate-300">
            {t("ui.bracket.description")}
          </p>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-200/80">
            {formatBracketDate(finalMatch.dateIso, language, timeZone)}
          </p>
        </div>

        <div className="mx-auto w-full max-w-[240px] lg:mx-0">
          <div className="relative mx-auto rounded-2xl border border-gold-300/25 bg-white/[0.04] p-3">
            <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold-300/70 to-transparent" />
            <img
              src="/image/trophy-2026-rose-gold.png"
              alt={t("tournament.stage.final")}
              className="mx-auto h-auto w-full max-w-[110px] object-contain drop-shadow-[0_18px_38px_rgba(255,255,255,0.16)]"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 max-w-sm">
        <BracketMatchCard
          match={finalMatch}
          language={language}
          timeZone={timeZone}
          t={t}
          featured
        />
      </div>
    </div>
  );
}

function KnockoutBracketScreen({ groupStandings = [], standingsStatus = "fallback" }) {
  const { language, timeZone, t } = useAppLocale();

  const thirdPlace = useMemo(() => placementMatches[0], []);
  const resolvedRounds = useMemo(
    () =>
      knockoutRounds.map((round) =>
        round.id === "round32"
          ? {
              ...round,
              matches: buildRound32Assignments(round.matches, groupStandings),
            }
          : round,
      ),
    [groupStandings],
  );

  const finalRound = resolvedRounds.find((round) => round.id === "final");
  const bracketFlow = resolvedRounds.flatMap((round) =>
    round.id === "final" ? [{ type: "trophy", id: "trophy-lane" }, { type: "round", round }] : [{ type: "round", round }],
  );

  return (
    <section className="mt-6">
      <div className="panel overflow-hidden p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="chip">{t("ui.bracket.badge")}</span>
            <h2 className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl">{t("tournament.stage.knockout")}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-5 text-slate-300">{t("ui.bracket.description")}</p>
          </div>

          <div className="hidden rounded-2xl bg-gold-300/10 p-3 text-gold-300 sm:block">
            <Trophy size={21} />
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <div className="panel-soft px-3 py-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
              {standingsStatus === "live" ? t("ui.bracket.pendingQualification") : t("ui.bracket.advanceRule")}
            </p>
          </div>
          <div className="panel-soft px-3 py-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-emerald-300">{t("ui.bracket.swipeHint")}</p>
          </div>
        </div>

        {finalRound?.matches?.[0] ? (
          <FinalShowcase finalMatch={finalRound.matches[0]} language={language} timeZone={timeZone} t={t} />
        ) : null}
      </div>

      <div className="mt-6">
        <SectionTitle
          title={t("tournament.stage.knockout")}
          description={t("ui.bracket.swipeHint")}
        />

        <div className="mt-3 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.8),rgba(2,6,23,0.96))] p-2 sm:p-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-300">
              {t("tournament.stage.knockout")}
            </p>
            <p className="text-[9px] uppercase tracking-[0.16em] text-slate-500">
              {knockoutRounds.length} fases
            </p>
          </div>

          <div className="overflow-x-auto pb-2 [scrollbar-width:none]">
            <div className="flex min-w-max items-stretch gap-2 pr-2">
              {bracketFlow.map((entry) =>
                entry.type === "trophy" ? (
                  <TrophyLane key={entry.id} t={t} />
                ) : (
                  <RoundColumn
                    key={entry.round.id}
                    round={entry.round}
                    language={language}
                    timeZone={timeZone}
                    t={t}
                  />
                ),
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <SectionTitle
          title={t(thirdPlace.titleKey)}
          description={formatBracketDate(thirdPlace.dateIso, language, timeZone)}
        />
        <div className="mt-4 max-w-md">
          <BracketMatchCard
            match={thirdPlace}
            language={language}
            timeZone={timeZone}
            t={t}
          />
        </div>
      </div>
    </section>
  );
}

export default KnockoutBracketScreen;
