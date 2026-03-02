import cors from "cors";
import Database from "better-sqlite3";
import express from "express";

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json({ limit: "200kb" }));

const db = new Database(":memory:");

function initDb() {
  db.exec(`
    CREATE TABLE settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      logo_url TEXT DEFAULT ''
    );

    CREATE TABLE testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      company TEXT NOT NULL,
      feedback TEXT NOT NULL,
      rating INTEGER NOT NULL DEFAULT 5
    );
  `);

  const seedSettings = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");
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

    seedClient.run("Axis Corp", "");
    seedClient.run("NovaTech", "");
    seedClient.run("Skyline HR", "");

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

  tx();
}

initDb();

const settingsQuery = db.prepare("SELECT key, value FROM settings ORDER BY key");
const clientsQuery = db.prepare("SELECT id, name, logo_url as logoUrl FROM clients ORDER BY id DESC");
const testimonialsQuery = db.prepare(
  "SELECT id, name, company, feedback, rating FROM testimonials ORDER BY id DESC",
);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, storage: "in-memory-sqlite" });
});

app.get("/api/content", (_req, res) => {
  const settings = Object.fromEntries(settingsQuery.all().map((row) => [row.key, row.value]));
  res.json({
    settings,
    clients: clientsQuery.all(),
    testimonials: testimonialsQuery.all(),
  });
});

app.get("/api/settings", (_req, res) => {
  res.json({ settings: settingsQuery.all() });
});

app.put("/api/settings", (req, res) => {
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

app.get("/api/clients", (_req, res) => {
  res.json({ clients: clientsQuery.all() });
});

app.post("/api/clients", (req, res) => {
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

app.delete("/api/clients/:id", (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "invalid id" });
  }

  db.prepare("DELETE FROM clients WHERE id = ?").run(id);
  res.json({ ok: true });
});

app.get("/api/testimonials", (_req, res) => {
  res.json({ testimonials: testimonialsQuery.all() });
});

app.post("/api/testimonials", (req, res) => {
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

app.delete("/api/testimonials/:id", (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "invalid id" });
  }

  db.prepare("DELETE FROM testimonials WHERE id = ?").run(id);
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
