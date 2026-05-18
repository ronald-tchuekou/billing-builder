import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { IssuerSettingsInput, ProfileInput } from "./schemas";

const KEY = ["me"] as const;

interface MeResponse {
  id: string;
  name: string;
  email: string;
  businessName: string | null;
  businessAddress: string | null;
  siret: string | null;
  vatNumber: string | null;
  phone: string | null;
  iban: string | null;
  bic: string | null;
  bankName: string | null;
  bankAddress: string | null;
  beneficiaryAddress: string | null;
}

export function useMe() {
  return useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const res = await fetch("/api/me", { cache: "no-store" });
      if (!res.ok) throw new Error("Échec du chargement du profil");
      return (await res.json()) as MeResponse;
    },
  });
}

export function useUpdateMe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<ProfileInput & IssuerSettingsInput>) => {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Échec de la mise à jour");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Profil mis à jour");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
