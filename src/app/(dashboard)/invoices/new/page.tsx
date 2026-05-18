"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { InvoiceForm } from "@/features/invoices/InvoiceForm";
import { useCreateInvoice } from "@/features/invoices/hooks";

export default function NewInvoicePage() {
  const router = useRouter();
  const create = useCreateInvoice();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-3xl font-bold">Nouvelle facture</h1>
      <Card>
        <CardContent className="pt-6">
          <InvoiceForm
            submitLabel="Créer la facture"
            onSubmit={async (values) => {
              const created = await create.mutateAsync(values);
              router.push(`/invoices/${created.id}`);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
