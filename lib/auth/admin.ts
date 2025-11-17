import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

/**
 * Check if the current user is an admin
 * @returns {Promise<boolean>} true if the user is an admin, false otherwise
 */
export async function isAdmin(): Promise<boolean> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (!session || !session.user) {
    return false;
  }

  const dbUser = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  return dbUser[0]?.role === "admin";
}

/**
 * Protect a route for admin access only
 * Redirects to dashboard if not an admin
 */
export async function requireAdmin() {
  const adminStatus = await isAdmin();
  
  if (!adminStatus) {
    redirect("/dashboard");
  }
}

/**
 * Get current user with admin status
 */
export async function getCurrentUserWithRole() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (!session || !session.user) {
    return null;
  }

  const dbUser = await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  return dbUser[0];
}