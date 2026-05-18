import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { getServerSession } from "@/lib/helpers/session";
import { clientSchema } from "@/features/clients/schemas";

export async function GET() {
  const session = await getServerSession();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const rows = await db
    .select()
    .from(clients)
    .where(eq(clients.userId, session.user.id))
    .orderBy(desc(clients.createdAt));
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const body = await request.json();
  const parsed = clientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
  }

  const [row] = await db
    .insert(clients)
    .values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      name: parsed.data.name,
      contactName: parsed.data.contactName ?? null,
      email: parsed.data.email ? parsed.data.email : null,
      phone: parsed.data.phone ?? null,
      address: parsed.data.address ?? null,
      vatNumber: parsed.data.vatNumber ?? null,
      notes: parsed.data.notes ?? null,
    })
    .returning();
  return NextResponse.json(row, { status: 201 });
}
