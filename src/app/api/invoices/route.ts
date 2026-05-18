import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { invoices, invoiceItems, payments, user as userTable } from "@/lib/db/schema";
import { getServerSession } from "@/lib/helpers/session";
import { invoiceSchema } from "@/features/invoices/schemas";
import { nextInvoiceNumber } from "@/lib/helpers/invoice-number";

export async function GET() {
  const session = await getServerSession();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const rows = await db.query.invoices.findMany({
    where: (i, { eq }) => eq(i.userId, session.user.id),
    orderBy: (i) => [desc(i.createdAt)],
    with: { client: true, items: true, payments: true },
  });
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const body = await request.json();
  const parsed = invoiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;
  const issueDate = new Date(data.issueDate);
  const number = await nextInvoiceNumber(session.user.id, issueDate);
  const id = crypto.randomUUID();

  const [issuer] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, session.user.id));

  await db.insert(invoices).values({
    id,
    userId: session.user.id,
    clientId: data.clientId,
    number,
    issueDate,
    dueInDays: data.dueInDays,
    status: data.status,
    currency: data.currency,
    notes: data.notes ?? null,
    issuerName: issuer?.businessName ?? issuer?.name ?? null,
    issuerAddress: issuer?.businessAddress ?? null,
    issuerSiret: issuer?.siret ?? null,
    issuerVat: issuer?.vatNumber ?? null,
    issuerIban: issuer?.iban ?? null,
    issuerBic: issuer?.bic ?? null,
    issuerBank: issuer?.bankName ?? null,
    issuerBankAddress: issuer?.bankAddress ?? null,
  });

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
  return NextResponse.json(row, { status: 201 });
}
