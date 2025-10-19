import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Strongly prefer Node runtime for Prisma
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/autocomplete?q=amox
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const qRaw = (searchParams.get("q") || "").trim();

    // tiny guards
    if (qRaw.length < 2) {
      return NextResponse.json([], { headers: { "cache-control": "no-store" } });
    }
    const q = qRaw.slice(0, 50); // cap length to avoid pathological queries

    // NOTE: ensure your Prisma model is `Drug` (PascalCase) unless you named it differently.
    const results = await prisma.drug.findMany({
      where: { name: { startsWith: q, mode: "insensitive" } }, // faster than contains for autocomplete
      orderBy: { name: "asc" },
      take: 10,
      select: {
        rxCui: true,
        name: true,
        forms: true,
        strengths: true,
      },
    });

    return NextResponse.json(results, {
      headers: { "cache-control": "no-store" },
    });
  } catch (err) {
    console.error("autocomplete error:", err);
    return NextResponse.json(
      { error: "Autocomplete failed" },
      { status: 500, headers: { "cache-control": "no-store" } }
    );
  }
}
