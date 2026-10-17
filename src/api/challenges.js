import { apiRequest } from "./client";

export function getAllChallenges() {
  return apiRequest("/challenges").then((data) => data.challenges);
}

export function joinChallenge(id) {
  return apiRequest(`/challenges/${id}/join`, { method: "POST" });
}

export function getMyChallengeProgress() {
  return apiRequest("/challenges/me/progress").then((data) => data.progressList);
}

export function createChallenge(payload) {
  return apiRequest("/challenges", {
    method: "POST",
    body: JSON.stringify(payload),
  }).then((data) => data.challenge);
}

export function deleteChallenge(id) {
  return apiRequest(`/challenges/${id}`, { method: "DELETE" });
}