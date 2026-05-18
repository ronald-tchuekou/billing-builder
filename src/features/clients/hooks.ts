import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { clientsApi } from "@/services/clients";
import type { ClientInput } from "./schemas";

const KEY = ["clients"] as const;

export function useClients() {
  return useQuery({ queryKey: KEY, queryFn: clientsApi.list });
}

export function useClient(id: string | undefined) {
  return useQuery({
    queryKey: [...KEY, id],
    queryFn: () => clientsApi.get(id!),
    enabled: !!id,
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ClientInput) => clientsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Client créé");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateClient(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ClientInput) => clientsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Client mis à jour");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clientsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Client supprimé");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
