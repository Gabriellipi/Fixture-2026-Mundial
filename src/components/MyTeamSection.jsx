import { formatMatchDate, formatMatchTime, getCountryName, useAppLocale } from "../context/AppLocaleContext";
import { formatUserTimeZoneLabel } from "../utils/dateTime";
import { getFavoriteTeamMeta } from "../utils/profile";

function getTeamMeta(teamName, groups) {
  const team = getFavoriteTeamMeta(groups, teamName);
  if (!team) return null;

  const group = groups.find((item) => item.teams.some((candidate) => candidate.code === team.code));
  return group ? { team, groupId: group.id } : null;
}

function getTeamMatches(teamName, matches) {
  return matches.filter(
    (m) =>
      m.homeTeam?.code === teamName ||
      m.awayTeam?.code === teamName ||
      m.homeTeam?.name === teamName ||
      m.awayTeam?.name === teamName,
  );
}

export default function MyTeamSection({ favoriteTeam, groups, matches, onGoToPredictions }) {
  const { t, language, timeZone } = useAppLocale();

  if (!favoriteTeam) {
    return (
      <section className="mt-6">
        <div className="panel p-5 sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-300">
            {t("my_team_badge")}
          </p>
          <h3 className="mt-2 font-display text-xl font-bold text-white">
            {t("my_team_no_team_title")}
          </h3>
          <p className="mt-1 text-sm text-slate-400">{t("my_team_no_team_desc")}</p>
        </div>
      </section>
    );
  }

  const meta = getTeamMeta(favoriteTeam, groups);
  if (!meta) return null;

  const { team, groupId } = meta;
  const teamMatches = getTeamMatches(team.code, matches);

  return (
    <section className="mt-6">
      <div className="panel relative overflow-hidden p-5 sm:p-6">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gold-400 via-gold-300 to-neon-400" />

        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={team.flag}
              alt={team.name}
              className="h-16 w-16 rounded-2xl border border-white/10 object-cover shadow-[0_8px_24px_rgba(2,6,23,0.55)]"
            />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-300">
              {t("my_team_badge")}
            </p>
            <h3 className="mt-0.5 font-display text-2xl font-bold text-white">{getCountryName(team, t)}</h3>
            <span className="mt-1 inline-block rounded-full border border-neon-500/30 bg-neon-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-neon-400">
              {t("my_team_group", { group: groupId })}
            </span>
          </div>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            {t("my_team_matches")}
          </p>
          <div className="space-y-2">
            {teamMatches.map((match) => {
              const isHome = match.homeTeam?.code === team.code;
              const opponent = isHome ? match.awayTeam : match.homeTeam;
              const dateStr = formatMatchDate(match, language, timeZone);
              const timeStr = formatMatchTime(match, language, timeZone);

              return (
                <button
                  key={match.id}
                  onClick={onGoToPredictions}
                  className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-start transition-all hover:border-neon-500/25 hover:bg-white/8"
                >
                  <img
                    src={opponent?.flag}
                    alt={opponent?.name}
                    className="h-9 w-9 flex-shrink-0 rounded-full border border-white/10 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">
                      {isHome
                        ? `${getCountryName(team, t)} vs ${getCountryName(opponent, t)}`
                        : `${getCountryName(opponent, t)} vs ${getCountryName(team, t)}`}
                    </p>
                    <p className="text-xs text-slate-500">
                      {dateStr} · {timeStr} · {match.venue}
                    </p>
                    <p className="mt-0.5 text-[10px] uppercase tracking-[0.22em] text-emerald-300/60">
                      {formatUserTimeZoneLabel(timeZone)}
                    </p>
                  </div>
                  <span className="flex-shrink-0 text-[11px] text-slate-600">›</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
