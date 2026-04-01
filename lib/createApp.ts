import express from "express";
// Use the HTTP-only client — no WASM, works in Vercel serverless and edge runtimes
import { createClient } from "@libsql/client/http";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const ORDER_EMAIL    = process.env.ORDER_EMAIL    || "cromwellorders@iddoors.co.nz";
const FROM_EMAIL     = process.env.FROM_EMAIL     || "portal@iddoors.co.nz";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "iddoors-admin";
const ADMIN_SIGNUP_KEY = process.env.ADMIN_SIGNUP_KEY || "id-admin-key-2024";
const IMPORT_API_KEY = "id-internal-import-key";

// ── Location emails ───────────────────────────────────────────────────────────

const LOCATION_EMAILS: Record<string, string> = {
  cromwell: 'cromwellorders@iddoors.co.nz',
  christchurch: 'info@iddoors.co.nz',
  timaru: 'matt@iddoors.co.nz',
};

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
        defaultLocation TEXT,
        defaultGlobalSpecs TEXT,
        role TEXT DEFAULT 'merchant',
        company TEXT,
        location TEXT
      )
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        userId TEXT,
        data TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'draft',
        floorPlanData TEXT,
        reviewNotes TEXT,
        FOREIGN KEY(userId) REFERENCES users(id)
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        token TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        expiresAt INTEGER NOT NULL
      )
    `);

    // Additive columns — wrapped in try/catch so duplicates are silently ignored
    for (const col of [
      'ALTER TABLE users ADD COLUMN defaultGlobalSpecs TEXT',
      'ALTER TABLE users ADD COLUMN role TEXT DEFAULT \'merchant\'',
      'ALTER TABLE users ADD COLUMN company TEXT',
      'ALTER TABLE users ADD COLUMN location TEXT',
      'ALTER TABLE orders ADD COLUMN status TEXT DEFAULT \'approved\'',
      'ALTER TABLE orders ADD COLUMN floorPlanData TEXT',
      'ALTER TABLE orders ADD COLUMN reviewNotes TEXT',
    ]) {
      try { await db.execute(col); } catch (_) { /* already exists */ }
    }
  })();

  return _dbReady;
}

// ── App factory ───────────────────────────────────────────────────────────────

export function createApp() {
  // Only instantiate Resend when an API key is available — constructor throws on undefined
  const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

  const app = express();
  app.use(express.json({ limit: '10mb' }));

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
      role: row.role ?? 'merchant',
      company: row.company ?? null,
      location: row.location ?? null,
    };
  }

  // ── Auth ────────────────────────────────────────────────────────────────────

  app.post("/api/auth/signup", async (req, res) => {
    const { email, password, name, defaultGlobalSpecs, role, company, location, adminSignupKey } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Email, password, and name are required" });
    }

    // Only allow admin role if the correct key is provided
    const resolvedRole = role || 'merchant';
    if (resolvedRole === 'admin') {
      if (adminSignupKey !== ADMIN_SIGNUP_KEY) {
        return res.status(403).json({ error: "Invalid admin signup key" });
      }
    }

    const id = crypto.randomUUID();
    try {
      const db = getDb();
      const hashed = await bcrypt.hash(password, 12);
      await db.execute({
        sql: `INSERT INTO users (id, email, password, name, defaultGlobalSpecs, role, company, location)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id,
          email.toLowerCase().trim(),
          hashed,
          name.trim(),
          defaultGlobalSpecs ? JSON.stringify(defaultGlobalSpecs) : null,
          resolvedRole,
          company ?? null,
          location ?? null,
        ],
      });
      res.json({
        id,
        email: email.toLowerCase().trim(),
        name: name.trim(),
        defaultGlobalSpecs: defaultGlobalSpecs ?? null,
        role: resolvedRole,
        company: company ?? null,
        location: location ?? null,
      });
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

  app.post("/api/auth/forgot-password", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    try {
      const db = getDb();
      const result = await db.execute({
        sql: "SELECT id FROM users WHERE email = ?",
        args: [email.toLowerCase().trim()],
      });
      const user = result.rows[0] as any;

      // Always return 200 — don't leak whether the address is registered
      if (!user) return res.json({ ok: true });

      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

      await db.execute({
        sql: "INSERT INTO password_reset_tokens (token, userId, expiresAt) VALUES (?, ?, ?)",
        args: [token, user.id, expiresAt],
      });

      const resetLink = `https://portal.iddoors.co.nz/reset-password?token=${token}`;

      if (resend) {
        resend.emails.send({
          from: FROM_EMAIL,
          to: email.toLowerCase().trim(),
          subject: "Reset your Independent Doors portal password",
          html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="padding:40px 40px 32px;text-align:center;border-bottom:1px solid #f0f0f0;">
      <img src="https://iddoors.co.nz/wp-content/uploads/2023/11/logo.svg" alt="Independent Doors" style="height:36px;width:auto;margin-bottom:24px;" />
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#000;letter-spacing:-0.5px;">Reset Your Password</h1>
      <p style="margin:0;font-size:15px;color:#86868b;font-weight:500;">We received a request to reset your password.</p>
    </div>
    <div style="padding:32px 40px;text-align:center;">
      <p style="font-size:15px;color:#333;line-height:1.6;margin:0 0 28px;">
        Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
      </p>
      <a href="${resetLink}" style="display:inline-block;background:#0071e3;color:#fff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 32px;border-radius:12px;letter-spacing:-0.2px;">
        Reset Password
      </a>
      <p style="margin:28px 0 0;font-size:13px;color:#aaa;line-height:1.5;">
        If you didn't request this, you can safely ignore this email.<br>
        Your password won't change until you click the link above.
      </p>
    </div>
    <div style="padding:20px 40px;background:#f5f5f7;border-top:1px solid #e8e8e8;">
      <p style="margin:0;font-size:12px;color:#aaa;text-align:center;">Independent Doors Ltd · Customer Portal</p>
    </div>
  </div>
</body>
</html>`,
        }).catch((err: Error) => console.error("[email] Password reset email failed:", err.message));
      }

      res.json({ ok: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: "Token and password are required" });

    try {
      const db = getDb();
      const result = await db.execute({
        sql: "SELECT * FROM password_reset_tokens WHERE token = ?",
        args: [token],
      });
      const record = result.rows[0] as any;

      if (!record) return res.status(400).json({ error: "Invalid or expired reset link" });
      if (Date.now() > Number(record.expiresAt)) {
        await db.execute({ sql: "DELETE FROM password_reset_tokens WHERE token = ?", args: [token] });
        return res.status(400).json({ error: "This reset link has expired. Please request a new one." });
      }

      const hashed = await bcrypt.hash(password, 12);
      await db.execute({
        sql: "UPDATE users SET password = ? WHERE id = ?",
        args: [hashed, record.userId],
      });
      await db.execute({
        sql: "DELETE FROM password_reset_tokens WHERE token = ?",
        args: [token],
      });

      res.json({ ok: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
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
    const { name, defaultMerchant, defaultLocation, defaultGlobalSpecs, role, company, location } = req.body;
    try {
      const db = getDb();
      await db.execute({
        sql: `UPDATE users
              SET name = ?, defaultMerchant = ?, defaultLocation = ?,
                  defaultGlobalSpecs = ?, role = ?, company = ?, location = ?
              WHERE id = ?`,
        args: [
          name,
          defaultMerchant ?? null,
          defaultLocation ?? null,
          defaultGlobalSpecs ? JSON.stringify(defaultGlobalSpecs) : null,
          role ?? null,
          company ?? null,
          location ?? null,
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
    res.json(result.rows.map((o: any) => ({
      ...o,
      data: JSON.parse(o.data as string),
      floorPlanData: o.floorPlanData ? parseJsonField(o.floorPlanData) : null,
    })));
  });

  app.get("/api/orders/drafts/:userId", async (req, res) => {
    try {
      const db = getDb();
      const result = await db.execute({
        sql: "SELECT * FROM orders WHERE userId = ? AND JSON_EXTRACT(data, '$.isDraft') = 1 ORDER BY createdAt DESC",
        args: [req.params.userId],
      });
      res.json(result.rows.map((o: any) => ({
        ...o,
        data: JSON.parse(o.data as string),
        floorPlanData: o.floorPlanData ? parseJsonField(o.floorPlanData) : null,
      })));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/orders", async (req, res) => {
    const { userId, data, floorPlanData } = req.body;
    if (!userId || !data) return res.status(400).json({ error: "userId and data are required" });

    const id = crypto.randomUUID();
    try {
      const db = getDb();

      // Get user info to determine routing
      const userResult = await db.execute({
        sql: "SELECT name, role, email, location FROM users WHERE id = ?",
        args: [userId],
      });
      const user = userResult.rows[0] as any;
      if (!user) return res.status(404).json({ error: "User not found" });

      const userRole = user.role || 'merchant';
      const userLocation = user.location as string | null;
      const userName = (user.name as string) || "Unknown User";
      const userEmail = user.email as string;

      // Determine status based on role
      const isStaff = userRole === 'staff';
      const status = isStaff ? 'pending_review' : 'approved';

      await db.execute({
        sql: "INSERT INTO orders (id, userId, data, status, floorPlanData) VALUES (?, ?, ?, ?, ?)",
        args: [
          id,
          userId,
          JSON.stringify(data),
          status,
          floorPlanData ? JSON.stringify(floorPlanData) : null,
        ],
      });

      if (!isStaff) {
        // merchant or builder — send order email immediately
        const emailTo = (userLocation && LOCATION_EMAILS[userLocation]) || ORDER_EMAIL;
        if (resend) {
          resend.emails.send({
            from: FROM_EMAIL,
            to: emailTo,
            subject: `New Door Order: ${data.jobName || 'Untitled'} — ${data.doors?.length || 0} Door${data.doors?.length !== 1 ? 's' : ''}`,
            html: buildOrderEmailHtml(id, data, userName),
          }).catch((err: Error) => console.error("[email] Order email failed:", err.message));
        }
      } else {
        // staff — send admin notification, do NOT send order email
        if (resend) {
          let notifyEmails: string[] = [];

          // Find admins at same location
          if (userLocation) {
            const adminResult = await db.execute({
              sql: "SELECT email FROM users WHERE role = 'admin' AND location = ?",
              args: [userLocation],
            });
            notifyEmails = adminResult.rows
              .map((r: any) => r.email as string)
              .filter(Boolean);
          }

          // Fall back to location email if no admins found
          if (notifyEmails.length === 0) {
            const fallback = (userLocation && LOCATION_EMAILS[userLocation]) || ORDER_EMAIL;
            notifyEmails = [fallback];
          }

          resend.emails.send({
            from: FROM_EMAIL,
            to: notifyEmails,
            subject: `Spec sheet pending review: ${data.jobName || 'Untitled'}`,
            html: `
              <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
                <h2 style="color:#0071e3;">New Spec Sheet Awaiting Review</h2>
                <p>A new spec sheet is pending your review.</p>
                <p><strong>Job:</strong> ${data.jobName || 'Untitled'}<br>
                <strong>Submitted by:</strong> ${userName} (${userEmail})<br>
                <strong>Doors:</strong> ${data.doors?.length || 0}</p>
                <p>Log in to the admin portal to review, approve, or request changes.</p>
              </div>`,
          }).catch((err: Error) => console.error("[email] Admin notify failed:", err.message));
        }
      }

      res.json({ id, status });
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
        sql: "INSERT INTO orders (id, userId, data, status) VALUES (?, ?, ?, 'draft')",
        args: [orderId, user.id, JSON.stringify(orderData)],
      });

      res.json({ id: orderId, userId: user.id, portalUrl: "/orders/draft/" + orderId });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ── Admin — All orders ──────────────────────────────────────────────────────

  app.get("/api/admin/orders", async (req, res) => {
    if (req.headers["x-admin-password"] !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const db = getDb();
      const result = await db.execute(`
        SELECT orders.id, orders.data, orders.createdAt, orders.userId,
               orders.status, orders.reviewNotes,
               users.name as userName, users.email as userEmail, users.location as userLocation
        FROM orders LEFT JOIN users ON orders.userId = users.id
        ORDER BY orders.createdAt DESC
      `);
      res.json(result.rows.map((o: any) => ({
        id: o.id, createdAt: o.createdAt, userId: o.userId,
        userName: o.userName, userEmail: o.userEmail, userLocation: o.userLocation,
        status: o.status ?? 'approved',
        reviewNotes: o.reviewNotes ?? null,
        data: JSON.parse(o.data as string),
      })));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ── Admin — Review queue ────────────────────────────────────────────────────

  app.get("/api/admin/review-queue", async (req, res) => {
    if (req.headers["x-admin-password"] !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const db = getDb();
      const { location } = req.query;

      let sql = `
        SELECT orders.id, orders.data, orders.createdAt, orders.userId,
               orders.status, orders.floorPlanData, orders.reviewNotes,
               users.name as userName, users.email as userEmail, users.location as userLocation
        FROM orders LEFT JOIN users ON orders.userId = users.id
        WHERE orders.status = 'pending_review'
      `;
      const args: any[] = [];

      if (location && typeof location === 'string') {
        sql += " AND users.location = ?";
        args.push(location);
      }
      sql += " ORDER BY orders.createdAt ASC";

      const result = await db.execute({ sql, args });
      res.json(result.rows.map((o: any) => ({
        id: o.id,
        createdAt: o.createdAt,
        userId: o.userId,
        status: o.status,
        floorPlanData: o.floorPlanData ? parseJsonField(o.floorPlanData) : null,
        reviewNotes: o.reviewNotes ?? null,
        userName: o.userName,
        userEmail: o.userEmail,
        userLocation: o.userLocation,
        data: JSON.parse(o.data as string),
      })));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/orders/:id/approve", async (req, res) => {
    if (req.headers["x-admin-password"] !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const db = getDb();
      const orderId = req.params.id;

      // Get order and user info
      const result = await db.execute({
        sql: `SELECT orders.data, users.name as userName, users.location as userLocation
              FROM orders LEFT JOIN users ON orders.userId = users.id
              WHERE orders.id = ?`,
        args: [orderId],
      });
      const order = result.rows[0] as any;
      if (!order) return res.status(404).json({ error: "Order not found" });

      await db.execute({
        sql: "UPDATE orders SET status = 'approved' WHERE id = ?",
        args: [orderId],
      });

      const data = JSON.parse(order.data as string);
      const emailTo = (order.userLocation && LOCATION_EMAILS[order.userLocation]) || ORDER_EMAIL;

      if (resend) {
        resend.emails.send({
          from: FROM_EMAIL,
          to: emailTo,
          subject: `New Door Order: ${data.jobName || 'Untitled'} — ${data.doors?.length || 0} Door${data.doors?.length !== 1 ? 's' : ''}`,
          html: buildOrderEmailHtml(orderId, data, order.userName || "Unknown"),
        }).catch((err: Error) => console.error("[email] Approval email failed:", err.message));
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/orders/:id/request-changes", async (req, res) => {
    if (req.headers["x-admin-password"] !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const db = getDb();
      const orderId = req.params.id;
      const { reviewNotes } = req.body;

      // Get order and user info
      const result = await db.execute({
        sql: `SELECT orders.data, users.name as userName, users.email as userEmail
              FROM orders LEFT JOIN users ON orders.userId = users.id
              WHERE orders.id = ?`,
        args: [orderId],
      });
      const order = result.rows[0] as any;
      if (!order) return res.status(404).json({ error: "Order not found" });

      await db.execute({
        sql: "UPDATE orders SET status = 'changes_requested', reviewNotes = ? WHERE id = ?",
        args: [reviewNotes || null, orderId],
      });

      const data = JSON.parse(order.data as string);

      if (resend && order.userEmail) {
        resend.emails.send({
          from: FROM_EMAIL,
          to: order.userEmail as string,
          subject: `Changes requested: ${data.jobName || 'Untitled'}`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
              <h2 style="color:#ff9500;">Changes Requested</h2>
              <p>Changes have been requested on your spec sheet for <strong>${data.jobName || 'Untitled'}</strong>.</p>
              ${reviewNotes ? `<p><strong>Notes from reviewer:</strong><br>${reviewNotes}</p>` : ''}
              <p>Please log in to the portal to review and resubmit your order.</p>
            </div>`,
        }).catch((err: Error) => console.error("[email] Changes requested email failed:", err.message));
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ── Manager API (Oliver's agency dashboard) ────────────────────────────────

  const managerAuth = (req: any, res: any, next: any) => {
    const key = req.headers['x-manager-key'];
    if (!key || key !== process.env.MANAGER_API_KEY) {
      return res.status(401).json({ error: 'unauthorized' });
    }
    next();
  };

  // GET /api/manager/stats — aggregate analytics
  app.get('/api/manager/stats', managerAuth, async (_req, res) => {
    try {
      const db = getDb();
      const [users, orders] = await Promise.all([
        db.execute('SELECT role, COUNT(*) as count FROM users GROUP BY role'),
        db.execute(`SELECT
          COUNT(*) as total,
          SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
          SUM(CASE WHEN status = 'pending_review' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'changes_requested' THEN 1 ELSE 0 END) as changes_requested,
          SUM(CASE WHEN created_at > unixepoch('now', '-7 days') THEN 1 ELSE 0 END) as last_7_days,
          SUM(CASE WHEN created_at > unixepoch('now', '-30 days') THEN 1 ELSE 0 END) as last_30_days
          FROM orders WHERE (data->>'isDraft' IS NULL OR data->>'isDraft' != 'true')`),
      ]);
      const totalUsers = await db.execute('SELECT COUNT(*) as count FROM users');
      const newUsersWeek = await db.execute(`SELECT COUNT(*) as count FROM users WHERE created_at > unixepoch('now', '-7 days')`);
      res.json({
        users: {
          total: (totalUsers.rows[0] as any).count,
          byRole: users.rows,
          newThisWeek: (newUsersWeek.rows[0] as any).count,
        },
        orders: orders.rows[0],
      });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // GET /api/manager/users — all users
  app.get('/api/manager/users', managerAuth, async (_req, res) => {
    try {
      const db = getDb();
      const result = await db.execute(`SELECT id, email, name, role, company, location, created_at FROM users ORDER BY created_at DESC`);
      res.json(result.rows);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // PUT /api/manager/users/:id — update user (role, location, etc.)
  app.put('/api/manager/users/:id', managerAuth, async (req, res) => {
    try {
      const db = getDb();
      const { role, location, company, name } = req.body;
      await db.execute({
        sql: 'UPDATE users SET role = COALESCE(?, role), location = COALESCE(?, location), company = COALESCE(?, company), name = COALESCE(?, name) WHERE id = ?',
        args: [role ?? null, location ?? null, company ?? null, name ?? null, req.params.id],
      });
      res.json({ ok: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // DELETE /api/manager/users/:id
  app.delete('/api/manager/users/:id', managerAuth, async (req, res) => {
    try {
      const db = getDb();
      await db.execute({ sql: 'DELETE FROM users WHERE id = ?', args: [req.params.id] });
      res.json({ ok: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // GET /api/manager/orders — all orders with user info
  app.get('/api/manager/orders', managerAuth, async (_req, res) => {
    try {
      const db = getDb();
      const result = await db.execute(`
        SELECT o.id, o.data, o.status, o.created_at, o.review_notes,
               u.name as user_name, u.email as user_email, u.location as user_location, u.role as user_role
        FROM orders o LEFT JOIN users u ON o.user_id = u.id
        WHERE (o.data->>'isDraft' IS NULL OR o.data->>'isDraft' != 'true')
        ORDER BY o.created_at DESC LIMIT 200
      `);
      res.json(result.rows);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // ── Top-level error handler ─────────────────────────────────────────────────
  app.use((err: any, _req: any, res: any, _next: any) => {
    console.error('[express] Unhandled error:', err?.message || err);
    res.status(500).json({ error: err?.message || 'Internal server error' });
  });

  return app;
}
