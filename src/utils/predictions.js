import { getMatchKickoffDate } from "./dateTime";

export function getKickoffDate(match) {
  return getMatchKickoffDate(match);
}

export function getLockDeadline(match) {
  return new Date(getKickoffDate(match).getTime() - 60 * 60 * 1000);
}

export function getPredictionPhase(match, prediction, now = new Date()) {
  if (prediction?.status === "submitted") {
    return "submitted";
  }

  if (now >= getLockDeadline(match)) {
    return "locked";
  }

  if (prediction?.home || prediction?.away || prediction?.status === "draft") {
    return "draft";
  }

  return "empty";
}

export function isPredictionEditable(match, prediction, now = new Date()) {
  const phase = getPredictionPhase(match, prediction, now);
  return phase === "draft" || phase === "empty";
}

export function canReopenPrediction(match, prediction, now = new Date()) {
  return prediction?.status === "submitted" && now < getLockDeadline(match);
}

export function hasPredictionScore(prediction) {
  return prediction?.home !== "" && prediction?.away !== "";
}
