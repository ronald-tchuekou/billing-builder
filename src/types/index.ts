export type { Client, NewClient } from "@/lib/db/schema/clients";
export type {
  Invoice,
  NewInvoice,
  InvoiceItem,
  NewInvoiceItem,
  Payment,
  NewPayment,
} from "@/lib/db/schema/invoices";

export type InvoiceStatus =
  | "draft"
  | "sent"
  | "partial"
  | "paid"
  | "overdue"
  | "cancelled";

export interface InvoiceWithRelations {
  id: string;
  userId: string;
  clientId: string;
  number: string;
  issueDate: string;
  dueInDays: number;
  status: InvoiceStatus;
  currency: string;
  notes: string | null;
  issuerName: string | null;
  issuerAddress: string | null;
  issuerSiret: string | null;
  issuerVat: string | null;
  issuerIban: string | null;
  issuerBic: string | null;
  issuerBank: string | null;
  issuerBankAddress: string | null;
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    name: string;
    contactName: string | null;
    email: string | null;
    address: string | null;
    vatNumber: string | null;
  };
  items: Array<{
    id: string;
    description: string;
    unitPrice: string;
    quantity: string;
    unitLabel: string;
    amount: string;
    position: number;
  }>;
  payments: Array<{
    id: string;
    amount: string;
    paidAt: string;
    method: string | null;
    reference: string | null;
    notes: string | null;
  }>;
}
