
import { apiRequest } from "./client";

export function getMe() {
  return apiRequest("/users/me")
    .then((data) => data.user);
}

export function getAllUsers() {
  return apiRequest("/users")
    .then((data) => data.users);
}

export function updateUserRole(id, role) {
  return apiRequest(`/users/${id}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  }).then((data) => data.user);
}

export function updateProfile(payload) {
  return apiRequest("/users/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
    skipAuthRedirect: Boolean(payload.currentPassword),
  }).then((data) => data.user);
}

export function deleteMyAccount(password) {
  return apiRequest("/users/me", {
    method: "DELETE",
    body: JSON.stringify({ password }),
    skipAuthRedirect: true,
  });
}
