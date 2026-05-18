import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { invoices, invoiceItems, payments } from "@/lib/db/schema";
import { getServerSession } from "@/lib/helpers/session";
import { invoiceSchema } from "@/features/invoices/schemas";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const session = await getServerSession();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });
  const { id } = await ctx.params;
  const row = await db.query.invoices.findFirst({
    where: (i, { and, eq }) => and(eq(i.id, id), eq(i.userId, session.user.id)),
    with: { client: true, items: true, payments: true },
  });
  if (!row) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json(row);
}

export async function PATCH(request: Request, ctx: Ctx) {
  const session = await getServerSession();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });
  const { id } = await ctx.params;
  const body = await request.json();
  const parsed = invoiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const [existing] = await db
    .select()
    .from(invoices)
    .where(and(eq(invoices.id, id), eq(invoices.userId, session.user.id)));
  if (!existing) return new NextResponse("Not found", { status: 404 });

  await db
    .update(invoices)
    .set({
      clientId: data.clientId,
      issueDate: new Date(data.issueDate),
      dueInDays: data.dueInDays,
      status: data.status,
      currency: data.currency,
      notes: data.notes ?? null,
      updatedAt: new Date(),
    })
    .where(eq(invoices.id, id));

  await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id));
  if (data.items.length) {
    await db.insert(invoiceItems).values(
      data.items.map((it, idx) => ({
        id: crypto.randomUUID(),
        invoiceId: id,
        description: it.description,
        unitPrice: it.unitPrice.toFixed(2),
        quantity: it.quantity.toFixed(2),
        unitLabel: it.unitLabel,
        amount: (it.unitPrice * it.quantity).toFixed(2),
        position: idx,
      }))
    );
  }

  await db.delete(payments).where(eq(payments.invoiceId, id));
  if (data.payments?.length) {
    await db.insert(payments).values(
      data.payments.map((p) => ({
        id: crypto.randomUUID(),
        invoiceId: id,
        amount: p.amount.toFixed(2),
        paidAt: new Date(p.paidAt),
        method: p.method ?? null,
        reference: p.reference ?? null,
      }))
    );
  }

  const row = await db.query.invoices.findFirst({
    where: (i, { eq }) => eq(i.id, id),
    with: { client: true, items: true, payments: true },
  });
  return NextResponse.json(row);
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const session = await getServerSession();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });
  const { id } = await ctx.params;
  await db
    .delete(invoices)
    .where(and(eq(invoices.id, id), eq(invoices.userId, session.user.id)));
  return new NextResponse(null, { status: 204 });
}
