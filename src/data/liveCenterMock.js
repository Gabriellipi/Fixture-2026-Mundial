function buildKickoffFromNow(minutesFromNow) {
  return new Date(Date.now() + minutesFromNow * 60 * 1000).toISOString();
}

export const mockLiveCenterData = {
  live: [
    {
      id: "live-1",
      fixture: {
        id: 910001,
        date: buildKickoffFromNow(-68),
        status: { short: "2H", elapsed: 68 },
      },
      league: {
        name: "FIFA World Cup 2026",
        round: "Group Stage - A",
      },
      teams: {
        home: { id: 16, name: "Mexico", logo: "https://media.api-sports.io/football/teams/16.png" },
        away: { id: 1517, name: "South Africa", logo: "https://media.api-sports.io/football/teams/1517.png" },
      },
      goals: { home: 2, away: 1 },
      statistics: [
        { type: "Ball Possession", home: "61%", away: "39%" },
        { type: "Shots on Goal", home: 6, away: 3 },
        { type: "Total Shots", home: 12, away: 8 },
      ],
    },
    {
      id: "live-2",
      fixture: {
        id: 910002,
        date: buildKickoffFromNow(-47),
        status: { short: "HT", elapsed: 45 },
      },
      league: {
        name: "FIFA World Cup 2026",
        round: "Group Stage - B",
      },
      teams: {
        home: { id: 1577, name: "South Korea", logo: "https://media.api-sports.io/football/teams/1577.png" },
        away: { id: 770, name: "Czech Republic", logo: "https://media.api-sports.io/football/teams/770.png" },
      },
      goals: { home: 0, away: 0 },
      statistics: [
        { type: "Ball Possession", home: "48%", away: "52%" },
        { type: "Shots on Goal", home: 2, away: 2 },
        { type: "Total Shots", home: 7, away: 9 },
      ],
    },
    {
      id: "live-3",
      fixture: {
        id: 910003,
        date: buildKickoffFromNow(-83),
        status: { short: "2H", elapsed: 83 },
      },
      league: {
        name: "FIFA World Cup 2026",
        round: "Group Stage - C",
      },
      teams: {
        home: { id: 31, name: "Morocco", logo: "https://media.api-sports.io/football/teams/31.png" },
        away: { id: 6, name: "Croatia", logo: "https://media.api-sports.io/football/teams/6.png" },
      },
      goals: { home: 1, away: 1 },
      statistics: [
        { type: "Ball Possession", home: "44%", away: "56%" },
        { type: "Shots on Goal", home: 4, away: 5 },
        { type: "Total Shots", home: 10, away: 13 },
      ],
    },
  ],
  today: [
    {
      id: "today-1",
      fixture: {
        id: 910101,
        date: buildKickoffFromNow(24),
        status: { short: "NS", elapsed: null },
      },
      league: {
        name: "FIFA World Cup 2026",
        round: "Group Stage - D",
      },
      teams: {
        home: { id: 6, name: "Brazil", logo: "https://media.api-sports.io/football/teams/6.png" },
        away: { id: 26, name: "Argentina", logo: "https://media.api-sports.io/football/teams/26.png" },
      },
      goals: { home: null, away: null },
      statistics: [],
    },
    {
      id: "today-2",
      fixture: {
        id: 910102,
        date: buildKickoffFromNow(105),
        status: { short: "NS", elapsed: null },
      },
      league: {
        name: "FIFA World Cup 2026",
        round: "Group Stage - E",
      },
      teams: {
        home: { id: 25, name: "Germany", logo: "https://media.api-sports.io/football/teams/25.png" },
        away: { id: 12, name: "Japan", logo: "https://media.api-sports.io/football/teams/12.png" },
      },
      goals: { home: null, away: null },
      statistics: [],
    },
    {
      id: "today-3",
      fixture: {
        id: 910103,
        date: buildKickoffFromNow(190),
        status: { short: "NS", elapsed: null },
      },
      league: {
        name: "FIFA World Cup 2026",
        round: "Group Stage - F",
      },
      teams: {
        home: { id: 2, name: "France", logo: "https://media.api-sports.io/football/teams/2.png" },
        away: { id: 27, name: "Portugal", logo: "https://media.api-sports.io/football/teams/27.png" },
      },
      goals: { home: null, away: null },
      statistics: [],
    },
    {
      id: "today-4",
      fixture: {
        id: 910104,
        date: buildKickoffFromNow(278),
        status: { short: "NS", elapsed: null },
      },
      league: {
        name: "FIFA World Cup 2026",
        round: "Group Stage - G",
      },
      teams: {
        home: { id: 9, name: "Spain", logo: "https://media.api-sports.io/football/teams/9.png" },
        away: { id: 1118, name: "Netherlands", logo: "https://media.api-sports.io/football/teams/1118.png" },
      },
      goals: { home: null, away: null },
      statistics: [],
    },
    {
      id: "today-5",
      fixture: {
        id: 910105,
        date: buildKickoffFromNow(362),
        status: { short: "NS", elapsed: null },
      },
      league: {
        name: "FIFA World Cup 2026",
        round: "Group Stage - H",
      },
      teams: {
        home: { id: 2382, name: "United States", logo: "https://media.api-sports.io/football/teams/2382.png" },
        away: { id: 5529, name: "Canada", logo: "https://media.api-sports.io/football/teams/5529.png" },
      },
      goals: { home: null, away: null },
      statistics: [],
    },
  ],
};
