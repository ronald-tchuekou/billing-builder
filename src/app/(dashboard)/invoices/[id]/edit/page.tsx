"use client";

import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { InvoiceForm } from "@/features/invoices/InvoiceForm";
import { useInvoice, useUpdateInvoice } from "@/features/invoices/hooks";

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data, isLoading } = useInvoice(id);
  const update = useUpdateInvoice(id);

  if (isLoading) return <p className="text-sm text-muted-foreground">Chargement...</p>;
  if (!data) return <p className="text-sm text-muted-foreground">Facture introuvable.</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-3xl font-bold">Modifier la facture {data.number}</h1>
      <Card>
        <CardContent className="pt-6">
          <InvoiceForm
            submitLabel="Mettre à jour"
            defaultValues={{
              clientId: data.clientId,
              issueDate: data.issueDate.slice(0, 10),
              dueInDays: data.dueInDays,
              currency: data.currency,
              status: data.status,
              notes: data.notes ?? "",
              items: data.items.map((it) => ({
                id: it.id,
                description: it.description,
                unitPrice: Number(it.unitPrice),
                quantity: Number(it.quantity),
                unitLabel: it.unitLabel,
              })),
              payments: data.payments.map((p) => ({
                id: p.id,
                amount: Number(p.amount),
                paidAt: p.paidAt.slice(0, 10),
                method: p.method ?? "",
                reference: p.reference ?? "",
              })),
            }}
            onSubmit={async (values) => {
              await update.mutateAsync(values);
              router.push(`/invoices/${id}`);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
