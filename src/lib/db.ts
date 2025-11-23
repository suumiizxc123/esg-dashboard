import fs from "fs/promises";
import path from "path";
import bcrypt from "bcryptjs";
import { Database, User } from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

const seedAdminEmail = "admin@bonz.local";
const seedAdmin: User = {
  id: "seed-admin",
  email: seedAdminEmail,
  name: "ESG Admin",
  role: "admin",
  organization: "Platform",
  levelPreference: "development",
  passwordHash: bcrypt.hashSync(
    process.env.SEED_ADMIN_PASSWORD || "admin123",
    10,
  ),
};

const defaultDb: Database = {
  users: [seedAdmin],
  assessments: [],
  indicatorOverrides: {},
};

async function persist(db: Database) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

function ensureSeedAdmin(db: Database): { db: Database; changed: boolean } {
  const hasSeed = db.users.some((user) => user.email === seedAdminEmail);
  if (hasSeed) {
    return { db, changed: false };
  }

  db.users.push(seedAdmin);
  return { db, changed: true };
}

export async function readDb(): Promise<Database> {
  try {
    const raw = await fs.readFile(DB_PATH, "utf-8");
    const parsed: Database = JSON.parse(raw);
    const ensured = ensureSeedAdmin(parsed);
    if (ensured.changed) {
      await persist(ensured.db);
    }
    return ensured.db;
  } catch (error) {
    console.error("DB not found, creating a fresh one.", error);
    await persist(defaultDb);
    return defaultDb;
  }
}

export async function writeDb(db: Database): Promise<void> {
  await persist(db);
}

export async function updateDb(
  mutator: (db: Database) => void | Database,
): Promise<Database> {
  const db = await readDb();
  const result = mutator(db);
  const nextDb = result && typeof result === "object" ? (result as Database) : db;
  await writeDb(nextDb);
  return nextDb;
}
