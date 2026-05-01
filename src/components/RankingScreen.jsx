import { Activity, Crown, Flame, Medal, Radio, Sparkles, TrendingUp, Trophy } from "lucide-react";
import { useMemo, useState } from "react";
import { getCountryName, useAppLocale } from "../context/AppLocaleContext";
import { useRankingData } from "../hooks/useRankingData";
import { calculateUserRankingStats } from "../utils/ranking";

function getAvatarFallback(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
}

function MetricCard({ icon: Icon, label, value, tone = "emerald" }) {
  const toneClass =
    tone === "gold"
      ? "bg-[linear-gradient(145deg,rgba(250,204,21,0.18),rgba(250,204,21,0.06))] text-gold-300"
      : tone === "sky"
        ? "bg-[linear-gradient(145deg,rgba(56,189,248,0.18),rgba(56,189,248,0.06))] text-sky-200"
        : "bg-[linear-gradient(145deg,rgba(52,211,153,0.18),rgba(52,211,153,0.06))] text-emerald-300";

  return (
    <div className={`rounded-[24px] border border-white/10 px-4 py-4 ${toneClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-black text-white">{value}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
          <Icon size={17} />
        </div>
      </div>
    </div>
  );
}

function UserAvatar({ entry, team, currentUser = false }) {
  if (entry.avatar) {
    return <img src={entry.avatar} alt={entry.name} className="h-11 w-11 rounded-2xl border border-white/10 object-cover" />;
  }

  return (
    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border text-xs font-black ${currentUser ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300" : "border-white/10 bg-white/5 text-white"}`}>
      {team?.flag ? (
        <img src={team.flag} alt={entry.name} className="h-full w-full rounded-2xl object-cover" />
      ) : (
        getAvatarFallback(entry.name)
      )}
    </div>
  );
}

function PodiumCard({ entry, team, rank, currentUser }) {
  const { t } = useAppLocale();
  const accent =
    rank === 1
      ? "bg-[linear-gradient(145deg,rgba(250,204,21,0.22),rgba(250,204,21,0.1),rgba(255,255,255,0.05))]"
      : rank === 2
        ? "bg-[linear-gradient(145deg,rgba(226,232,240,0.16),rgba(255,255,255,0.06),rgba(255,255,255,0.05))]"
        : "bg-[linear-gradient(145deg,rgba(251,146,60,0.18),rgba(251,146,60,0.08),rgba(255,255,255,0.05))]";

  return (
    <div className={`rounded-[28px] border ${currentUser ? "border-emerald-400/30" : "border-white/10"} p-5 ${accent}`}>
      <div className="flex items-center justify-between gap-3">
        <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${rank === 1 ? "bg-gold-300/14 text-gold-300" : "bg-white/8 text-slate-200"}`}>
          #{rank}
        </span>
        {entry.online ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {t("ranking_status_online")}
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <UserAvatar entry={entry} team={team} currentUser={currentUser} />
        <div className="min-w-0">
          <p className="truncate text-lg font-bold text-white">{entry.name}</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-slate-400">
            {team ? getCountryName(team, t) : entry.favoriteTeam}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-center">
          <p className="text-[9px] uppercase tracking-[0.18em] text-slate-500">{t("ranking_pts")}</p>
          <p className="mt-1 text-xl font-black text-white">{entry.score}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-center">
          <p className="text-[9px] uppercase tracking-[0.18em] text-slate-500">{t("ranking_accuracy_short")}</p>
          <p className="mt-1 text-xl font-black text-white">{entry.accuracy}%</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-center">
          <p className="text-[9px] uppercase tracking-[0.18em] text-slate-500">{t("ranking_streak_short")}</p>
          <p className="mt-1 text-xl font-black text-white">{entry.streak}</p>
        </div>
      </div>
    </div>
  );
}

function RankingRow({ entry, team, currentUser = false }) {
  const { t } = useAppLocale();

  return (
    <div className={`grid grid-cols-[40px_minmax(0,1.8fr)_70px_80px_70px_70px] items-center gap-3 rounded-[24px] border px-4 py-3 ${currentUser ? "border-emerald-400/25 bg-emerald-500/10" : "border-white/8 bg-white/[0.03]"}`}>
      <div className="text-sm font-black text-white">#{entry.rank}</div>
      <div className="flex min-w-0 items-center gap-3">
        <UserAvatar entry={entry} team={team} currentUser={currentUser} />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-white">
            {entry.name}
            {currentUser ? <span className="ml-2 text-[10px] uppercase tracking-[0.18em] text-emerald-300">{t("ranking_you")}</span> : null}
          </p>
          <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
            <span>{team ? getCountryName(team, t) : entry.favoriteTeam}</span>
            <span className={`inline-flex items-center gap-1 ${entry.online ? "text-emerald-300" : "text-slate-500"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${entry.online ? "bg-emerald-400" : "bg-slate-500"}`} />
              {entry.online ? t("ranking_status_online") : t("ranking_status_recent")}
            </span>
          </div>
        </div>
      </div>
      <div className="text-center text-sm font-black text-white">{entry.score}</div>
      <div className="text-center text-sm font-black text-white">{entry.accuracy}%</div>
      <div className="text-center text-sm font-black text-white">{entry.exact}</div>
      <div className={`text-center text-sm font-black ${entry.movement > 0 ? "text-emerald-300" : entry.movement < 0 ? "text-red-200" : "text-slate-400"}`}>
        {entry.movement > 0 ? `+${entry.movement}` : entry.movement}
      </div>
    </div>
  );
}

function RankingCard({ entry, team, currentUser = false }) {
  const { t } = useAppLocale();

  return (
    <div className={`rounded-[24px] border p-4 ${currentUser ? "border-emerald-400/25 bg-emerald-500/10" : "border-white/10 bg-white/[0.03]"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <UserAvatar entry={entry} team={team} currentUser={currentUser} />
          <div>
            <p className="text-sm font-bold text-white">
              #{entry.rank} {entry.name}
              {currentUser ? <span className="ml-2 text-[10px] uppercase tracking-[0.18em] text-emerald-300">{t("ranking_you")}</span> : null}
            </p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-slate-400">
              {team ? getCountryName(team, t) : entry.favoriteTeam}
            </p>
          </div>
        </div>

        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] ${entry.online ? "border border-emerald-400/20 bg-emerald-500/10 text-emerald-300" : "border border-white/10 bg-white/5 text-slate-400"}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${entry.online ? "bg-emerald-400" : "bg-slate-500"}`} />
          {entry.online ? t("ranking_status_online") : t("ranking_status_recent")}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        <div className="rounded-2xl border border-white/10 bg-black/20 px-2.5 py-2 text-center">
          <p className="text-[9px] uppercase tracking-[0.18em] text-slate-500">{t("ranking_pts")}</p>
          <p className="mt-1 text-lg font-black text-white">{entry.score}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 px-2.5 py-2 text-center">
          <p className="text-[9px] uppercase tracking-[0.18em] text-slate-500">{t("ranking_accuracy_short")}</p>
          <p className="mt-1 text-lg font-black text-white">{entry.accuracy}%</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 px-2.5 py-2 text-center">
          <p className="text-[9px] uppercase tracking-[0.18em] text-slate-500">{t("ranking_exact_short")}</p>
          <p className="mt-1 text-lg font-black text-white">{entry.exact}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 px-2.5 py-2 text-center">
          <p className="text-[9px] uppercase tracking-[0.18em] text-slate-500">{t("ranking_move_short")}</p>
          <p className={`mt-1 text-lg font-black ${entry.movement > 0 ? "text-emerald-300" : entry.movement < 0 ? "text-red-200" : "text-white"}`}>
            {entry.movement > 0 ? `+${entry.movement}` : entry.movement}
          </p>
        </div>
      </div>
    </div>
  );
}

function RankingScreen({ matches, predictions, groups, currentUser }) {
  const { t } = useAppLocale();
  const [filter, setFilter] = useState("all");

  const teamMap = useMemo(
    () =>
      groups.flatMap((group) => group.teams).reduce((acc, team) => {
        acc[team.code] = team;
        acc[team.name] = team;
        return acc;
      }, {}),
    [groups],
  );

  const predictionRows = useMemo(
    () =>
      Object.entries(predictions).map(([fixtureId, prediction]) => ({
        user_id: currentUser?.id ?? "current-user",
        fixture_id: fixtureId,
        predicted_home_score: prediction?.home === "" ? null : Number(prediction?.home),
        predicted_away_score: prediction?.away === "" ? null : Number(prediction?.away),
        status: prediction?.status ?? "draft",
        submitted_at: prediction?.submittedAt ?? null,
        locked_at: prediction?.lockedAt ?? null,
      })),
    [currentUser?.id, predictions],
  );

  const userPerformance = useMemo(
    () => calculateUserRankingStats(matches, predictionRows),
    [matches, predictionRows],
  );

  const previewLeaderboard = useMemo(() => {
    return [
      {
      id: currentUser?.id ?? "current-user",
      name: currentUser?.name ?? t("ranking_you_default"),
      favoriteTeam: currentUser?.favoriteTeam ?? "MX",
      avatar: currentUser?.avatar ?? "",
      score: userPerformance.score,
      officialPoints: userPerformance.officialPoints,
      accuracy: userPerformance.accuracy,
      exact: userPerformance.exact,
      streak: userPerformance.streak,
      online: true,
      partial: userPerformance.partial,
      miss: userPerformance.miss,
      movement: userPerformance.movement,
      hasOfficialResults: userPerformance.hasOfficialResults,
      isCurrentUser: true,
      rank: 1,
    },
    ];
  }, [currentUser?.avatar, currentUser?.favoriteTeam, currentUser?.id, currentUser?.name, t, userPerformance]);

  const { entries: realtimeEntries, loading, error, realtimeEnabled } = useRankingData({
    matches,
    currentUser,
  });

  const leaderboard = realtimeEntries.length > 0 ? realtimeEntries : previewLeaderboard;

  const currentEntry = leaderboard.find((entry) => entry.isCurrentUser) ?? leaderboard[0];
  const aheadEntry = leaderboard[currentEntry.rank - 2] ?? null;
  const behindEntry = leaderboard[currentEntry.rank] ?? null;
  const topThree = leaderboard.slice(0, 3);

  const filteredEntries = useMemo(() => {
    if (filter === "online") {
      return leaderboard.filter((entry) => entry.online);
    }
    if (filter === "rising") {
      return leaderboard.filter((entry) => entry.movement > 0);
    }
    return leaderboard;
  }, [filter, leaderboard]);

  const onlineCount = leaderboard.filter((entry) => entry.online).length;
  const averageAccuracy = Math.round(leaderboard.reduce((sum, entry) => sum + entry.accuracy, 0) / leaderboard.length);
  const activityFeed = leaderboard.length > 1
    ? [
        t("ranking_activity_exact", { name: topThree[0]?.name ?? currentEntry.name, count: Math.max(0, topThree[0]?.exact ?? 0) }),
        t("ranking_activity_rise", { name: topThree[1]?.name ?? currentEntry.name, positions: Math.max(0, topThree[1]?.movement ?? 0) }),
        t("ranking_activity_online", { name: currentEntry.name }),
      ]
    : [
        t("ranking_activity_waiting"),
        t("ranking_activity_joining"),
        t("ranking_activity_online", { name: currentEntry.name }),
      ];

  const motivationMessage =
    currentEntry.rank <= 3
      ? t("ranking_motivation_lead")
      : currentEntry.rank <= 10
        ? t("ranking_motivation_top10")
        : t("ranking_motivation_chasing", {
            gap: Math.max(1, (aheadEntry?.score ?? currentEntry.score) - currentEntry.score),
          });

  return (
    <section className="mt-8">
      <div className="panel overflow-hidden p-5 sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <span className="chip">{t("ranking_live_badge")}</span>
            <h2 className="mt-4 font-display text-3xl font-bold text-white">{t("ranking_competition_title")}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">{t("ranking_competition_desc")}</p>
            <div className="mt-4 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
              {userPerformance.hasOfficialResults ? t("ranking_official_note") : t("ranking_preseason_note")}
            </div>
            <div className={`mt-3 inline-flex rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] ${realtimeEnabled && !error ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300" : "border-white/10 bg-white/5 text-slate-400"}`}>
              {loading
                ? t("ranking_sync_loading")
                : realtimeEnabled && !error
                  ? t("ranking_sync_live")
                  : t("ranking_sync_preview")}
            </div>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-2 xl:max-w-md">
            <MetricCard icon={Radio} label={t("ranking_online_now")} value={onlineCount} tone="emerald" />
            <MetricCard icon={TrendingUp} label={t("ranking_avg_accuracy")} value={`${averageAccuracy}%`} tone="sky" />
            <MetricCard icon={Trophy} label={t("ranking_your_position")} value={`#${currentEntry.rank}`} tone="gold" />
            <MetricCard icon={Activity} label={t("ranking_active_today")} value={leaderboard.length} tone="emerald" />
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[1.5fr_1fr]">
          <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-3">
              {topThree.map((entry, index) => (
                <PodiumCard
                  key={entry.id}
                  entry={entry}
                  team={teamMap[entry.favoriteTeam] ?? null}
                  rank={index + 1}
                  currentUser={Boolean(entry.isCurrentUser)}
                />
              ))}
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-300">{t("ranking_table_badge")}</p>
                  <h3 className="mt-2 text-xl font-bold text-white">{t("ranking_table_title")}</h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    ["all", t("ranking_filter_all")],
                    ["online", t("ranking_filter_online")],
                    ["rising", t("ranking_filter_rising")],
                  ].map(([value, label]) => {
                    const active = filter === value;

                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setFilter(value)}
                        className={`rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] transition ${active ? "border border-emerald-400/20 bg-emerald-500/12 text-emerald-300" : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"}`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 hidden space-y-3 lg:block">
                <div className="grid grid-cols-[40px_minmax(0,1.8fr)_70px_80px_70px_70px] gap-3 px-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  <div>#</div>
                  <div>{t("ranking_user")}</div>
                  <div className="text-center">{t("ranking_pts")}</div>
                  <div className="text-center">{t("ranking_accuracy_short")}</div>
                  <div className="text-center">{t("ranking_exact_short")}</div>
                  <div className="text-center">{t("ranking_move_short")}</div>
                </div>

                {filteredEntries.map((entry) => (
                  <RankingRow key={entry.id} entry={entry} team={teamMap[entry.favoriteTeam] ?? null} currentUser={Boolean(entry.isCurrentUser)} />
                ))}
              </div>

              <div className="mt-4 space-y-3 lg:hidden">
                {filteredEntries.map((entry) => (
                  <RankingCard key={entry.id} entry={entry} team={teamMap[entry.favoriteTeam] ?? null} currentUser={Boolean(entry.isCurrentUser)} />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[28px] border border-emerald-400/20 bg-[linear-gradient(145deg,rgba(16,185,129,0.14),rgba(15,23,42,0.58))] p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-300">{t("ranking_chase_badge")}</p>
                  <h3 className="mt-2 text-2xl font-bold text-white">{t("ranking_chase_title")}</h3>
                </div>
                <div className="rounded-3xl border border-white/10 bg-black/20 p-3 text-emerald-300">
                  <Crown size={20} />
                </div>
              </div>

              <div className="mt-4 rounded-[24px] border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">{t("ranking_your_position")}</p>
                    <p className="mt-1 text-3xl font-black text-white">#{currentEntry.rank}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">{t("ranking_pts")}</p>
                    <p className="mt-1 text-2xl font-black text-white">{currentEntry.score}</p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-300">{motivationMessage}</p>

                {aheadEntry ? (
                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">{t("ranking_gap_badge")}</p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {t("ranking_gap_text", { name: aheadEntry.name, gap: Math.max(1, aheadEntry.score - currentEntry.score) })}
                    </p>
                  </div>
                ) : null}

                {behindEntry ? (
                  <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">{t("ranking_pressure_badge")}</p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {t("ranking_pressure_text", { name: behindEntry.name, gap: Math.max(1, currentEntry.score - behindEntry.score) })}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-300">{t("ranking_activity_badge")}</p>
              <h3 className="mt-2 text-2xl font-bold text-white">{t("ranking_activity_title")}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{t("ranking_activity_desc")}</p>

              <div className="mt-4 space-y-3">
                {activityFeed.map((item, index) => (
                  <div key={`${item}-${index}`} className="flex items-start gap-3 rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3">
                    <div className="mt-0.5 rounded-2xl bg-emerald-500/10 p-2 text-emerald-300">
                      {index === 0 ? <Trophy size={16} /> : index === 1 ? <TrendingUp size={16} /> : <Sparkles size={16} />}
                    </div>
                    <p className="text-sm leading-6 text-white">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(145deg,rgba(250,204,21,0.1),rgba(255,255,255,0.03))] p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-gold-300">
                  <Flame size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-gold-300">{t("ranking_rewards_badge")}</p>
                  <h3 className="mt-1 text-xl font-bold text-white">{t("ranking_rewards_title")}</h3>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                {[
                  t("ranking_reward_precision"),
                  t("ranking_reward_exact"),
                  t("ranking_reward_online"),
                ].map((reward) => (
                  <div key={reward} className="rounded-[22px] border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white">
                    <div className="flex items-center gap-2">
                      <Medal size={15} className="text-gold-300" />
                      <span>{reward}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default RankingScreen;
