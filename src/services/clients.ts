import type { Client } from "@/types";
import type { ClientInput } from "@/features/clients/schemas";

const base = "/api/clients";

export const clientsApi = {
  async list(): Promise<Client[]> {
    const res = await fetch(base, { cache: "no-store" });
    if (!res.ok) throw new Error("Échec du chargement");
    return res.json();
  },
  async get(id: string): Promise<Client> {
    const res = await fetch(`${base}/${id}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Client introuvable");
    return res.json();
  },
  async create(data: ClientInput): Promise<Client> {
    const res = await fetch(base, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.text()) || "Échec création");
    return res.json();
  },
  async update(id: string, data: ClientInput): Promise<Client> {
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
};
