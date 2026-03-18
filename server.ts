import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("database.db");
const resend = new Resend(process.env.RESEND_API_KEY);

const ORDER_EMAIL = process.env.ORDER_EMAIL || "cromwellorders@iddoors.co.nz";
const FROM_EMAIL = process.env.FROM_EMAIL || "portal@iddoors.co.nz";

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT,
    defaultMerchant TEXT,
    defaultLocation TEXT
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    userId TEXT,
    data TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(userId) REFERENCES users(id)
  );
`);

// ── Email helpers ────────────────────────────────────────────────────────────

function buildOrderEmailHtml(orderId: string, data: any, userName: string): string {
  const { jobName, contactName, siteAddress, orderNumber, merchant, requiredBy, deliveryType, globalSpecs, doors } = data;

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

    <!-- Header -->
    <div style="background:#0071e3;padding:32px 40px;display:flex;align-items:center;justify-content:space-between;">
      <div>
        <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">New Door Order</h1>
        <p style="margin:4px 0 0;color:rgba(255,255,255,0.7);font-size:14px;">Submitted via Customer Portal</p>
      </div>
      <div style="background:rgba(255,255,255,0.15);padding:8px 16px;border-radius:100px;">
        <span style="color:#fff;font-size:13px;font-weight:600;">${doors.length} Door${doors.length !== 1 ? 's' : ''}</span>
      </div>
    </div>

    <!-- Job Details -->
    <div style="padding:32px 40px;border-bottom:1px solid #f0f0f0;">
      <h2 style="margin:0 0 20px;font-size:14px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:1px;">Job Details</h2>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;">
        <div>
          <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#aaa;text-transform:uppercase;letter-spacing:0.5px;">Job Name</p>
          <p style="margin:0;font-size:16px;font-weight:700;color:#000;">${jobName || '—'}</p>
        </div>
        <div>
          <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#aaa;text-transform:uppercase;letter-spacing:0.5px;">Contact</p>
          <p style="margin:0;font-size:15px;font-weight:600;color:#333;">${contactName || '—'}</p>
        </div>
        <div>
          <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#aaa;text-transform:uppercase;letter-spacing:0.5px;">Site Address</p>
          <p style="margin:0;font-size:15px;font-weight:600;color:#333;">${siteAddress || '—'}</p>
        </div>
        <div>
          <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#aaa;text-transform:uppercase;letter-spacing:0.5px;">Order #</p>
          <p style="margin:0;font-size:15px;font-weight:600;color:#0071e3;">${orderNumber || 'Pending'}</p>
        </div>
        <div>
          <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#aaa;text-transform:uppercase;letter-spacing:0.5px;">Merchant</p>
          <p style="margin:0;font-size:15px;font-weight:600;color:#333;">${merchant || '—'}</p>
        </div>
        <div>
          <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#aaa;text-transform:uppercase;letter-spacing:0.5px;">Required By</p>
          <p style="margin:0;font-size:15px;font-weight:600;color:#333;">${requiredBy || 'TBC'}</p>
        </div>
        <div>
          <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#aaa;text-transform:uppercase;letter-spacing:0.5px;">Delivery</p>
          <p style="margin:0;font-size:15px;font-weight:600;color:#333;">${deliveryType}</p>
        </div>
        <div>
          <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#aaa;text-transform:uppercase;letter-spacing:0.5px;">Submitted By</p>
          <p style="margin:0;font-size:15px;font-weight:600;color:#333;">${userName}</p>
        </div>
      </div>
    </div>

    <!-- Global Specs -->
    <div style="padding:32px 40px;border-bottom:1px solid #f0f0f0;background:#fafafa;">
      <h2 style="margin:0 0 20px;font-size:14px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:1px;">Global Specs</h2>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;">
        <div>
          <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#aaa;text-transform:uppercase;letter-spacing:0.5px;">Jamb</p>
          <p style="margin:0;font-size:15px;font-weight:600;color:#333;">${globalSpecs.jambStyle} / ${globalSpecs.jambMaterial}</p>
        </div>
        <div>
          <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#aaa;text-transform:uppercase;letter-spacing:0.5px;">Hinges</p>
          <p style="margin:0;font-size:15px;font-weight:600;color:#333;">${globalSpecs.hingeDetails || 'Standard'}</p>
        </div>
        <div>
          <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#aaa;text-transform:uppercase;letter-spacing:0.5px;">Hardware Brand</p>
          <p style="margin:0;font-size:15px;font-weight:600;color:#333;">${globalSpecs.hardwareBrand || '—'}</p>
        </div>
        <div>
          <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#aaa;text-transform:uppercase;letter-spacing:0.5px;">Handle Height</p>
          <p style="margin:0;font-size:15px;font-weight:600;color:#333;">${globalSpecs.handleHeight}mm</p>
        </div>
        <div>
          <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#aaa;text-transform:uppercase;letter-spacing:0.5px;">Drilling</p>
          <p style="margin:0;font-size:15px;font-weight:600;color:#333;">${globalSpecs.drillingRequired ? 'Yes' : 'No'}</p>
        </div>
        <div>
          <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#aaa;text-transform:uppercase;letter-spacing:0.5px;">Robe Track</p>
          <p style="margin:0;font-size:15px;font-weight:600;color:#333;">${globalSpecs.robeTrackColour || '—'}</p>
        </div>
      </div>
    </div>

    <!-- Door Schedule -->
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

    <!-- Footer -->
    <div style="padding:24px 40px;background:#f5f5f7;border-top:1px solid #e8e8e8;display:flex;align-items:center;justify-content:space-between;">
      <p style="margin:0;font-size:13px;color:#aaa;">Order ID: <span style="font-weight:600;color:#666;">${orderId}</span></p>
      <p style="margin:0;font-size:13px;color:#aaa;">Submitted via Independent Doors Customer Portal</p>
    </div>
  </div>
</body>
</html>`;
}

// ── Server ───────────────────────────────────────────────────────────────────

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || "3000", 10);

  app.use(express.json());

  // ── Auth ──────────────────────────────────────────────────────────────────

  app.post("/api/auth/signup", async (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Email, password, and name are required" });
    }
    const id = crypto.randomUUID();
    try {
      const hashed = await bcrypt.hash(password, 12);
      const stmt = db.prepare("INSERT INTO users (id, email, password, name) VALUES (?, ?, ?, ?)");
      stmt.run(id, email.toLowerCase().trim(), hashed, name.trim());
      res.json({ id, email, name });
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
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase().trim()) as any;
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      defaultMerchant: user.defaultMerchant,
      defaultLocation: user.defaultLocation,
    });
  });

  // ── User Profile ──────────────────────────────────────────────────────────

  app.get("/api/user/profile/:id", (req, res) => {
    const user = db.prepare("SELECT id, email, name, defaultMerchant, defaultLocation FROM users WHERE id = ?").get(req.params.id) as any;
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  app.put("/api/user/profile/:id", (req, res) => {
    const { name, defaultMerchant, defaultLocation } = req.body;
    try {
      db.prepare("UPDATE users SET name = ?, defaultMerchant = ?, defaultLocation = ? WHERE id = ?")
        .run(name, defaultMerchant, defaultLocation, req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ── Orders ────────────────────────────────────────────────────────────────

  app.get("/api/orders/:userId", (req, res) => {
    const orders = db.prepare("SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC").all(req.params.userId) as any[];
    res.json(orders.map(o => ({ ...o, data: JSON.parse(o.data) })));
  });

  app.post("/api/orders", async (req, res) => {
    const { userId, data } = req.body;
    if (!userId || !data) {
      return res.status(400).json({ error: "userId and data are required" });
    }
    const id = crypto.randomUUID();
    try {
      db.prepare("INSERT INTO orders (id, userId, data) VALUES (?, ?, ?)").run(id, userId, JSON.stringify(data));

      // Fetch user name for email
      const user = db.prepare("SELECT name, email FROM users WHERE id = ?").get(userId) as any;
      const userName = user?.name || "Unknown User";

      // Send email (non-blocking — don't fail the order if email fails)
      if (process.env.RESEND_API_KEY) {
        resend.emails.send({
          from: FROM_EMAIL,
          to: ORDER_EMAIL,
          subject: `New Door Order: ${data.jobName || 'Untitled'} — ${data.doors?.length || 0} Door${data.doors?.length !== 1 ? 's' : ''}`,
          html: buildOrderEmailHtml(id, data, userName),
        }).catch((err: Error) => {
          console.error("[email] Failed to send order notification:", err.message);
        });
      } else {
        console.warn("[email] RESEND_API_KEY not set — skipping order notification email");
      }

      res.json({ id });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ── Vite / Static ─────────────────────────────────────────────────────────

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
