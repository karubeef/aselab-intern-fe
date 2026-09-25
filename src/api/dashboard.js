import { apiRequest } from "./client";

export function getAdminDashboard() {
  return apiRequest("/dashboard/admin");
}