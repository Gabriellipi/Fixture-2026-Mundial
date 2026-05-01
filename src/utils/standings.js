export function buildFallbackStandings(groups) {
  return groups.map((group) => ({
    id: group.id,
    teams: group.teams.map((team, index) => ({
      ...team,
      rank: index + 1,
      points: 0,
      played: 0,
      won: 0,
      draw: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      form: [],
    })),
  }));
}

function normalizeStandingRow(row, groupTeams) {
  const teamName = row?.team?.name ?? row?.team?.team_name ?? row?.all?.team_name ?? "";
  const matchedTeam =
    groupTeams.find(
      (team) =>
        team.name === teamName ||
        team.fifaCode === row?.team?.code,
    ) ?? null;

  return {
    ...(matchedTeam ?? {
      name: teamName,
      flag: row?.team?.logo ?? "",
      fifaCode: row?.team?.code ?? teamName.slice(0, 3).toUpperCase(),
    }),
    rank: row?.rank ?? 0,
    points: row?.points ?? 0,
    played: row?.all?.played ?? row?.played ?? 0,
    won: row?.all?.win ?? row?.won ?? 0,
    draw: row?.all?.draw ?? row?.draw ?? 0,
    lost: row?.all?.lose ?? row?.lost ?? 0,
    goalsFor: row?.all?.goals?.for ?? row?.for ?? 0,
    goalsAgainst: row?.all?.goals?.against ?? row?.against ?? 0,
    goalDifference: row?.goalsDiff ?? row?.goal_diff ?? 0,
    form:
      typeof row?.form === "string"
        ? row.form.split("").filter(Boolean)
        : Array.isArray(row?.form)
          ? row.form
          : [],
  };
}

export function normalizeApiStandings(payload, groups) {
  const standingsMatrix = payload?.response?.[0]?.league?.standings ?? [];

  if (!standingsMatrix.length) {
    return buildFallbackStandings(groups);
  }

  return groups.map((group) => {
    const apiGroup =
      standingsMatrix.find(
        (rows) =>
          rows?.[0]?.group?.includes(`Group ${group.id}`) ||
          rows?.[0]?.group?.endsWith(group.id) ||
          rows?.[0]?.group === group.id,
      ) ?? [];

    if (!apiGroup.length) {
      return {
        id: group.id,
        teams: buildFallbackStandings([group])[0].teams,
      };
    }

    const normalizedTeams = apiGroup
      .map((row) => normalizeStandingRow(row, group.teams))
      .sort((firstTeam, secondTeam) => firstTeam.rank - secondTeam.rank);

    return {
      id: group.id,
      teams: normalizedTeams,
    };
  });
}
