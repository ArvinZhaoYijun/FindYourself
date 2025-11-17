import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { chatSession, chatMessage } from "@/lib/db/schema";
import { canUserChat, deductCredits } from "@/lib/credits";
import { eq } from "drizzle-orm";
import { volcanoEngine } from "@/lib/volcano-engine";
import { ChatMessage } from "@/lib/volcano-engine/types";
import { randomUUID } from "crypto";

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
    const { message, sessionId } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Check if user has enough credits
    const hasCredits = await canUserChat(userId);
    if (!hasCredits) {
      return NextResponse.json({ 
        error: "Insufficient credits", 
        remainingCredits: 0 
      }, { status: 402 });
    }

    // Get or create chat session
    let chatSessionId = sessionId;
    if (!chatSessionId) {
      // Create new session
      chatSessionId = randomUUID();
      await db.insert(chatSession).values({
        id: chatSessionId,
        userId,
        title: message.substring(0, 100),
        model: "doubao-1-5-thinking-pro-250415",
      });
    }

    // Deduct credits
    const deductResult = await deductCredits(userId, 10, "chat_usage", chatSessionId);
    if (!deductResult.success) {
      return NextResponse.json({ 
        error: deductResult.error || "Failed to deduct credits",
        remainingCredits: deductResult.remainingCredits 
      }, { status: 402 });
    }

    // Save user message
    const userMessageId = randomUUID();
    await db.insert(chatMessage).values({
      id: userMessageId,
      sessionId: chatSessionId,
      role: "user",
      content: message,
      creditsUsed: 10,
    });

    // Get chat history for context
    const messages = await db
      .select()
      .from(chatMessage)
      .where(eq(chatMessage.sessionId, chatSessionId))
      .orderBy(chatMessage.createdAt)
      .limit(20); // Keep last 20 messages for context

    // Build conversation history for Volcano Engine
    // Filter out the message we just inserted to avoid duplication
    const chatMessages: ChatMessage[] = messages
      .filter(m => m.id !== userMessageId)
      .map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    // Add the current message
    chatMessages.push({
      role: 'user',
      content: message,
    });

    // Call Volcano Engine API
    const response = await volcanoEngine.createChatCompletion(chatMessages, {
      temperature: 0.7,
      top_p: 0.95,
      max_tokens: 2048,
    });

    const text = response.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    // Save assistant message
    const assistantMessageId = randomUUID();
    await db.insert(chatMessage).values({
      id: assistantMessageId,
      sessionId: chatSessionId,
      role: "assistant",
      content: text,
      creditsUsed: 0,
    });

    // Update session
    await db
      .update(chatSession)
      .set({
        totalMessages: messages.length + 2,
        totalCreditsUsed: (messages.filter(m => m.role === "user").length + 1) * 10,
        lastMessageAt: new Date(),
      })
      .where(eq(chatSession.id, chatSessionId));

    return NextResponse.json({
      sessionId: chatSessionId,
      message: text,
      remainingCredits: deductResult.remainingCredits,
    });

  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to process chat" 
    }, { status: 500 });
  }
}