import { useState } from "react";
import { readCookieConsent, writeCookieConsent } from "../utils/cookieConsent";

const defaultPreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
};

export default function CookieConsent({ openManager, onCloseManager }) {
  const [visible, setVisible] = useState(() => !readCookieConsent());
  const [manageOpen, setManageOpen] = useState(false);
  const [preferences, setPreferences] = useState(defaultPreferences);

  const saveConsent = (status, prefs) => {
    // Persist explicit user choice once and reuse for future sessions.
    writeCookieConsent({
      status,
      preferences: { ...prefs, necessary: true },
      updatedAt: new Date().toISOString(),
    });
    setVisible(false);
    setManageOpen(false);
    onCloseManager?.();
  };

  const shouldRender = visible || openManager;
  const managerOpen = manageOpen || openManager;

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-[70] px-4">
      <div className="mx-auto max-w-4xl rounded-2xl border border-gray-200 bg-white/85 p-5 text-gray-700 shadow-xl backdrop-blur-xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <h2 className="text-base font-semibold text-gray-900">Cookie Preferences</h2>
            <p className="mt-1 text-sm text-gray-600">
              We use necessary cookies for core functionality. You can choose analytics and marketing cookies.
              View our <a href="/privacy-policy" className="text-blue-600">Privacy Policy</a> and <a href="/terms-and-conditions" className="text-blue-600">Terms & Conditions</a>.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => saveConsent("rejected", { ...preferences, analytics: false, marketing: false })}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700"
            >
              Reject
            </button>
            <button
              type="button"
              onClick={() => saveConsent("accepted", { ...preferences, analytics: true, marketing: true })}
              className="rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white"
            >
              Accept All
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setManageOpen((prev) => !prev)}
          className="mt-3 text-xs font-semibold text-blue-600"
        >
          {managerOpen ? "Hide options" : "Manage options"}
        </button>

        {managerOpen ? (
          <div className="mt-3 grid gap-2 rounded-xl border border-gray-200 bg-white p-4 text-sm">
            <CookieToggle label="Necessary" value alwaysOn />
            <CookieToggle
              label="Analytics"
              value={preferences.analytics}
              onChange={(next) => setPreferences((prev) => ({ ...prev, analytics: next }))}
            />
            <CookieToggle
              label="Marketing"
              value={preferences.marketing}
              onChange={(next) => setPreferences((prev) => ({ ...prev, marketing: next }))}
            />
            <button
              type="button"
              onClick={() => saveConsent("custom", preferences)}
              className="mt-2 w-fit rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-3 py-2 text-xs font-semibold text-white"
            >
              Save Preferences
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function CookieToggle({ label, value, onChange, alwaysOn = false }) {
  return (
    <label className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={alwaysOn ? true : value}
        disabled={alwaysOn}
        onChange={(event) => onChange?.(event.target.checked)}
        className="h-4 w-4"
      />
    </label>
  );
}
