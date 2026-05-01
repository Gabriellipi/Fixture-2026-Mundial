import { useEffect, useMemo, useState } from "react";
import { getCountryName, useAppLocale } from "../context/AppLocaleContext";

function ProfileCompletionCard({ user, groups, onSaveProfile, saving, errorMessage }) {
  const { availableLanguages, language, timeZone, t, setLanguage: applyLanguage } = useAppLocale();
  const [fullName, setFullName] = useState(
    user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? "",
  );
  const [favoriteTeam, setFavoriteTeam] = useState("");
  const [reminderOptIn, setReminderOptIn] = useState(true);
  const [preferredLanguage, setPreferredLanguage] = useState(language);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(
    user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture ?? "",
  );

  const teams = useMemo(
    () =>
      groups
        .flatMap((group) => group.teams)
        .sort((firstTeam, secondTeam) =>
          getCountryName(firstTeam, t).localeCompare(getCountryName(secondTeam, t), language),
        ),
    [groups, language, t],
  );
  const selectedTeam = teams.find((team) => team.code === favoriteTeam) ?? null;

  useEffect(() => {
    setPreferredLanguage(language);
  }, [language]);

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    setAvatarFile(file);

    if (!file) {
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSaveProfile({
      fullName,
      email: user?.email ?? "",
      favoriteTeam,
      avatarFile,
      avatarUrl: avatarFile ? avatarPreview : selectedTeam?.flag ?? avatarPreview,
      reminderOptIn,
      preferredLanguage,
      timeZone,
    });
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-8 sm:max-w-lg lg:max-w-3xl lg:px-6">
      <section className="panel overflow-hidden p-6 sm:p-8">
        <span className="chip">{t("identity_badge")}</span>
        <h1 className="mt-4 font-display text-4xl font-black leading-tight text-white">
          {t("identity_title")}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
          {t("identity_description")}
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-white/5 px-4 py-5">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt={t("identity_avatar")}
                className="h-24 w-24 rounded-3xl border border-white/10 object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-slate-900 text-3xl font-black text-white">
                {fullName?.slice(0, 1)?.toUpperCase() ?? "?"}
              </div>
            )}

            <div className="w-full">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {t("identity_avatar")}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-500 file:px-3 file:py-2 file:text-xs file:font-bold file:text-slate-950"
              />
              <span className="mt-2 block text-xs text-slate-500">
                {avatarFile?.name ?? t("ningunArchivo")}
              </span>
            </div>
          </div>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              {t("identity_name")}
            </span>
            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30"
              placeholder={language === "he" ? "השם או הכינוי שלך" : language === "en" ? "Your name or nickname" : "Tu nombre o apodo"}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              {t("identity_favorite_team")}
            </span>
            <select
              value={favoriteTeam}
              onChange={(event) => {
                const nextTeamName = event.target.value;
                const nextTeam = teams.find((team) => team.code === nextTeamName) ?? null;
                setFavoriteTeam(nextTeamName);

                if (!avatarFile && nextTeam?.flag) {
                  setAvatarPreview(nextTeam.flag);
                }
              }}
              required
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value="" className="bg-slate-950">
                {t("identity_choose_team")}
              </option>
              {teams.map((team) => (
                <option key={team.fifaCode} value={team.code} className="bg-slate-950">
                  {getCountryName(team, t)}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Email
            </span>
            <input
              type="email"
              value={user?.email ?? ""}
              disabled
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              {t("identity_language")}
            </span>
            <select
              value={preferredLanguage}
              onChange={(event) => {
                const nextLanguage = event.target.value;
                setPreferredLanguage(nextLanguage);
                applyLanguage(nextLanguage);
              }}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30"
            >
              {availableLanguages.map((item) => (
                <option key={item.value} value={item.value} className="bg-slate-950">
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
            <input
              type="checkbox"
              checked={reminderOptIn}
              onChange={(event) => setReminderOptIn(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent text-emerald-500 focus:ring-emerald-500"
            />
            <div>
              <p className="text-sm font-semibold text-white">{t("identity_reminders")}</p>
              <p className="mt-1 text-xs leading-6 text-slate-400">
                {t("identity_reminders_desc")}
              </p>
            </div>
          </label>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-2xl border border-emerald-400/30 bg-emerald-500 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? t("identity_saving") : t("identity_save")}
          </button>

          {errorMessage ? (
            <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errorMessage}
            </div>
          ) : null}
        </form>
      </section>
    </main>
  );
}

export default ProfileCompletionCard;
