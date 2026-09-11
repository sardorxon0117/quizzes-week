require("dotenv").config({ path: ".env.local" });
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const sql = fs.readFileSync(path.join(__dirname, "../migrations/001_init.sql"), "utf8");
  console.log("Running migration...");
  await pool.query(sql);
  console.log("Migration complete.");

  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const existing = await pool.query("SELECT id FROM admin_users WHERE username = $1", [username]);
  if (existing.rows.length === 0) {
    const hash = await bcrypt.hash(password, 10);
    await pool.query("INSERT INTO admin_users (username, password_hash) VALUES ($1, $2)", [username, hash]);
    console.log(`Admin user created: ${username}`);
  } else {
    console.log("Admin user already exists, skipping.");
  }

  const seedGroups = ["FN-101", "FE-102", "FL-103", "BE-201", "MA-202"];
  for (const g of seedGroups) {
    await pool.query("INSERT INTO groups (name) VALUES ($1) ON CONFLICT (name) DO NOTHING", [g]);
  }
  console.log("Seed groups ensured.");

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
