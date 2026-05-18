"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { invoiceSchema, type InvoiceInput } from "./schemas";
import { useClients } from "@/features/clients/hooks";
import { formatCurrency } from "@/lib/utils";

interface Props {
  defaultValues?: Partial<InvoiceInput>;
  submitLabel?: string;
  onSubmit: (data: InvoiceInput) => Promise<void> | void;
}

const emptyItem = { description: "", unitPrice: 0, quantity: 1, unitLabel: "j" };

export function InvoiceForm({ defaultValues, submitLabel = "Enregistrer", onSubmit }: Props) {
  const { data: clients } = useClients();

  const form = useForm<InvoiceInput>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      clientId: defaultValues?.clientId ?? "",
      issueDate: defaultValues?.issueDate ?? new Date().toISOString().slice(0, 10),
      dueInDays: defaultValues?.dueInDays ?? 30,
      currency: defaultValues?.currency ?? "EUR",
      notes: defaultValues?.notes ?? "",
      status: defaultValues?.status ?? "draft",
      items: defaultValues?.items?.length
        ? defaultValues.items
        : [{ ...emptyItem }],
      payments: defaultValues?.payments ?? [],
    },
  });

  const { register, control, handleSubmit, watch, setValue, formState } = form;
  const { errors, isSubmitting } = formState;

  const items = useFieldArray({ control, name: "items" });
  const pays = useFieldArray({ control, name: "payments" });

  const watched = watch();
  const subtotal = (watched.items ?? []).reduce(
    (s, it) => s + Number(it.unitPrice || 0) * Number(it.quantity || 0),
    0
  );
  const paid = (watched.payments ?? []).reduce((s, p) => s + Number(p.amount || 0), 0);
  const remaining = Math.max(0, subtotal - paid);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Client *</Label>
            <Select
              value={watched.clientId || undefined}
              onValueChange={(v) => setValue("clientId", v, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir un client" />
              </SelectTrigger>
              <SelectContent>
                {clients?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.clientId && (
              <p className="text-xs text-destructive">{errors.clientId.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="issueDate">Date d&apos;émission</Label>
            <Input id="issueDate" type="date" {...register("issueDate")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueInDays">Échéance (jours)</Label>
            <Input id="dueInDays" type="number" min={0} {...register("dueInDays")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Devise</Label>
            <Input id="currency" {...register("currency")} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Statut</Label>
            <Select
              value={watched.status}
              onValueChange={(v) =>
                setValue("status", v as InvoiceInput["status"], { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="sent">Envoyée</SelectItem>
                <SelectItem value="partial">Partiel</SelectItem>
                <SelectItem value="paid">Payée</SelectItem>
                <SelectItem value="overdue">En retard</SelectItem>
                <SelectItem value="cancelled">Annulée</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={2} {...register("notes")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Prestations</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => items.append({ ...emptyItem })}
          >
            <Plus className="h-4 w-4" /> Ligne
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.fields.map((field, idx) => {
            const it = watched.items?.[idx];
            const amount = Number(it?.unitPrice || 0) * Number(it?.quantity || 0);
            return (
              <div key={field.id} className="grid gap-2 sm:grid-cols-[1fr_120px_100px_80px_120px_40px] sm:items-end">
                <div className="space-y-2">
                  <Label className="text-xs">Description</Label>
                  <Input {...register(`items.${idx}.description`)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Prix U.</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    {...register(`items.${idx}.unitPrice`)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Qté</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    {...register(`items.${idx}.quantity`)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Unité</Label>
                  <Input {...register(`items.${idx}.unitLabel`)} placeholder="j" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Montant</Label>
                  <div className="rounded-md border bg-muted/50 px-3 py-2 text-sm">
                    {formatCurrency(amount, watched.currency || "EUR")}
                  </div>
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => items.remove(idx)}
                  aria-label="Supprimer la ligne"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            );
          })}
          {errors.items && (
            <p className="text-xs text-destructive">
              {(errors.items as { message?: string }).message ?? "Erreur"}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Acomptes / Paiements reçus</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              pays.append({
                amount: 0,
                paidAt: new Date().toISOString().slice(0, 10),
                method: "Virement",
                reference: "",
              })
            }
          >
            <Plus className="h-4 w-4" /> Paiement
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {pays.fields.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun paiement enregistré.</p>
          ) : (
            pays.fields.map((field, idx) => (
              <div
                key={field.id}
                className="grid gap-2 sm:grid-cols-[140px_160px_140px_1fr_40px] sm:items-end"
              >
                <div className="space-y-2">
                  <Label className="text-xs">Montant</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    {...register(`payments.${idx}.amount`)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Date</Label>
                  <Input type="date" {...register(`payments.${idx}.paidAt`)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Méthode</Label>
                  <Input {...register(`payments.${idx}.method`)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Référence</Label>
                  <Input {...register(`payments.${idx}.reference`)} />
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => pays.remove(idx)}
                  aria-label="Supprimer le paiement"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2 pt-6 text-right text-sm">
          <div>
            Total: <span className="font-medium">{formatCurrency(subtotal, watched.currency || "EUR")}</span>
          </div>
          <div>
            Payé: <span className="font-medium">- {formatCurrency(paid, watched.currency || "EUR")}</span>
          </div>
          <div className="text-base">
            Reste à payer:{" "}
            <span className="font-bold">
              {formatCurrency(remaining, watched.currency || "EUR")}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
