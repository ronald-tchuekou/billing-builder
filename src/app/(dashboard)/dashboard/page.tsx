import Link from "next/link";
import { desc } from "drizzle-orm";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/helpers/session";
import { getDashboardStats, getMonthlyRevenue } from "@/lib/db/queries";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { FadeInUp, StaggerChildren } from "@/components/ui/motion";
import type { InvoiceStatus } from "@/types";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<InvoiceStatus, { label: string; className: string }> = {
  draft:      { label: "Brouillon", className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  sent:       { label: "Envoyée",   className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  partial:    { label: "Partielle", className: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" },
  paid:       { label: "Payée",     className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" },
  overdue:    { label: "En retard", className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
  cancelled:  { label: "Annulée",   className: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400" },
};

function Delta({ current, prev }: { current: number; prev: number }) {
  const diff = current - prev;
  if (diff === 0) return <span className="flex items-center gap-0.5 text-xs text-muted-foreground"><Minus className="h-3 w-3" />0 ce mois</span>;
  const positive = diff > 0;
  return (
    <span className={cn("flex items-center gap-0.5 text-xs font-medium", positive ? "text-emerald-600" : "text-red-500")}>
      {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {positive ? "+" : ""}{diff} ce mois
    </span>
  );
}

export default async function DashboardPage() {
  const session = await getServerSession();
  const userId = session!.user.id;

  const [stats, monthlyRevenue, recent] = await Promise.all([
    getDashboardStats(userId),
    getMonthlyRevenue(userId, 12),
    db.query.invoices.findMany({
      where: (i, { eq }) => eq(i.userId, userId),
      orderBy: (i) => [desc(i.createdAt)],
      limit: 5,
      with: { client: true, items: true, payments: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <FadeInUp className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-sm text-muted-foreground">Vue d'ensemble de votre activité</p>
        </div>
        <Button asChild size="sm">
          <Link href="/invoices/new">+ Nouvelle facture</Link>
        </Button>
      </FadeInUp>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <FadeInUp delay={0.05}>
          <div className="rounded-xl border bg-card p-6">
            <p className="text-sm font-medium text-muted-foreground">Factures</p>
            <p className="mt-1 text-3xl font-bold">{stats.invoicesTotal}</p>
            <div className="mt-2">
              <Delta current={stats.invoicesThisMonth} prev={stats.invoicesPrevMonth} />
            </div>
          </div>
        </FadeInUp>

        <FadeInUp delay={0.1}>
          <div className="rounded-xl border bg-card p-6">
            <p className="text-sm font-medium text-muted-foreground">Clients</p>
            <p className="mt-1 text-3xl font-bold">{stats.clientsTotal}</p>
            <div className="mt-2">
              <Delta current={stats.clientsThisMonth} prev={stats.clientsPrevMonth} />
            </div>
          </div>
        </FadeInUp>

        <FadeInUp delay={0.15}>
          <div className="rounded-xl border bg-gradient-to-br from-primary to-violet-600 p-6 text-primary-foreground">
            <p className="text-sm font-medium opacity-80">Encours</p>
            <p className="mt-1 text-3xl font-bold">{formatCurrency(stats.outstanding)}</p>
            <p className="mt-2 text-xs opacity-70">À percevoir</p>
          </div>
        </FadeInUp>
      </div>

      {/* Revenue Chart */}
      <RevenueChart data={monthlyRevenue} />

      {/* Recent Invoices */}
      <FadeInUp delay={0.25}>
        <div className="rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div>
              <h3 className="font-semibold">Factures récentes</h3>
              <p className="text-sm text-muted-foreground">Les 5 dernières factures émises</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/invoices">Voir tout →</Link>
            </Button>
          </div>
          {recent.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground">
              Aucune facture pour le moment.{" "}
              <Link href="/invoices/new" className="text-primary underline-offset-4 hover:underline">
                Créer votre première facture
              </Link>
            </div>
          ) : (
            <StaggerChildren stagger={0.04} className="divide-y">
              {recent.map((inv) => {
                const billed = inv.items.reduce((s, it) => s + Number(it.amount), 0);
                const paid = inv.payments.reduce((s, p) => s + Number(p.amount), 0);
                const remaining = Math.max(0, billed - paid);
                const badge = STATUS_BADGE[inv.status as InvoiceStatus];
                return (
                  <div key={inv.id} className="flex items-center justify-between px-6 py-3">
                    <div className="min-w-0">
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="font-medium text-sm hover:text-primary transition-colors"
                      >
                        {inv.number}
                      </Link>
                      <p className="text-xs text-muted-foreground truncate">
                        {inv.client?.name} · {formatDate(inv.issueDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 ml-4 shrink-0">
                      <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", badge.className)}>
                        {badge.label}
                      </span>
                      <div className="text-right text-sm">
                        <div className="font-medium">{formatCurrency(billed)}</div>
                        {remaining > 0 && (
                          <div className="text-xs text-muted-foreground">
                            Reste {formatCurrency(remaining)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </StaggerChildren>
          )}
        </div>
      </FadeInUp>
    </div>
  );
}
