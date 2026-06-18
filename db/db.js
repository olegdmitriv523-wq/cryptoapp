const sqlite3 = require("sqlite3").verbose();

// 🔥 створення / підключення бази
const db = new sqlite3.Database("./db.sqlite", (err) => {
  if (err) {
    console.error("DB ERROR:", err);
  } else {
    console.log("✅ Connected to SQLite");
  }
});

// ===== USERS =====
db.run(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  password TEXT,
  balance REAL DEFAULT 1000,
  deposit REAL DEFAULT 0,
  wallet TEXT,
  private_key TEXT,
  referrer_id INTEGER
)
`);

// ===== REFERRALS =====
db.run(`
CREATE TABLE IF NOT EXISTS referrals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  referral_id INTEGER
)
`);

module.exports = db;