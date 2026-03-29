/* global process */
import cors from "cors";
import Database from "better-sqlite3";
import express from "express";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

function loadDotEnv(filePath) {
  if (!filePath || typeof filePath !== "string") return;
  if (!fs.existsSync(filePath)) return;

  const raw = fs.readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const idx = trimmed.indexOf("=");
    if (idx <= 0) continue;

    const key = trimmed.slice(0, idx).trim();
    if (!key) continue;

    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (typeof process.env[key] === "undefined") {
      process.env[key] = value;
    }
  }
}

loadDotEnv(path.join(projectRoot, ".env"));

const app = express();
const portCandidate = Number.parseInt(process.env.PORT, 10);
const port = Number.isInteger(portCandidate) && portCandidate > 0 ? portCandidate : 4000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const adminSessions = new Map();

app.use(cors());
app.use(express.json({ limit: "200kb" }));
const dataDir = path.join(projectRoot, "Data");
fs.mkdirSync(dataDir, { recursive: true });

const dbPath = process.env.DB_PATH || path.join(dataDir, "bss.db");
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      logo_url TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      company TEXT NOT NULL,
      feedback TEXT NOT NULL,
      rating INTEGER NOT NULL DEFAULT 5
    );

    CREATE TABLE IF NOT EXISTS contact_details (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      company_name TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      whatsapp_number TEXT NOT NULL DEFAULT '',
      phone_primary TEXT NOT NULL DEFAULT '',
      phone_secondary TEXT NOT NULL DEFAULT '',
      address_line1 TEXT NOT NULL DEFAULT '',
      address_line2 TEXT NOT NULL DEFAULT '',
      city TEXT NOT NULL DEFAULT '',
      state TEXT NOT NULL DEFAULT '',
      postal_code TEXT NOT NULL DEFAULT '',
      country TEXT NOT NULL DEFAULT '',
      map_url TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS smtp_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      host TEXT NOT NULL DEFAULT '',
      port INTEGER NOT NULL DEFAULT 587,
      secure INTEGER NOT NULL DEFAULT 0,
      username TEXT NOT NULL DEFAULT '',
      password TEXT NOT NULL DEFAULT '',
      from_name TEXT NOT NULL DEFAULT '',
      from_email TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const seedSettings = db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)");
  const seedClient = db.prepare("INSERT INTO clients (name, logo_url) VALUES (?, ?)");
  const seedTestimonial = db.prepare(
    "INSERT INTO testimonials (name, company, feedback, rating) VALUES (?, ?, ?, ?)",
  );

  const tx = db.transaction(() => {
    seedSettings.run("companyName", "Brilliant Systems Solutions (BSS)");
    seedSettings.run("heroHeading", "Empowering Businesses with Smart IT & AI Solutions");
    seedSettings.run(
      "heroSubheading",
      "BSS helps enterprises modernize technology, automate workflows, and scale operations securely.",
    );
    seedSettings.run("contactEmail", "hello@bss-example.com");
    seedSettings.run("whatsappNumber", "919000000000");

    db.prepare(
      `INSERT OR IGNORE INTO contact_details (
        id, company_name, email, whatsapp_number, phone_primary, phone_secondary,
        address_line1, address_line2, city, state, postal_code, country, map_url
      ) VALUES (
        1, ?, ?, ?, '', '',
        '', '', '', '', '', 'India', ''
      )`,
    ).run(
      "Brilliant Systems Solutions (BSS)",
      "hello@bss-example.com",
      "919000000000",
    );

    db.prepare(
      `INSERT OR IGNORE INTO smtp_settings (
        id, host, port, secure, username, password, from_name, from_email
      ) VALUES (
        1, '', 587, 0, '', '', '', ''
      )`,
    ).run();
  });

  tx();

  const clientCount = db.prepare("SELECT COUNT(1) as count FROM clients").get().count;
  if (clientCount === 0) {
    const seedTx = db.transaction(() => {
      seedClient.run("Axis Corp", "");
      seedClient.run("NovaTech", "");
      seedClient.run("Skyline HR", "");
    });
    seedTx();
  }

  const testimonialCount = db.prepare("SELECT COUNT(1) as count FROM testimonials").get().count;
  if (testimonialCount === 0) {
    const seedTx = db.transaction(() => {
      seedTestimonial.run(
        "Arjun Menon",
        "NovaTech Industries",
        "BSS transformed our IT operations with automation-first thinking.",
        5,
      );
      seedTestimonial.run(
        "Pema Dorji",
        "Yangkhor Private Limited",
        "Their consulting team modernized our HR and payroll workflows with measurable gains.",
        5,
      );
    });
    seedTx();
  }
}

initDb();

const settingsQuery = db.prepare("SELECT key, value FROM settings ORDER BY key");
const clientsQuery = db.prepare("SELECT id, name, logo_url as logoUrl FROM clients ORDER BY id DESC");
const testimonialsQuery = db.prepare(
  "SELECT id, name, company, feedback, rating FROM testimonials ORDER BY id DESC",
);
const contactDetailsQuery = db.prepare(`
  SELECT
    company_name as companyName,
    email,
    whatsapp_number as whatsappNumber,
    phone_primary as phonePrimary,
    phone_secondary as phoneSecondary,
    address_line1 as addressLine1,
    address_line2 as addressLine2,
    city,
    state,
    postal_code as postalCode,
    country,
    map_url as mapUrl,
    updated_at as updatedAt
  FROM contact_details
  WHERE id = 1
`);
const smtpSettingsQuery = db.prepare(`
  SELECT
    host,
    port,
    secure,
    username,
    password,
    from_name as fromName,
    from_email as fromEmail,
    updated_at as updatedAt
  FROM smtp_settings
  WHERE id = 1
`);

function createSession() {
  const token =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : crypto.randomBytes(24).toString("hex");
  const expiresAt = Date.now() + SESSION_TTL_MS;
  adminSessions.set(token, expiresAt);
  return { token, expiresAt };
}

function isSessionValid(token) {
  if (!token || typeof token !== "string") return false;
  const expiresAt = adminSessions.get(token);
  if (!expiresAt) return false;
  if (expiresAt < Date.now()) {
    adminSessions.delete(token);
    return false;
  }
  return true;
}

function requireAdmin(req, res, next) {
  const token = req.header("x-admin-token");
  if (!isSessionValid(token)) {
    return res.status(401).json({ error: "Unauthorized. Please login as admin." });
  }
  next();
}

app.get("/api/health", (_req, res) => {
  try {
    db.prepare("SELECT 1 as ok").get();
    res.json({ ok: true, storage: "file-sqlite", dbPath });
  } catch (error) {
    res.status(500).json({
      ok: false,
      storage: "file-sqlite",
      dbPath,
      error: error?.message || "Database health check failed",
    });
  }
});

app.post("/api/admin/login", (req, res) => {
  const password = req.body?.password;
  if (typeof password !== "string") {
    return res.status(400).json({ error: "password is required" });
  }

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Invalid admin password" });
  }

  const session = createSession();
  res.json({ ok: true, token: session.token, expiresAt: session.expiresAt });
});

app.post("/api/admin/logout", (req, res) => {
  const token = req.header("x-admin-token");
  if (token) adminSessions.delete(token);
  res.json({ ok: true });
});

app.get("/api/content", (_req, res) => {
  const settings = Object.fromEntries(settingsQuery.all().map((row) => [row.key, row.value]));
  const contactDetails = contactDetailsQuery.get() || null;
  res.json({
    settings,
    clients: clientsQuery.all(),
    testimonials: testimonialsQuery.all(),
    contactDetails,
  });
});

app.get("/api/contact-details", (_req, res) => {
  res.json({ contactDetails: contactDetailsQuery.get() || null });
});

app.put("/api/contact-details", requireAdmin, (req, res) => {
  const payload = req.body?.contactDetails;
  if (!payload || typeof payload !== "object") {
    return res.status(400).json({ error: "contactDetails object is required" });
  }

  const companyName = String(payload.companyName || "").trim();
  const email = String(payload.email || "").trim();
  const whatsappNumber = String(payload.whatsappNumber || "").trim();
  const phonePrimary = String(payload.phonePrimary || "").trim();
  const phoneSecondary = String(payload.phoneSecondary || "").trim();
  const addressLine1 = String(payload.addressLine1 || "").trim();
  const addressLine2 = String(payload.addressLine2 || "").trim();
  const city = String(payload.city || "").trim();
  const state = String(payload.state || "").trim();
  const postalCode = String(payload.postalCode || "").trim();
  const country = String(payload.country || "").trim();
  const mapUrl = String(payload.mapUrl || "").trim();

  db.prepare(
    `UPDATE contact_details SET
      company_name = ?,
      email = ?,
      whatsapp_number = ?,
      phone_primary = ?,
      phone_secondary = ?,
      address_line1 = ?,
      address_line2 = ?,
      city = ?,
      state = ?,
      postal_code = ?,
      country = ?,
      map_url = ?,
      updated_at = datetime('now')
    WHERE id = 1`,
  ).run(
    companyName,
    email,
    whatsappNumber,
    phonePrimary,
    phoneSecondary,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    country,
    mapUrl,
  );

  res.json({ ok: true, contactDetails: contactDetailsQuery.get() || null });
});

app.get("/api/smtp-settings", requireAdmin, (_req, res) => {
  const row = smtpSettingsQuery.get() || null;
  if (!row) return res.json({ smtpSettings: null });
  const { password: _password, ...rest } = row;
  res.json({ smtpSettings: { ...rest, hasPassword: Boolean(row.password) } });
});

app.put("/api/smtp-settings", requireAdmin, (req, res) => {
  const payload = req.body?.smtpSettings;
  if (!payload || typeof payload !== "object") {
    return res.status(400).json({ error: "smtpSettings object is required" });
  }

  const host = String(payload.host || "").trim();
  const port = Number.parseInt(payload.port, 10);
  const secure = payload.secure ? 1 : 0;
  const username = String(payload.username || "").trim();
  const fromName = String(payload.fromName || "").trim();
  const fromEmail = String(payload.fromEmail || "").trim();
  const password = typeof payload.password === "string" ? payload.password : null;

  if (!host) {
    return res.status(400).json({ error: "host is required" });
  }
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    return res.status(400).json({ error: "port must be a valid number (1-65535)" });
  }

  const existing = smtpSettingsQuery.get();
  const nextPassword = password && password.trim() ? password : existing?.password || "";

  db.prepare(
    `UPDATE smtp_settings SET
      host = ?,
      port = ?,
      secure = ?,
      username = ?,
      password = ?,
      from_name = ?,
      from_email = ?,
      updated_at = datetime('now')
    WHERE id = 1`,
  ).run(host, port, secure, username, nextPassword, fromName, fromEmail);

  const row = smtpSettingsQuery.get() || null;
  if (!row) return res.json({ ok: true, smtpSettings: null });
  const { password: _password, ...rest } = row;
  res.json({ ok: true, smtpSettings: { ...rest, hasPassword: Boolean(row.password) } });
});

app.get("/api/settings", requireAdmin, (_req, res) => {
  res.json({ settings: settingsQuery.all() });
});

app.put("/api/settings", requireAdmin, (req, res) => {
  const settings = req.body?.settings;
  if (!settings || typeof settings !== "object") {
    return res.status(400).json({ error: "settings object is required" });
  }

  const upsert = db.prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
  );

  const tx = db.transaction((entries) => {
    for (const [key, value] of entries) {
      if (!key || typeof value !== "string") continue;
      upsert.run(key, value.trim());
    }
  });

  tx(Object.entries(settings));
  res.json({ ok: true });
});

app.get("/api/clients", requireAdmin, (_req, res) => {
  res.json({ clients: clientsQuery.all() });
});

app.post("/api/clients", requireAdmin, (req, res) => {
  const name = req.body?.name?.trim();
  const logoUrl = req.body?.logoUrl?.trim() || "";

  if (!name) {
    return res.status(400).json({ error: "name is required" });
  }

  const insert = db.prepare("INSERT INTO clients (name, logo_url) VALUES (?, ?)");
  const info = insert.run(name, logoUrl);

  const created = db
    .prepare("SELECT id, name, logo_url as logoUrl FROM clients WHERE id = ?")
    .get(info.lastInsertRowid);

  res.status(201).json({ client: created });
});

app.delete("/api/clients/:id", requireAdmin, (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "invalid id" });
  }

  db.prepare("DELETE FROM clients WHERE id = ?").run(id);
  res.json({ ok: true });
});

app.get("/api/testimonials", requireAdmin, (_req, res) => {
  res.json({ testimonials: testimonialsQuery.all() });
});

app.post("/api/testimonials", requireAdmin, (req, res) => {
  const name = req.body?.name?.trim();
  const company = req.body?.company?.trim();
  const feedback = req.body?.feedback?.trim();
  const rating = Number.parseInt(req.body?.rating, 10) || 5;

  if (!name || !company || !feedback) {
    return res.status(400).json({ error: "name, company, and feedback are required" });
  }

  const normalizedRating = Math.min(5, Math.max(1, rating));

  const insert = db.prepare(
    "INSERT INTO testimonials (name, company, feedback, rating) VALUES (?, ?, ?, ?)",
  );
  const info = insert.run(name, company, feedback, normalizedRating);

  const created = db
    .prepare("SELECT id, name, company, feedback, rating FROM testimonials WHERE id = ?")
    .get(info.lastInsertRowid);

  res.status(201).json({ testimonial: created });
});

app.delete("/api/testimonials/:id", requireAdmin, (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "invalid id" });
  }

  db.prepare("DELETE FROM testimonials WHERE id = ?").run(id);
  res.json({ ok: true });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  if (err instanceof SyntaxError && err?.type === "entity.parse.failed") {
    return res.status(400).json({
      error: "Invalid JSON body",
      details: err.message,
    });
  }

  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`, err);
  const isProd = process.env.NODE_ENV === "production";
  res.status(500).json({
    error: "Internal server error. Check backend logs.",
    ...(isProd ? {} : { details: err?.message || String(err) }),
  });
});

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
