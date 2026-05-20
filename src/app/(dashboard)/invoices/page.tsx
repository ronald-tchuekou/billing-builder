"use client";

import {useState} from "react";
import Link from "next/link";
import {ArrowUpDown, FileText, Plus} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Skeleton} from "@/components/ui/skeleton";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {useInvoices} from "@/features/invoices/hooks";
import {formatCurrency, formatDate} from "@/lib/utils";
import type {InvoiceStatus} from "@/types";

const STATUS_BADGE: Record<InvoiceStatus, { label: string; className: string }> = {
  draft: {label: "Brouillon", className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"},
  sent: {label: "Envoyée", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"},
  partial: {label: "Partielle", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"},
  paid: {label: "Payée", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"},
  overdue: {label: "En retard", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"},
  cancelled: {label: "Annulée", className: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"},
};

type TabValue = "all" | "pending" | "paid" | "overdue";
type SortBy = "date" | "amount";
type SortDir = "asc" | "desc";

export default function InvoicesPage() {
  const {data: invoices = [], isLoading, isError} = useInvoices();
  const [tab, setTab] = useState<TabValue>("all");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function handleSort(field: SortBy) {
    if (sortBy === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
  }

  const filtered = invoices.filter((inv) => {
    if (tab === "pending") return inv.status === "sent" || inv.status === "partial";
    if (tab === "paid") return inv.status === "paid";
    if (tab === "overdue") return inv.status === "overdue";
    return true;
  });

  const sorted = filtered.slice().sort((a, b) => {
    const aVal =
      sortBy === "date"
        ? new Date(a.issueDate).getTime()
        : a.items.reduce((s, it) => s + Number(it.amount), 0);
    const bVal =
      sortBy === "date"
        ? new Date(b.issueDate).getTime()
        : b.items.reduce((s, it) => s + Number(it.amount), 0);
    return sortDir === "asc" ? aVal - bVal : bVal - aVal;
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Factures</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez et suivez toutes vos factures
          </p>
        </div>
        <Button asChild>
          <Link href="/invoices/new">
            <Plus className="mr-2 h-4 w-4"/>
            Nouvelle facture
          </Link>
        </Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)}>
        <div className="flex items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="all">Tous</TabsTrigger>
            <TabsTrigger value="pending">En attente</TabsTrigger>
            <TabsTrigger value="paid">Payées</TabsTrigger>
            <TabsTrigger value="overdue">En retard</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSort("date")}
              className={sortBy === "date" ? "text-primary" : ""}
            >
              <ArrowUpDown className="mr-1.5 h-3.5 w-3.5"/>
              Date
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSort("amount")}
              className={sortBy === "amount" ? "text-primary" : ""}
            >
              <ArrowUpDown className="mr-1.5 h-3.5 w-3.5"/>
              Montant
            </Button>
          </div>
        </div>

        {(["all", "pending", "paid", "overdue"] as TabValue[]).map((tabValue) => (
          <TabsContent key={tabValue} value={tabValue} className="mt-4">
            {isError ? (
              <div
                className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                Une erreur est survenue lors du chargement des factures.
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">#</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Client</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Montant</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Statut</th>
                  </tr>
                  </thead>
                  <tbody>
                  {isLoading ? (
                    Array.from({length: 8}).map((_, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="px-4 py-3"><Skeleton className="h-4 w-20"/></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-32"/></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-24"/></td>
                        <td className="px-4 py-3 text-right"><Skeleton className="h-4 w-20 ml-auto"/></td>
                        <td className="px-4 py-3"><Skeleton className="h-5 w-16 rounded-full"/></td>
                      </tr>
                    ))
                  ) : sorted.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                          <FileText className="h-10 w-10 text-muted-foreground/40"/>
                          <p className="text-sm text-muted-foreground">Aucune facture</p>
                          <Button asChild size="sm" variant="outline">
                            <Link href="/invoices/new">Créer une facture</Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    sorted.map((inv) => {
                      const total = inv.items.reduce((s, it) => s + Number(it.amount), 0);
                      const badge = STATUS_BADGE[inv.status];
                      return (
                        <tr
                          key={inv.id}
                          className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <Link
                              href={`/invoices/${inv.id}`}
                              className="font-medium hover:underline"
                            >
                              {inv.number}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{inv.client.name}</td>
                          <td className="px-4 py-3 text-muted-foreground">{formatDate(inv.issueDate)}</td>
                          <td className="px-4 py-3 text-right font-medium">
                            {formatCurrency(total, inv.currency)}
                          </td>
                          <td className="px-4 py-3">
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}
                                >
                                  {badge.label}
                                </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
