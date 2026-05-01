import { zonedDateToUtc } from "../utils/dateTime";

export const user = {
  name: "Gabriel",
  points: 0,
  avatar:
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80",
};

export const tournamentMeta = {
  name: "FIFA World Cup 2026",
  host: "Canadá, México y Estados Unidos",
  dates: "11 Jun - 19 Jul 2026",
  hasStarted: false,
  teams: 48,
  matches: 104,
  groupStageMatches: 72,
  dataSnapshot: "Datos oficiales FIFA al 16 Abr 2026",
};

const makeTeam = (name, code, fifaCode, flag, aliases = []) => ({
  name,
  code,
  isoCode: code,
  localeKey: code.replace(/-/g, "_"),
  fifaCode,
  flag,
  aliases,
});

export const groups = [
  {
    id: "A",
    teams: [
      makeTeam("Mexico", "MX", "MEX", "https://flagcdn.com/w80/mx.png", ["México"]),
      makeTeam("South Africa", "ZA", "RSA", "https://flagcdn.com/w80/za.png", ["Sudáfrica"]),
      makeTeam("Korea Republic", "KR", "KOR", "https://flagcdn.com/w80/kr.png", ["Corea del Sur"]),
      makeTeam("Czechia", "CZ", "CZE", "https://flagcdn.com/w80/cz.png", ["Chequia"]),
    ],
  },
  {
    id: "B",
    teams: [
      makeTeam("Canada", "CA", "CAN", "https://flagcdn.com/w80/ca.png", ["Canadá"]),
      makeTeam("Bosnia and Herzegovina", "BA", "BIH", "https://flagcdn.com/w80/ba.png", ["Bosnia y Herzegovina"]),
      makeTeam("Qatar", "QA", "QAT", "https://flagcdn.com/w80/qa.png", ["Catar"]),
      makeTeam("Switzerland", "CH", "SUI", "https://flagcdn.com/w80/ch.png", ["Suiza"]),
    ],
  },
  {
    id: "C",
    teams: [
      makeTeam("Brazil", "BR", "BRA", "https://flagcdn.com/w80/br.png", ["Brasil"]),
      makeTeam("Morocco", "MA", "MAR", "https://flagcdn.com/w80/ma.png", ["Marruecos"]),
      makeTeam("Haiti", "HT", "HAI", "https://flagcdn.com/w80/ht.png", ["Haití"]),
      makeTeam("Scotland", "GB-SCT", "SCO", "https://flagcdn.com/w80/gb-sct.png", ["Escocia"]),
    ],
  },
  {
    id: "D",
    teams: [
      makeTeam("United States", "US", "USA", "https://flagcdn.com/w80/us.png", ["Estados Unidos"]),
      makeTeam("Paraguay", "PY", "PAR", "https://flagcdn.com/w80/py.png"),
      makeTeam("Australia", "AU", "AUS", "https://flagcdn.com/w80/au.png"),
      makeTeam("Turkey", "TR", "TUR", "https://flagcdn.com/w80/tr.png", ["Turquía"]),
    ],
  },
  {
    id: "E",
    teams: [
      makeTeam("Germany", "DE", "GER", "https://flagcdn.com/w80/de.png", ["Alemania"]),
      makeTeam("Curacao", "CW", "CUW", "https://flagcdn.com/w80/cw.png", ["Curazao"]),
      makeTeam("Ivory Coast", "CI", "CIV", "https://flagcdn.com/w80/ci.png", ["Costa de Marfil"]),
      makeTeam("Ecuador", "EC", "ECU", "https://flagcdn.com/w80/ec.png"),
    ],
  },
  {
    id: "F",
    teams: [
      makeTeam("Netherlands", "NL", "NED", "https://flagcdn.com/w80/nl.png", ["Países Bajos"]),
      makeTeam("Japan", "JP", "JPN", "https://flagcdn.com/w80/jp.png", ["Japón"]),
      makeTeam("Sweden", "SE", "SWE", "https://flagcdn.com/w80/se.png", ["Suecia"]),
      makeTeam("Tunisia", "TN", "TUN", "https://flagcdn.com/w80/tn.png", ["Túnez"]),
    ],
  },
  {
    id: "G",
    teams: [
      makeTeam("Belgium", "BE", "BEL", "https://flagcdn.com/w80/be.png", ["Bélgica"]),
      makeTeam("Egypt", "EG", "EGY", "https://flagcdn.com/w80/eg.png", ["Egipto"]),
      makeTeam("Iran", "IR", "IRN", "https://flagcdn.com/w80/ir.png", ["Irán"]),
      makeTeam("New Zealand", "NZ", "NZL", "https://flagcdn.com/w80/nz.png", ["Nueva Zelanda"]),
    ],
  },
  {
    id: "H",
    teams: [
      makeTeam("Spain", "ES", "ESP", "https://flagcdn.com/w80/es.png", ["España"]),
      makeTeam("Cape Verde", "CV", "CPV", "https://flagcdn.com/w80/cv.png", ["Cabo Verde"]),
      makeTeam("Saudi Arabia", "SA", "KSA", "https://flagcdn.com/w80/sa.png", ["Arabia Saudita"]),
      makeTeam("Uruguay", "UY", "URU", "https://flagcdn.com/w80/uy.png"),
    ],
  },
  {
    id: "I",
    teams: [
      makeTeam("France", "FR", "FRA", "https://flagcdn.com/w80/fr.png", ["Francia"]),
      makeTeam("Senegal", "SN", "SEN", "https://flagcdn.com/w80/sn.png"),
      makeTeam("Norway", "NO", "NOR", "https://flagcdn.com/w80/no.png", ["Noruega"]),
      makeTeam("Iraq", "IQ", "IRQ", "https://flagcdn.com/w80/iq.png", ["Irak"]),
    ],
  },
  {
    id: "J",
    teams: [
      makeTeam("Argentina", "AR", "ARG", "https://flagcdn.com/w80/ar.png"),
      makeTeam("Algeria", "DZ", "ALG", "https://flagcdn.com/w80/dz.png", ["Argelia"]),
      makeTeam("Austria", "AT", "AUT", "https://flagcdn.com/w80/at.png"),
      makeTeam("Jordan", "JO", "JOR", "https://flagcdn.com/w80/jo.png", ["Jordania"]),
    ],
  },
  {
    id: "K",
    teams: [
      makeTeam("Portugal", "PT", "POR", "https://flagcdn.com/w80/pt.png"),
      makeTeam("DR Congo", "CD", "COD", "https://flagcdn.com/w80/cd.png", ["Congo RD"]),
      makeTeam("Uzbekistan", "UZ", "UZB", "https://flagcdn.com/w80/uz.png", ["Uzbekistán"]),
      makeTeam("Colombia", "CO", "COL", "https://flagcdn.com/w80/co.png"),
    ],
  },
  {
    id: "L",
    teams: [
      makeTeam("England", "GB-ENG", "ENG", "https://flagcdn.com/w80/gb-eng.png", ["Inglaterra"]),
      makeTeam("Croatia", "HR", "CRO", "https://flagcdn.com/w80/hr.png", ["Croacia"]),
      makeTeam("Ghana", "GH", "GHA", "https://flagcdn.com/w80/gh.png"),
      makeTeam("Panama", "PA", "PAN", "https://flagcdn.com/w80/pa.png", ["Panamá"]),
    ],
  },
];

const teamLookup = groups.flatMap((group) => group.teams).reduce((acc, team) => {
  acc[team.name] = team;
  acc[team.code] = team;
  team.aliases.forEach((alias) => {
    acc[alias] = team;
  });
  return acc;
}, {});

const venueTimeZones = {
  "Ciudad de México": "America/Mexico_City",
  Guadalajara: "America/Mexico_City",
  Monterrey: "America/Monterrey",
  Toronto: "America/Toronto",
  Vancouver: "America/Vancouver",
  "Los Ángeles": "America/Los_Angeles",
  Seattle: "America/Los_Angeles",
  "Área de la Bahía": "America/Los_Angeles",
  Boston: "America/New_York",
  Filadelfia: "America/New_York",
  "Nueva York / Nueva Jersey": "America/New_York",
  Miami: "America/New_York",
  Atlanta: "America/New_York",
  Dallas: "America/Chicago",
  Houston: "America/Chicago",
  "Kansas City": "America/Chicago",
};

const buildMatch = (id, dateIso, time, groupId, stadium, venue, homeName, awayName, options = {}) => ({
  id,
  groupId,
  date: `${Number(dateIso.slice(8, 10))} Jun`,
  dateIso,
  time,
  kickoffUtc: options.kickoffUtc ?? zonedDateToUtc(dateIso, time, venueTimeZones[venue] ?? "UTC").toISOString(),
  sourceTimeZone: venueTimeZones[venue] ?? "UTC",
  stadium,
  venue,
  source: "officialCalendar",
  broadcasts: options.broadcasts ?? {},
  homeTeam: teamLookup[homeName],
  awayTeam: teamLookup[awayName],
});

export const upcomingMatches = [
  buildMatch(1, "2026-06-11", "13:00", "A", "Mexico City Stadium", "Ciudad de México", "México", "Sudáfrica", {
    kickoffUtc: "2026-06-11T19:00:00.000Z",
  }),
  buildMatch(2, "2026-06-11", "22:00", "A", "Estadio Guadalajara", "Guadalajara", "Corea del Sur", "Chequia"),
  buildMatch(3, "2026-06-12", "15:00", "B", "Toronto Stadium", "Toronto", "Canadá", "Bosnia y Herzegovina", {
    kickoffUtc: "2026-06-12T19:00:00.000Z",
  }),
  buildMatch(4, "2026-06-12", "18:00", "D", "Los Angeles Stadium", "Los Ángeles", "Estados Unidos", "Paraguay", {
    kickoffUtc: "2026-06-13T01:00:00.000Z",
  }),
  buildMatch(5, "2026-06-13", "12:00", "C", "Boston Stadium", "Boston", "Haití", "Escocia"),
  buildMatch(6, "2026-06-13", "15:00", "D", "BC Place Vancouver", "Vancouver", "Australia", "Turquía"),
  buildMatch(7, "2026-06-13", "20:00", "C", "New York New Jersey Stadium", "Nueva York / Nueva Jersey", "Brasil", "Marruecos"),
  buildMatch(8, "2026-06-13", "22:00", "B", "San Francisco Bay Area Stadium", "Área de la Bahía", "Catar", "Suiza"),
  buildMatch(9, "2026-06-14", "12:00", "E", "Philadelphia Stadium", "Filadelfia", "Costa de Marfil", "Ecuador"),
  buildMatch(10, "2026-06-14", "15:00", "E", "Houston Stadium", "Houston", "Germany", "Curacao"),
  buildMatch(11, "2026-06-14", "18:00", "F", "Dallas Stadium", "Dallas", "Países Bajos", "Japón"),
  buildMatch(12, "2026-06-14", "21:00", "F", "Estadio Monterrey", "Monterrey", "Suecia", "Túnez"),
  buildMatch(13, "2026-06-15", "12:00", "H", "Miami Stadium", "Miami", "Arabia Saudita", "Uruguay"),
  buildMatch(14, "2026-06-15", "15:00", "H", "Atlanta Stadium", "Atlanta", "España", "Cabo Verde"),
  buildMatch(15, "2026-06-15", "18:00", "G", "Los Angeles Stadium", "Los Ángeles", "Irán", "Nueva Zelanda"),
  buildMatch(16, "2026-06-15", "21:00", "G", "Seattle Stadium", "Seattle", "Bélgica", "Egipto"),
  buildMatch(17, "2026-06-16", "12:00", "I", "New York New Jersey Stadium", "Nueva York / Nueva Jersey", "France", "Senegal"),
  buildMatch(18, "2026-06-16", "15:00", "I", "Boston Stadium", "Boston", "Irak", "Noruega"),
  buildMatch(19, "2026-06-16", "20:00", "J", "Kansas City Stadium", "Kansas City", "Argentina", "Algeria"),
  buildMatch(20, "2026-06-16", "21:00", "J", "San Francisco Bay Area Stadium", "Área de la Bahía", "Austria", "Jordania"),
  buildMatch(21, "2026-06-17", "12:00", "L", "Toronto Stadium", "Toronto", "Ghana", "Panamá"),
  buildMatch(22, "2026-06-17", "15:00", "L", "Dallas Stadium", "Dallas", "Inglaterra", "Croacia"),
  buildMatch(23, "2026-06-17", "18:00", "K", "Houston Stadium", "Houston", "Portugal", "Congo RD"),
  buildMatch(24, "2026-06-17", "21:00", "K", "Mexico City Stadium", "Ciudad de México", "Uzbekistán", "Colombia"),
  buildMatch(25, "2026-06-18", "12:00", "A", "Atlanta Stadium", "Atlanta", "Chequia", "Sudáfrica"),
  buildMatch(26, "2026-06-18", "15:00", "B", "Los Angeles Stadium", "Los Ángeles", "Suiza", "Bosnia y Herzegovina"),
  buildMatch(27, "2026-06-18", "18:00", "B", "BC Place Vancouver", "Vancouver", "Canadá", "Catar"),
  buildMatch(28, "2026-06-18", "21:00", "A", "Estadio Guadalajara", "Guadalajara", "México", "Corea del Sur"),
  buildMatch(29, "2026-06-19", "12:00", "C", "Philadelphia Stadium", "Filadelfia", "Brasil", "Haití"),
  buildMatch(30, "2026-06-19", "15:00", "C", "Boston Stadium", "Boston", "Escocia", "Marruecos"),
  buildMatch(31, "2026-06-19", "18:00", "D", "San Francisco Bay Area Stadium", "Área de la Bahía", "Turquía", "Paraguay"),
  buildMatch(32, "2026-06-19", "21:00", "D", "Seattle Stadium", "Seattle", "Estados Unidos", "Australia"),
  buildMatch(33, "2026-06-20", "12:00", "E", "Toronto Stadium", "Toronto", "Germany", "Ivory Coast"),
  buildMatch(34, "2026-06-20", "15:00", "E", "Kansas City Stadium", "Kansas City", "Ecuador", "Curazao"),
  buildMatch(35, "2026-06-20", "18:00", "F", "Houston Stadium", "Houston", "Países Bajos", "Suecia"),
  buildMatch(36, "2026-06-20", "21:00", "F", "Estadio Monterrey", "Monterrey", "Túnez", "Japón"),
  buildMatch(37, "2026-06-21", "12:00", "H", "Miami Stadium", "Miami", "Uruguay", "Cabo Verde"),
  buildMatch(38, "2026-06-21", "15:00", "H", "Atlanta Stadium", "Atlanta", "España", "Arabia Saudita"),
  buildMatch(39, "2026-06-21", "18:00", "G", "Los Angeles Stadium", "Los Ángeles", "Bélgica", "Irán"),
  buildMatch(40, "2026-06-21", "21:00", "G", "BC Place Vancouver", "Vancouver", "Nueva Zelanda", "Egipto"),
  buildMatch(41, "2026-06-22", "12:00", "I", "New York New Jersey Stadium", "Nueva York / Nueva Jersey", "Noruega", "Senegal"),
  buildMatch(42, "2026-06-22", "15:00", "I", "Philadelphia Stadium", "Filadelfia", "France", "Iraq"),
  buildMatch(43, "2026-06-22", "12:00", "J", "Dallas Stadium", "Dallas", "Argentina", "Austria"),
  buildMatch(44, "2026-06-22", "20:00", "J", "San Francisco Bay Area Stadium", "Área de la Bahía", "Jordan", "Algeria"),
  buildMatch(45, "2026-06-23", "12:00", "L", "Boston Stadium", "Boston", "Inglaterra", "Ghana"),
  buildMatch(46, "2026-06-23", "15:00", "L", "Toronto Stadium", "Toronto", "Panamá", "Croacia"),
  buildMatch(47, "2026-06-23", "18:00", "K", "Houston Stadium", "Houston", "Portugal", "Uzbekistán"),
  buildMatch(48, "2026-06-23", "21:00", "K", "Estadio Guadalajara", "Guadalajara", "Colombia", "Congo RD"),
  buildMatch(49, "2026-06-24", "11:00", "C", "Miami Stadium", "Miami", "Escocia", "Brasil"),
  buildMatch(50, "2026-06-24", "11:00", "C", "Atlanta Stadium", "Atlanta", "Marruecos", "Haití"),
  buildMatch(51, "2026-06-24", "14:00", "B", "BC Place Vancouver", "Vancouver", "Suiza", "Canadá"),
  buildMatch(52, "2026-06-24", "14:00", "B", "Seattle Stadium", "Seattle", "Bosnia y Herzegovina", "Catar"),
  buildMatch(53, "2026-06-24", "17:00", "A", "Mexico City Stadium", "Ciudad de México", "Chequia", "México"),
  buildMatch(54, "2026-06-24", "17:00", "A", "Estadio Monterrey", "Monterrey", "Sudáfrica", "Corea del Sur"),
  buildMatch(55, "2026-06-25", "11:00", "E", "Philadelphia Stadium", "Filadelfia", "Curazao", "Costa de Marfil"),
  buildMatch(56, "2026-06-25", "11:00", "E", "New York New Jersey Stadium", "Nueva York / Nueva Jersey", "Ecuador", "Germany"),
  buildMatch(57, "2026-06-25", "14:00", "F", "Dallas Stadium", "Dallas", "Japón", "Suecia"),
  buildMatch(58, "2026-06-25", "14:00", "F", "Kansas City Stadium", "Kansas City", "Túnez", "Países Bajos"),
  buildMatch(59, "2026-06-25", "17:00", "D", "Los Angeles Stadium", "Los Ángeles", "Turquía", "Estados Unidos"),
  buildMatch(60, "2026-06-25", "17:00", "D", "San Francisco Bay Area Stadium", "Área de la Bahía", "Paraguay", "Australia"),
  buildMatch(61, "2026-06-26", "11:00", "I", "Boston Stadium", "Boston", "Norway", "France"),
  buildMatch(62, "2026-06-26", "11:00", "I", "Toronto Stadium", "Toronto", "Senegal", "Irak"),
  buildMatch(63, "2026-06-26", "14:00", "G", "Seattle Stadium", "Seattle", "Egipto", "Irán"),
  buildMatch(64, "2026-06-26", "14:00", "G", "BC Place Vancouver", "Vancouver", "Nueva Zelanda", "Bélgica"),
  buildMatch(65, "2026-06-26", "17:00", "H", "Houston Stadium", "Houston", "Cabo Verde", "Arabia Saudita"),
  buildMatch(66, "2026-06-26", "17:00", "H", "Estadio Guadalajara", "Guadalajara", "Uruguay", "España"),
  buildMatch(67, "2026-06-27", "11:00", "L", "New York New Jersey Stadium", "Nueva York / Nueva Jersey", "Panamá", "Inglaterra"),
  buildMatch(68, "2026-06-27", "11:00", "L", "Philadelphia Stadium", "Filadelfia", "Croacia", "Ghana"),
  buildMatch(69, "2026-06-27", "21:00", "J", "Kansas City Stadium", "Kansas City", "Algeria", "Austria"),
  buildMatch(70, "2026-06-27", "21:00", "J", "Dallas Stadium", "Dallas", "Jordan", "Argentina"),
  buildMatch(71, "2026-06-27", "17:00", "K", "Miami Stadium", "Miami", "Colombia", "Portugal"),
  buildMatch(72, "2026-06-27", "17:00", "K", "Atlanta Stadium", "Atlanta", "Congo RD", "Uzbekistán"),
];

export const groupCards = groups.map((group) => ({
  id: group.id,
  teams: group.teams,
}));

export const leaderboard = [
  { id: 1, name: "Lucia M.", points: 164, streak: "+12" },
  { id: 2, name: "Pedro R.", points: 159, streak: "+8" },
  { id: 3, name: "Sofia T.", points: 151, streak: "+10" },
];
