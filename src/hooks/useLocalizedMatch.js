import { useMemo } from "react";
import { getCountryName, useAppLocale } from "../context/AppLocaleContext";
import { getBroadcasterCountry } from "../data/broadcasters";
import { buildFifaScoresFixturesUrl } from "../utils/fifa";
import { getMatchKickoffInstant, getTimeZoneAbbreviation } from "../utils/dateTime";

function getDateFormatOptions(language) {
  if (language === "he") {
    return { day: "numeric", month: "long", year: "numeric" };
  }

  if (language === "en") {
    return { month: "short", day: "numeric", year: "numeric" };
  }

  return { day: "numeric", month: "short", year: "numeric" };
}

function getRegionDisplayName(language, regionCode) {
  if (!regionCode || regionCode === "001") {
    return "Global";
  }

  try {
    return new Intl.DisplayNames([language], { type: "region" }).of(regionCode) ?? regionCode;
  } catch {
    return regionCode;
  }
}

export function useLocalizedMatch(match, selectedCountryCode) {
  const { language, timeZone, regionCode, t } = useAppLocale();

  return useMemo(() => {
    const kickoffDate = getMatchKickoffInstant(match);
    const homeTeamName = getCountryName(match.homeTeam, t);
    const awayTeamName = getCountryName(match.awayTeam, t);
    const displayTime = new Intl.DateTimeFormat(language, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone,
    }).format(kickoffDate);
    const displayDate = new Intl.DateTimeFormat(language, {
      ...getDateFormatOptions(language),
      timeZone,
    }).format(kickoffDate);
    const tzLabel = getTimeZoneAbbreviation(kickoffDate, timeZone, language);
    const activeCountryCode = selectedCountryCode ?? regionCode;
    const broadcasterCountry = getBroadcasterCountry(activeCountryCode);
    const localBroadcasters = broadcasterCountry.channels;
    const audienceRegionName = broadcasterCountry.name ?? getRegionDisplayName(language, activeCountryCode);
    const watchGuideUrl = buildFifaScoresFixturesUrl(language, activeCountryCode);

    return {
      homeTeamName,
      awayTeamName,
      displayTime,
      displayDate,
      tzLabel,
      kickoffDate,
      localBroadcasters,
      audienceRegionName,
      broadcasterCountry,
      watchGuideUrl,
    };
  }, [language, match, regionCode, selectedCountryCode, t, timeZone]);
}
