function getFormatter(timeZone) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function getParts(date, timeZone) {
  const formatter = getFormatter(timeZone);
  const values = formatter.formatToParts(date).reduce((acc, part) => {
    if (part.type !== "literal") {
      acc[part.type] = part.value;
    }
    return acc;
  }, {});

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
  };
}

function getTimeZoneOffset(date, timeZone) {
  const parts = getParts(date, timeZone);
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );

  return asUtc - date.getTime();
}

export function zonedDateToUtc(dateIso, time, timeZone) {
  const [year, month, day] = dateIso.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const offset = getTimeZoneOffset(utcGuess, timeZone);

  return new Date(utcGuess.getTime() - offset);
}

export function getMatchKickoffInstant(match) {
  if (match?.kickoffUtc) {
    return new Date(match.kickoffUtc);
  }

  return zonedDateToUtc(match.dateIso, match.time, match.sourceTimeZone ?? "UTC");
}

export function getMatchKickoffDate(match) {
  return getMatchKickoffInstant(match);
}

export function getTimeZoneAbbreviation(date, timeZone, locale = "en") {
  if (!timeZone) return "";

  try {
    if (timeZone === "UTC") {
      return "UTC";
    }

    const shortName = new Intl.DateTimeFormat(locale, {
      timeZone,
      timeZoneName: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
      .formatToParts(date)
      .find((part) => part.type === "timeZoneName")?.value;

    if (!shortName || shortName.startsWith("GMT")) {
      const longEnglishName = new Intl.DateTimeFormat("en-US", {
        timeZone,
        timeZoneName: "long",
        hour: "2-digit",
        minute: "2-digit",
      })
        .formatToParts(date)
        .find((part) => part.type === "timeZoneName")?.value;

      if (longEnglishName) {
        const abbreviation = longEnglishName
          .split(" ")
          .filter(Boolean)
          .map((word) => word[0])
          .join("")
          .toUpperCase();

        if (abbreviation) {
          return abbreviation;
        }
      }
    }

    return shortName ?? timeZone;
  } catch {
    return timeZone;
  }
}

export function formatUserTimeZoneLabel(timeZone, date = new Date(), locale = "en") {
  if (!timeZone) return "";

  try {
    const offsetPart = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "shortOffset",
    })
      .formatToParts(date)
      .find((part) => part.type === "timeZoneName");
    const offset = offsetPart?.value ?? "";
    const abbreviation = getTimeZoneAbbreviation(date, timeZone, locale);

    const city = timeZone.split("/").pop()?.replace(/_/g, " ") ?? "";

    if (timeZone === "UTC" || !city) {
      return abbreviation || offset || timeZone;
    }

    if (abbreviation && abbreviation !== offset) {
      return `${abbreviation} · ${city}`;
    }

    return offset ? `${offset} · ${city}` : city;
  } catch {
    return timeZone;
  }
}
