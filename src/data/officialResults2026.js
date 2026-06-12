const fallbackResults = [
  {
    id: 1,
    date: "2026-06-11",
    homeName: "Mexico",
    awayName: "South Africa",
    homeGoals: 2,
    awayGoals: 0,
    status: "FT",
    elapsed: 90,
  },
  {
    id: 2,
    date: "2026-06-12",
    homeName: "Korea Republic",
    awayName: "Czechia",
    homeGoals: 2,
    awayGoals: 1,
    status: "FT",
    elapsed: 90,
  },
];

const teamAliases = {
  Mexico: ["Mexico", "México"],
  "South Africa": ["South Africa", "Sudáfrica", "South Africa 2", "D. África"],
  "Korea Republic": ["Korea Republic", "Corea del Sur", "South Korea"],
  Czechia: ["Czechia", "Chequia", "Czech Republic"],
};

function buildTeam(name, idOffset) {
  return {
    id: 2026000 + idOffset,
    name,
    logo: "",
  };
}

export function getFallbackWorldCupFixturesByDate(date) {
  return fallbackResults
    .filter((result) => result.date === date)
    .map((result) => ({
      fixture: {
        id: result.id,
        date: `${result.date}T19:00:00.000Z`,
        status: {
          short: result.status,
          elapsed: result.elapsed,
        },
      },
      league: {
        id: 1,
        name: "FIFA World Cup",
        round: "Group Stage - 1",
        season: 2026,
      },
      teams: {
        home: buildTeam(result.homeName, result.id * 2),
        away: buildTeam(result.awayName, result.id * 2 + 1),
      },
      goals: {
        home: result.homeGoals,
        away: result.awayGoals,
      },
      score: {
        halftime: { home: null, away: null },
        fulltime: { home: result.homeGoals, away: result.awayGoals },
        extratime: { home: null, away: null },
        penalty: { home: null, away: null },
      },
      statistics: [],
      _fallback: true,
      _aliases: {
        home: teamAliases[result.homeName] ?? [result.homeName],
        away: teamAliases[result.awayName] ?? [result.awayName],
      },
    }));
}

export function getFallbackWorldCupLiveFixtures() {
  return [];
}

export function getFallbackWorldCupFixturePayload(params = {}) {
  if (params.live) {
    return { response: getFallbackWorldCupLiveFixtures() };
  }

  if (params.date) {
    return { response: getFallbackWorldCupFixturesByDate(params.date) };
  }

  return { response: fallbackResults.flatMap((result) => getFallbackWorldCupFixturesByDate(result.date)) };
}

export function getFallbackResultByMatchId(matchId) {
  return fallbackResults.find((result) => result.id === Number(matchId)) ?? null;
}
