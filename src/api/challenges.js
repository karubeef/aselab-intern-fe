
import { apiRequest } from "./client";

export function getAllChallenges() {
  return apiRequest("/challenges").then(
    (data) => data.challenges
  );
}

export function getMyChallenges(tab = "active") {
  return apiRequest(
    `/challenges/me?tab=${encodeURIComponent(tab)}`
  ).then((data) => data.challenges);
}

export async function getMyChallengeProgress() {
  const [activeData, completedData] = await Promise.all([
    getMyChallenges("active"),
    getMyChallenges("completed"),
  ]);

  const activeChallenges = Array.isArray(activeData)
    ? activeData
    : [];

  const completedChallenges = Array.isArray(completedData)
    ? completedData
    : [];

  const progressMap = new Map();

  for (const challenge of [
    ...activeChallenges,
    ...completedChallenges,
  ]) {
    if (challenge.id == null) continue;

    progressMap.set(String(challenge.id), {
      challengeId: challenge.id,
      progress: Number(challenge.progress) || 0,
      isCompleted: Boolean(challenge.isCompleted),
      completedAt: challenge.completedAt || null,
    });
  }

  return Array.from(progressMap.values());
}

export async function joinChallenge() {
  throw new Error(
    "Challenge sekarang diikuti secara otomatis. " +
    "Buat laporan dan tunggu hingga diverifikasi Admin " +
    "agar progres challenge bertambah."
  );
}

export function createChallenge(payload) {
  return apiRequest("/challenges", {
    method: "POST",
    body: JSON.stringify(payload),
  }).then((data) => data.challenge);
}

export function deleteChallenge(id) {
  return apiRequest(`/challenges/${id}`, {
    method: "DELETE",
  });
}
