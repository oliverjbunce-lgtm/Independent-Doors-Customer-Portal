import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("database.db");

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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Auth Routes
  app.post("/api/auth/signup", (req, res) => {
    const { email, password, name } = req.body;
    const id = crypto.randomUUID();
    try {
      const stmt = db.prepare("INSERT INTO users (id, email, password, name) VALUES (?, ?, ?, ?)");
      stmt.run(id, email, password, name); // In a real app, hash the password!
      res.json({ id, email, name });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password) as any;
    if (user) {
      res.json({ id: user.id, email: user.email, name: user.name, defaultMerchant: user.defaultMerchant, defaultLocation: user.defaultLocation });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  // User Profile
  app.get("/api/user/profile/:id", (req, res) => {
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id) as any;
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  app.put("/api/user/profile/:id", (req, res) => {
    const { name, defaultMerchant, defaultLocation } = req.body;
    try {
      const stmt = db.prepare("UPDATE users SET name = ?, defaultMerchant = ?, defaultLocation = ? WHERE id = ?");
      stmt.run(name, defaultMerchant, defaultLocation, req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Orders
  app.get("/api/orders/:userId", (req, res) => {
    const orders = db.prepare("SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC").all(req.params.userId) as any[];
    res.json(orders.map(o => ({ ...o, data: JSON.parse(o.data) })));
  });

  app.post("/api/orders", (req, res) => {
    const { userId, data } = req.body;
    const id = crypto.randomUUID();
    try {
      const stmt = db.prepare("INSERT INTO orders (id, userId, data) VALUES (?, ?, ?)");
      stmt.run(id, userId, JSON.stringify(data));
      res.json({ id });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
