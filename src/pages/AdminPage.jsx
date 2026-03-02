import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  createClient,
  createTestimonial,
  deleteClient,
  deleteTestimonial,
  getContent,
  updateSettings,
} from "../api";

const initialClient = { name: "", logoUrl: "" };
const initialTestimonial = { name: "", company: "", feedback: "", rating: 5 };

export default function AdminPage() {
  const [settings, setSettings] = useState({
    companyName: "",
    heroHeading: "",
    heroSubheading: "",
    contactEmail: "",
    whatsappNumber: "",
  });
  const [clients, setClients] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [clientForm, setClientForm] = useState(initialClient);
  const [testimonialForm, setTestimonialForm] = useState(initialTestimonial);
  const [message, setMessage] = useState("");

  async function load() {
    try {
      const payload = await getContent();
      setSettings((prev) => ({ ...prev, ...payload.settings }));
      setClients(payload.clients || []);
      setTestimonials(payload.testimonials || []);
    } catch {
      setMessage("Failed to load admin data.");
    }
  }

  useEffect(() => {
    let mounted = true;

    getContent()
      .then((payload) => {
        if (!mounted) return;
        setSettings((prev) => ({ ...prev, ...payload.settings }));
        setClients(payload.clients || []);
        setTestimonials(payload.testimonials || []);
      })
      .catch(() => {
        if (!mounted) return;
        setMessage("Failed to load admin data.");
      });

    return () => {
      mounted = false;
    };
  }, []);

  const saveSettings = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      await updateSettings(settings);
      setMessage("Common settings updated.");
    } catch (error) {
      setMessage(error.message);
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
      setMessage(error.message);
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
      setMessage(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">BSS Admin Panel</h1>
          <Link to="/" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            Back to Site
          </Link>
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
              label="Contact Email"
              value={settings.contactEmail || ""}
              onChange={(value) => setSettings((prev) => ({ ...prev, contactEmail: value }))}
            />
            <Field
              label="WhatsApp Number"
              value={settings.whatsappNumber || ""}
              onChange={(value) => setSettings((prev) => ({ ...prev, whatsappNumber: value }))}
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
                  onClick={async () => {
                    await deleteClient(client.id);
                    load();
                  }}
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
                  onClick={async () => {
                    await deleteTestimonial(item.id);
                    load();
                  }}
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
