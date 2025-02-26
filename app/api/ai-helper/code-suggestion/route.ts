import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { codeSnippet } = await req.json();
        if (!codeSnippet) {
            return NextResponse.json({
                message: "Code snippet is needed"
            }, { status: 400 })
        }

        const llm = new ChatGoogleGenerativeAI({
            modelName: "gemini-1.5-flash",
            apiKey: process.env.GOOGLE_GEMINI_API_KEY!,
            maxOutputTokens: 1024,
        });

        const prompt = `You are a smart code completion AI. Suggest the next few words based on this partial code:\n\n${codeSnippet}\n\nSuggestion:`;

        const stream = await llm.stream(prompt);

        const readableStream = new ReadableStream({
            async start(controller) {
                for await (const chunk of stream) {
                    if (chunk.content) {
                        if (typeof chunk.content === 'string') {
                            controller.enqueue(new TextEncoder().encode(chunk.content));
                        }
                    }
                }
                controller.close();
            },
        });

        return new Response(readableStream, {
            headers: { "Content-Type": "text/plain" },
        });
    } catch (error: any) {
        console.error("Error in AI Suggestion:", error);
        return NextResponse.json(
            { message: "Internal Server Error", error: error.message },
            { status: 500 }
        );
    }
}