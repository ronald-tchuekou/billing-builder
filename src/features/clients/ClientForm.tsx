"use client";

import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {type ClientInput, clientSchema} from "./schemas";

interface Props {
  defaultValues?: Partial<ClientInput>;
  submitLabel?: string;
  onSubmit: (data: ClientInput) => Promise<void> | void;
}

export function ClientForm({defaultValues, submitLabel = "Enregistrer", onSubmit}: Props) {
  const {
    register,
    handleSubmit,
    formState: {errors, isSubmitting},
  } = useForm<ClientInput>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      contactName: defaultValues?.contactName ?? "",
      email: defaultValues?.email ?? "",
      phone: defaultValues?.phone ?? "",
      address: defaultValues?.address ?? "",
      vatNumber: defaultValues?.vatNumber ?? "",
      notes: defaultValues?.notes ?? "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nom de l&apos;entreprise *</Label>
          <Input id="name" {...register("name")} className={"bg-background"}/>
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactName">Contact</Label>
          <Input id="contactName" {...register("contactName")} className={"bg-background"}/>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} className={"bg-background"}/>
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input id="phone" {...register("phone")} className={"bg-background"}/>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Adresse</Label>
        <Textarea id="address" rows={2} {...register("address")} className={"bg-background"}/>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="vatNumber">N° TVA</Label>
          <Input id="vatNumber" {...register("vatNumber")} className={"bg-background"}/>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" rows={3} {...register("notes")} className={"bg-background"}/>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
