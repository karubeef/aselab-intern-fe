
const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api"
).replace(/\/+$/, "");

function handleUnauthorized() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  if (!window.location.pathname.startsWith("/login")) {
    window.location.replace("/login?expired=true");
  }
}

export async function apiRequest(endpoint, options = {}) {
  const {
    skipAuthRedirect = false,
    headers: customHeaders,
    ...fetchOptions
  } = options;

  const isFormData =
    typeof FormData !== "undefined" &&
    fetchOptions.body instanceof FormData;

  const token = localStorage.getItem("token");
  const headers = new Headers(customHeaders);

  if (
    !isFormData &&
    fetchOptions.body != null &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  let data = null;
  const body = await response.text();

  if (body) {
    try {
      data = JSON.parse(body);
    } catch {
      if (!response.ok) {
        throw new Error(
          `Permintaan gagal (${response.status}).`
        );
      }
      throw new Error("Respons server bukan JSON yang valid.");
    }
  }

  if (
    response.status === 401 &&
    token &&
    !skipAuthRedirect
  ) {
    handleUnauthorized();
    throw new Error(
      "Sesi kamu telah berakhir, silakan login kembali."
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
      `Permintaan gagal (${response.status}).`
    );
  }

  return data;
}
