import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { creditLedger } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

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
    
    // Get query parameters
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    // Fetch credit history
    const history = await db
      .select({
        id: creditLedger.id,
        userId: creditLedger.userId,
        delta: creditLedger.delta,
        reason: creditLedger.reason,
        paymentId: creditLedger.paymentId,
        createdAt: creditLedger.createdAt,
      })
      .from(creditLedger)
      .where(eq(creditLedger.userId, userId))
      .orderBy(desc(creditLedger.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const countResult = await db
      .select({ count: creditLedger.id })
      .from(creditLedger)
      .where(eq(creditLedger.userId, userId));
    
    const totalCount = countResult.length;

    // Format the response (return reason for i18n on client side)
    const formattedHistory = history.map(record => {
      // Determine the type based on reason
      let type = "";
      
      switch(record.reason) {
        case "subscription_cycle":
        case "subscription_schedule":
          type = "subscription";
          break;
        case "one_time_pack":
          type = "purchase";
          break;
        case "chat_usage":
        case "video_generation":
        case "image_generation":
          type = "usage";
          break;
        case "refund":
          type = "refund";
          break;
        case "adjustment":
          type = "adjustment";
          break;
        default:
          type = "other";
      }

      return {
        id: record.id,
        amount: record.delta,
        type,
        reason: record.reason,
        createdAt: record.createdAt,
        paymentId: record.paymentId,
      };
    });

    return NextResponse.json({
      history: formattedHistory,
      totalCount,
      hasMore: offset + limit < totalCount,
    });
  } catch (error) {
    console.error("Error fetching credit history:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
