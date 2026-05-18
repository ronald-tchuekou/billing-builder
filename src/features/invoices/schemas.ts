import { z } from "zod";

export const invoiceItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "Description requise"),
  unitPrice: z.coerce.number().min(0),
  quantity: z.coerce.number().min(0).default(1),
  unitLabel: z.string().default("j"),
});

export const paymentSchema = z.object({
  id: z.string().optional(),
  amount: z.coerce.number().min(0),
  paidAt: z.string().min(1),
  method: z.string().optional().nullable(),
  reference: z.string().optional().nullable(),
});

export const invoiceSchema = z.object({
  clientId: z.string().min(1, "Client requis"),
  issueDate: z.string().min(1, "Date requise"),
  dueInDays: z.coerce.number().int().min(0).default(30),
  currency: z.string().default("EUR"),
  notes: z.string().optional().nullable(),
  status: z
    .enum(["draft", "sent", "partial", "paid", "overdue", "cancelled"])
    .default("draft"),
  items: z.array(invoiceItemSchema).min(1, "Au moins une ligne"),
  payments: z.array(paymentSchema).default([]),
});

export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
