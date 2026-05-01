import { getFavoriteTeamMeta, getInitials } from "../utils/profile";
import { getCountryName, useAppLocale } from "../context/AppLocaleContext";
import BrandLogo from "./BrandLogo";

function WorldCupMark() {
  const { t } = useAppLocale();

  return (
    <div className="flex items-center gap-2.5 sm:gap-3">
      <div className="overflow-hidden rounded-[20px] border border-white/10 bg-black/35 p-2 shadow-[0_16px_40px_rgba(0,0,0,0.32)] sm:rounded-[24px] sm:p-2.5">
        <BrandLogo
          alt={t("ui.brand.title")}
          className="h-9 w-auto object-contain sm:h-12"
        />
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-400 sm:text-xs sm:tracking-[0.32em]">
          {t("ui.brand.title")}
        </p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-slate-500 sm:text-[11px] sm:tracking-[0.24em]">
          {t("ui.brand.subtitle")}
        </p>
      </div>
    </div>
  );
}

function DashboardHeader({ user, groups, tournamentStarted = false }) {
  const { t } = useAppLocale();
  const favoriteTeam = getFavoriteTeamMeta(groups, user.favoriteTeam);

  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <WorldCupMark />
        <div className="mt-2">
          <h2 className="font-display text-xl font-bold text-white sm:text-2xl">{t("header_dashboard")}</h2>
          <p className="text-xs text-slate-400 sm:text-sm">{t("header_welcome", { name: user.name })}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <div className="panel-soft premium-card min-w-[104px] px-3 py-3 text-right shadow-[0_12px_30px_rgba(2,6,23,0.35)] sm:px-4">
          <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">{t("header_points")}</p>
          <p className="mt-1 text-lg font-extrabold text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.28)] sm:text-xl">
            {user.points}
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-slate-500">
            {tournamentStarted ? t("header_points_live") : t("header_points_pending")}
          </p>
        </div>

        <div className="relative">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={t("ui.brand.avatarOf", { name: user.name })}
              className="h-12 w-12 rounded-2xl border border-white/10 object-cover shadow-[0_10px_30px_rgba(2,6,23,0.45)] transition-all duration-300 hover:border-emerald-400/35 hover:shadow-[0_12px_30px_rgba(16,185,129,0.2)] sm:h-14 sm:w-14"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 font-display text-base font-black text-white shadow-[0_10px_30px_rgba(2,6,23,0.45)] sm:h-14 sm:w-14 sm:text-lg">
              {getInitials(user.name)}
            </div>
          )}

          {favoriteTeam ? (
            <img
              src={favoriteTeam.flag}
              alt={t("ui.brand.favoriteTeam", { team: getCountryName(favoriteTeam, t) })}
              className="absolute -bottom-1.5 -right-1.5 h-5 w-5 rounded-full border-2 border-slate-950 object-cover sm:-bottom-2 sm:-right-2 sm:h-6 sm:w-6"
            />
          ) : null}
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
