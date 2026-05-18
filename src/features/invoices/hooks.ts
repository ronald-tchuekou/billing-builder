import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { invoicesApi } from "@/services/invoices";
import type { InvoiceInput } from "./schemas";

const KEY = ["invoices"] as const;

export function useInvoices() {
  return useQuery({ queryKey: KEY, queryFn: invoicesApi.list });
}

export function useInvoice(id: string | undefined) {
  return useQuery({
    queryKey: [...KEY, id],
    queryFn: () => invoicesApi.get(id!),
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: InvoiceInput) => invoicesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Facture créée");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateInvoice(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: InvoiceInput) => invoicesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Facture mise à jour");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => invoicesApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Facture supprimée");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
