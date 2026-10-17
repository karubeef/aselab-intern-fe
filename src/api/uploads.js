import { apiRequest } from "./client";

export function uploadPhotos(files) {
  const formData = new FormData();
  files.forEach((file) => formData.append("photos", file));

  return apiRequest("/uploads", {
    method: "POST",
    body: formData,
  }).then((data) => data.urls);
}