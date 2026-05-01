import { getCountryName, getGroupLabel, useAppLocale } from "../context/AppLocaleContext";

function GroupCard({ group }) {
  const { t } = useAppLocale();

  return (
    <article className="panel min-w-[220px] snap-start p-4">
      <div className="flex items-center justify-between">
        <span className="font-display text-lg font-bold text-white">{getGroupLabel(group.id, t)}</span>
        <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
          {t("ui.label.teamsCount", { count: group.teams.length })}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {group.teams.map((team, index) => (
          <div
            key={team.name}
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-3"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-extrabold text-white">
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{getCountryName(team, t)}</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{team.fifaCode}</p>
              </div>
            </div>
            <img
              src={team.flag}
              alt={t("ui.label.flagOf", { team: getCountryName(team, t) })}
              className="h-8 w-8 rounded-full border border-white/10 object-cover"
            />
          </div>
        ))}
      </div>
    </article>
  );
}

function GroupCarousel({ groups }) {
  return (
    <div className="mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {groups.map((group) => (
        <GroupCard key={group.id} group={group} />
      ))}
    </div>
  );
}

export default GroupCarousel;
