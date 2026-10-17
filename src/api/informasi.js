
import { apiRequest } from "./client";

export function getAllInformasi() {
  return apiRequest("/informasi").then(
    (data) => data.informasiList
  );
}

export function getInformasiById(id) {
  return apiRequest(`/informasi/${id}`).then(
    (data) => data.informasi
  );
}

export function createInformasi(payload) {
  return apiRequest("/informasi", {
    method: "POST",
    body: JSON.stringify(payload),
  }).then((data) => data.informasi);
}

export function updateInformasi(id, payload) {
  return apiRequest(`/informasi/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  }).then((data) => data.informasi);
}

export function deleteInformasi(id) {
  return apiRequest(`/informasi/${id}`, {
    method: "DELETE",
  });
}
