import { NextRequest, NextResponse } from "next/server";
import { isPackKey, isSubscriptionKey, oneTimePacks, subscriptionPlans } from "@/constants/billing";
import { createCheckoutSession } from "@/lib/payments/creem";
import { auth } from "@/lib/auth";

type Body = {
  kind: "subscription" | "one_time";
  key: string; // plan or pack key
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;
    const { kind, key } = body;

    // Get user from Better Auth session (do not trust client userId)
    const session = await auth.api.getSession({ headers: req.headers });
    const userId = session?.session?.userId;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let creemPriceId: string | undefined;
    // Add success=1 so client has a stable success signal on return
    let successUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?success=1`;
    let cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pricing`;

    if (kind === "subscription") {
      if (!isSubscriptionKey(key)) {
        return NextResponse.json({ error: "Invalid subscription key" }, { status: 400 });
      }
      const plan = subscriptionPlans[key];
      creemPriceId = plan.creemPriceId;
    } else if (kind === "one_time") {
      if (!isPackKey(key)) {
        return NextResponse.json({ error: "Invalid pack key" }, { status: 400 });
      }
      const pack = oneTimePacks[key];
      creemPriceId = pack.creemPriceId;
    } else {
      return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
    }

    const { url } = await createCheckoutSession({
      userId,
      key,
      kind,
      successUrl,
      cancelUrl,
      creemPriceId,
    });

    return NextResponse.json({ url });
  } catch (e: any) {
    console.error("Creem checkout error:", e);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
