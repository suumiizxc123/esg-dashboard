export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { sanitizeUser } from "@/lib/auth";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ user: sanitizeUser(user) });
}
