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

  const migrationsDir = path.join(__dirname, "../migrations");
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    console.log(`Running migration: ${file}...`);
    await pool.query(sql);
  }
  console.log("Migrations complete.");

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

  const defaultCompetitionInfo =
    "<p><strong>Quizzes Week</strong> — PDP University talabalari o'rtasida o'tkaziladigan haftalik interaktiv bilim musobaqasi.</p><p>Har kuni yangi savollar joylashtiriladi, QR kodni skanerlab yoki kodni qo'lda kiritib javob yuborishingiz mumkin. Eng ko'p to'g'ri javob bergan guruh g'olib deb topiladi.</p>";
  await pool.query(
    "INSERT INTO settings (key, value) VALUES ('competition_info', $1) ON CONFLICT (key) DO NOTHING",
    [defaultCompetitionInfo]
  );
  console.log("Default competition info ensured.");

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
