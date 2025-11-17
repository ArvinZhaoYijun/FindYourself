import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generationHistory } from "@/lib/db/schema";
import { canUserAfford, deductCredits } from "@/lib/credits";
import { volcanoEngine } from "@/lib/volcano-engine";
import { randomUUID } from "crypto";
import { uploadImageFromUrl } from "@/lib/r2-storage";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.session.userId;

    // Parse request body
    const { prompt, size, watermark, imageUrl } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    if (!imageUrl) {
      return NextResponse.json({ error: "Reference image is required" }, { status: 400 });
    }

    // Check if user has enough credits (20 credits for image generation)
    const creditsNeeded = 20;
    const hasCredits = await canUserAfford(userId, creditsNeeded);
    if (!hasCredits) {
      return NextResponse.json({ 
        error: "Insufficient credits", 
        creditsNeeded,
        remainingCredits: 0 
      }, { status: 402 });
    }

    // Create generation history entry
    const historyId = randomUUID();
    await db.insert(generationHistory).values({
      id: historyId,
      userId,
      type: "image",
      prompt,
      status: "processing",
      creditsUsed: creditsNeeded,
      metadata: JSON.stringify({ size, watermark, imageUrl }),
    });

    // Deduct credits
    const deductResult = await deductCredits(userId, creditsNeeded, "image_generation", historyId);
    if (!deductResult.success) {
      // Update history to failed
      await db.update(generationHistory)
        .set({ status: "failed", error: deductResult.error })
        .where(eq(generationHistory.id, historyId));
      
      return NextResponse.json({ 
        error: deductResult.error || "Failed to deduct credits",
        remainingCredits: deductResult.remainingCredits 
      }, { status: 402 });
    }

    try {
      // Generate image with options
      const result = await volcanoEngine.generateImage(prompt, {
        size,
        inputImages: [imageUrl],
        watermark,
      });
      
      if (!result.data || result.data.length === 0) {
        throw new Error('No image generated');
      }
      
      const imageData = result.data[0];

      // Upload image to R2 storage
      const r2Url = await uploadImageFromUrl(imageData.url, userId, 'image');

      // Update history with R2 URL
      await db.update(generationHistory)
        .set({ 
          status: "completed", 
          resultUrl: r2Url,
          updatedAt: new Date(),
        })
        .where(eq(generationHistory.id, historyId));

      return NextResponse.json({
        id: historyId,
        url: r2Url,
        revisedPrompt: imageData.revised_prompt,
        remainingCredits: deductResult.remainingCredits,
        sourceImageUrl: imageUrl,
      });

    } catch (genError: any) {
      // Update history to failed
      await db.update(generationHistory)
        .set({ 
          status: "failed", 
          error: genError.message,
          updatedAt: new Date(),
        })
        .where(eq(generationHistory.id, historyId));

      throw genError;
    }

  } catch (error: any) {
    console.error("Image generation API error:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to generate image" 
    }, { status: 500 });
  }
}
