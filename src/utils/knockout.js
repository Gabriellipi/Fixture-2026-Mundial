function compareTeams(firstTeam, secondTeam) {
  return (
    (secondTeam.points ?? 0) - (firstTeam.points ?? 0) ||
    (secondTeam.goalDifference ?? 0) - (firstTeam.goalDifference ?? 0) ||
    (secondTeam.goalsFor ?? 0) - (firstTeam.goalsFor ?? 0) ||
    (firstTeam.rank ?? 99) - (secondTeam.rank ?? 99) ||
    String(firstTeam.name ?? "").localeCompare(String(secondTeam.name ?? ""))
  );
}

function isGroupComplete(group) {
  return (group?.teams ?? []).length > 0 && group.teams.every((team) => (team.played ?? 0) >= 3);
}

function parseSeedSlot(slot) {
  const match = String(slot).match(/^([12])([A-L])$/);
  if (!match) {
    return null;
  }

  return {
    position: Number(match[1]),
    groupId: match[2],
  };
}

function parseThirdSlot(slot) {
  const match = String(slot).match(/^3([A-L](?:\/[A-L])+)$/);
  if (!match) {
    return null;
  }

  return match[1].split("/");
}

function resolveDirectSeed(slot, groupStandings) {
  const seed = parseSeedSlot(slot);
  if (!seed) {
    return null;
  }

  const group = groupStandings.find((item) => item.id === seed.groupId);
  if (!isGroupComplete(group)) {
    return null;
  }
  const team = group?.teams?.find((item) => item.rank === seed.position) ?? null;

  if (!team) {
    return null;
  }

  return {
    ...team,
    bracketLabel: `${seed.position}${seed.groupId}`,
  };
}

export function buildRound32Assignments(roundMatches, groupStandings) {
  const allGroupsComplete = groupStandings.every((group) => isGroupComplete(group));
  const thirdPlacedTeams = groupStandings
    .map((group) => {
      if (!isGroupComplete(group)) {
        return null;
      }

      const team = group.teams.find((item) => item.rank === 3);
      return team
        ? {
            ...team,
            groupId: group.id,
            bracketLabel: `3${group.id}`,
          }
        : null;
    })
    .filter(Boolean)
    .sort(compareTeams)
    .slice(0, 8);

  const availableThirds = [...thirdPlacedTeams];

  function resolveSlot(slot) {
    const directTeam = resolveDirectSeed(slot, groupStandings);
    if (directTeam) {
      return directTeam;
    }

    const eligibleGroups = parseThirdSlot(slot);
    if (!eligibleGroups) {
      return slot;
    }

     if (!allGroupsComplete) {
      return slot;
    }

    const nextIndex = availableThirds.findIndex((team) => eligibleGroups.includes(team.groupId));
    if (nextIndex === -1) {
      return slot;
    }

    return availableThirds.splice(nextIndex, 1)[0];
  }

  return roundMatches.map((match) => ({
    ...match,
    home: resolveSlot(match.home),
    away: resolveSlot(match.away),
  }));
}
