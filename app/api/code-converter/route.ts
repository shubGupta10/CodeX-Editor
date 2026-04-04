import { ConnectoDatabase } from "@/lib/db";
import { authOptions } from "@/lib/options";
import { checkUsage, recordUsage } from "@/lib/usage";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { getServerSession } from "next-auth";
import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await ConnectoDatabase();
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

        // 1. Unified Usage Check (Redis-to-DB sync)
        const usage = await checkUsage(userId || null, "conversion", ip);
        if (!usage.allowed) {
            return NextResponse.json({ 
                message: usage.message,
                requiresSignIn: !userId 
            }, { status: 429 });
        }

        const { codeSnippet, sourceLanguage, targetLanguage } = await req.json();
        if (!codeSnippet || !sourceLanguage || !targetLanguage) {
            return NextResponse.json({ message: "Code Snippet, source, and target languages are required" }, { status: 400 });
        }

        const llm = new ChatGoogleGenerativeAI({
            modelName: "gemini-2.5-flash-lite",
            apiKey: process.env.GOOGLE_GEMINI_API_KEY,
            maxOutputTokens: 2048,
            temperature: 0.7,
        });

        const prompt = `
        You are a highly skilled AI that converts code from one programming language to another.
        - Convert the given **${sourceLanguage}** code into **${targetLanguage}**.
        - Ensure that syntax, best practices, and performance are maintained.
        - Do NOT add explanations, comments, or extra text. Only return the converted code.

        Code in ${sourceLanguage}:
        ${codeSnippet}
        
        Converted Code in ${targetLanguage}:
        `;

        const stream = await llm.stream(prompt);

        const readableStream = new ReadableStream({
            async start(controller) {
                for await (const chunk of stream) {
                    if (chunk.content && typeof chunk.content === "string") {
                        controller.enqueue(new TextEncoder().encode(chunk.content));
                    }
                }
                
                // Finalize Consumption on completion
                await recordUsage(userId || null, "conversion", ip);
                controller.close();
            }
        });

        return new Response(readableStream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-cache",
            },
        });
    } catch (error) {
        console.error("Code converter error:", error);
        return NextResponse.json({ error: "An error occurred" }, { status: 500 });
    }
}