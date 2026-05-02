import { useEffect, useState } from "react";
import { zonedDateToUtc } from "../utils/dateTime";
import { useAppLocale } from "../context/AppLocaleContext";

const KICKOFF_TIME = "22:00";
const KICKOFF_TIME_ZONE = "UTC";
const KICKOFF = zonedDateToUtc("2026-06-11", KICKOFF_TIME, KICKOFF_TIME_ZONE);

function pad(n) {
  return String(n).padStart(2, "0");
}

function getTimeLeft() {
  const diff = Math.max(0, KICKOFF.getTime() - Date.now());
  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    over: diff === 0,
  };
}

export default function CountdownBanner() {
  const { t } = useAppLocale();
  const [time, setTime] = useState(getTimeLeft);

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const units = [
    { value: time.days, label: t("countdown_days") },
    { value: pad(time.hours), label: t("countdown_hours") },
    { value: pad(time.minutes), label: t("countdown_minutes") },
    { value: pad(time.seconds), label: t("countdown_seconds") },
  ];

  return (
    <div className="sticky top-0 z-30 -mx-4 mt-4 border-y border-emerald-300/20 bg-[#16a34a] text-white shadow-[0_16px_35px_rgba(22,163,74,0.28)] backdrop-blur-md sm:-mx-6 lg:-mx-6">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <p className="shrink-0 max-w-[80px] text-[9px] font-semibold uppercase leading-tight tracking-[0.22em] text-white/75 sm:max-w-none sm:text-[10px] sm:tracking-[0.28em]">
          {t("countdown_label")}
        </p>

        {time.over ? (
          <p className="font-display text-xl font-bold text-white sm:text-2xl">{t("mundialComenzo")}</p>
        ) : (
          <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
            {units.map(({ value, label }) => (
              <div
                key={label}
                className="flex flex-col items-center rounded-xl bg-black/15 px-2 py-1.5 sm:rounded-2xl sm:px-3 sm:py-2.5"
              >
                <span className="font-display text-xl font-bold tabular-nums text-white sm:text-2xl md:text-4xl">
                  {value}
                </span>
                <span className="mt-0.5 text-[8px] uppercase tracking-[0.16em] text-white/65 sm:mt-1 sm:text-[9px] sm:tracking-[0.24em]">
                  {label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
