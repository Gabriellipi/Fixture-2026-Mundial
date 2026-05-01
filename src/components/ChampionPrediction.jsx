import { useState } from "react";
import { getCountryName, resolveCountryIdentifier, useAppLocale } from "../context/AppLocaleContext";
import { zonedDateToUtc } from "../utils/dateTime";

const TOURNAMENT_START = zonedDateToUtc("2026-06-11", "19:00", "America/Mexico_City");

function isTournamentStarted() {
  return Date.now() >= TOURNAMENT_START.getTime();
}

export default function ChampionPrediction({ userId, groups }) {
  const { t } = useAppLocale();
  const storageKey = `wc2026_champion_${userId ?? "guest"}`;

  const [selected, setSelected] = useState(() => localStorage.getItem(storageKey) ?? null);
  const [picking, setPicking] = useState(false);

  const locked = isTournamentStarted();
  const allTeams = groups.flatMap((g) => g.teams);
  const selectedCode = resolveCountryIdentifier(selected);
  const selectedTeam = allTeams.find(
    (team) => team.code === selected || team.name === selected || team.code === selectedCode,
  );

  if (locked && !selected) return null;

  function handlePick(teamCode) {
    if (locked) return;
    localStorage.setItem(storageKey, teamCode);
    setSelected(teamCode);
    setPicking(false);
  }

  const showGrid = !selected || picking;

  return (
    <section className="mt-6">
      <div className="panel relative overflow-hidden p-5 sm:p-6">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400 via-neon-400 to-gold-300" />
        <div className="absolute -right-12 top-8 h-40 w-40 rounded-full bg-gold-300/8 blur-3xl" />

        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-neon-400">
          {t("champion_badge")}
        </p>
        <h3 className="mt-2 font-display text-xl font-bold text-white">{t("champion_title")}</h3>
        <p className="mt-1 text-sm text-slate-400">{t("champion_desc")}</p>

        {!showGrid && selectedTeam ? (
          <div className="mt-5 flex items-center gap-4">
            <div className="relative">
              <img
                src={selectedTeam.flag}
                alt={selectedTeam.name}
                className="h-20 w-20 rounded-2xl border border-gold-300/25 object-cover shadow-[0_0_32px_rgba(247,214,122,0.18)]"
              />
              <div className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-gold-300/40 bg-gold-300/15">
                <span className="text-[10px]">🏆</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                {t("champion_your_pick")}
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-white">{getCountryName(selectedTeam, t)}</p>
              {locked ? (
                <span className="mt-1.5 inline-block text-[10px] uppercase tracking-[0.2em] text-slate-600">
                  {t("champion_locked")}
                </span>
              ) : (
                <button
                  onClick={() => setPicking(true)}
                  className="mt-1.5 text-[11px] uppercase tracking-[0.2em] text-gold-300 transition-colors hover:text-gold-400"
                >
                  {t("champion_change")}
                </button>
              )}
            </div>
          </div>
        ) : (
          !locked && (
            <div className="mt-4">
              <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-slate-500">
                {t("champion_pick_prompt")}
              </p>
              <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 lg:grid-cols-12">
                {allTeams.map((team) => (
                  <button
                    key={team.code}
                    title={getCountryName(team, t)}
                    onClick={() => handlePick(team.code)}
                    className="group flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1.5 transition-all hover:border-neon-500/40 hover:bg-neon-500/10"
                  >
                    <img
                      src={team.flag}
                      alt={getCountryName(team, t)}
                      className="h-7 w-7 rounded-full border border-white/10 object-cover"
                    />
                    <span className="text-[8px] uppercase tracking-wide text-slate-600 group-hover:text-slate-400">
                      {team.fifaCode}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}
