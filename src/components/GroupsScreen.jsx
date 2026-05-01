import { Activity, ShieldCheck, Star, TimerReset } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import SectionTitle from "./SectionTitle";
import TeamDetailPanel from "./TeamDetailPanel";
import { getCountryName, getGroupLabel, useAppLocale } from "../context/AppLocaleContext";
import { getFavoriteTeamMeta } from "../utils/profile";

function normalizeSearchValue(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function FormDots({ form }) {
  const { t } = useAppLocale();
  if (!form?.length) {
    return (
      <span className="text-[9px] uppercase tracking-[0.14em] text-slate-500">
        {t("ui.status.noMatches")}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {form.slice(-5).map((result, index) => {
        const styles =
          result === "W"
            ? "bg-emerald-400/20 text-emerald-300"
            : result === "D"
              ? "bg-amber-400/20 text-amber-300"
              : "bg-red-400/20 text-red-300";

        return (
          <span
            key={`${result}-${index}`}
            className={`flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold ${styles}`}
          >
            {result}
          </span>
        );
      })}
    </div>
  );
}

function GroupTable({ group, favoriteTeam, isFocused = false, focusedTeamCode = null, onTeamClick }) {
  const { t } = useAppLocale();
  const containsFavoriteTeam = group.teams.some(
    (team) => team.code === favoriteTeam || team.name === favoriteTeam,
  );

  return (
    <article
      id={`group-${group.id}`}
      className={`panel premium-card overflow-hidden transition-all duration-300 ${
        isFocused ? "ring-2 ring-emerald-400/60 shadow-[0_24px_70px_rgba(16,185,129,0.16)]" : ""
      }`}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-400">
            {getGroupLabel(group.id, t)}
          </p>
          <h3 className="mt-2 font-display text-xl font-bold text-white">
            {t("groups_live_table")}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {containsFavoriteTeam ? (
            <div className="flex items-center gap-2 rounded-full border border-gold-300/30 bg-gold-300/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-gold-300">
              <Star size={12} fill="currentColor" />
              {t("groups_favorite_chip")}
            </div>
          ) : null}
          <div className="rounded-2xl bg-emerald-400/10 p-3 text-emerald-300">
            <ShieldCheck size={18} />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[560px] w-full table-fixed text-start text-sm">
          <colgroup>
            <col className="w-6" />
            <col />
            <col className="w-8" />
            <col className="w-7" />
            <col className="w-7" />
            <col className="w-7" />
            <col className="w-7" />
            <col className="w-7" />
            <col className="w-7" />
            <col className="w-7" />
          </colgroup>
          <thead className="bg-white/5 text-[9px] uppercase tracking-[0.14em] text-slate-500 sm:text-[10px] sm:tracking-[0.18em]">
            <tr>
              <th className="py-3 pl-3 text-center">#</th>
              <th className="min-w-0 py-3 pl-2 pr-1">{t("ui.label.team")}</th>
              <th className="py-3 text-center">PTS</th>
              <th className="py-3 text-center">PJ</th>
              <th className="py-3 text-center">PG</th>
              <th className="py-3 text-center">PE</th>
              <th className="py-3 text-center">PP</th>
              <th className="py-3 text-center">GF</th>
              <th className="py-3 text-center">GC</th>
              <th className="py-3 pr-3 text-center">D</th>
            </tr>
          </thead>
          <tbody>
            {group.teams.map((team, index) => (
              <tr
                key={team.fifaCode}
                role="button"
                tabIndex={0}
                onClick={() => onTeamClick?.(team, group.id)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onTeamClick?.(team, group.id); } }}
                className={`cursor-pointer border-t transition hover:bg-white/[0.04] ${
                  team.code === favoriteTeam || team.name === favoriteTeam || team.code === focusedTeamCode
                    ? "border-gold-300/15 bg-gold-300/10 hover:bg-gold-300/15"
                    : "border-white/5"
                }`}
              >
                <td className="h-16 py-3 pl-3 align-middle">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-extrabold ${
                      team.code === favoriteTeam || team.name === favoriteTeam || team.code === focusedTeamCode
                        ? "bg-gold-300 text-slate-950"
                        : "bg-white/10 text-white"
                    }`}
                  >
                    {team.rank || index + 1}
                  </span>
                </td>
                <td className="h-16 min-w-0 py-3 pl-2 pr-1 align-middle">
                  <div className="flex min-w-0 items-center gap-2">
                    <img
                      src={team.flag}
                      alt={t("ui.label.flagOf", { team: getCountryName(team, t) })}
                      className="h-7 w-7 shrink-0 rounded-full border border-white/10 object-cover"
                    />
                    <div className="min-w-0">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <p
                          className="truncate text-sm font-semibold text-white"
                          title={getCountryName(team, t)}
                        >
                          {getCountryName(team, t)}
                        </p>
                        {team.code === favoriteTeam || team.name === favoriteTeam || team.code === focusedTeamCode ? (
                          <Star size={10} fill="currentColor" className="shrink-0 text-gold-300" aria-label={t("groups_favorite_badge")} />
                        ) : null}
                      </div>
                      <div className="mt-1 overflow-hidden">
                        <FormDots form={team.form} />
                      </div>
                    </div>
                  </div>
                </td>
                <td
                  className={`h-16 text-center align-middle font-extrabold ${
                    team.code === favoriteTeam || team.name === favoriteTeam || team.code === focusedTeamCode ? "text-gold-300" : "text-emerald-300"
                  }`}
                >
                  {team.points}
                </td>
                <td className="h-16 text-center align-middle text-slate-200">{team.played}</td>
                <td className="h-16 text-center align-middle text-slate-200">{team.won}</td>
                <td className="h-16 text-center align-middle text-slate-200">{team.draw}</td>
                <td className="h-16 text-center align-middle text-slate-200">{team.lost}</td>
                <td className="h-16 text-center align-middle text-slate-200">{team.goalsFor}</td>
                <td className="h-16 text-center align-middle text-slate-200">{team.goalsAgainst}</td>
                <td className="h-16 pr-3 text-center align-middle text-slate-200">{team.goalDifference}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function GroupsScreen({
  groups,
  favoriteTeam,
  groupStandings,
  standingsStatus = "fallback",
  focusedGroupId = null,
  focusedTeamCode = null,
  matches = [],
}) {
  const { t } = useAppLocale();
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState("all");

  const handleTeamClick = (team, groupId) => {
    setSelectedTeam(team);
    setSelectedGroupId(groupId);
  };
  const favoriteTeamMeta = useMemo(() => getFavoriteTeamMeta(groups, favoriteTeam), [favoriteTeam, groups]);
  const favoriteTeamGroup = useMemo(
    () =>
      groupStandings.find((group) =>
        group.teams.some(
          (team) =>
            team.code === favoriteTeam || team.name === favoriteTeam,
        ),
      ) ?? null,
    [favoriteTeam, groupStandings],
  );

  const filteredGroups = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(searchQuery.trim());

    return [...groupStandings]
      .sort((firstGroup, secondGroup) => firstGroup.id.localeCompare(secondGroup.id))
      .filter((group) => {
        if (filterMode === "favorite" && favoriteTeamGroup?.id !== group.id) {
          return false;
        }

        if (!normalizedQuery) {
          return true;
        }

        const groupHaystack = normalizeSearchValue(
          group.teams
            .flatMap((team) => [
              team.name,
              getCountryName(team, t),
              team.code,
              team.fifaCode,
              ...(team.aliases ?? []),
            ])
            .filter(Boolean)
            .join(" "),
        );

        return groupHaystack.includes(normalizedQuery) || normalizeSearchValue(group.id).includes(normalizedQuery);
      });
  }, [favoriteTeamGroup?.id, filterMode, groupStandings, searchQuery, t]);

  useEffect(() => {
    if (!focusedGroupId) {
      return;
    }

    const node = document.getElementById(`group-${focusedGroupId}`);
    if (!node) {
      return;
    }

    requestAnimationFrame(() => {
      node.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [focusedGroupId, groupStandings]);

  useEffect(() => {
    if (focusedGroupId) {
      window.history.replaceState(null, "", `#group-${focusedGroupId.toLowerCase()}`);
    }
  }, [focusedGroupId]);

  const totals = useMemo(() => {
    const playedMatches = groupStandings.reduce(
      (sum, group) => sum + group.teams.reduce((innerSum, team) => innerSum + team.played, 0),
      0,
    );

    return {
      groups: groupStandings.length,
      teams: groupStandings.reduce((sum, group) => sum + group.teams.length, 0),
      playedMatches: Math.floor(playedMatches / 2),
    };
  }, [groupStandings]);

  return (
    <section className="mt-8">
      <div className="panel overflow-hidden p-5 sm:p-6">
        <span className="chip">{t("groups_badge")}</span>
        <h2 className="mt-4 font-display text-3xl font-bold text-white">
          {t("groups_title")}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">{t("groups_description")}</p>

        {favoriteTeamGroup ? (
          <div className="mt-5 rounded-3xl border border-gold-300/20 bg-gold-300/10 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-gold-300/15 p-3 text-gold-300">
                <Star size={18} fill="currentColor" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-300">
                  {t("groups_favorite_title")}
                </p>
                <p className="mt-1 text-sm leading-6 text-white">
                  {t("groups_favorite_desc", { team: favoriteTeamMeta ? getCountryName(favoriteTeamMeta, t) : favoriteTeam, group: favoriteTeamGroup.id })}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="panel-soft px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t("groups_groups")}</p>
            <p className="mt-1 text-lg font-extrabold text-white">{totals.groups}</p>
          </div>
          <div className="panel-soft px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t("groups_teams")}</p>
            <p className="mt-1 text-lg font-extrabold text-white">{totals.teams}</p>
          </div>
          <div className="panel-soft px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t("groups_played")}</p>
            <p className="mt-1 text-lg font-extrabold text-white">{totals.playedMatches}</p>
          </div>
          <div className="panel-soft px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t("groups_state")}</p>
            <div className="mt-1 flex items-center gap-2">
              {standingsStatus === "live" ? (
                <Activity size={16} className="text-emerald-400" />
              ) : (
                <TimerReset size={16} className="text-gold-300" />
              )}
              <p className="text-sm font-extrabold text-white">
                {standingsStatus === "live" ? t("groups_live") : t("groups_pre_start")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <SectionTitle
          title={t("groups_tables")}
          description={t("groups_tables_desc")}
        />

        <div className="mt-4 panel-soft px-4 py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                {t("groups_filter_label")}
              </p>
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={t("groups_filter_placeholder")}
                className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/40"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFilterMode("all")}
                className={`rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] transition ${
                  filterMode === "all"
                    ? "border border-emerald-400/20 bg-emerald-500/12 text-emerald-300"
                    : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                {t("groups_filter_all")}
              </button>
              {favoriteTeamGroup ? (
                <button
                  type="button"
                  onClick={() => setFilterMode("favorite")}
                  className={`rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] transition ${
                    filterMode === "favorite"
                      ? "border border-gold-300/25 bg-gold-300/12 text-gold-300"
                      : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {t("groups_filter_favorite")}
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {filteredGroups.length > 0 ? (
          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            {filteredGroups.map((group) => (
              <GroupTable
                key={group.id}
                group={group}
                favoriteTeam={favoriteTeam}
                isFocused={group.id === focusedGroupId}
                focusedTeamCode={focusedTeamCode}
                onTeamClick={handleTeamClick}
              />
            ))}
          </div>
        ) : (
          <div className="mt-4 panel px-5 py-6 text-center text-sm text-slate-400">
            {t("groups_filter_empty")}
          </div>
        )}
      </div>

      {selectedTeam ? (
        <TeamDetailPanel
          team={selectedTeam}
          matches={matches}
          groupId={selectedGroupId}
          onClose={() => { setSelectedTeam(null); setSelectedGroupId(null); }}
        />
      ) : null}
    </section>
  );
}

export default GroupsScreen;
