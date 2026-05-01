// Dev-only mock data for testing live match UI states.
// Activate via the "Simular partidos en vivo" toggle in profile (import.meta.env.DEV only).
export const mockLiveMatches = [
  {
    id: 1,
    status: "LIVE",
    minute: 67,
    score: { home: 2, away: 1 },
    events: [
      { id: "1-goal-18", type: "goal", team: "home", minute: 18, player: "S. Gimenez", detail: "1-0" },
      { id: "1-yellow-34", type: "yellow-card", team: "away", minute: 34, player: "T. Mokoena" },
      { id: "1-goal-51", type: "goal", team: "home", minute: 51, player: "A. Vega", assist: "E. Alvarez", detail: "2-0" },
      { id: "1-goal-67", type: "goal", team: "away", minute: 67, player: "L. Foster", detail: "2-1" },
      { id: "1-sub-70", type: "substitution", team: "away", minute: 70, player: "T. Zwane", playerOut: "M. Mayambela" },
    ],
    stats: {
      possession: { home: 61, away: 39 },
      shotsOnTarget: { home: 6, away: 3 },
      corners: { home: 5, away: 2 },
    },
    lineups: {
      home: {
        formation: "4-3-3",
        starters: ["Malagon", "Sanchez", "Montes", "Vasquez", "Arteaga", "E. Alvarez", "Chavez", "Pineda", "A. Vega", "S. Gimenez", "Lozano"],
        bench: ["Rangel", "Araujo", "Orbelin", "Quiñones", "Martin"],
      },
      away: {
        formation: "4-2-3-1",
        starters: ["Williams", "Mudau", "Kekana", "Xulu", "Modiba", "Mokoena", "Sithole", "Mayambela", "Zwane", "Tau", "Foster"],
        bench: ["Mothwa", "Ngezana", "Appollis", "Maseko", "Rayners"],
      },
    },
  },
  {
    id: 2,
    status: "HT",
    minute: 45,
    score: { home: 0, away: 0 },
    events: [
      { id: "2-yellow-12", type: "yellow-card", team: "home", minute: 12, player: "H. Son" },
      { id: "2-yellow-40", type: "yellow-card", team: "away", minute: 40, player: "T. Holes" },
    ],
    stats: {
      possession: { home: 48, away: 52 },
      shotsOnTarget: { home: 2, away: 2 },
      corners: { home: 1, away: 4 },
    },
    lineups: {
      home: {
        formation: "4-2-3-1",
        starters: ["Kim", "Lee", "Cho", "Hwang", "Son", "Jung", "Park", "Kang", "Yoon", "Choi", "Han"],
        bench: ["Song", "Moon", "Na", "Bae", "Oh"],
      },
      away: {
        formation: "3-4-2-1",
        starters: ["Stanek", "Coufal", "Krejci", "Holes", "Soucek", "Provod", "Cerny", "Barak", "Kral", "Lingr", "Schick"],
        bench: ["Mandous", "Masopust", "Jurecka", "Hlozek", "Sevcik"],
      },
    },
  },
  {
    id: 3,
    status: "FINISHED",
    minute: 90,
    score: { home: 1, away: 3 },
  },
];

export const mockLiveMatchData = Object.fromEntries(
  mockLiveMatches.map((match) => [
    match.id,
    {
      status: match.status,
      minute: match.minute,
      score: match.score,
      events: match.events ?? [],
      stats: match.stats ?? null,
      lineups: match.lineups ?? null,
    },
  ]),
);
