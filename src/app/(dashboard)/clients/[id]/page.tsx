"use client";

import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClientForm } from "@/features/clients/ClientForm";
import { useClient, useUpdateClient, useDeleteClient } from "@/features/clients/hooks";

export default function ClientEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data, isLoading } = useClient(id);
  const update = useUpdateClient(id);
  const remove = useDeleteClient();

  if (isLoading) return <p className="text-sm text-muted-foreground">Chargement...</p>;
  if (!data) return <p className="text-sm text-muted-foreground">Client introuvable.</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Modifier le client</h1>
        <Button
          variant="destructive"
          onClick={async () => {
            if (confirm("Supprimer ce client ?")) {
              await remove.mutateAsync(id);
              router.push("/clients");
            }
          }}
        >
          Supprimer
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{data.name}</CardTitle>
          <CardDescription>Mets à jour les informations du client.</CardDescription>
        </CardHeader>
        <CardContent>
          <ClientForm
            defaultValues={{
              name: data.name,
              contactName: data.contactName ?? "",
              email: data.email ?? "",
              phone: data.phone ?? "",
              address: data.address ?? "",
              vatNumber: data.vatNumber ?? "",
              notes: data.notes ?? "",
            }}
            submitLabel="Mettre à jour"
            onSubmit={async (values) => {
              await update.mutateAsync(values);
              router.push("/clients");
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
