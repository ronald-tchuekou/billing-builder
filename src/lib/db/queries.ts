import { db } from "@/lib/db";
import { invoices, clients } from "@/lib/db/schema";
import { eq, sql, and, gte } from "drizzle-orm";

export type MonthlyRevenue = { month: string; revenue: number };

export async function getMonthlyRevenue(
  userId: string,
  months = 12
): Promise<MonthlyRevenue[]> {
  const rows = await db.execute(sql`
    SELECT
      to_char(date_trunc('month', i.issue_date), 'YYYY-MM') AS month,
      COALESCE(SUM(ii.amount::numeric), 0)::float AS revenue
    FROM invoices i
    LEFT JOIN invoice_items ii ON ii.invoice_id = i.id
    WHERE
      i.user_id = ${userId}
      AND i.issue_date >= date_trunc('month', now()) - (${months - 1} || ' months')::interval
    GROUP BY date_trunc('month', i.issue_date)
    ORDER BY date_trunc('month', i.issue_date) ASC
  `);
  return rows.rows as MonthlyRevenue[];
}

export type DashboardStats = {
  invoicesTotal: number;
  invoicesThisMonth: number;
  invoicesPrevMonth: number;
  clientsTotal: number;
  clientsThisMonth: number;
  clientsPrevMonth: number;
  outstanding: number;
};

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [invTotal] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(invoices)
    .where(eq(invoices.userId, userId));

  const [invThisMonth] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(invoices)
    .where(and(eq(invoices.userId, userId), gte(invoices.createdAt, startOfMonth)));

  const [invPrevMonth] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(invoices)
    .where(
      and(
        eq(invoices.userId, userId),
        gte(invoices.createdAt, startOfPrevMonth),
        sql`${invoices.createdAt} < ${startOfMonth.toISOString()}`
      )
    );

  const [cliTotal] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(clients)
    .where(eq(clients.userId, userId));

  const [cliThisMonth] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(clients)
    .where(and(eq(clients.userId, userId), gte(clients.createdAt, startOfMonth)));

  const [cliPrevMonth] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(clients)
    .where(
      and(
        eq(clients.userId, userId),
        gte(clients.createdAt, startOfPrevMonth),
        sql`${clients.createdAt} < ${startOfMonth.toISOString()}`
      )
    );

  const allInvs = await db.query.invoices.findMany({
    where: (i, { eq }) => eq(i.userId, userId),
    with: { items: true, payments: true },
  });
  const outstanding = allInvs.reduce((sum, inv) => {
    const billed = inv.items.reduce((s, it) => s + Number(it.amount), 0);
    const paid = inv.payments.reduce((s, p) => s + Number(p.amount), 0);
    return sum + Math.max(0, billed - paid);
  }, 0);

  return {
    invoicesTotal: invTotal?.count ?? 0,
    invoicesThisMonth: invThisMonth?.count ?? 0,
    invoicesPrevMonth: invPrevMonth?.count ?? 0,
    clientsTotal: cliTotal?.count ?? 0,
    clientsThisMonth: cliThisMonth?.count ?? 0,
    clientsPrevMonth: cliPrevMonth?.count ?? 0,
    outstanding,
  };
}
