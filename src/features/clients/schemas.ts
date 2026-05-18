import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  contactName: z.string().optional().nullable(),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  vatNumber: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type ClientInput = z.infer<typeof clientSchema>;
