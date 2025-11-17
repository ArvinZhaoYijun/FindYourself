import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { chatSession, chatMessage } from "@/lib/db/schema";
import { canUserChat, deductCredits } from "@/lib/credits";
import { eq } from "drizzle-orm";
import { volcanoEngine, parseSSEChunk } from "@/lib/volcano-engine";
import { ChatMessage } from "@/lib/volcano-engine/types";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.session?.userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const userId = session.session.userId;

    // Parse request body
    const { message, sessionId } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: "Message is required" }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if user has enough credits
    const hasCredits = await canUserChat(userId);
    if (!hasCredits) {
      return new Response(JSON.stringify({ 
        error: "Insufficient credits", 
        remainingCredits: 0 
      }), { 
        status: 402,
        headers: { 'Content-Type': 'application/json' }
      });
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
      return new Response(JSON.stringify({ 
        error: deductResult.error || "Failed to deduct credits",
        remainingCredits: deductResult.remainingCredits 
      }), { 
        status: 402,
        headers: { 'Content-Type': 'application/json' }
      });
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
      .limit(20);

    // Build conversation history for Volcano Engine
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

    // Create a readable stream for the response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial metadata
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'metadata',
            sessionId: chatSessionId,
            remainingCredits: deductResult.remainingCredits 
          })}\n\n`));

          // Call Volcano Engine API with streaming
          const stream = await volcanoEngine.createChatStream(chatMessages, {
            temperature: 0.7,
            top_p: 0.95,
            max_tokens: 2048,
          });

          const reader = stream.getReader();
          const decoder = new TextDecoder();
          let fullText = "";
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const parsed = parseSSEChunk(line);
              if (parsed) {
                if (parsed.done) {
                  break;
                }
                const content = parsed.choices?.[0]?.delta?.content || '';
                if (content) {
                  fullText += content;
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                    type: 'content',
                    content
                  })}\n\n`));
                }
              }
            }
          }

          // Save assistant message
          const assistantMessageId = randomUUID();
          await db.insert(chatMessage).values({
            id: assistantMessageId,
            sessionId: chatSessionId,
            role: "assistant",
            content: fullText,
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

          // Send completion signal
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'done' 
          })}\n\n`));
          
          controller.close();
        } catch (error: any) {
          console.error("Stream error:", error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'error',
            error: error.message || "Failed to process chat" 
          })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error("Chat API error:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to process chat" 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}