import { resolveCountryIdentifier } from "../context/AppLocaleContext";

export function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function getFavoriteTeamMeta(groups, favoriteTeam) {
  if (!favoriteTeam) {
    return null;
  }

  const resolvedCode = resolveCountryIdentifier(favoriteTeam);

  return (
    groups
      .flatMap((group) => group.teams)
      .find(
        (team) =>
          team.code === favoriteTeam ||
          team.name === favoriteTeam ||
          (resolvedCode && team.code === resolvedCode),
      ) ?? null
  );
}
