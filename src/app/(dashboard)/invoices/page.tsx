"use client";

import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useInvoices } from "@/features/invoices/hooks";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function InvoicesPage() {
  const { data, isLoading } = useInvoices();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Factures</h1>
          <p className="text-sm text-muted-foreground">Toutes tes factures émises.</p>
        </div>
        <Button asChild>
          <Link href="/invoices/new">
            <Plus className="h-4 w-4" /> Nouvelle facture
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste</CardTitle>
          <CardDescription>
            {data ? `${data.length} facture(s)` : "Chargement..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Chargement...</p>
          ) : !data || data.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune facture.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N°</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Restant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-24 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((inv) => {
                  const billed = inv.items.reduce((s, it) => s + Number(it.amount), 0);
                  const paid = inv.payments.reduce((s, p) => s + Number(p.amount), 0);
                  const remaining = Math.max(0, billed - paid);
                  return (
                    <TableRow key={inv.id}>
                      <TableCell>
                        <Link
                          href={`/invoices/${inv.id}`}
                          className="font-medium hover:underline"
                        >
                          {inv.number}
                        </Link>
                      </TableCell>
                      <TableCell>{inv.client?.name}</TableCell>
                      <TableCell>{formatDate(inv.issueDate)}</TableCell>
                      <TableCell>{formatCurrency(billed, inv.currency)}</TableCell>
                      <TableCell>{formatCurrency(remaining, inv.currency)}</TableCell>
                      <TableCell>
                        <Badge variant={inv.status === "paid" ? "default" : "secondary"}>
                          {inv.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="icon" variant="ghost">
                          <a
                            href={`/api/invoices/${inv.id}/pdf`}
                            target="_blank"
                            rel="noreferrer"
                            aria-label="PDF"
                          >
                            <FileText className="h-4 w-4" />
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
