"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { requestPasswordReset } from "@/lib/auth-client";
import { forgotSchema, type ForgotInput } from "@/features/auth/schemas";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotInput>({ resolver: zodResolver(forgotSchema) });

  async function onSubmit(values: ForgotInput) {
    const { error } = await requestPasswordReset({
      email: values.email,
      redirectTo: "/auth/reset-password",
    });
    if (error) {
      toast.error(error.message ?? "Erreur");
      return;
    }
    toast.success("Si l'email existe, un lien de réinitialisation a été envoyé.");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mot de passe oublié</CardTitle>
        <CardDescription>
          Saisis ton email, nous t&apos;enverrons un lien pour réinitialiser ton mot de passe.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Envoi..." : "Envoyer le lien"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/auth/login" className="text-primary hover:underline">
              Retour à la connexion
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
