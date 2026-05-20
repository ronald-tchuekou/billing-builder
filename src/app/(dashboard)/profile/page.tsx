"use client";

import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {FadeInUp} from "@/components/ui/motion";
import {type ProfileInput, profileSchema} from "@/features/profile/schemas";
import {useMe, useUpdateMe} from "@/features/profile/hooks";

export default function ProfilePage() {
  const {data, isLoading} = useMe();
  const update = useUpdateMe();
  const {
    register,
    handleSubmit,
    reset,
    formState: {errors, isSubmitting},
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    values: data ? {name: data.name, email: data.email} : undefined,
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Chargement...</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <FadeInUp>
        <h1 className="text-3xl font-bold">Profil</h1>
      </FadeInUp>
      <FadeInUp delay={0.1}>
        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
            <CardDescription>Nom et email de connexion.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(async (v) => {
                await update.mutateAsync(v);
                reset(v);
              })}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input id="name" {...register("name")} className={"bg-background"}/>
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} className={"bg-background"}/>
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </FadeInUp>
    </div>
  );
}
