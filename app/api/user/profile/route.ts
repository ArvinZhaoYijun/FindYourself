import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user as userTable, subscription as subscriptionTable } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    // Get session from Better Auth
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.session.userId;

    // Get user with credits
    const users = await db
      .select({
        id: userTable.id,
        name: userTable.name,
        email: userTable.email,
        emailVerified: userTable.emailVerified,
        image: userTable.image,
        credits: userTable.credits,
        createdAt: userTable.createdAt,
      })
      .from(userTable)
      .where(eq(userTable.id, userId));

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = users[0];

    // Get active subscription
    const subscriptions = await db
      .select()
      .from(subscriptionTable)
      .where(
        and(
          eq(subscriptionTable.userId, userId),
          eq(subscriptionTable.status, "active")
        )
      )
      .orderBy(desc(subscriptionTable.updatedAt))
      .limit(1);

    const activeSubscription = subscriptions[0];

    return NextResponse.json({
      user: {
        ...user,
        subscription: activeSubscription ? {
          planKey: activeSubscription.planKey,
          status: activeSubscription.status,
          currentPeriodEnd: activeSubscription.currentPeriodEnd,
        } : null,
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
