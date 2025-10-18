export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";

function toErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

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
        drugTableExists: table?.[0]?.exists ?? false,
      }),
      {
        headers: {
          "content-type": "application/json",
          "cache-control": "no-store",
        },
      }
    );
  } catch (err: unknown) {
    const msg = toErrorMessage(err);
    console.error("dbcheck error:", msg);
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
