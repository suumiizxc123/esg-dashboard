export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { comparePassword, createToken, sanitizeUser } from "@/lib/auth";
import { ensureSeedAdmin, getUserByEmail } from "@/lib/repo";

export async function POST(request: NextRequest) {
  ensureSeedAdmin(process.env.SEED_ADMIN_PASSWORD || "admin123");
  const body = await request.json();
  const email: string = (body.email || "").toLowerCase().trim();
  const password: string = body.password || "";

  if (!email || !password) {
    return NextResponse.json({ error: "Имэйл ба нууц үг бөглөнө үү." }, { status: 400 });
  }

  const user = getUserByEmail(email);
  if (!user) {
    return NextResponse.json({ error: "Бүртгэл олдсонгүй." }, { status: 404 });
  }

  const ok = await comparePassword(user.passwordHash, password);
  if (!ok) {
    return NextResponse.json({ error: "Нууц үг буруу." }, { status: 401 });
  }

  const token = createToken({ userId: user.id, role: user.role });
  return NextResponse.json({ token, user: sanitizeUser(user) });
}
