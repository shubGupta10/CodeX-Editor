import { NextResponse, NextRequest } from "next/server";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/options";
import { checkUsage, recordUsage } from "@/lib/usage";
import redis from "@/redis/redis";

const MAX_LOGGED_IN_REQUESTS = 5;
const MAX_GUEST_REQUESTS = 2;
const ONE_DAY_IN_SECONDS = 86400;

export async function POST(req: NextRequest) {
  try {
    const { prompt, code } = await req.json();
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    // 1. Unified Usage Check (Redis-to-DB sync)
    const usage = await checkUsage(userId || null, "ai", ip);
    if (!usage.allowed) {
      return NextResponse.json(
        { message: usage.message },
        { status: 429 }
      );
    }

    const llm = new ChatGoogleGenerativeAI({
      modelName: "gemini-2.5-flash-lite",
      apiKey: process.env.GOOGLE_GEMINI_API_KEY,
      maxOutputTokens: 3072,
      temperature: 0.7,
    });

    const fullPrompt = `You are an expert programming assistant.  
    Analyze the following code and **respond according to the user's request**.  
    
    ### Code:  
    \`\`\`  
    ${code}  
    \`\`\`  
    
    ### User Request:  
    ${prompt}  
    
    ### Guidelines for Response:  
    - If the user asks for **fixes**, find and fix **bugs** (if any).  
    - If the user asks for **improvements**, suggest better coding practices.  
    - If the user asks for **a function**, **only** return the requested function without extra explanations.  
    - Always format the response properly in **Markdown** and use **valid code syntax**.  
    
    Now, generate the best possible response in **Markdown format**.`;

    const stream = await llm.stream(fullPrompt);
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.content) {
              const content =
                typeof chunk.content === "string"
                  ? chunk.content
                  : JSON.stringify(chunk.content);
              controller.enqueue(new TextEncoder().encode(content));
            }
          }
          
          // Finalize Consumption on completion
          await recordUsage(userId || null, "ai", ip);
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: any) {
    console.error("Error in AI Assistant:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}