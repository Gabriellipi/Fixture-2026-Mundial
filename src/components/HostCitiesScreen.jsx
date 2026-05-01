import { ArrowUpRight, CalendarPlus, ExternalLink, MapPinned } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import SectionTitle from "./SectionTitle";
import { hostCountries } from "../data/hostCities";
import { downloadFixtureCalendar } from "../utils/calendar";
import { useAppLocale } from "../context/AppLocaleContext";
import {
  DEFAULT_FIXTURE_COUNTRY,
  FIXTURE_COUNTRY_STORAGE_KEY,
  detectFixtureCountry,
  getBroadcasterCountryOptions,
  getCountryTimeZone,
} from "../data/broadcasters";
import { formatUserTimeZoneLabel } from "../utils/dateTime";

function CountryChip({ country, active, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(country.code)}
      className={`shrink-0 rounded-full border px-3 py-2 text-sm transition ${
        active
          ? "border-emerald-300/40 bg-white/10 text-white shadow-[0_0_0_1px_rgba(110,231,183,0.16)]"
          : "border-white/10 bg-transparent text-slate-300 hover:bg-white/10"
      }`}
    >
      <span className="mr-2">{country.flag}</span>
      <span className="font-semibold">{country.name}</span>
    </button>
  );
}

function CityCard({ item, countryName }) {
  return (
    <article className="group overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/60">
      <div
        className="relative h-32 bg-cover bg-center sm:h-40"
        style={{ backgroundImage: item.image }}
      >
        <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/25 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/85 backdrop-blur-md">
          {countryName}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-base font-bold text-white">{item.city}</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-slate-400 sm:text-[11px] sm:tracking-[0.18em]">
              {item.stadium}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-2.5 text-emerald-300">
            <MapPinned size={16} />
          </div>
        </div>

        <a
          href={item.fifaUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-300 transition hover:text-white"
        >
          Ver en FIFA
          <ArrowUpRight size={14} />
        </a>
      </div>
    </article>
  );
}

function CountryShowcase({ country }) {
  return (
    <article className="panel overflow-hidden">
      <div
        className={`relative isolate overflow-hidden bg-gradient-to-br ${country.accentFrom} ${country.accentTo}`}
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-90"
          style={{ backgroundImage: country.heroImage }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_28%)]" />

        <div className="relative z-10 flex flex-col gap-6 p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-emerald-200/90">
                {country.spotlight}
              </p>
              <h4 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">{country.name}</h4>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-200">{country.description}</p>
            </div>

            <a
              href={country.fifaUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-black/25 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md transition hover:bg-black/40 sm:w-auto"
            >
              Fuente oficial FIFA
              <ExternalLink size={14} />
            </a>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {country.cities.map((item) => (
              <CityCard key={`${country.code}-${item.city}`} item={item} countryName={country.name} />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

function HostCitiesScreen({ matches = [] }) {
  const { t, language } = useAppLocale();
  const [selectedCountry, setSelectedCountry] = useState(DEFAULT_FIXTURE_COUNTRY);
  const countries = getBroadcasterCountryOptions();
  const calendarTimeZone = getCountryTimeZone(selectedCountry);
  const calendarTimeZoneLabel = formatUserTimeZoneLabel(calendarTimeZone, new Date(), language);

  useEffect(() => {
    const storedCountry = window.localStorage.getItem(FIXTURE_COUNTRY_STORAGE_KEY);
    const nextCountry = storedCountry || detectFixtureCountry(window.navigator.language);
    setSelectedCountry(nextCountry);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(FIXTURE_COUNTRY_STORAGE_KEY, selectedCountry);
  }, [selectedCountry]);

  const featuredCountries = useMemo(() => {
    if (!selectedCountry) {
      return hostCountries;
    }

    const selected = hostCountries.find((country) => country.code === selectedCountry);
    const rest = hostCountries.filter((country) => country.code !== selectedCountry);
    return selected ? [selected, ...rest] : hostCountries;
  }, [selectedCountry]);

  return (
    <section className="mt-8">
      <SectionTitle title={t("hosts_title")} description={t("hosts_desc")} />

      <div className="mt-4 panel overflow-hidden p-5 sm:p-6">
        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(16,185,129,0.12),rgba(2,6,23,0.82))] p-5 sm:p-6">
          <div className="absolute -right-10 top-0 h-40 w-40 rounded-full bg-red-500/15 blur-3xl" />
          <div className="absolute -left-8 bottom-0 h-36 w-36 rounded-full bg-emerald-400/12 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-emerald-300">
                FIFA WORLD CUP 2026
              </p>
              <h3 className="mt-2 font-display text-2xl font-bold text-white">{t("hosts_card_title")}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-200">{t("hosts_card_body")}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => downloadFixtureCalendar(matches, calendarTimeZone)}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-950 transition hover:bg-emerald-400"
              >
                <CalendarPlus size={16} />
                {t("hosts_download_calendar")}
              </button>

              <a
                href="https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/host-cities"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-white/10"
              >
                <ExternalLink size={16} />
                {t("hosts_open_fifa")}
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[28px] border border-white/10 bg-black/20 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                {t("hosts_calendar_country")}
              </p>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {countries.map((country) => (
                  <CountryChip
                    key={country.code}
                    country={country}
                    active={country.code === selectedCountry}
                    onSelect={setSelectedCountry}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-400">{t("hosts_calendar_timezone", { timezone: calendarTimeZoneLabel })}</p>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          {featuredCountries.map((country) => (
            <CountryShowcase key={country.code} country={country} />
          ))}
        </div>

        <p className="mt-5 text-xs leading-5 text-slate-500">{t("hosts_calendar_note")}</p>
      </div>
    </section>
  );
}

export default HostCitiesScreen;
