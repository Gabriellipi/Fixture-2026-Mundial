import { useEffect, useMemo, useState } from "react";
import { getCountryName, useAppLocale } from "../context/AppLocaleContext";

function ProfilePreferencesCard({
  user,
  profile,
  groups,
  onSave,
  saving,
  saveState,
  errorMessage,
  preferredLanguage,
  timeZone,
}) {
  const { t, availableLanguages, setLanguage: applyLanguage, isRTL } = useAppLocale();
  const [fullName, setFullName] = useState(
    profile?.full_name ?? user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? "",
  );
  const [favoriteTeam, setFavoriteTeam] = useState(profile?.favorite_team ?? "");
  const [reminderOptIn, setReminderOptIn] = useState(profile?.reminder_opt_in ?? true);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(
    profile?.avatar_url ?? user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture ?? "",
  );
  const [language, setLanguage] = useState(preferredLanguage ?? "es");
  const [isEditing, setIsEditing] = useState(true);

  const teams = useMemo(
    () =>
      groups
        .flatMap((group) => group.teams)
        .sort((firstTeam, secondTeam) =>
          getCountryName(firstTeam, t).localeCompare(getCountryName(secondTeam, t), language),
        ),
    [groups, language, t],
  );

  const selectedTeam = teams.find((team) => team.code === favoriteTeam || team.name === favoriteTeam) ?? null;

  useEffect(() => {
    setLanguage(preferredLanguage ?? "es");
  }, [preferredLanguage]);

  useEffect(() => {
    if (saveState === "success" && !errorMessage) {
      setIsEditing(false);
    }

    if (saveState === "error") {
      setIsEditing(true);
    }
  }, [errorMessage, saveState]);

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    setIsEditing(true);
    setAvatarFile(file);

    if (!file) {
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
  };

  const handleUseSocialPhoto = () => {
    setIsEditing(true);
    setAvatarFile(null);
    setAvatarPreview(user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture ?? "");
  };

  const handleUseTeamFlag = () => {
    if (!selectedTeam?.flag) {
      return;
    }

    setIsEditing(true);
    setAvatarFile(null);
    setAvatarPreview(selectedTeam.flag);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    await onSave({
      fullName,
      favoriteTeam,
      avatarFile,
      avatarUrl:
        avatarPreview ||
        selectedTeam?.flag ||
        user?.user_metadata?.avatar_url ||
        user?.user_metadata?.picture ||
        null,
      reminderOptIn,
      email: user?.email ?? "",
      preferredLanguage: language,
      timeZone,
    });
  };

  const handleResetSelection = () => {
    setIsEditing(true);
  };

  const handleFullNameChange = (event) => {
    setIsEditing(true);
    setFullName(event.target.value);
  };

  const handleFavoriteTeamChange = (event) => {
    setIsEditing(true);
    setFavoriteTeam(event.target.value);
  };

  const handleReminderChange = (event) => {
    setIsEditing(true);
    setReminderOptIn(event.target.checked);
  };

  const isLocked = !isEditing && saveState === "success";

  return (
    <section className="mt-8">
      <div className="panel overflow-hidden p-5 sm:p-6">
        <span className="chip">{t("identity_badge")}</span>
        <h2 className="mt-4 font-display text-3xl font-bold text-white">
          {t("identity_title")}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          {t("identity_description")}
        </p>

        <form className="mt-6 grid gap-4 lg:grid-cols-2" onSubmit={handleSubmit}>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 lg:col-span-2">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
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

              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{t("identity_avatar")}</p>
                <p className="mt-1 text-xs leading-6 text-slate-400">
                  {t("identity_avatar_desc")}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleUseSocialPhoto}
                    disabled={isLocked}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-emerald-400/30 hover:bg-white/10"
                  >
                    {t("identity_social_photo")}
                  </button>
                  <button
                    type="button"
                    onClick={handleUseTeamFlag}
                    disabled={!selectedTeam?.flag || isLocked}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-emerald-400/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {t("identity_team_flag")}
                  </button>
                </div>
              </div>
            </div>

            <label className="mt-4 block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {t("identity_upload")}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={isLocked}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-500 file:px-3 file:py-2 file:text-xs file:font-bold file:text-slate-950"
              />
              <span className="mt-2 block text-xs text-slate-500">
                {avatarFile?.name ?? t("ningunArchivo")}
              </span>
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              {t("identity_name")}
            </span>
            <input
              type="text"
              value={fullName}
              onChange={handleFullNameChange}
              required
              disabled={isLocked}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              {t("identity_favorite_team")}
            </span>
            <select
              value={favoriteTeam}
              onChange={handleFavoriteTeamChange}
              disabled={isLocked}
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

          <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 lg:col-span-2">
            <input
              type="checkbox"
              checked={reminderOptIn}
              onChange={handleReminderChange}
              disabled={isLocked}
              className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent text-emerald-500 focus:ring-emerald-500"
            />
            <div>
              <p className="text-sm font-semibold text-white">{t("identity_reminders")}</p>
              <p className="mt-1 text-xs leading-6 text-slate-400">
                {t("identity_reminders_desc")}
              </p>
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              {t("identity_language")}
            </span>
            <select
              value={language}
              onChange={(event) => {
                const nextLanguage = event.target.value;
                setIsEditing(true);
                setLanguage(nextLanguage);
                applyLanguage(nextLanguage);
              }}
              disabled={isLocked}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30"
            >
              {availableLanguages.map((item) => (
                <option key={item.value} value={item.value} className="bg-slate-950">
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              {t("identity_timezone")}
            </span>
            <p className={`text-sm font-semibold text-white ${isRTL ? "text-right" : ""}`}>{timeZone}</p>
            <p className="mt-1 text-xs leading-6 text-slate-400">{t("identity_timezone_hint")}</p>
          </div>

          <div className="flex flex-col gap-3 lg:col-span-2 sm:flex-row">
            <button
              type="submit"
              disabled={saving || isLocked}
              className={`flex-1 rounded-2xl px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                saveState === "success" && isLocked
                  ? "border border-emerald-300/30 bg-emerald-400 text-slate-950"
                  : "border border-emerald-400/30 bg-emerald-500 text-slate-950 hover:bg-emerald-400"
              }`}
            >
              {saving ? t("identity_saving") : saveState === "success" && isLocked ? t("identity_saved") : t("identity_save")}
            </button>

            {(saveState === "success" || errorMessage) && (
              <button
                type="button"
                onClick={handleResetSelection}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:border-emerald-400/30 hover:bg-white/10"
              >
                {t("identity_reset")}
              </button>
            )}
          </div>

          {errorMessage ? (
            <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200 lg:col-span-2">
              {errorMessage}
            </div>
          ) : null}

          {saveState === "success" && !errorMessage ? (
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 lg:col-span-2">
              {t("identity_saved_message")}
            </div>
          ) : null}
        </form>
      </div>
    </section>
  );
}

export default ProfilePreferencesCard;
