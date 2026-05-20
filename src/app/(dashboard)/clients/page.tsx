"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Trash2, Users } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ClientForm } from "@/features/clients/ClientForm";
import { useClients, useCreateClient, useDeleteClient } from "@/features/clients/hooks";
import { StaggerChildren } from "@/components/ui/motion";
import type { ClientInput } from "@/features/clients/schemas";

type Client = {
  id: string;
  userId: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  vatNumber: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function ClientCard({
  client,
  onDelete,
}: {
  client: Client;
  onDelete: (id: string) => void;
}) {
  const reduced = useReducedMotion();
  const initials = getInitials(client.name);

  const cardContent = (
    <Card className="relative h-full overflow-hidden bg-card transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <Link
              href={`/clients/${client.id}`}
              className="block focus:outline-none"
            >
              <p className="truncate font-semibold text-foreground leading-tight">
                {client.name}
              </p>
              {client.email && (
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {client.email}
                </p>
              )}
              {client.phone && (
                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                  {client.phone}
                </p>
              )}
            </Link>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (confirm(`Supprimer le client "${client.name}" ?`)) {
                onDelete(client.id);
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Supprimer</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (reduced) {
    return cardContent;
  }

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="h-full"
    >
      {cardContent}
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <Card className="bg-card">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Skeleton className="h-11 w-11 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function ClientsPage() {
  const { data, isLoading } = useClients();
  const create = useCreateClient();
  const remove = useDeleteClient();
  const [open, setOpen] = useState(false);

  async function handleCreate(values: ClientInput) {
    await create.mutateAsync(values);
    setOpen(false);
  }

  const clients: Client[] = data ?? [];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "" : `${clients.length} client${clients.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nouveau client</DialogTitle>
              <DialogDescription>
                Remplissez les informations du client.
              </DialogDescription>
            </DialogHeader>
            <ClientForm submitLabel="Créer le client" onSubmit={handleCreate} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-foreground">Aucun client pour l&apos;instant</p>
            <p className="text-sm text-muted-foreground">
              Commencez par ajouter votre premier client.
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un client
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Nouveau client</DialogTitle>
                <DialogDescription>
                  Remplissez les informations du client.
                </DialogDescription>
              </DialogHeader>
              <ClientForm submitLabel="Créer le client" onSubmit={handleCreate} />
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <StaggerChildren
          stagger={0.05}
          className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
        >
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onDelete={(id) => remove.mutate(id)}
            />
          ))}
        </StaggerChildren>
      )}
    </div>
  );
}
