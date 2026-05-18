import {
  pgTable,
  text,
  timestamp,
  integer,
  numeric,
  date,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth";
import { clients } from "./clients";

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft",
  "sent",
  "partial",
  "paid",
  "overdue",
  "cancelled",
]);

export const invoices = pgTable("invoices", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  clientId: text("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "restrict" }),
  number: text("number").notNull(),
  issueDate: date("issue_date", { mode: "date" }).notNull(),
  dueInDays: integer("due_in_days").notNull().default(30),
  status: invoiceStatusEnum("status").notNull().default("draft"),
  currency: text("currency").notNull().default("EUR"),
  notes: text("notes"),
  // Snapshot of issuer info at the time of issuing (for historical accuracy)
  issuerName: text("issuer_name"),
  issuerAddress: text("issuer_address"),
  issuerSiret: text("issuer_siret"),
  issuerVat: text("issuer_vat"),
  issuerIban: text("issuer_iban"),
  issuerBic: text("issuer_bic"),
  issuerBank: text("issuer_bank"),
  issuerBankAddress: text("issuer_bank_address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const invoiceItems = pgTable("invoice_items", {
  id: text("id").primaryKey(),
  invoiceId: text("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  // Stored as numeric for precision (decimal). Use string in TS to avoid float issues.
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull().default("1"),
  unitLabel: text("unit_label").notNull().default("j"),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  position: integer("position").notNull().default(0),
});

export const payments = pgTable("payments", {
  id: text("id").primaryKey(),
  invoiceId: text("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  paidAt: date("paid_at", { mode: "date" }).notNull(),
  method: text("method"),
  reference: text("reference"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  client: one(clients, {
    fields: [invoices.clientId],
    references: [clients.id],
  }),
  user: one(user, {
    fields: [invoices.userId],
    references: [user.id],
  }),
  items: many(invoiceItems),
  payments: many(payments),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  invoice: one(invoices, {
    fields: [payments.invoiceId],
    references: [invoices.id],
  }),
}));

export const clientsRelations = relations(clients, ({ many }) => ({
  invoices: many(invoices),
}));

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type NewInvoiceItem = typeof invoiceItems.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
