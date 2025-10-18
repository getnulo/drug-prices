export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const now = await prisma.$queryRaw<{ now: Date }[]>`SELECT NOW() as now`;
    const table = await prisma.$queryRaw<{ exists: boolean }[]>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables WHERE table_name = 'Drug'
      ) as exists
    `;
    return new Response(
      JSON.stringify({
        ok: true,
        now: now?.[0]?.now ?? null,
        drugTableExists: table?.[0]?.exists ?? false
      }),
      { headers: { "content-type": "application/json", "cache-control": "no-store" } }
    );
  } catch (err: any) {
    console.error("dbcheck error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: String(err?.message || err) }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
