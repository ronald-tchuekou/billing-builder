import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

export const issuerSettingsSchema = z.object({
  businessName: z.string().optional().nullable(),
  businessAddress: z.string().optional().nullable(),
  siret: z.string().optional().nullable(),
  vatNumber: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  iban: z.string().optional().nullable(),
  bic: z.string().optional().nullable(),
  bankName: z.string().optional().nullable(),
  bankAddress: z.string().optional().nullable(),
  beneficiaryAddress: z.string().optional().nullable(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type IssuerSettingsInput = z.infer<typeof issuerSettingsSchema>;
