const CONSENT_KEY = "bss_cookie_consent_v1";

export function readCookieConsent() {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeCookieConsent(value) {
  localStorage.setItem(CONSENT_KEY, JSON.stringify(value));
}

export function cookieConsentKey() {
  return CONSENT_KEY;
}
