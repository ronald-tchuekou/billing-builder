import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface DraftItem {
  id: string;
  description: string;
  unitPrice: number;
  quantity: number;
  unitLabel: string;
}

export interface DraftPayment {
  id: string;
  amount: number;
  paidAt: string;
  method?: string;
  reference?: string;
}

interface InvoiceDraftState {
  clientId: string | null;
  issueDate: string;
  dueInDays: number;
  currency: string;
  notes: string;
  items: DraftItem[];
  payments: DraftPayment[];
  setField: <K extends keyof InvoiceDraftState>(key: K, value: InvoiceDraftState[K]) => void;
  addItem: (item: Omit<DraftItem, "id">) => void;
  updateItem: (id: string, patch: Partial<DraftItem>) => void;
  removeItem: (id: string) => void;
  addPayment: (p: Omit<DraftPayment, "id">) => void;
  removePayment: (id: string) => void;
  reset: () => void;
}

const empty = (): Pick<
  InvoiceDraftState,
  "clientId" | "issueDate" | "dueInDays" | "currency" | "notes" | "items" | "payments"
> => ({
  clientId: null,
  issueDate: new Date().toISOString().slice(0, 10),
  dueInDays: 30,
  currency: "EUR",
  notes: "",
  items: [],
  payments: [],
});

export const useInvoiceDraft = create<InvoiceDraftState>()(
  persist(
    (set) => ({
      ...empty(),
      setField: (key, value) => set({ [key]: value } as Partial<InvoiceDraftState>),
      addItem: (item) =>
        set((s) => ({
          items: [...s.items, { ...item, id: crypto.randomUUID() }],
        })),
      updateItem: (id, patch) =>
        set((s) => ({
          items: s.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
        })),
      removeItem: (id) =>
        set((s) => ({ items: s.items.filter((it) => it.id !== id) })),
      addPayment: (p) =>
        set((s) => ({
          payments: [...s.payments, { ...p, id: crypto.randomUUID() }],
        })),
      removePayment: (id) =>
        set((s) => ({ payments: s.payments.filter((p) => p.id !== id) })),
      reset: () => set(empty()),
    }),
    { name: "invoice-draft" }
  )
);
