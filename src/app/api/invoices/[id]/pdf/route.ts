import { NextResponse } from "next/server";
import { createElement, type ReactElement } from "react";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/helpers/session";
import { InvoiceDocument } from "@/features/invoices/pdf/InvoiceDocument";
import type { InvoiceWithRelations } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  const invoice = JSON.parse(JSON.stringify(row)) as InvoiceWithRelations;
  const element = createElement(InvoiceDocument, { invoice }) as unknown as ReactElement<DocumentProps>;
  const buffer = await renderToBuffer(element);

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="Facture_${row.number}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
