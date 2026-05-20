import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function getServerSession() {
  const hdrs = await headers();
  try {
    return await auth.api.getSession({ headers: hdrs });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("fetch failed") || msg.includes("NeonDbError")) {
      await new Promise((r) => setTimeout(r, 500));
      return await auth.api.getSession({ headers: hdrs });
    }
    throw err;
  }
}

export async function requireSession() {
  const session = await getServerSession();
  if (!session?.user) {
    throw new Response("Unauthorized", { status: 401 });
  }
  return session;
}
