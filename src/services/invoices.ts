import type { InvoiceInput } from "@/features/invoices/schemas";
import type { InvoiceWithRelations } from "@/types";

const base = "/api/invoices";

export const invoicesApi = {
  async list(): Promise<InvoiceWithRelations[]> {
    const res = await fetch(base, { cache: "no-store" });
    if (!res.ok) throw new Error("Échec du chargement");
    return res.json();
  },
  async get(id: string): Promise<InvoiceWithRelations> {
    const res = await fetch(`${base}/${id}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Facture introuvable");
    return res.json();
  },
  async create(data: InvoiceInput): Promise<InvoiceWithRelations> {
    const res = await fetch(base, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.text()) || "Échec création");
    return res.json();
  },
  async update(id: string, data: InvoiceInput): Promise<InvoiceWithRelations> {
    const res = await fetch(`${base}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.text()) || "Échec mise à jour");
    return res.json();
  },
  async remove(id: string): Promise<void> {
    const res = await fetch(`${base}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error((await res.text()) || "Échec suppression");
  },
  pdfUrl(id: string) {
    return `${base}/${id}/pdf`;
  },
};
