import { apiRequest } from "./client";

export function getAdminDashboard() {
  return apiRequest("/dashboard/admin");
}

export function getUserDashboard() {
  return apiRequest("/dashboard/user");
}