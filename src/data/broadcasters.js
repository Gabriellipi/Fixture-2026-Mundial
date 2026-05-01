export const BROADCASTERS = {
  MX: { name: "México", flag: "🇲🇽", channels: ["Las Estrellas", "Canal 5", "NUEVE", "TUDN", "ViX"] },
  AR: { name: "Argentina", flag: "🇦🇷", channels: ["TyC Sports", "TV Pública", "Disney+"] },
  CO: { name: "Colombia", flag: "🇨🇴", channels: ["RCN", "Win Sports", "Caracol"] },
  PE: { name: "Perú", flag: "🇵🇪", channels: ["América TV", "Movistar Deportes"] },
  CL: { name: "Chile", flag: "🇨🇱", channels: ["Canal 13", "TVN", "TNT Sports"] },
  ES: { name: "España", flag: "🇪🇸", channels: ["RTVE", "Telecinco", "DAZN"] },
  US: { name: "EEUU (español)", flag: "🇺🇸", channels: ["Telemundo", "Universo", "Peacock"] },
  BR: { name: "Brasil", flag: "🇧🇷", channels: ["Globo", "SporTV", "Globoplay"] },
  FR: { name: "Francia", flag: "🇫🇷", channels: ["TF1", "beIN Sports"] },
  DE: { name: "Alemania", flag: "🇩🇪", channels: ["ARD", "ZDF", "MagentaTV"] },
  IL: { name: "Israel", flag: "🇮🇱", channels: ["KAN", "Sport 5"] },
};

export const COUNTRY_TIMEZONES = {
  MX: "America/Mexico_City",
  AR: "America/Argentina/Buenos_Aires",
  CO: "America/Bogota",
  PE: "America/Lima",
  CL: "America/Santiago",
  ES: "Europe/Madrid",
  US: "America/New_York",
  BR: "America/Sao_Paulo",
  FR: "Europe/Paris",
  DE: "Europe/Berlin",
  IL: "Asia/Jerusalem",
};

export const DEFAULT_FIXTURE_COUNTRY = "MX";
export const FIXTURE_COUNTRY_STORAGE_KEY = "fixture_country";

export function getBroadcasterCountryOptions() {
  return Object.entries(BROADCASTERS).map(([code, value]) => ({
    code,
    ...value,
  }));
}

export function getBroadcasterCountry(code) {
  return BROADCASTERS[code] ?? BROADCASTERS[DEFAULT_FIXTURE_COUNTRY];
}

export function detectFixtureCountry(languageTag = "") {
  const normalized = String(languageTag).toLowerCase();
  const regionMatch = normalized.match(/-([a-z]{2})\b/);
  const regionCode = regionMatch?.[1]?.toUpperCase();

  if (regionCode && BROADCASTERS[regionCode]) {
    return regionCode;
  }

  if (normalized.startsWith("es-mx")) return "MX";
  if (normalized.startsWith("es-ar")) return "AR";
  if (normalized.startsWith("es-co")) return "CO";
  if (normalized.startsWith("es-pe")) return "PE";
  if (normalized.startsWith("es-cl")) return "CL";
  if (normalized.startsWith("es-es")) return "ES";
  if (normalized.startsWith("es-us") || normalized.startsWith("en-us")) return "US";
  if (normalized.startsWith("pt-br")) return "BR";
  if (normalized.startsWith("fr")) return "FR";
  if (normalized.startsWith("de")) return "DE";
  if (normalized.startsWith("he-il") || normalized.startsWith("en-il")) return "IL";

  return DEFAULT_FIXTURE_COUNTRY;
}

export function getCountryTimeZone(code) {
  return COUNTRY_TIMEZONES[code] ?? COUNTRY_TIMEZONES[DEFAULT_FIXTURE_COUNTRY];
}
