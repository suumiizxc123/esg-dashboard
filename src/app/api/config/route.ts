export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { mergeIndicatorConfig } from "@/lib/materiality";
import { requireUser } from "@/lib/auth";
import { listOverrides, upsertOverrides } from "@/lib/repo";

export async function GET() {
  const overrides = listOverrides();
  const indicators = mergeIndicatorConfig(overrides || {});
  return NextResponse.json({ indicators, overrides });
}

export async function PUT(request: NextRequest) {
  const user = await requireUser(request);
  if (user instanceof Response) return user;
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Admin эрх шаардлагатай." }, { status: 403 });
  }

  const body = await request.json();
  const updates: Array<{ code: string; weight?: number; impact?: number }> = body.updates || [];

  const overrides = upsertOverrides(updates);
  const indicators = mergeIndicatorConfig(overrides || {});

  return NextResponse.json({ indicators, overrides });
}
