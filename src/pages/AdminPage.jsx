import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  clearAdminToken,
  createClient,
  createTestimonial,
  deleteClient,
  deleteTestimonial,
  getAdminToken,
  getContent,
  getSmtpSettings,
  loginAdmin,
  logoutAdmin,
  updateContactDetails,
  updateSettings,
  updateSmtpSettings,
} from "../api";

const initialClient = { name: "", logoUrl: "" };
const initialTestimonial = { name: "", company: "", feedback: "", rating: 5 };
const initialContactDetails = {
  companyName: "",
  email: "",
  whatsappNumber: "",
  phonePrimary: "",
  phoneSecondary: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  mapUrl: "",
};
const initialSmtpSettings = {
  host: "",
  port: 587,
  secure: false,
  username: "",
  password: "",
  fromName: "",
  fromEmail: "",
  hasPassword: false,
};

export default function AdminPage() {
  const [settings, setSettings] = useState({
    companyName: "",
    heroHeading: "",
    heroSubheading: "",
  });
  const [contactDetails, setContactDetails] = useState(initialContactDetails);
  const [smtpSettings, setSmtpSettings] = useState(initialSmtpSettings);
  const [clients, setClients] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [clientForm, setClientForm] = useState(initialClient);
  const [testimonialForm, setTestimonialForm] = useState(initialTestimonial);
  const [message, setMessage] = useState("");
  const [apiHealth, setApiHealth] = useState({ loading: true, ok: false, message: "" });
  const [adminPassword, setAdminPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getAdminToken()));

  const handleUnauthorized = useCallback(() => {
    clearAdminToken();
    setIsAuthenticated(false);
    setMessage("Admin session expired. Please login again.");
  }, []);

  const handleApiError = useCallback((error, fallbackMessage) => {
    if (error?.message?.toLowerCase().includes("unauthorized")) {
      handleUnauthorized();
      return;
    }
    setMessage(error?.message || fallbackMessage);
  }, [handleUnauthorized]);

  const load = useCallback(async () => {
    try {
      const payload = await getContent();
      const incomingSettings = payload.settings || {};
      setSettings({
        companyName: incomingSettings.companyName || "",
        heroHeading: incomingSettings.heroHeading || "",
        heroSubheading: incomingSettings.heroSubheading || "",
      });
      setClients(payload.clients || []);
      setTestimonials(payload.testimonials || []);
      setContactDetails((prev) => ({ ...prev, ...(payload.contactDetails || {}) }));

      const smtpPayload = await getSmtpSettings();
      const incoming = smtpPayload.smtpSettings || {};
      setSmtpSettings((prev) => ({
        ...prev,
        ...incoming,
        password: "",
      }));
    } catch (error) {
      handleApiError(error, "Failed to load admin data.");
    }
  }, [handleApiError]);

  useEffect(() => {
    if (!isAuthenticated) return;
    load();
  }, [isAuthenticated, load]);

  useEffect(() => {
    if (isAuthenticated) return;
    let cancelled = false;

    async function checkHealth() {
      setApiHealth({ loading: true, ok: false, message: "" });
      try {
        const res = await fetch("/api/health");
        const payload = await res.json().catch(() => null);
        if (cancelled) return;
        if (!res.ok) {
          setApiHealth({
            loading: false,
            ok: false,
            message: payload?.error || `API health check failed (${res.status})`,
          });
          return;
        }
        setApiHealth({
          loading: false,
          ok: true,
          message: payload?.dbPath ? `Connected (${payload.dbPath})` : "Connected",
        });
      } catch (error) {
        if (cancelled) return;
        setApiHealth({
          loading: false,
          ok: false,
          message: error?.message || "Cannot reach API. Start backend server.",
        });
      }
    }

    checkHealth();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const handleLogin = async (event) => {
    event.preventDefault();
    if (!adminPassword.trim()) return;
    setMessage("");
    setLoginLoading(true);

    try {
      await loginAdmin(adminPassword.trim());
      setIsAuthenticated(true);
      setAdminPassword("");
      setMessage("Admin login successful.");
    } catch (error) {
      handleApiError(error, "Login failed.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutAdmin();
    } catch {
      clearAdminToken();
    }
    setIsAuthenticated(false);
    setSettings({
      companyName: "",
      heroHeading: "",
      heroSubheading: "",
    });
    setContactDetails(initialContactDetails);
    setSmtpSettings(initialSmtpSettings);
    setClients([]);
    setTestimonials([]);
    setClientForm(initialClient);
    setTestimonialForm(initialTestimonial);
    setMessage("Logged out.");
  };

  const saveSettings = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      await updateSettings(settings);
      setMessage("Common settings updated.");
    } catch (error) {
      handleApiError(error, "Failed to update settings.");
    }
  };

  const saveContactDetails = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      await updateContactDetails(contactDetails);
      await load();
      setMessage("Contact details updated.");
    } catch (error) {
      handleApiError(error, "Failed to update contact details.");
    }
  };

  const saveSmtpSettings = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      await updateSmtpSettings(smtpSettings);
      await load();
      setMessage("SMTP settings updated.");
    } catch (error) {
      handleApiError(error, "Failed to update SMTP settings.");
    }
  };

  const addClient = async (event) => {
    event.preventDefault();
    if (!clientForm.name.trim()) return;
    setMessage("");
    try {
      await createClient(clientForm);
      setClientForm(initialClient);
      await load();
      setMessage("Client added.");
    } catch (error) {
      handleApiError(error, "Failed to add client.");
    }
  };

  const removeClient = async (id) => {
    setMessage("");
    try {
      await deleteClient(id);
      await load();
      setMessage("Client removed.");
    } catch (error) {
      handleApiError(error, "Failed to delete client.");
    }
  };

  const addTestimonial = async (event) => {
    event.preventDefault();
    if (!testimonialForm.name.trim() || !testimonialForm.company.trim() || !testimonialForm.feedback.trim()) {
      return;
    }
    setMessage("");
    try {
      await createTestimonial(testimonialForm);
      setTestimonialForm(initialTestimonial);
      await load();
      setMessage("Testimonial added.");
    } catch (error) {
      handleApiError(error, "Failed to add testimonial.");
    }
  };

  const removeTestimonial = async (id) => {
    setMessage("");
    try {
      await deleteTestimonial(id);
      await load();
      setMessage("Testimonial removed.");
    } catch (error) {
      handleApiError(error, "Failed to delete testimonial.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Admin Login</h1>
          <p className="mt-2 text-sm text-slate-600">
            Default password: <span className="font-semibold">admin123</span> (configurable via <span className="font-mono">.env</span> → <span className="font-mono">ADMIN_PASSWORD</span>)
          </p>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <p className="font-semibold">API status</p>
            <p className="mt-1">
              {apiHealth.loading ? "Checking..." : apiHealth.ok ? apiHealth.message : `Not ready: ${apiHealth.message}`}
            </p>
            {!apiHealth.loading && !apiHealth.ok ? (
              <p className="mt-2 text-xs text-slate-600">
                Start backend with <span className="font-mono">node server/index.js</span> (or <span className="font-mono">npm.cmd run server</span>).
              </p>
            ) : null}
          </div>

          {message ? (
            <p className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{message}</p>
          ) : null}

          <form onSubmit={handleLogin} className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Password</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(event) => setAdminPassword(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="Enter admin password"
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:bg-indigo-300"
            >
              {loginLoading ? "Signing in..." : "Login"}
            </button>
          </form>

          <Link to="/" className="mt-4 inline-block text-sm font-semibold text-indigo-700">
            Back to Site
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between gap-3">
          <h1 className="text-3xl font-bold text-slate-900">BSS Admin Panel</h1>
          <div className="flex items-center gap-2">
            <Link to="/" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              Back to Site
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-700"
            >
              Logout
            </button>
          </div>
        </div>

        {message ? <p className="mb-6 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Common Settings</h2>
          <form onSubmit={saveSettings} className="mt-4 grid gap-4 md:grid-cols-2">
            <Field
              label="Company Name"
              value={settings.companyName || ""}
              onChange={(value) => setSettings((prev) => ({ ...prev, companyName: value }))}
            />
            <Field
              label="Hero Heading"
              value={settings.heroHeading || ""}
              onChange={(value) => setSettings((prev) => ({ ...prev, heroHeading: value }))}
            />
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-slate-700">Hero Subheading</label>
              <textarea
                value={settings.heroSubheading || ""}
                onChange={(event) =>
                  setSettings((prev) => ({ ...prev, heroSubheading: event.target.value }))
                }
                className="min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white md:col-span-2 md:w-fit">
              Save Settings
            </button>
          </form>
        </section>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Contact Details</h2>
          <form onSubmit={saveContactDetails} className="mt-4 grid gap-4 md:grid-cols-2">
            <Field
              label="Company Name"
              value={contactDetails.companyName || ""}
              onChange={(value) => setContactDetails((prev) => ({ ...prev, companyName: value }))}
            />
            <Field
              label="Email"
              type="email"
              value={contactDetails.email || ""}
              onChange={(value) => setContactDetails((prev) => ({ ...prev, email: value }))}
            />
            <Field
              label="WhatsApp Number"
              value={contactDetails.whatsappNumber || ""}
              onChange={(value) => setContactDetails((prev) => ({ ...prev, whatsappNumber: value }))}
            />
            <Field
              label="Primary Phone"
              value={contactDetails.phonePrimary || ""}
              onChange={(value) => setContactDetails((prev) => ({ ...prev, phonePrimary: value }))}
            />
            <Field
              label="Secondary Phone"
              value={contactDetails.phoneSecondary || ""}
              onChange={(value) => setContactDetails((prev) => ({ ...prev, phoneSecondary: value }))}
            />
            <Field
              label="Address Line 1"
              value={contactDetails.addressLine1 || ""}
              onChange={(value) => setContactDetails((prev) => ({ ...prev, addressLine1: value }))}
            />
            <Field
              label="Address Line 2"
              value={contactDetails.addressLine2 || ""}
              onChange={(value) => setContactDetails((prev) => ({ ...prev, addressLine2: value }))}
            />
            <Field
              label="City"
              value={contactDetails.city || ""}
              onChange={(value) => setContactDetails((prev) => ({ ...prev, city: value }))}
            />
            <Field
              label="State"
              value={contactDetails.state || ""}
              onChange={(value) => setContactDetails((prev) => ({ ...prev, state: value }))}
            />
            <Field
              label="Postal Code"
              value={contactDetails.postalCode || ""}
              onChange={(value) => setContactDetails((prev) => ({ ...prev, postalCode: value }))}
            />
            <Field
              label="Country"
              value={contactDetails.country || ""}
              onChange={(value) => setContactDetails((prev) => ({ ...prev, country: value }))}
            />
            <Field
              label="Map URL"
              value={contactDetails.mapUrl || ""}
              onChange={(value) => setContactDetails((prev) => ({ ...prev, mapUrl: value }))}
            />
            <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white md:col-span-2 md:w-fit">
              Save Contact Details
            </button>
          </form>
        </section>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Mail Service (SMTP)</h2>
          <form onSubmit={saveSmtpSettings} className="mt-4 grid gap-4 md:grid-cols-2">
            <Field
              label="SMTP Host"
              value={smtpSettings.host || ""}
              onChange={(value) => setSmtpSettings((prev) => ({ ...prev, host: value }))}
            />
            <Field
              label="Port"
              type="number"
              value={smtpSettings.port}
              onChange={(value) =>
                setSmtpSettings((prev) => ({ ...prev, port: Number.parseInt(value, 10) || 0 }))
              }
            />
            <div className="flex items-end gap-3">
              <label className="mb-1 block text-sm font-semibold text-slate-700">Secure (TLS)</label>
              <input
                type="checkbox"
                checked={Boolean(smtpSettings.secure)}
                onChange={(event) => setSmtpSettings((prev) => ({ ...prev, secure: event.target.checked }))}
                className="h-5 w-5 accent-indigo-600"
              />
            </div>
            <div className="text-xs text-slate-500 md:col-span-2">
              Current password: {smtpSettings.hasPassword ? "Saved" : "Not set"} (leave password empty to keep existing)
            </div>
            <Field
              label="Username"
              value={smtpSettings.username || ""}
              onChange={(value) => setSmtpSettings((prev) => ({ ...prev, username: value }))}
            />
            <Field
              label="Password"
              type="password"
              value={smtpSettings.password || ""}
              onChange={(value) => setSmtpSettings((prev) => ({ ...prev, password: value }))}
            />
            <Field
              label="From Name"
              value={smtpSettings.fromName || ""}
              onChange={(value) => setSmtpSettings((prev) => ({ ...prev, fromName: value }))}
            />
            <Field
              label="From Email"
              type="email"
              value={smtpSettings.fromEmail || ""}
              onChange={(value) => setSmtpSettings((prev) => ({ ...prev, fromEmail: value }))}
            />
            <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white md:col-span-2 md:w-fit">
              Save SMTP Settings
            </button>
          </form>
        </section>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Clients</h2>
          <form onSubmit={addClient} className="mt-4 grid gap-4 md:grid-cols-3">
            <Field
              label="Client Name"
              value={clientForm.name}
              onChange={(value) => setClientForm((prev) => ({ ...prev, name: value }))}
            />
            <Field
              label="Logo URL"
              value={clientForm.logoUrl}
              onChange={(value) => setClientForm((prev) => ({ ...prev, logoUrl: value }))}
            />
            <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white md:self-end">
              Add Client
            </button>
          </form>

          <div className="mt-6 space-y-3">
            {clients.map((client) => (
              <div key={client.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
                <div>
                  <p className="font-semibold text-slate-900">{client.name}</p>
                  {client.logoUrl ? <p className="text-xs text-slate-500">{client.logoUrl}</p> : null}
                </div>
                <button
                  type="button"
                  onClick={() => removeClient(client.id)}
                  className="rounded-md bg-rose-100 px-3 py-1 text-sm font-medium text-rose-700"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Testimonials</h2>
          <form onSubmit={addTestimonial} className="mt-4 grid gap-4 md:grid-cols-2">
            <Field
              label="Client Name"
              value={testimonialForm.name}
              onChange={(value) => setTestimonialForm((prev) => ({ ...prev, name: value }))}
            />
            <Field
              label="Company"
              value={testimonialForm.company}
              onChange={(value) => setTestimonialForm((prev) => ({ ...prev, company: value }))}
            />
            <Field
              label="Rating (1-5)"
              type="number"
              value={testimonialForm.rating}
              onChange={(value) => setTestimonialForm((prev) => ({ ...prev, rating: value }))}
            />
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-slate-700">Feedback</label>
              <textarea
                value={testimonialForm.feedback}
                onChange={(event) =>
                  setTestimonialForm((prev) => ({ ...prev, feedback: event.target.value }))
                }
                className="min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white md:w-fit">
              Add Testimonial
            </button>
          </form>

          <div className="mt-6 space-y-3">
            {testimonials.map((item) => (
              <div key={item.id} className="flex items-start justify-between rounded-lg border border-slate-200 px-4 py-3">
                <div>
                  <p className="font-semibold text-slate-900">{item.name} - {item.company}</p>
                  <p className="text-sm text-slate-600">{item.feedback}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeTestimonial(item.id)}
                  className="rounded-md bg-rose-100 px-3 py-1 text-sm font-medium text-rose-700"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-slate-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
      />
    </div>
  );
}
