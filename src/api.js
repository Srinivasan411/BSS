const headers = {
  "Content-Type": "application/json",
};

async function request(path, options = {}) {
  const res = await fetch(path, options);
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(payload.error || "Request failed");
  }
  return res.json();
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
