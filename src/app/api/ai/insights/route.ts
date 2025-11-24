export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const model = "gpt-4o-mini";

export async function POST(request: NextRequest) {
  const apiKey =
    process.env.OPENAI_API_KEY?.trim() ||
    process.env.OPEN_API_KEY?.trim() ||
    process.env.NEXT_PUBLIC_OPENAI_API_KEY?.trim();

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "OpenAI API key тохироогүй байна. .env.local файлдаа OPENAI_API_KEY (эсвэл OPEN_API_KEY) утгаа оруулаад серверээ дахин асаана уу.",
      },
      { status: 500 },
    );
  }

  const payload = await request.json();
  const level = payload.level || "initial";
  const overall = payload.overall ?? 0;
  const weakest: Array<{ code: string; label: string; score: number }> = payload.weakest || [];
  const highMaterial: Array<string> = payload.highMaterial || [];
  const customNote: string = payload.note || "";
  const recs: Array<{ code: string; label: string; actions: string[]; score?: number; impact?: number }> =
    payload.recommendations || [];

  const openai = new OpenAI({ apiKey });

  try {
    const response = await openai.chat.completions.create({
      model,
      temperature: 0.35,
      messages: [
        {
          role: "system",
          content:
            "Та Монголын их, дээд сургуулиудад зориулсан ESG/БОНЗ зөвлөх. Дан Монгол хэлээр, цэгцтэй, богино өгүүлбэрээр зөвлөмж гаргана. 3 тэргүүлэх чиглэл, 3 ойрын алхмыг жагсааж, давхардсан санаа бүү оруул. Энерги, ялгарлын тооцоо, ёс зүй/авилгын удирдлага, аудит, тайлагнал зэрэг стандарт ESG практикийг санал болго. Загвар: ChatGPT-4o mini.",
        },
        {
          role: "user",
          content: `Өөрийн үнэлгээний товчоон:
- Түвшин: ${level}
- Нийт оноо: ${overall}
- Сул үзүүлэлт: ${weakest
  .map((item) => `${item.code} (${item.label}) = ${item.score}`)
  .join(", ") || "—"}
- High-high материаллаг: ${highMaterial.join(", ") || "байхгүй"}
- Нэмэлт тайлбар: ${customNote || "—"}
- Дотоод зөвлөмжийн санаанууд: ${recs
  .map(
    (item) =>
      `${item.code} ${item.label} (оноо: ${item.score ?? "-"}, нөлөөлөл: ${item.impact ?? "-"}) → ${item.actions
        .slice(0, 2)
        .join(" / ")}`,
  )
  .join(" | ") || "—"}

Гаралт: 
- "Тэргүүлэх чиглэл" гарчгийн дор 3 суман жагсаалт (50 үг хүртэл).
- "Ойрын алхам" гарчгийн дор 3 суман жагсаалт (50 үг хүртэл).
- Богино, хэрэгжүүлэхүйц, шалгахуйц байх.`,
        },
      ],
      max_tokens: 320,
    });

    const text = response.choices[0]?.message?.content || "Зөвлөмж үүсгэхэд алдаа гарлаа.";
    return NextResponse.json({ text });
  } catch (error) {
    console.error("AI insights error:", error);

    if (error instanceof OpenAI.APIError) {
      const message =
        error.status === 401 || error.status === 403
          ? "OpenAI API key буруу эсвэл зөвшөөрөлгүй байна. Клүүчээ шалгана уу."
          : error.message || "AI зөвлөмж гаргах үед алдаа гарлаа.";
      return NextResponse.json({ error: message }, { status: error.status || 500 });
    }

    return NextResponse.json({ error: "AI зөвлөмж гаргах үед алдаа гарлаа." }, { status: 500 });
  }
}
