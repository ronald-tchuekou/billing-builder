import Link from "next/link";
import { eq, sql, desc } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { invoices, clients } from "@/lib/db/schema";
import { getServerSession } from "@/lib/helpers/session";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession();
  const userId = session!.user.id;

  const [invoicesCount] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(invoices)
    .where(eq(invoices.userId, userId));

  const [clientsCount] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(clients)
    .where(eq(clients.userId, userId));

  const recent = await db.query.invoices.findMany({
    where: (i, { eq }) => eq(i.userId, userId),
    orderBy: (i) => [desc(i.createdAt)],
    limit: 5,
    with: { client: true, items: true, payments: true },
  });

  const outstanding = recent.reduce((sum, inv) => {
    const billed = inv.items.reduce((s, it) => s + Number(it.amount), 0);
    const paid = inv.payments.reduce((s, p) => s + Number(p.amount), 0);
    return sum + Math.max(0, billed - paid);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <Button asChild>
          <Link href="/invoices/new">Nouvelle facture</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Factures</CardDescription>
            <CardTitle>{invoicesCount?.c ?? 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Clients</CardDescription>
            <CardTitle>{clientsCount?.c ?? 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Restant à percevoir (récent)</CardDescription>
            <CardTitle>{formatCurrency(outstanding)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Factures récentes</CardTitle>
          <CardDescription>Les 5 dernières factures émises.</CardDescription>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune facture pour le moment.</p>
          ) : (
            <ul className="divide-y">
              {recent.map((inv) => {
                const billed = inv.items.reduce((s, it) => s + Number(it.amount), 0);
                const paid = inv.payments.reduce((s, p) => s + Number(p.amount), 0);
                const remaining = Math.max(0, billed - paid);
                return (
                  <li key={inv.id} className="flex items-center justify-between py-3">
                    <div>
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="font-medium hover:underline"
                      >
                        {inv.number}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {inv.client?.name} · {formatDate(inv.issueDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={inv.status === "paid" ? "success" : "secondary"}>
                        {inv.status}
                      </Badge>
                      <div className="text-right text-sm">
                        <div>{formatCurrency(billed)}</div>
                        {remaining > 0 && (
                          <div className="text-xs text-muted-foreground">
                            Reste {formatCurrency(remaining)}
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
