const headers = {
  "Content-Type": "application/json",
};

const ADMIN_TOKEN_KEY = "bss_admin_token";
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

export function getAdminToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(ADMIN_TOKEN_KEY) || "";
}

export function clearAdminToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

function setAdminToken(token) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

function buildUrl(path) {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_BASE_URL}${path}`;
}

async function request(path, options = {}) {
  const token = getAdminToken();
  const mergedHeaders = {
    ...(options.headers || {}),
    ...(token ? { "x-admin-token": token } : {}),
  };

  let res;
  try {
    res = await fetch(buildUrl(path), { ...options, headers: mergedHeaders });
  } catch {
    throw new Error("Cannot reach API server. Start backend with `npm run server`.");
  }

  if (!res.ok) {
    const raw = await res.text().catch(() => "");
    let payload = null;
    if (raw) {
      try {
        payload = JSON.parse(raw);
      } catch {
        payload = null;
      }
    }
    if (res.status === 401) {
      clearAdminToken();
    }
    throw new Error(
      payload?.error ||
        (res.status === 404 ? "API route not found. Ensure backend is running and updated." : "") ||
        (res.status >= 500 ? `Backend error (${res.status}). Check backend terminal logs.` : "") ||
        raw ||
        `Request failed (${res.status}) on ${path}`,
    );
  }
  return res.json();
}

export async function loginAdmin(password) {
  const response = await request("/api/admin/login", {
    method: "POST",
    headers,
    body: JSON.stringify({ password }),
  });

  if (response.token) {
    setAdminToken(response.token);
  }

  return response;
}

export function logoutAdmin() {
  return request("/api/admin/logout", {
    method: "POST",
  }).finally(() => {
    clearAdminToken();
  });
}

export function getContent() {
  return request("/api/content");
}

export function updateSettings(settings) {
  return request("/api/settings", {
    method: "PUT",
    headers,
    body: JSON.stringify({ settings }),
  });
}

export function createClient(payload) {
  return request("/api/clients", {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
}

export function deleteClient(id) {
  return request(`/api/clients/${id}`, {
    method: "DELETE",
  });
}

export function createTestimonial(payload) {
  return request("/api/testimonials", {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
}

export function deleteTestimonial(id) {
  return request(`/api/testimonials/${id}`, {
    method: "DELETE",
  });
}
