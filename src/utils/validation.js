import { sanitizeText } from "./sanitize";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9\s-]{8,15}$/;

export function validateLeadForm(rawForm) {
  const form = Object.fromEntries(
    Object.entries(rawForm).map(([key, value]) => [key, sanitizeText(value)]),
  );

  const errors = {};

  if (!form.name) errors.name = "Name is required.";
  if (!form.company) errors.company = "Company name is required.";

  if (!form.email) {
    errors.email = "Email is required.";
  } else if (!EMAIL_REGEX.test(form.email)) {
    errors.email = "Enter a valid email.";
  }

  if (!form.phone) {
    errors.phone = "Phone is required.";
  } else if (!PHONE_REGEX.test(form.phone)) {
    errors.phone = "Enter a valid phone number.";
  }

  if (!form.message) errors.message = "Message is required.";

  return { errors, sanitized: form };
}
