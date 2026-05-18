import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { getServerSession } from "@/lib/helpers/session";
import { clientSchema } from "@/features/clients/schemas";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const session = await getServerSession();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });
  const { id } = await ctx.params;
  const [row] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.id, id), eq(clients.userId, session.user.id)));
  if (!row) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json(row);
}

export async function PATCH(request: Request, ctx: Ctx) {
  const session = await getServerSession();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });
  const { id } = await ctx.params;
  const body = await request.json();
  const parsed = clientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
  }
  const [row] = await db
    .update(clients)
    .set({
      name: parsed.data.name,
      contactName: parsed.data.contactName ?? null,
      email: parsed.data.email ? parsed.data.email : null,
      phone: parsed.data.phone ?? null,
      address: parsed.data.address ?? null,
      vatNumber: parsed.data.vatNumber ?? null,
      notes: parsed.data.notes ?? null,
      updatedAt: new Date(),
    })
    .where(and(eq(clients.id, id), eq(clients.userId, session.user.id)))
    .returning();
  if (!row) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const session = await getServerSession();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });
  const { id } = await ctx.params;
  await db
    .delete(clients)
    .where(and(eq(clients.id, id), eq(clients.userId, session.user.id)));
  return new NextResponse(null, { status: 204 });
}
