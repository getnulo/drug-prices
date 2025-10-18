import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/autocomplete?q=amox
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();

    if (q.length < 2) return NextResponse.json([]);

    const results = await prisma.drug.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      orderBy: { name: "asc" },
      take: 10,
    });

    return NextResponse.json(
      results.map(d => ({
        rxCui: d.rxCui,
        name: d.name,
        forms: d.forms,
        strengths: d.strengths,
      }))
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Autocomplete failed" }, { status: 500 });
  }
}
