function formatIcsDate(date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function formatIcsLocalDate(date, timeZone) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const parts = formatter.formatToParts(date).reduce((acc, part) => {
    if (part.type !== "literal") {
      acc[part.type] = part.value;
    }
    return acc;
  }, {});

  return `${parts.year}${parts.month}${parts.day}T${parts.hour}${parts.minute}${parts.second}`;
}

function escapeIcsText(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export function buildFixtureCalendarIcs(matches = [], timeZone = "UTC") {
  const now = formatIcsDate(new Date());
  const events = matches
    .filter((match) => match.kickoffUtc)
    .map((match) => {
      const start = new Date(match.kickoffUtc);
      const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
      const summary = `${match.homeTeam?.name ?? "Local"} vs ${match.awayTeam?.name ?? "Visitante"}`;
      const location = [match.stadium, match.venue].filter(Boolean).join(", ");
      const description = [
        "Fixture Digital 2026",
        match.groupId ? `Grupo ${match.groupId}` : null,
        location || null,
      ]
        .filter(Boolean)
        .join(" · ");

      return [
        "BEGIN:VEVENT",
        `UID:fixture-digital-${match.id}@fixturedigital2026.app`,
        `DTSTAMP:${now}`,
        `DTSTART;TZID=${timeZone}:${formatIcsLocalDate(start, timeZone)}`,
        `DTEND;TZID=${timeZone}:${formatIcsLocalDate(end, timeZone)}`,
        `SUMMARY:${escapeIcsText(summary)}`,
        `DESCRIPTION:${escapeIcsText(description)}`,
        `LOCATION:${escapeIcsText(location)}`,
        "END:VEVENT",
      ].join("\r\n");
    });

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Fixture Digital 2026//World Cup Schedule//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-TIMEZONE:${timeZone}`,
    ...events,
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadFixtureCalendar(matches = [], timeZone = "UTC") {
  const blob = new Blob([buildFixtureCalendarIcs(matches, timeZone)], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "fixture-digital-2026.ics";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
