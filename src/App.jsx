import { useEffect, useMemo, useState } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { detectPreferredLanguage, detectTimeZone, useAppLocale } from "./context/AppLocaleContext";
import AuthScreen from "./components/AuthScreen";
import PrivacyPolicyScreen from "./components/PrivacyPolicyScreen";
import TermsScreen from "./components/TermsScreen";
import DeleteAccountModal from "./components/DeleteAccountModal";
import BottomNav from "./components/BottomNav";
import ChampionPrediction from "./components/ChampionPrediction";
import SmartBanner from "./components/SmartBanner";
import DashboardHeader from "./components/DashboardHeader";
import HostCitiesScreen from "./components/HostCitiesScreen";
import LiveScreen from "./components/LiveScreen";
import TopNav from "./components/TopNav";
import GroupsScreen from "./components/GroupsScreen";
import KnockoutBracketScreen from "./components/KnockoutBracketScreen";
import MyPredictionsScreen from "./components/MyPredictionsScreen";
import MyTeamSection from "./components/MyTeamSection";
import PredictionsScreen from "./components/PredictionsScreen";
import RankingScreen from "./components/RankingScreen";
import ProfileCompletionCard from "./components/ProfileCompletionCard";
import ProfilePreferencesCard from "./components/ProfilePreferencesCard";
import SectionTitle from "./components/SectionTitle";
import CompactPredictionCard from "./components/CompactPredictionCard";
import UpcomingMatchCard from "./components/UpcomingMatchCard";
import BrandLogo from "./components/BrandLogo";
import { supabase } from "./lib/supabase";
import {
  groups,
  tournamentMeta,
  upcomingMatches,
  user,
} from "./data/worldCup2026";
import {
  getCurrentSession,
  isAnonymousUser,
  isRealAuthenticatedUser,
  signInWithEmailOtp,
  signInWithFacebook,
  signInWithGoogle,
  signOutUser,
  subscribeToAuthChanges,
} from "./services/auth";
import { getWorldCupFixturesByDate, getWorldCupStandings } from "./services/apiSports";
import { loadProfile, updateProfilePreferences, upsertProfile } from "./services/profile";
import { loadStoredPredictions, persistPrediction } from "./services/predictions";
import { uploadAvatar } from "./services/storage";
import { getPredictionPhase, hasPredictionScore } from "./utils/predictions";
import { buildFallbackStandings, normalizeApiStandings } from "./utils/standings";
import { mockLiveMatchData } from "./data/mockLiveMatches";

const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS ?? "")
  .split(",")
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

const TOURNAMENT_START_TS = new Date("2026-06-11T19:00:00Z").getTime();
const TOURNAMENT_END_TS = new Date("2026-07-19T23:59:00Z").getTime();

function isAdminUser(user) {
  if (!user?.email) {
    return false;
  }

  return adminEmails.includes(user.email.toLowerCase());
}

const initialPredictions = upcomingMatches.reduce((acc, match) => {
  acc[match.id] = {
    home: "",
    away: "",
    status: "draft",
    submittedAt: null,
    lockedAt: null,
  };
  return acc;
}, {});

function buildDisplayDateLabel(dateIso) {
  const [year, month, day] = dateIso.split("-");
  const monthShort = month === "06" ? "Jun" : month;
  return `${Number(day)} ${monthShort}`;
}

function overrideMatchTiming(match, overrides) {
  return {
    ...match,
    ...overrides,
    date: buildDisplayDateLabel(overrides.dateIso ?? match.dateIso),
  };
}

function buildSimulatedMatches(mode) {
  if (mode !== "live") {
    return upcomingMatches;
  }

  return upcomingMatches.map((match) => {
    if (match.id === 1) {
      return overrideMatchTiming(match, {
        dateIso: "2026-06-11",
        time: "19:00",
        kickoffUtc: "2026-06-11T19:00:00Z",
      });
    }

    if (match.id === 2) {
      return overrideMatchTiming(match, {
        dateIso: "2026-06-11",
        time: "20:00",
        kickoffUtc: "2026-06-11T20:00:00Z",
      });
    }

    if (match.id === 3) {
      return overrideMatchTiming(match, {
        dateIso: "2026-06-11",
        time: "17:00",
        kickoffUtc: "2026-06-11T17:00:00Z",
      });
    }

    if (match.id === 4) {
      return overrideMatchTiming(match, {
        dateIso: "2026-06-11",
        time: "22:00",
        kickoffUtc: "2026-06-11T22:00:00Z",
      });
    }

    return match;
  });
}

function getLocalDayKey(date, timeZone) {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

function normalizeTeamName(name = "") {
  return String(name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
}

function deriveUserDisplayName(authUser) {
  return (
    authUser?.user_metadata?.full_name ??
    authUser?.user_metadata?.name ??
    authUser?.user_metadata?.user_name ??
    authUser?.email?.split("@")[0] ??
    "Fan"
  );
}

function App() {
  const { setPreferences, t, language, timeZone } = useAppLocale();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let handle;
    CapacitorApp.addListener("appUrlOpen", ({ url }) => {
      if (url?.startsWith("com.fixturedigital.app2026://")) {
        supabase?.auth.getSessionFromUrl({ url });
      }
    }).then((h) => { handle = h; });
    return () => { handle?.remove(); };
  }, []);

  const [activeTab, setActiveTab] = useState("inicio");
  const [groupFocus, setGroupFocus] = useState({ groupId: null, teamCode: null });
  const [predictions, setPredictions] = useState(initialPredictions);
  const [saveStates, setSaveStates] = useState({});
  const [storageMode, setStorageMode] = useState("local");
  const [authReady, setAuthReady] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authMessage, setAuthMessage] = useState("");
  const [loadingProvider, setLoadingProvider] = useState(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSaveState, setProfileSaveState] = useState("idle");
  const [liveMatchData, setLiveMatchData] = useState({});
  const [simulationMode, setSimulationMode] = useState("real");
  const [resolvedFixtureIds, setResolvedFixtureIds] = useState({});
  const [clockNow, setClockNow] = useState(() => new Date());
  const [groupStandings, setGroupStandings] = useState(() => buildFallbackStandings(groups));
  const [groupStandingsStatus, setGroupStandingsStatus] = useState("fallback");
  const [legalScreen, setLegalScreen] = useState(null); // 'privacy' | 'terms' | null
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);

  const ensureProfileRow = async (nextUser, existingProfile = null) => {
    if (!isRealAuthenticatedUser(nextUser)) {
      return existingProfile;
    }

    if (existingProfile) {
      return existingProfile;
    }

    const baseAvatar =
      nextUser.user_metadata?.avatar_url ??
      nextUser.user_metadata?.picture ??
      nextUser.user_metadata?.photo_url ??
      null;

    return upsertProfile({
      id: nextUser.id,
      fullName: deriveUserDisplayName(nextUser),
      email: nextUser.email ?? "",
      reminderOptIn: true,
      preferredLanguage: language,
      timeZone,
      avatarUrl: baseAvatar,
    });
  };

  useEffect(() => {
    if (simulationMode !== "real") {
      return;
    }

    const id = setInterval(() => {
      setClockNow(new Date());
    }, 60_000);

    return () => clearInterval(id);
  }, [simulationMode]);

  useEffect(() => {
    let cancelled = false;

    async function loadStandings() {
      try {
        const payload = await getWorldCupStandings({ season: 2026 });

        if (cancelled) {
          return;
        }

        setGroupStandings(normalizeApiStandings(payload, groups));
        setGroupStandingsStatus("live");
      } catch (error) {
        if (cancelled) {
          return;
        }

        setGroupStandings(buildFallbackStandings(groups));
        setGroupStandingsStatus("fallback");
      }
    }

    loadStandings();

    const id = setInterval(loadStandings, 5 * 60_000);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      const authState = await getCurrentSession();

      if (authState.user && isAnonymousUser(authState.user)) {
        await signOutUser();
      }

      if (!isMounted) {
        return;
      }

      setAuthUser(isRealAuthenticatedUser(authState.user) ? authState.user : null);
      setAuthReady(true);

      if (isRealAuthenticatedUser(authState.user)) {
        const [predictionResult, profileResult] = await Promise.all([
          loadStoredPredictions(),
          loadProfile(authState.user.id).catch(() => null),
        ]);

        if (!isMounted) {
          return;
        }

        setStorageMode(predictionResult.mode);
        setPredictions((current) => ({
          ...current,
          ...predictionResult.predictions,
        }));
        try {
          const ensuredProfile = await ensureProfileRow(authState.user, profileResult);
          if (!isMounted) {
            return;
          }
          setProfile(ensuredProfile);
        } catch (error) {
          console.error("Auto profile creation failed", error);
          setProfile(null);
          setAuthMessage(
            error.message?.includes("public.profiles")
              ? t("auth_profile_preparing")
              : error.message ?? t("auth_profile_error"),
          );
        }
      }
    }

    bootstrap();

    const unsubscribe = subscribeToAuthChanges(async ({ user: nextUser }) => {
      if (!isMounted) {
        return;
      }

      if (nextUser && isAnonymousUser(nextUser)) {
        await signOutUser();
        return;
      }

      setAuthUser(isRealAuthenticatedUser(nextUser) ? nextUser : null);

      if (isRealAuthenticatedUser(nextUser)) {
        const [predictionResult, profileResult] = await Promise.all([
          loadStoredPredictions(),
          loadProfile(nextUser.id).catch(() => null),
        ]);

        if (!isMounted) {
          return;
        }

        setStorageMode(predictionResult.mode);
        setPredictions((current) => ({
          ...current,
          ...predictionResult.predictions,
        }));
        try {
          const ensuredProfile = await ensureProfileRow(nextUser, profileResult);
          if (!isMounted) {
            return;
          }
          setProfile(ensuredProfile);
        } catch (error) {
          console.error("Auto profile creation failed", error);
          setProfile(null);
          setAuthMessage(
            error.message?.includes("public.profiles")
              ? t("auth_profile_preparing")
              : error.message ?? t("auth_profile_error"),
          );
        }
      } else {
        setProfile(null);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [language, timeZone]);

  useEffect(() => {
    const next = {};
    if (profile?.preferred_language) {
      next.language = profile.preferred_language;
    }
    if (profile?.timezone) {
      next.timeZone = profile.timezone;
    }
    if (next.language || next.timeZone) {
      setPreferences(next);
    }
  }, [profile?.preferred_language, profile?.timezone, setPreferences]);

  const handleGoogleSignIn = async () => {
    try {
      setLoadingProvider("google");
      setAuthMessage("");
      const { error } = await signInWithGoogle();

      if (error) {
        setAuthMessage(error.message);
      }
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleEmailSignIn = async (email) => {
    try {
      setLoadingProvider("email");
      setAuthMessage("");
      const { error } = await signInWithEmailOtp(email);

      if (error) {
        setAuthMessage(error.message);
        return;
      }

      setAuthMessage(t("auth_email_sent"));
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      setLoadingProvider("facebook");
      setAuthMessage("");
      const { error } = await signInWithFacebook();
      if (error) setAuthMessage(error.message);
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleSaveProfile = async ({
    fullName,
    email,
    favoriteTeam,
    avatarFile,
    avatarUrl,
    reminderOptIn,
    preferredLanguage,
    timeZone: nextTimeZone,
  }) => {
    if (!authUser) {
      return;
    }

    try {
      setProfileError("");
      setProfileSaveState("idle");
      setProfileSaving(true);
      let nextAvatarUrl =
        avatarUrl ?? authUser.user_metadata?.avatar_url ?? authUser.user_metadata?.picture ?? null;

      if (avatarFile) {
        nextAvatarUrl = await uploadAvatar(authUser.id, avatarFile);
      }

      const nextProfile = await updateProfilePreferences({
        id: authUser.id,
        fullName,
        favoriteTeam,
        avatarUrl: nextAvatarUrl,
        reminderOptIn,
        email,
        preferredLanguage,
        timeZone: nextTimeZone,
      });
      setProfile(nextProfile);
      setPreferences({
        language: nextProfile.preferred_language ?? preferredLanguage,
        timeZone: nextProfile.timezone ?? nextTimeZone,
      });
      setProfileSaveState("success");
    } catch (error) {
      console.error("Profile save failed", error);
      setProfileSaveState("error");
      setProfileError(
        error.message?.includes("public.profiles")
          ? "No pudimos guardar tu perfil todavía. Probá de nuevo en unos minutos."
          : error.message?.includes("avatars")
            ? "No pudimos subir la imagen. Probá con otra foto."
          : error.message ?? "No se pudo guardar el perfil.",
      );
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSaveProfilePreferences = async ({
    fullName,
    favoriteTeam,
    avatarFile,
    avatarUrl,
    reminderOptIn,
    email,
    preferredLanguage,
    timeZone: nextTimeZone,
  }) => {
    if (!authUser) {
      return;
    }

    try {
      setProfileError("");
      setProfileSaveState("idle");
      setProfileSaving(true);
      let nextAvatarUrl =
        avatarUrl ?? profile?.avatar_url ?? authUser.user_metadata?.avatar_url ?? authUser.user_metadata?.picture ?? null;

      if (avatarFile) {
        nextAvatarUrl = await uploadAvatar(authUser.id, avatarFile);
      }

      const nextProfile = await updateProfilePreferences({
        id: authUser.id,
        fullName,
        favoriteTeam,
        avatarUrl: nextAvatarUrl,
        reminderOptIn,
        email,
        preferredLanguage,
        timeZone: nextTimeZone,
      });
      setProfile(nextProfile);
      setPreferences({
        language: nextProfile.preferred_language ?? preferredLanguage,
        timeZone: nextProfile.timezone ?? nextTimeZone,
      });
      setProfileSaveState("success");
    } catch (error) {
      console.error("Profile update failed", error);
      setProfileSaveState("error");
      setProfileError(
        error.message?.includes("public.profiles")
          ? "No pudimos actualizar tu perfil todavía. Probá de nuevo en unos minutos."
          : error.message?.includes("avatars")
            ? "No pudimos subir la imagen. Probá con otra foto."
          : error.message ?? "No se pudo actualizar el perfil.",
      );
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePredictionChange = (matchId, team, value) => {
    const numericValue = value.replace(/[^\d]/g, "").slice(0, 2);

    setPredictions((current) => {
      const currentPrediction = current[matchId];
      const match = upcomingMatches.find((item) => item.id === matchId);

      if (!match || getPredictionPhase(match, currentPrediction) !== "draft") {
        return current;
      }

      return {
        ...current,
        [matchId]: {
          ...currentPrediction,
          status: "draft",
          [team]: numericValue,
        },
      };
    });

    setSaveStates((current) => ({
      ...current,
      [matchId]: "pending",
    }));
  };

  const handlePersist = async (matchId, action) => {
    const match = upcomingMatches.find((item) => item.id === matchId);
    const prediction = predictions[matchId];

    if (!match || !prediction) {
      return;
    }

    const phase = getPredictionPhase(match, prediction);

    if (phase === "submitted" || phase === "locked") {
      return;
    }

    if (!hasPredictionScore(prediction)) {
      setSaveStates((current) => ({
        ...current,
        [matchId]: "error",
      }));
      return;
    }

    const nextPrediction = {
      ...prediction,
      status: action === "submit" ? "submitted" : "draft",
      submittedAt: action === "submit" ? new Date().toISOString() : prediction.submittedAt,
    };

    setSaveStates((current) => ({
      ...current,
      [matchId]: "saving",
    }));

    setPredictions((current) => ({
      ...current,
      [matchId]: nextPrediction,
    }));

    try {
      const result = await persistPrediction(matchId, nextPrediction, action);
      setStorageMode(result.mode);
      setSaveStates((current) => ({
        ...current,
        [matchId]: action === "submit" ? "submitted" : "saved",
      }));
    } catch (error) {
      console.error("Prediction save failed", error);
      setSaveStates((current) => ({
        ...current,
        [matchId]: "error",
      }));
    }
  };

  const handleSaveDraft = (matchId) => handlePersist(matchId, "draft");
  const handleSubmitPrediction = (matchId) => handlePersist(matchId, "submit");

  const handleReopenPrediction = async (matchId) => {
    const match = upcomingMatches.find((item) => item.id === matchId);
    const prediction = predictions[matchId];

    if (!match || !prediction) {
      return;
    }

    const nextPrediction = {
      ...prediction,
      status: "draft",
      submittedAt: null,
    };

    setSaveStates((current) => ({
      ...current,
      [matchId]: "saving",
    }));

    setPredictions((current) => ({
      ...current,
      [matchId]: nextPrediction,
    }));

    try {
      const result = await persistPrediction(matchId, nextPrediction, "draft");
      setStorageMode(result.mode);
      setSaveStates((current) => ({
        ...current,
        [matchId]: "saved",
      }));
    } catch (error) {
      console.error("Prediction reopen failed", error);
      setSaveStates((current) => ({
        ...current,
        [matchId]: "error",
      }));
    }
  };

  const handleOpenTeamGroup = (team) => {
    if (!team?.code) {
      return;
    }

    const group = groups.find((item) => item.teams.some((candidate) => candidate.code === team.code));
    setGroupFocus({
      groupId: group?.id ?? null,
      teamCode: team.code,
    });
    setActiveTab("grupos");
  };

  const simulatedNow = useMemo(() => {
    if (simulationMode === "opening") {
      return new Date("2026-06-11T15:00:00Z");
    }

    if (simulationMode === "live") {
      return new Date("2026-06-11T20:07:00Z");
    }

    return null;
  }, [simulationMode]);

  const effectiveNow = simulatedNow ?? clockNow;
  const displayMatches = useMemo(() => buildSimulatedMatches(simulationMode), [simulationMode]);
  const activeLiveData = simulationMode === "live" ? mockLiveMatchData : liveMatchData;

  useEffect(() => {
    if (simulationMode !== "real" || !import.meta.env.VITE_API_SPORTS_KEY) {
      return;
    }

    const currentIso = effectiveNow.toISOString().slice(0, 10);
    const prevIso = new Date(effectiveNow.getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const nextIso = new Date(effectiveNow.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const targetDates = [...new Set([prevIso, currentIso, nextIso])];
    let cancelled = false;

    async function resolveFixtures() {
      try {
        const results = await Promise.all(
          targetDates.map((date) => getWorldCupFixturesByDate({ season: 2026, date })),
        );

        if (cancelled) {
          return;
        }

        const fixtures = results.flatMap((result) => result.response ?? []);
        const nextMap = {};

        displayMatches.forEach((match) => {
          const localHome = normalizeTeamName(match.homeTeam?.name);
          const localAway = normalizeTeamName(match.awayTeam?.name);
          const localDate = match.kickoffUtc?.slice(0, 10);

          const candidate = fixtures.find((fixture) => {
            const apiHome = normalizeTeamName(fixture.teams?.home?.name);
            const apiAway = normalizeTeamName(fixture.teams?.away?.name);
            const apiDate = fixture.fixture?.date?.slice(0, 10);

            return localHome === apiHome && localAway === apiAway && localDate === apiDate;
          });

          if (candidate?.fixture?.id) {
            nextMap[match.id] = candidate.fixture.id;
          }
        });

        setResolvedFixtureIds(nextMap);
      } catch (error) {
        console.error("Fixture id resolution failed", error);
      }
    }

    resolveFixtures();

    return () => {
      cancelled = true;
    };
  }, [displayMatches, effectiveNow, simulationMode]);

  const enrichedMatches = useMemo(
    () =>
      displayMatches.map((m) => ({
        ...m,
        apiSportsFixtureId: resolvedFixtureIds[m.id] ?? null,
        status: activeLiveData[m.id]?.status ?? "SCHEDULED",
        score: activeLiveData[m.id]?.score ?? null,
        minute: activeLiveData[m.id]?.minute ?? null,
        events: activeLiveData[m.id]?.events ?? [],
        stats: activeLiveData[m.id]?.stats ?? null,
        lineups: activeLiveData[m.id]?.lineups ?? null,
      })),
    [activeLiveData, displayMatches, resolvedFixtureIds]
  );

  const nowTs = effectiveNow.getTime();
  const tournamentIsActive = nowTs >= TOURNAMENT_START_TS && nowTs <= TOURNAMENT_END_TS;

  const dashboardMatches = useMemo(() => {
    if (!tournamentIsActive) {
      return enrichedMatches.slice(0, 4);
    }
    const todayKey = getLocalDayKey(effectiveNow, timeZone);
    const todays = enrichedMatches.filter(
      (m) => m.kickoffUtc && getLocalDayKey(new Date(m.kickoffUtc), timeZone) === todayKey
    );
    const live = todays.filter((m) => m.status === "LIVE" || m.status === "HT" || m.status === "1H" || m.status === "2H");
    const scheduled = todays
      .filter((m) => m.status === "SCHEDULED")
      .sort((a, b) => new Date(a.kickoffUtc) - new Date(b.kickoffUtc));
    const finished = todays.filter((m) => m.status === "FINISHED" || m.status === "FT" || m.status === "AET");
    return [...live, ...scheduled, ...finished];
  }, [effectiveNow, enrichedMatches, tournamentIsActive, timeZone]);

  const liveCount = dashboardMatches.filter(
    (m) => m.status === "LIVE" || m.status === "HT" || m.status === "1H" || m.status === "2H"
  ).length;
  const finishedStartIndex = dashboardMatches.findIndex(
    (m) => m.status === "FINISHED" || m.status === "FT" || m.status === "AET"
  );
  const dashboardDateLabel = effectiveNow.toLocaleDateString(language, {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone,
  });

  const currentScreen = useMemo(() => {
    if (activeTab === "grupos") {
      return (
        <GroupsScreen
          groups={groups}
          groupStandings={groupStandings}
          standingsStatus={groupStandingsStatus}
          favoriteTeam={profile?.favorite_team ?? null}
          focusedGroupId={groupFocus.groupId}
          focusedTeamCode={groupFocus.teamCode}
          matches={upcomingMatches}
        />
      );
    }

    if (activeTab === "sedes") {
      return <HostCitiesScreen matches={displayMatches} />;
    }

    if (activeTab === "live") {
      return <LiveScreen isActive />;
    }

    if (activeTab === "predicciones") {
      return (
        <PredictionsScreen
          matches={enrichedMatches}
          predictions={predictions}
          saveStates={saveStates}
          onPredictionChange={handlePredictionChange}
          onSaveDraft={handleSaveDraft}
          onReopenPrediction={handleReopenPrediction}
          onSubmitPrediction={handleSubmitPrediction}
          onTeamSelect={handleOpenTeamGroup}
          onGoToGroups={() => setActiveTab("grupos")}
        />
      );
    }

    if (activeTab === "mispicks") {
      return (
        <MyPredictionsScreen
          matches={enrichedMatches}
          predictions={predictions}
          onReopenPrediction={handleReopenPrediction}
          onGoToPredictionCenter={() => setActiveTab("predicciones")}
        />
      );
    }

    if (activeTab === "eliminatorias") {
      return <KnockoutBracketScreen groupStandings={groupStandings} standingsStatus={groupStandingsStatus} />;
    }

    if (activeTab === "ranking") {
      return (
        <RankingScreen
          matches={enrichedMatches}
          predictions={predictions}
          groups={groups}
          currentUser={{
            id: authUser?.id ?? null,
            name: profile?.full_name ?? authUser?.user_metadata?.full_name ?? authUser?.email ?? user.name,
            avatar: profile?.avatar_url ?? authUser?.user_metadata?.avatar_url ?? authUser?.user_metadata?.picture ?? null,
            favoriteTeam: profile?.favorite_team ?? null,
          }}
        />
      );
    }

    return (
      <>
        <section className="mt-8">
          <div className="panel relative overflow-hidden p-5 sm:p-6">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-neon-400 via-gold-300 to-sky-400" />
            <div className="absolute -right-16 top-10 h-44 w-44 rounded-full bg-red-500/10 blur-3xl" />
            <div className="absolute -left-10 bottom-6 h-36 w-36 rounded-full bg-gold-300/10 blur-3xl" />
            <span className="chip">{t("tournament.metadata.snapshot")}</span>
            <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-md">
                <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-gold-300">
                  {t("hero_hosts")}
                </p>
                <h1 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
                  {t("hero_title")}
                </h1>
                <p className="mt-3 text-sm leading-6 text-slate-300">{t("hero_description")}</p>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">{t("hero_venues")}</p>
                    <p className="mt-2 text-sm font-semibold text-white">{t("hero_venues_desc")}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">{t("hero_format")}</p>
                    <p className="mt-2 text-sm font-semibold text-white">{t("hero_format_desc")}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">{t("hero_goal")}</p>
                    <p className="mt-2 text-sm font-semibold text-white">{t("hero_goal_desc")}</p>
                  </div>
                </div>
              </div>

              <div className="mx-auto w-full max-w-[420px] lg:mx-0 lg:max-w-[500px]">
                <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.16),transparent_40%),linear-gradient(180deg,rgba(0,0,0,0.3),rgba(15,23,42,0.28))] p-5 shadow-[0_28px_70px_rgba(2,6,23,0.48)] backdrop-blur-md">
                  <div className="absolute inset-0 rounded-[36px] ring-1 ring-inset ring-white/5" />
                  <div className="absolute inset-x-8 bottom-2 h-20 rounded-full bg-emerald-400/10 blur-3xl" />
                  <BrandLogo
                    alt={t("ui.brand.title")}
                    className="relative z-10 mx-auto h-auto w-full max-w-[280px] object-contain sm:max-w-[320px] lg:max-w-[360px]"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="panel-soft px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t("stat_matches")}</p>
                <p className="mt-1 text-lg font-extrabold text-white">{tournamentMeta.groupStageMatches}</p>
              </div>
              <div className="panel-soft px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t("stat_teams")}</p>
                <p className="mt-1 text-lg font-extrabold text-white">{tournamentMeta.teams}</p>
              </div>
              <div className="panel-soft px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t("stat_dates")}</p>
                <p className="mt-1 text-lg font-extrabold text-neon-400">{tournamentMeta.dates}</p>
              </div>
            </div>

          </div>
        </section>

        <MyTeamSection
          favoriteTeam={profile?.favorite_team ?? null}
          groups={groups}
          matches={displayMatches}
          onGoToPredictions={() => setActiveTab("predicciones")}
        />

        <ChampionPrediction
          userId={authUser?.id}
          groups={groups}
        />

        <ProfilePreferencesCard
          user={authUser}
          profile={profile}
          groups={groups}
          onSave={handleSaveProfilePreferences}
          saving={profileSaving}
          saveState={profileSaveState}
          errorMessage={profileError}
          preferredLanguage={profile?.preferred_language ?? language}
          timeZone={profile?.timezone ?? timeZone}
        />

        <section className="mt-8">
          {liveCount > 0 ? (
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <h2 className="text-white text-xl font-bold">{t("dashboard_liveNow")}</h2>
              <span className="text-red-400 text-sm">{t("ui.label.matchesCount", { count: liveCount })}</span>
            </div>
          ) : tournamentIsActive ? (
            <SectionTitle
              title={t("dashboard_todayMatches")}
              description={
                dashboardMatches.length > 0
                  ? t("dashboard_daySummary", { count: dashboardMatches.length, date: dashboardDateLabel })
                  : t("dashboard_todayNone")
              }
            />
          ) : (
            <SectionTitle
              title={t("upcoming_matches")}
              description={t("upcoming_matches_desc")}
            />
          )}
          <div className="mt-4 space-y-4">
            {dashboardMatches.map((match, index) => (
              <div key={match.id}>
                {finishedStartIndex > 0 && index === finishedStartIndex ? (
                  <div className="mb-4 flex items-center gap-3">
                    <div className="h-px flex-1 bg-white/5" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                      {t("dashboard_finishedSeparator")}
                    </span>
                    <div className="h-px flex-1 bg-white/5" />
                  </div>
                ) : null}
                {match.status === "SCHEDULED" ? (
                  <CompactPredictionCard
                    match={match}
                    prediction={predictions[match.id]}
                    saveState={saveStates[match.id]}
                    onPredictionChange={handlePredictionChange}
                    onSaveDraft={handleSaveDraft}
                    onReopenPrediction={handleReopenPrediction}
                    onSubmitPrediction={handleSubmitPrediction}
                    onTeamSelect={handleOpenTeamGroup}
                  />
                ) : (
                  <UpcomingMatchCard
                    match={match}
                    prediction={predictions[match.id]}
                    saveState={saveStates[match.id]}
                    liveData={activeLiveData[match.id] ?? null}
                    onPredictionChange={handlePredictionChange}
                    onSaveDraft={handleSaveDraft}
                    onReopenPrediction={handleReopenPrediction}
                    onSubmitPrediction={handleSubmitPrediction}
                    onTeamSelect={handleOpenTeamGroup}
                  />
                )}
              </div>
            ))}
            {tournamentIsActive && dashboardMatches.length === 0 ? (
              <div className="rounded-3xl border border-white/8 bg-white/[0.03] px-5 py-6 text-sm text-slate-400">
                {t("dashboard_todayNone")}
              </div>
            ) : null}
          </div>
        </section>

        <section className="mt-8">
          <SectionTitle
            title={t("ranking_title")}
            description={t("ranking_home_desc")}
          />
          <div className="panel overflow-hidden p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-emerald-300">
                  {t("ranking_live_badge")}
                </p>
                <h3 className="mt-2 font-display text-2xl font-bold text-white">
                  {t("ranking_home_title")}
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">{t("ranking_home_body")}</p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab("ranking")}
                className="rounded-2xl border border-emerald-400/20 bg-emerald-500/12 px-4 py-4 text-left transition hover:border-emerald-400/30 hover:bg-emerald-500/18"
              >
                <p className="text-[10px] uppercase tracking-[0.24em] text-emerald-300">{t("ranking_cta_badge")}</p>
                <p className="mt-2 text-lg font-extrabold text-white">{t("ranking_cta_title")}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                  {t("ranking_cta_body")}
                </p>
              </button>
            </div>
          </div>
        </section>
      </>
    );
  }, [
    activeTab,
    authUser,
    language,
    predictions,
    profile,
    profileError,
    profileSaveState,
    profileSaving,
    groupFocus.groupId,
    groupFocus.teamCode,
    saveStates,
    t,
    timeZone,
    dashboardMatches,
    liveCount,
    activeLiveData,
    tournamentIsActive,
    simulationMode,
    displayMatches,
    groupStandings,
    groupStandingsStatus,
  ]);

  if (!authReady) {
    return <div className="min-h-screen bg-slate-950" />;
  }

  if (!authUser) {
    return (
      <div className="min-h-screen bg-pitch">
        <AuthScreen
          onGoogleSignIn={handleGoogleSignIn}
          onFacebookSignIn={handleFacebookSignIn}
          onEmailSignIn={handleEmailSignIn}
          authMessage={authMessage}
          loadingProvider={loadingProvider}
          onShowPrivacy={() => setLegalScreen("privacy")}
          onShowTerms={() => setLegalScreen("terms")}
        />
        {legalScreen === "privacy" && <PrivacyPolicyScreen onClose={() => setLegalScreen(null)} />}
        {legalScreen === "terms" && <TermsScreen onClose={() => setLegalScreen(null)} />}
      </div>
    );
  }

  if (!profile?.full_name && !isAdminUser(authUser)) {
    return (
      <div className="min-h-screen bg-pitch">
        <ProfileCompletionCard
          user={authUser}
          groups={groups}
          onSaveProfile={handleSaveProfile}
          saving={profileSaving}
          errorMessage={profileError}
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-pitch">
      <TopNav
        activeTab={activeTab}
        onChange={setActiveTab}
        onSignOut={signOutUser}
        onSearchTeam={handleOpenTeamGroup}
        groups={groups}
        user={{
          name: profile?.full_name ?? authUser.user_metadata?.full_name ?? authUser.email ?? user.name,
          avatar: profile?.avatar_url ?? authUser.user_metadata?.avatar_url ?? authUser.user_metadata?.picture ?? null,
        }}
        onShowPrivacy={() => setLegalScreen("privacy")}
        onShowTerms={() => setLegalScreen("terms")}
        onDeleteAccount={() => setShowDeleteAccount(true)}
      />

      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-28 pt-4 sm:max-w-xl lg:max-w-5xl lg:px-6">
        <div className="absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(circle_at_top,rgba(60,235,123,0.18),transparent_40%)]" />

        <DashboardHeader
          user={{
            ...user,
            points: tournamentMeta.hasStarted ? user.points : 0,
            name: profile?.full_name ?? authUser.user_metadata?.full_name ?? authUser.email ?? user.name,
            avatar: profile?.avatar_url ?? authUser.user_metadata?.avatar_url ?? authUser.user_metadata?.picture ?? null,
          favoriteTeam: profile?.favorite_team ?? null,
        }}
        groups={groups}
        tournamentStarted={tournamentMeta.hasStarted || simulationMode === "live"}
      />
        <SmartBanner enrichedMatches={enrichedMatches} nowOverride={simulatedNow} />
        {currentScreen}
      </main>

      <BottomNav activeTab={activeTab} onChange={setActiveTab} />

      {legalScreen === "privacy" && <PrivacyPolicyScreen onClose={() => setLegalScreen(null)} />}
      {legalScreen === "terms" && <TermsScreen onClose={() => setLegalScreen(null)} />}
      {showDeleteAccount && authUser && (
        <DeleteAccountModal
          user={authUser}
          onClose={() => setShowDeleteAccount(false)}
          onDeleted={() => setShowDeleteAccount(false)}
        />
      )}
    </div>
  );
}

export default App;
