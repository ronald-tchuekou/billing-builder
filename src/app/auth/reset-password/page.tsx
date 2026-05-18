"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { resetPassword } from "@/lib/auth-client";
import { resetSchema, type ResetInput } from "@/features/auth/schemas";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetInput>({ resolver: zodResolver(resetSchema) });

  async function onSubmit(values: ResetInput) {
    const { error } = await resetPassword({
      newPassword: values.password,
      token,
    });
    if (error) {
      toast.error(error.message ?? "Lien invalide ou expiré");
      return;
    }
    toast.success("Mot de passe mis à jour");
    router.push("/auth/login");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nouveau mot de passe</CardTitle>
        <CardDescription>Choisis un mot de passe d&apos;au moins 8 caractères.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nouveau mot de passe</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirmation</Label>
            <Input id="confirm" type="password" {...register("confirm")} />
            {errors.confirm && (
              <p className="text-xs text-destructive">{errors.confirm.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting || !token}>
            {isSubmitting ? "Enregistrement..." : "Mettre à jour"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
