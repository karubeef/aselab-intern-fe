import { apiRequest } from "./client";

export function createReport(reportData) {
  return apiRequest("/reports", {
    method: "POST",
    body: JSON.stringify(reportData),
  }).then((data) => data.report);
}

export function getAllReports(status) {
  const query = status ? `?status=${status}` : "";
  return apiRequest(`/reports${query}`).then(
    (data) => data.reports
  );
}

export function getReportById(id) {
  return apiRequest(`/reports/${id}`).then((data) => data.report);
}

export function updateReport(id, reportData) {
  return apiRequest(`/reports/${id}`, {
    method: "PATCH",
    body: JSON.stringify(reportData),
  }).then((data) => data.report);
}

export function deleteReport(id) {
  return apiRequest(`/reports/${id}`, { method: "DELETE" });
}

export function verifyReport(id, status, rejectReason) {
  return apiRequest(`/reports/${id}/verify`, {
    method: "PATCH",
    body: JSON.stringify({ status, rejectReason }),
  }).then((data) => data.report);
}

export function getHeatmap() {
  return apiRequest("/reports/map").then((data) => data.areas);
}

export function getHeatmapAreaDetail(areaId) {
  return apiRequest(`/reports/map/${areaId}`);
}

export function updateReportStatus(id, status) {
  return apiRequest(`/reports/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  }).then((data) => data.report);
}

export function getMyReports(status) {
  const query = status ? `?status=${status}` : "";
  return apiRequest(`/reports/me${query}`).then((data) => data.reports);
}