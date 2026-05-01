import { getMatchKickoffDate } from "../utils/dateTime";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { translations } from "../i18n/translations";

const AppLocaleContext = createContext(null);

export function detectPreferredLanguage() {
  if (typeof navigator === "undefined") {
    return "es";
  }

  const locale = navigator.language?.toLowerCase() ?? "es";

  const prefixMap = [
    ["he", "he"],
    ["ar", "ar"],
    ["en", "en"],
    ["fr", "fr"],
    ["de", "de"],
    ["pt", "pt"],
    ["it", "it"],
    ["id", "id"],
    ["ko", "ko"],
    ["ja", "ja"],
  ];

  for (const [prefix, lang] of prefixMap) {
    if (locale.startsWith(prefix)) return lang;
  }

  return "es";
}

export function detectTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC";
  } catch {
    return "UTC";
  }
}

const TIMEZONE_REGION_FALLBACKS = {
  "Asia/Jerusalem": "IL",
  UTC: "001",
};

export function detectRegionCode(preferredTimeZone = detectTimeZone()) {
  if (typeof navigator !== "undefined") {
    const localeCandidates = [...(navigator.languages ?? []), navigator.language].filter(Boolean);

    for (const locale of localeCandidates) {
      try {
        if (typeof Intl?.Locale === "function") {
          const region = new Intl.Locale(locale).maximize().region;
          if (region) {
            return region;
          }
        }
      } catch {
        // fall back to basic parsing
      }

      const match = locale.match(/[-_](\w{2})$/i);
      if (match) {
        return match[1].toUpperCase();
      }
    }
  }

  return TIMEZONE_REGION_FALLBACKS[preferredTimeZone] ?? "US";
}

function interpolate(template, values) {
  return template.replace(/\{(\w+)\}/g, (_, key) => values?.[key] ?? "");
}

function getNestedValue(object, path) {
  return path.split(".").reduce((current, segment) => {
    if (current && typeof current === "object" && segment in current) {
      return current[segment];
    }
    return undefined;
  }, object);
}

const LANGUAGE_STORAGE_KEY = "preferredLanguage";
const TIMEZONE_STORAGE_KEY = "wc2026_timezone";
const SUPPORTED_LANGUAGES = ["es", "en", "fr", "de", "pt", "it", "id", "ko", "ja", "ar", "he"];

function readStoredLanguage() {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && SUPPORTED_LANGUAGES.includes(stored)) {
      return stored;
    }
  } catch {
    // localStorage inaccessible
  }
  return null;
}

function readStoredTimeZone() {
  try {
    return localStorage.getItem(TIMEZONE_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function AppLocaleProvider({ children }) {
  const [language, setLanguage] = useState(() => readStoredLanguage() ?? detectPreferredLanguage());
  const [timeZone, setTimeZone] = useState(() => readStoredTimeZone() ?? detectTimeZone());

  useEffect(() => {
    const dir = language === "he" || language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
    document.body.dir = dir;
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // ignore
    }
  }, [language]);

  useEffect(() => {
    try {
      localStorage.setItem(TIMEZONE_STORAGE_KEY, timeZone);
    } catch {
      // ignore
    }
  }, [timeZone]);

  const value = useMemo(() => {
    const dictionary = translations[language] ?? translations.es;
    const t = (key, values) => {
      const message = getNestedValue(dictionary, key) ?? dictionary[key] ?? getNestedValue(translations.es, key) ?? translations.es[key];
      if (message === undefined) {
        console.warn(`[i18n] Missing translation key: ${key}`);
        return key;
      }
      return typeof message === "string" ? interpolate(message, values) : key;
    };

    return {
      language,
      timeZone,
      regionCode: detectRegionCode(timeZone),
      dir: language === "he" || language === "ar" ? "rtl" : "ltr",
      isRTL: language === "he" || language === "ar",
      availableLanguages: SUPPORTED_LANGUAGES.map((code) => ({
        value: code,
        label: translations[code]?.languageName ?? code,
      })),
      setLanguage: (nextLanguage) => {
        if (nextLanguage && SUPPORTED_LANGUAGES.includes(nextLanguage)) {
          setLanguage(nextLanguage);
        }
      },
      setTimeZone: (nextTimeZone) => {
        if (nextTimeZone) {
          setTimeZone(nextTimeZone);
        }
      },
      setPreferences: ({ language: nextLanguage, timeZone: nextTimeZone }) => {
        if (nextLanguage) {
          setLanguage(nextLanguage);
        }
        if (nextTimeZone) {
          setTimeZone(nextTimeZone);
        }
      },
      t,
    };
  }, [language, timeZone]);

  return <AppLocaleContext.Provider value={value}>{children}</AppLocaleContext.Provider>;
}

export function useAppLocale() {
  const context = useContext(AppLocaleContext);

  if (!context) {
    throw new Error("useAppLocale must be used inside AppLocaleProvider");
  }

  return context;
}

export function formatMatchDate(match, language, timeZone) {
  return new Intl.DateTimeFormat(language, {
    day: "numeric",
    month: "short",
    timeZone,
  }).format(getMatchKickoffDate(match));
}

export function formatMatchTime(match, language, timeZone) {
  return new Intl.DateTimeFormat(language, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  }).format(getMatchKickoffDate(match));
}

export function formatDateLabel(dateIso, language, timeZone) {
  return new Intl.DateTimeFormat(language, {
    day: "numeric",
    month: "short",
    timeZone,
  }).format(new Date(`${dateIso}T12:00:00Z`));
}

export function getGroupLabel(groupId, t) {
  return t("tournament.group", { id: groupId });
}

export function getCountryName(team, t) {
  if (!team) {
    return "";
  }

  const localeKey = team.localeKey ?? team.code?.replace(/-/g, "_");
  return localeKey ? t(`country.${localeKey}`) : team.name;
}

export function resolveCountryIdentifier(value) {
  if (!value) {
    return null;
  }

  const normalizedKey = value.toUpperCase().replace(/-/g, "_");

  if (getNestedValue(translations.es.country, normalizedKey)) {
    return normalizedKey.replace(/_/g, "-");
  }

  const normalizedValue = value.trim().toLowerCase();

  for (const language of Object.keys(translations)) {
    const countryEntries = Object.entries(translations[language].country ?? {});
    const match = countryEntries.find(([, label]) => label.toLowerCase() === normalizedValue);

    if (match) {
      return match[0].replace(/_/g, "-");
    }
  }

  return null;
}
