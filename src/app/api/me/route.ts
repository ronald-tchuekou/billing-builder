import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { getServerSession } from "@/lib/helpers/session";
import {
  issuerSettingsSchema,
  profileSchema,
} from "@/features/profile/schemas";
import { z } from "zod";

export async function GET() {
  const session = await getServerSession();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });
  const [row] = await db.select().from(user).where(eq(user.id, session.user.id));
  return NextResponse.json(row ?? null);
}

const patchSchema = profileSchema.partial().merge(issuerSettingsSchema.partial());

export async function PATCH(request: Request) {
  const session = await getServerSession();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data as z.infer<typeof patchSchema>;

  const [row] = await db
    .update(user)
    .set({
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.email !== undefined ? { email: data.email } : {}),
      ...(data.businessName !== undefined ? { businessName: data.businessName } : {}),
      ...(data.businessAddress !== undefined ? { businessAddress: data.businessAddress } : {}),
      ...(data.siret !== undefined ? { siret: data.siret } : {}),
      ...(data.vatNumber !== undefined ? { vatNumber: data.vatNumber } : {}),
      ...(data.phone !== undefined ? { phone: data.phone } : {}),
      ...(data.iban !== undefined ? { iban: data.iban } : {}),
      ...(data.bic !== undefined ? { bic: data.bic } : {}),
      ...(data.bankName !== undefined ? { bankName: data.bankName } : {}),
      ...(data.bankAddress !== undefined ? { bankAddress: data.bankAddress } : {}),
      ...(data.beneficiaryAddress !== undefined
        ? { beneficiaryAddress: data.beneficiaryAddress }
        : {}),
      updatedAt: new Date(),
    })
    .where(eq(user.id, session.user.id))
    .returning();
  return NextResponse.json(row);
}
