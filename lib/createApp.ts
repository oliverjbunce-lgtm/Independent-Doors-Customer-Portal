import express from "express";
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const ORDER_EMAIL    = process.env.ORDER_EMAIL    || "cromwellorders@iddoors.co.nz";
const FROM_EMAIL     = process.env.FROM_EMAIL     || "portal@iddoors.co.nz";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "iddoors-admin";
const IMPORT_API_KEY = "id-internal-import-key";

// ── Email template ────────────────────────────────────────────────────────────

function buildOrderEmailHtml(orderId: string, data: any, userName: string): string {
  const {
    jobName, contactName, siteAddress, orderNumber, merchant,
    requiredBy, deliveryType, globalSpecs, doors,
  } = data;

  const doorRows = doors.map((d: any, i: number) => `
    <tr style="border-bottom:1px solid #f0f0f0;">
      <td style="padding:8px 12px;font-size:13px;color:#666;">${i + 1}</td>
      <td style="padding:8px 12px;font-size:13px;font-weight:600;">${d.location || `Door ${i + 1}`}</td>
      <td style="padding:8px 12px;font-size:13px;color:#0071e3;font-weight:600;">${d.hanging}</td>
      <td style="padding:8px 12px;font-size:13px;color:#666;">${d.height}×${d.width}×${d.thickness}</td>
      <td style="padding:8px 12px;font-size:13px;color:#666;">${d.trimHeight && d.trimWidth ? `${d.trimHeight}×${d.trimWidth}` : '—'}</td>
      <td style="padding:8px 12px;font-size:13px;color:#666;">${d.floorGap}/${d.gibFrameSize}</td>
      <td style="padding:8px 12px;font-size:13px;color:#666;">${d.doorFinish}</td>
      <td style="padding:8px 12px;font-size:13px;color:#666;">${d.doorCore}</td>
      <td style="padding:8px 12px;font-size:13px;color:#666;">${d.frameType}</td>
      <td style="padding:8px 12px;font-size:13px;color:#666;">${d.softClose ? '✓' : '—'}</td>
      <td style="padding:8px 12px;font-size:13px;color:#666;">${d.hardwareCode || '—'}</td>
      <td style="padding:8px 12px;font-size:13px;color:#666;">${d.notes || '—'}</td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:900px;margin:40px auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:#0071e3;padding:32px 40px;">
      <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">New Door Order</h1>
      <p style="margin:4px 0 0;color:rgba(255,255,255,0.7);font-size:14px;">Submitted via Customer Portal · ${doors.length} Door${doors.length !== 1 ? 's' : ''}</p>
    </div>
    <div style="padding:32px 40px;border-bottom:1px solid #f0f0f0;">
      <h2 style="margin:0 0 20px;font-size:14px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:1px;">Job Details</h2>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;">
        <div><p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#aaa;text-transform:uppercase;letter-spacing:0.5px;">Job Name</p><p style="margin:0;font-size:16px;font-weight:700;color:#000;">${jobName || '—'}</p></div>
        <div><p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#aaa;text-transform:uppercase;letter-spacing:0.5px;">Contact</p><p style="margin:0;font-size:15px;font-weight:600;color:#333;">${contactName || '—'}</p></div>
        <div><p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#aaa;text-transform:uppercase;letter-spacing:0.5px;">Site Address</p><p style="margin:0;font-size:15px;font-weight:600;color:#333;">${siteAddress || '—'}</p></div>
        <div><p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#aaa;text-transform:uppercase;letter-spacing:0.5px;">Order #</p><p style="margin:0;font-size:15px;font-weight:600;color:#0071e3;">${orderNumber || 'Pending'}</p></div>
        <div><p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#aaa;text-transform:uppercase;letter-spacing:0.5px;">Merchant</p><p style="margin:0;font-size:15px;font-weight:600;color:#333;">${merchant || '—'}</p></div>
        <div><p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#aaa;text-transform:uppercase;letter-spacing:0.5px;">Required By</p><p style="margin:0;font-size:15px;font-weight:600;color:#333;">${requiredBy || 'TBC'}</p></div>
        <div><p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#aaa;text-transform:uppercase;letter-spacing:0.5px;">Delivery</p><p style="margin:0;font-size:15px;font-weight:600;color:#333;">${deliveryType}</p></div>
        <div><p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#aaa;text-transform:uppercase;letter-spacing:0.5px;">Submitted By</p><p style="margin:0;font-size:15px;font-weight:600;color:#333;">${userName}</p></div>
      </div>
    </div>
    <div style="padding:32px 40px;border-bottom:1px solid #f0f0f0;background:#fafafa;">
      <h2 style="margin:0 0 20px;font-size:14px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:1px;">Global Specs</h2>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;">
        <div><p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#aaa;text-transform:uppercase;letter-spacing:0.5px;">Jamb</p><p style="margin:0;font-size:15px;font-weight:600;color:#333;">${globalSpecs.jambStyle} / ${globalSpecs.jambMaterial}</p></div>
        <div><p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#aaa;text-transform:uppercase;letter-spacing:0.5px;">Hinges</p><p style="margin:0;font-size:15px;font-weight:600;color:#333;">${globalSpecs.hingeDetails || 'Standard'}</p></div>
        <div><p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#aaa;text-transform:uppercase;letter-spacing:0.5px;">Hardware Brand</p><p style="margin:0;font-size:15px;font-weight:600;color:#333;">${globalSpecs.hardwareBrand || '—'}</p></div>
        <div><p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#aaa;text-transform:uppercase;letter-spacing:0.5px;">Handle Height</p><p style="margin:0;font-size:15px;font-weight:600;color:#333;">${globalSpecs.handleHeight}mm</p></div>
        <div><p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#aaa;text-transform:uppercase;letter-spacing:0.5px;">Drilling</p><p style="margin:0;font-size:15px;font-weight:600;color:#333;">${globalSpecs.drillingRequired ? 'Yes' : 'No'}</p></div>
        <div><p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#aaa;text-transform:uppercase;letter-spacing:0.5px;">Robe Track</p><p style="margin:0;font-size:15px;font-weight:600;color:#333;">${globalSpecs.robeTrackColour || '—'}</p></div>
      </div>
    </div>
    <div style="padding:32px 40px;">
      <h2 style="margin:0 0 20px;font-size:14px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:1px;">Door Schedule</h2>
      <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="background:#f5f5f7;border-bottom:2px solid #e8e8e8;">
              <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.5px;">#</th>
              <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.5px;">Location</th>
              <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.5px;">Hang</th>
              <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.5px;">H×W×T</th>
              <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.5px;">Trim H×W</th>
              <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.5px;">Gap/Gib</th>
              <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.5px;">Finish</th>
              <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.5px;">Core</th>
              <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.5px;">Frame</th>
              <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.5px;">Soft ×</th>
              <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.5px;">Hw Code</th>
              <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.5px;">Notes</th>
            </tr>
          </thead>
          <tbody>
            ${doorRows || '<tr><td colspan="12" style="padding:24px;text-align:center;color:#aaa;font-style:italic;">No doors in schedule</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
    <div style="padding:24px 40px;background:#f5f5f7;border-top:1px solid #e8e8e8;">
      <p style="margin:0;font-size:13px;color:#aaa;">Order ID: <span style="font-weight:600;color:#666;">${orderId}</span> · Submitted via Independent Doors Customer Portal</p>
    </div>
  </div>
</body>
</html>`;
}

// ── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULT_GLOBAL_SPECS = {
  hingeDetails: '',
  robeTrackColour: '',
  jambStyle: 'Flat',
  jambMaterial: 'MDF',
  drillingRequired: true,
  hardwareBrand: '',
  handleHeight: '1000',
};

// ── DB singleton — lazy, created on first request ─────────────────────────────

let _db: ReturnType<typeof createClient> | null = null;
let _dbReady: Promise<void> | null = null;

function getDb() {
  if (!_db) {
    _db = createClient({
      url: process.env.TURSO_DATABASE_URL || "file:local.db",
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return _db;
}

function ensureDbReady(): Promise<void> {
  if (_dbReady) return _dbReady;

  const db = getDb();
  _dbReady = (async () => {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        password TEXT,
        name TEXT,
        defaultMerchant TEXT,
        defaultLocation TEXT
      )
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        userId TEXT,
        data TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(userId) REFERENCES users(id)
      )
    `);

    // Additive columns — wrapped in try/catch so duplicates are silently ignored
    for (const col of [
      'ALTER TABLE users ADD COLUMN defaultGlobalSpecs TEXT',
      'ALTER TABLE users ADD COLUMN role TEXT',
      'ALTER TABLE users ADD COLUMN company TEXT',
    ]) {
      try { await db.execute(col); } catch (_) { /* already exists */ }
    }
  })();

  return _dbReady;
}

// ── App factory ───────────────────────────────────────────────────────────────

export function createApp() {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const app = express();
  app.use(express.json());

  // CORS — allow cross-origin calls from the Door AI frontend
  app.use((_req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key, x-admin-password');
    if (_req.method === 'OPTIONS') { res.sendStatus(204); return; }
    next();
  });

  // Ensure DB is ready before any route handles a request (lazy init)
  app.use(async (_req, _res, next) => {
    try {
      await ensureDbReady();
      next();
    } catch (err: any) {
      console.error('[db] Initialisation failed:', err?.message);
      _res.status(503).json({ error: 'Database initialisation failed', detail: err?.message });
    }
  });

  // ── Helper ──────────────────────────────────────────────────────────────────

  function parseJsonField(raw: any): any {
    if (!raw) return null;
    try { return JSON.parse(raw as string); } catch (_) { return null; }
  }

  function serializeUser(row: any) {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      defaultMerchant: row.defaultMerchant ?? null,
      defaultLocation: row.defaultLocation ?? null,
      defaultGlobalSpecs: parseJsonField(row.defaultGlobalSpecs),
      role: row.role ?? null,
      company: row.company ?? null,
    };
  }

  // ── Auth ────────────────────────────────────────────────────────────────────

  app.post("/api/auth/signup", async (req, res) => {
    const { email, password, name, defaultGlobalSpecs, role, company } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Email, password, and name are required" });
    }
    const id = crypto.randomUUID();
    try {
      const db = getDb();
      const hashed = await bcrypt.hash(password, 12);
      await db.execute({
        sql: `INSERT INTO users (id, email, password, name, defaultGlobalSpecs, role, company)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id,
          email.toLowerCase().trim(),
          hashed,
          name.trim(),
          defaultGlobalSpecs ? JSON.stringify(defaultGlobalSpecs) : null,
          role ?? null,
          company ?? null,
        ],
      });
      res.json({ id, email: email.toLowerCase().trim(), name: name.trim(), defaultGlobalSpecs: defaultGlobalSpecs ?? null, role: role ?? null, company: company ?? null });
    } catch (error: any) {
      if (error.message?.includes("UNIQUE")) {
        res.status(400).json({ error: "An account with that email already exists" });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

    const db = getDb();
    const result = await db.execute({
      sql: "SELECT * FROM users WHERE email = ?",
      args: [email.toLowerCase().trim()],
    });
    const user = result.rows[0] as any;
    if (!user) return res.status(401).json({ error: "Invalid email or password" });
    const valid = await bcrypt.compare(password, user.password as string);
    if (!valid) return res.status(401).json({ error: "Invalid email or password" });

    res.json(serializeUser(user));
  });

  // ── User Profile ────────────────────────────────────────────────────────────

  app.get("/api/user/profile/:id", async (req, res) => {
    const db = getDb();
    const result = await db.execute({
      sql: "SELECT * FROM users WHERE id = ?",
      args: [req.params.id],
    });
    const user = result.rows[0] as any;
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(serializeUser(user));
  });

  app.put("/api/user/profile/:id", async (req, res) => {
    const { name, defaultMerchant, defaultLocation, defaultGlobalSpecs, role, company } = req.body;
    try {
      const db = getDb();
      await db.execute({
        sql: `UPDATE users
              SET name = ?, defaultMerchant = ?, defaultLocation = ?,
                  defaultGlobalSpecs = ?, role = ?, company = ?
              WHERE id = ?`,
        args: [
          name,
          defaultMerchant ?? null,
          defaultLocation ?? null,
          defaultGlobalSpecs ? JSON.stringify(defaultGlobalSpecs) : null,
          role ?? null,
          company ?? null,
          req.params.id,
        ],
      });
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ── Orders ──────────────────────────────────────────────────────────────────

  app.get("/api/orders/:userId", async (req, res) => {
    const db = getDb();
    const result = await db.execute({
      sql: "SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC",
      args: [req.params.userId],
    });
    res.json(result.rows.map((o: any) => ({ ...o, data: JSON.parse(o.data as string) })));
  });

  app.get("/api/orders/drafts/:userId", async (req, res) => {
    try {
      const db = getDb();
      const result = await db.execute({
        sql: "SELECT * FROM orders WHERE userId = ? AND JSON_EXTRACT(data, '$.isDraft') = 1 ORDER BY createdAt DESC",
        args: [req.params.userId],
      });
      res.json(result.rows.map((o: any) => ({ ...o, data: JSON.parse(o.data as string) })));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/orders", async (req, res) => {
    const { userId, data } = req.body;
    if (!userId || !data) return res.status(400).json({ error: "userId and data are required" });

    const id = crypto.randomUUID();
    try {
      const db = getDb();
      await db.execute({
        sql: "INSERT INTO orders (id, userId, data) VALUES (?, ?, ?)",
        args: [id, userId, JSON.stringify(data)],
      });
      const userResult = await db.execute({
        sql: "SELECT name FROM users WHERE id = ?",
        args: [userId],
      });
      const userName = (userResult.rows[0] as any)?.name || "Unknown User";

      if (process.env.RESEND_API_KEY) {
        resend.emails.send({
          from: FROM_EMAIL,
          to: ORDER_EMAIL,
          subject: `New Door Order: ${data.jobName || 'Untitled'} — ${data.doors?.length || 0} Door${data.doors?.length !== 1 ? 's' : ''}`,
          html: buildOrderEmailHtml(id, data, userName),
        }).catch((err: Error) => console.error("[email] Failed:", err.message));
      } else {
        console.warn("[email] RESEND_API_KEY not set — skipping");
      }

      res.json({ id });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ── Import endpoint (Door AI → Portal) ─────────────────────────────────────

  app.post("/api/orders/import", async (req, res) => {
    if (req.headers["x-api-key"] !== IMPORT_API_KEY) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { email, doors, jobName } = req.body;
    if (!email || !doors || !Array.isArray(doors)) {
      return res.status(400).json({ error: "email and doors array are required" });
    }

    try {
      const db = getDb();
      const userResult = await db.execute({
        sql: "SELECT * FROM users WHERE email = ?",
        args: [email.toLowerCase().trim()],
      });
      const user = userResult.rows[0] as any;
      if (!user) return res.status(404).json({ error: "No account found for that email address" });

      const globalSpecs = { ...DEFAULT_GLOBAL_SPECS, ...(parseJsonField(user.defaultGlobalSpecs) || {}) };

      const orderId = crypto.randomUUID();
      const orderData = {
        jobName: jobName || 'Floor Plan Import',
        contactName: user.name,
        siteAddress: user.defaultLocation || '',
        orderNumber: '',
        merchant: user.defaultMerchant || user.company || '',
        requiredBy: '',
        deliveryType: 'Delivery',
        globalSpecs,
        doors,
        isDraft: true,
      };

      await db.execute({
        sql: "INSERT INTO orders (id, userId, data) VALUES (?, ?, ?)",
        args: [orderId, user.id, JSON.stringify(orderData)],
      });

      res.json({ id: orderId, userId: user.id, portalUrl: "/orders/draft/" + orderId });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ── Admin ───────────────────────────────────────────────────────────────────

  app.get("/api/admin/orders", async (req, res) => {
    if (req.headers["x-admin-password"] !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const db = getDb();
      const result = await db.execute(`
        SELECT orders.id, orders.data, orders.createdAt, orders.userId,
               users.name as userName, users.email as userEmail
        FROM orders LEFT JOIN users ON orders.userId = users.id
        ORDER BY orders.createdAt DESC
      `);
      res.json(result.rows.map((o: any) => ({
        id: o.id, createdAt: o.createdAt, userId: o.userId,
        userName: o.userName, userEmail: o.userEmail,
        data: JSON.parse(o.data as string),
      })));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ── Top-level error handler ─────────────────────────────────────────────────
  app.use((err: any, _req: any, res: any, _next: any) => {
    console.error('[express] Unhandled error:', err?.message || err);
    res.status(500).json({ error: err?.message || 'Internal server error' });
  });

  return app;
}
