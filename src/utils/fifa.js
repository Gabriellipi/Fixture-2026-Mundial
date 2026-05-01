const LANGUAGE_SEGMENTS = {
  es: "es",
  en: "en",
  he: "en",
};

export function buildFifaScoresFixturesUrl(language = "en", regionCode = "US") {
  const languageSegment = LANGUAGE_SEGMENTS[language] ?? "en";
  const normalizedRegion = regionCode && regionCode !== "001" ? regionCode : "US";

  return `https://www.fifa.com/${languageSegment}/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures?country=${normalizedRegion}&wtw-filter=ALL`;
}
