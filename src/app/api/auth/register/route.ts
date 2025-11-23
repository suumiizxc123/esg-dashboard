export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { hashPassword, createToken, sanitizeUser } from "@/lib/auth";
import { createUser, getUserByEmail, ensureSeedAdmin } from "@/lib/repo";
import { Level } from "@/types";

export async function POST(request: NextRequest) {
  ensureSeedAdmin(process.env.SEED_ADMIN_PASSWORD || "admin123");
  const body = await request.json();
  const email: string = (body.email || "").toLowerCase().trim();
  const password: string = body.password || "";
  const name: string = body.name || "School User";
  const organization: string | undefined = body.organization || undefined;
  const levelPreference: Level = body.levelPreference === "initial" ? "initial" : "development";

  if (!email || !password) {
    return NextResponse.json({ error: "Email болон нууц үг шаардлагатай." }, { status: 400 });
  }

  const exists = getUserByEmail(email);
  if (exists) {
    return NextResponse.json({ error: "Энэ имэйлээр бүртгэлтэй хэрэглэгч байна." }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);
  const newUser = {
    id: nanoid(),
    email,
    name,
    role: "school" as const,
    organization,
    levelPreference,
    passwordHash,
  };

  createUser(newUser);

  const token = createToken({ userId: newUser.id, role: newUser.role });

  return NextResponse.json({
    token,
    user: sanitizeUser(newUser),
  });
}
