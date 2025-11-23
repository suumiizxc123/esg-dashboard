import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { PublicUser, User } from "@/types";
import { getUserById, ensureSeedAdmin } from "./repo";

const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-prod";

interface TokenPayload {
  userId: string;
  role: User["role"];
}

export function sanitizeUser(user: User): PublicUser {
  const { passwordHash: _passwordHash, ...safe } = user;
  void _passwordHash;
  return safe;
}

export function createToken(payload: TokenPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token?: string): TokenPayload | null {
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function getUserFromRequest(request: NextRequest) {
  ensureSeedAdmin(process.env.SEED_ADMIN_PASSWORD || "admin123");
  const header = request.headers.get("authorization");
  const token =
    header?.startsWith("Bearer ") === true
      ? header.replace("Bearer ", "")
      : request.cookies.get("token")?.value;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = getUserById(payload.userId);
  return user || null;
}

export async function requireUser(
  request: NextRequest,
): Promise<User | Response> {
  const user = await getUserFromRequest(request);
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }
  return user;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(hash: string, password: string) {
  return bcrypt.compare(password, hash);
}
