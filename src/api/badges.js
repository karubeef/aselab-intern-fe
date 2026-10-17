
import { apiRequest } from "./client";

export function getAllBadges() {
  return apiRequest("/badges").then((data) => data.badges);
}

export function getMyBadges() {
  return apiRequest("/badges/me").then(
    (data) => data.userBadges
  );
}
