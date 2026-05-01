import { Crown, TrendingUp } from "lucide-react";
import { useAppLocale } from "../context/AppLocaleContext";

function LeaderboardCard({ players }) {
  const { t } = useAppLocale();

  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-gold-300/15 p-2 text-gold-300">
            <Crown size={20} />
          </div>
          <div>
            <p className="font-display text-lg font-bold text-white">{t("leaderboard_title")}</p>
            <p className="text-sm text-slate-400">{t("leaderboard_subtitle")}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-neon-400/10 px-3 py-2 text-xs font-bold text-neon-400">
          <TrendingUp size={14} />
          {t("leaderboard_live")}
        </div>
      </div>

      <div className="p-4">
        {players.map((player, index) => (
          <div
            key={player.id}
            className="flex items-center justify-between rounded-2xl px-3 py-3 odd:bg-white/5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 font-display font-bold text-white">
                #{index + 1}
              </div>
              <div>
                <p className="font-semibold text-white">{player.name}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  {t("leaderboard_streak", { count: player.streak })}
                </p>
              </div>
            </div>

            <p className="text-lg font-extrabold text-gold-300">{player.points}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LeaderboardCard;
