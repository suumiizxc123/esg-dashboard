export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { indicatorCodes } from "@/data/indicators";
import { createAssessment, listAssessmentsFor } from "@/lib/repo";

export async function GET(request: NextRequest) {
  const user = await requireUser(request);
  if (user instanceof Response) return user;

  const searchParams = request.nextUrl.searchParams;
  const viewAll = searchParams.get("all") === "true" && user.role === "admin";

  const assessments = listAssessmentsFor(user.id, viewAll);

  return NextResponse.json({
    assessments: assessments.sort((a, b) =>
      a.createdAt < b.createdAt ? 1 : -1,
    ),
  });
}

export async function POST(request: NextRequest) {
  const user = await requireUser(request);
  if (user instanceof Response) return user;

  const body = await request.json();
  const level = body.level === "initial" ? "initial" : "development";
  const schoolName = body.schoolName || user.organization || user.name;
  const scores = body.scores || {};

  const normalizedScores: Record<string, number> = {};
  indicatorCodes.forEach((code) => {
    const value = Number(scores[code] ?? 0);
    normalizedScores[code] = Math.max(0, Math.min(4, Number.isFinite(value) ? value : 0));
  });

  const assessment = createAssessment({
    userId: user.id,
    schoolName,
    level,
    scores: normalizedScores,
  });

  return NextResponse.json({ assessment });
}
