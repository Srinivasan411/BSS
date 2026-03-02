export function sanitizeText(value) {
  return String(value ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function sanitizeFormData(formData) {
  return Object.fromEntries(
    Object.entries(formData).map(([key, value]) => [key, sanitizeText(value)]),
  );
}
