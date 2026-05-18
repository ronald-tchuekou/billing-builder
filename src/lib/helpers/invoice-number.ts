import { and, eq, like } from "drizzle-orm";
import { db } from "@/lib/db";
import { invoices } from "@/lib/db/schema";

/**
 * Generates an invoice number in format YYYY-MM-NNN per user/month.
 */
export async function nextInvoiceNumber(userId: string, issueDate: Date): Promise<string> {
  const yyyy = issueDate.getFullYear();
  const mm = String(issueDate.getMonth() + 1).padStart(2, "0");
  const prefix = `${yyyy}-${mm}-`;

  const existing = await db
    .select({ number: invoices.number })
    .from(invoices)
    .where(and(eq(invoices.userId, userId), like(invoices.number, `${prefix}%`)));

  const sequences = existing
    .map((r) => Number(r.number.slice(prefix.length)))
    .filter((n) => !Number.isNaN(n));
  const next = (sequences.length ? Math.max(...sequences) : 0) + 1;
  return `${prefix}${String(next).padStart(3, "0")}`;
}
