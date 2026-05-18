"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  issuerSettingsSchema,
  type IssuerSettingsInput,
} from "@/features/profile/schemas";
import { useMe, useUpdateMe } from "@/features/profile/hooks";

export default function SettingsPage() {
  const { data, isLoading } = useMe();
  const update = useUpdateMe();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<IssuerSettingsInput>({
    resolver: zodResolver(issuerSettingsSchema),
    values: data
      ? {
          businessName: data.businessName ?? "",
          businessAddress: data.businessAddress ?? "",
          siret: data.siret ?? "",
          vatNumber: data.vatNumber ?? "",
          phone: data.phone ?? "",
          iban: data.iban ?? "",
          bic: data.bic ?? "",
          bankName: data.bankName ?? "",
          bankAddress: data.bankAddress ?? "",
          beneficiaryAddress: data.beneficiaryAddress ?? "",
        }
      : undefined,
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Chargement...</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold">Paramètres</h1>

      <Card>
        <CardHeader>
          <CardTitle>Émetteur (apparaît sur les factures PDF)</CardTitle>
          <CardDescription>
            Ces informations sont reproduites en haut de chaque facture PDF générée.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(async (v) => {
              await update.mutateAsync(v);
              reset(v);
            })}
            className="space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="businessName">Raison sociale / Nom</Label>
                <Input id="businessName" {...register("businessName")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siret">SIRET</Label>
                <Input id="siret" {...register("siret")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vatNumber">N° TVA</Label>
                <Input id="vatNumber" {...register("vatNumber")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input id="phone" {...register("phone")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessAddress">Adresse</Label>
              <Textarea id="businessAddress" rows={2} {...register("businessAddress")} />
            </div>

            <div className="space-y-1 pt-4">
              <h3 className="font-semibold">Coordonnées bancaires</h3>
              <p className="text-sm text-muted-foreground">
                Affichées au bas de chaque facture pour le règlement.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bankName">Banque</Label>
                <Input id="bankName" {...register("bankName")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="iban">IBAN</Label>
                <Input id="iban" {...register("iban")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bic">BIC / SWIFT</Label>
                <Input id="bic" {...register("bic")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankAddress">Adresse de la banque</Label>
              <Textarea id="bankAddress" rows={2} {...register("bankAddress")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="beneficiaryAddress">Adresse du bénéficiaire</Label>
              <Textarea id="beneficiaryAddress" rows={2} {...register("beneficiaryAddress")} />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
