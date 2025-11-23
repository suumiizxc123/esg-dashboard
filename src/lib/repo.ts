import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { Database, IndicatorOverride, User } from "@/types";
import { nanoid } from "nanoid";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

const seedAdminEmail = "admin@bonz.local";

const defaultDb: Database = {
  users: [],
  assessments: [],
  indicatorOverrides: {},
};

function readDb(): Database {
  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw) as Database;
  } catch {
    return defaultDb;
  }
}

function writeDb(db: Database) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

export function ensureSeedAdmin(seedPassword: string) {
  const db = readDb();
  const existing = db.users.find((u) => u.email === seedAdminEmail);
  if (existing) return existing;

  const passwordHash = bcrypt.hashSync(seedPassword, 10);
  const user: User = {
    id: "seed-admin",
    email: seedAdminEmail,
    name: "ESG Admin",
    role: "admin",
    organization: "Platform",
    levelPreference: "development",
    passwordHash,
  };
  db.users.push(user);
  writeDb(db);
  return user;
}

export function getUserByEmail(email: string) {
  const db = readDb();
  return db.users.find((u) => u.email === email);
}

export function getUserById(id: string) {
  const db = readDb();
  return db.users.find((u) => u.id === id);
}

export function createUser(user: User) {
  const db = readDb();
  db.users.push(user);
  writeDb(db);
  return user;
}

export function listUsers(): User[] {
  return readDb().users;
}

export function listAssessmentsFor(userId?: string, all = false) {
  const db = readDb();
  const rows = db.assessments;
  const filtered = all || !userId ? rows : rows.filter((row) => row.userId === userId);
  return filtered;
}

export function createAssessment(payload: {
  userId: string;
  schoolName: string;
  level: "initial" | "development";
  scores: Record<string, number>;
}) {
  const db = readDb();
  const assessment = {
    id: nanoid(),
    userId: payload.userId,
    schoolName: payload.schoolName,
    level: payload.level,
    scores: payload.scores,
    createdAt: new Date().toISOString(),
  };
  db.assessments.push(assessment);
  writeDb(db);
  return assessment;
}

export function listOverrides(): Record<string, IndicatorOverride> {
  return readDb().indicatorOverrides || {};
}

export function upsertOverrides(
  updates: Array<{ code: string; weight?: number; impact?: number }>,
): Record<string, IndicatorOverride> {
  const db = readDb();
  db.indicatorOverrides = db.indicatorOverrides || {};
  updates.forEach((entry) => {
    if (!entry.code) return;
    const normalized = db.indicatorOverrides[entry.code] || {};
    if (typeof entry.weight === "number" && !Number.isNaN(entry.weight)) {
      normalized.weight = Number(entry.weight);
    }
    if (typeof entry.impact === "number" && !Number.isNaN(entry.impact)) {
      normalized.impact = Number(entry.impact);
    }
    db.indicatorOverrides[entry.code] = normalized;
  });
  writeDb(db);
  return db.indicatorOverrides;
}

export function getDatabaseSnapshot(): Database {
  return readDb();
}
