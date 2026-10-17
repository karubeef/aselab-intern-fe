const PREFIX = "oceanguard-local-resolution-";

export function getLocalResolution(reportId) {
  try {
    const raw = localStorage.getItem(PREFIX + reportId);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setLocalResolution(reportId, data) {
  localStorage.setItem(PREFIX + reportId, JSON.stringify(data));
}

export function clearLocalResolution(reportId) {
  localStorage.removeItem(PREFIX + reportId);
}