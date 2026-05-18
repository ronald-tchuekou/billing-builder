"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Download, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useInvoice, useDeleteInvoice } from "@/features/invoices/hooks";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data, isLoading } = useInvoice(id);
  const remove = useDeleteInvoice();

  if (isLoading) return <p className="text-sm text-muted-foreground">Chargement...</p>;
  if (!data) return <p className="text-sm text-muted-foreground">Facture introuvable.</p>;

  const billed = data.items.reduce((s, it) => s + Number(it.amount), 0);
  const paid = data.payments.reduce((s, p) => s + Number(p.amount), 0);
  const remaining = Math.max(0, billed - paid);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Facture {data.number}</h1>
          <p className="text-sm text-muted-foreground">
            {data.client.name} · Émise le {formatDate(data.issueDate)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <a href={`/api/invoices/${id}/pdf`} target="_blank" rel="noreferrer">
              <Download className="h-4 w-4" /> PDF
            </a>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/invoices/${id}/edit`}>
              <Pencil className="h-4 w-4" /> Modifier
            </Link>
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              if (confirm("Supprimer cette facture ?")) {
                await remove.mutateAsync(id);
                router.push("/invoices");
              }
            }}
          >
            <Trash2 className="h-4 w-4" /> Supprimer
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Prestations</CardTitle>
          <Badge variant={data.status === "paid" ? "success" : "secondary"}>
            {data.status}
          </Badge>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Prix U.</TableHead>
                <TableHead className="text-right">Qté</TableHead>
                <TableHead className="text-right">Montant</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((it) => (
                <TableRow key={it.id}>
                  <TableCell>{it.description}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(Number(it.unitPrice), data.currency)}
                  </TableCell>
                  <TableCell className="text-right">
                    {Number(it.quantity)} {it.unitLabel}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(Number(it.amount), data.currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="ml-auto mt-6 max-w-sm space-y-1 text-right text-sm">
            <div>
              Total: <span className="font-medium">{formatCurrency(billed, data.currency)}</span>
            </div>
            <div>
              Payé:{" "}
              <span className="font-medium">- {formatCurrency(paid, data.currency)}</span>
            </div>
            <div className="border-t pt-2 text-base font-bold">
              Reste à payer: {formatCurrency(remaining, data.currency)}
            </div>
          </div>
        </CardContent>
      </Card>

      {data.payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Paiements reçus</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Méthode</TableHead>
                  <TableHead>Référence</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{formatDate(p.paidAt)}</TableCell>
                    <TableCell>{p.method ?? "—"}</TableCell>
                    <TableCell>{p.reference ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(Number(p.amount), data.currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
