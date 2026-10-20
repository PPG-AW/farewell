import { db } from "@/db";
import { users, adminLog } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { randomUUID } from "crypto";
import type { NextRequest } from "next/server";

export async function createSession(userId: string) {
  const token = randomUUID() + randomUUID().replace(/-/g, "");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 jam
  await db.update(users).set({ sessionToken: token, sessionExpires: expires }).where(eq(users.id, userId));
  return { token, expires };
}

export async function getSessionUser(token: string | null | undefined) {
  if (!token) return null;
  const rows = await db
    .select()
    .from(users)
    .where(and(eq(users.sessionToken, token), gt(users.sessionExpires, new Date())))
    .limit(1);
  return rows[0] ?? null;
}

export function tokenFrom(req: NextRequest): string | null {
  const h = req.headers.get("authorization");
  if (h?.startsWith("Bearer ")) return h.slice(7);
  return req.headers.get("x-session-token");
}

export async function requireUser(req: NextRequest) {
  const user = await getSessionUser(tokenFrom(req));
  return user;
}

export async function requireAdmin(req: NextRequest) {
  const user = await requireUser(req);
  if (!user || user.peran !== "admin") return null;
  return user;
}

export async function logAdmin(aksi: string, target = "") {
  try {
    await db.insert(adminLog).values({ aksi, target });
  } catch {
    /* logging must never break requests */
  }
}
