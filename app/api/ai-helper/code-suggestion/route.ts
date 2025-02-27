import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { codeSnippet } = await req.json();

        if (!codeSnippet || typeof codeSnippet !== "string") {
            return NextResponse.json(
                { message: "Invalid input: Code snippet must be a non-empty string." },
                { status: 400 }
            );
        }

        const llm = new ChatGoogleGenerativeAI({
            modelName: "gemini-1.5-flash",
            apiKey: process.env.GOOGLE_GEMINI_API_KEY!,
            maxOutputTokens: 1024,
        });

        const prompt = `You are a smart code completion AI. Suggest the next few words based on this partial code:\n\n${codeSnippet}\n\nSuggestion:`;

        const stream = await llm.stream(prompt);

        const transformStream = new TransformStream({
            async transform(chunk, controller) {
                if (chunk.content && typeof chunk.content === "string") {
                    controller.enqueue(new TextEncoder().encode(chunk.content));
                }
            },
        });

        stream.pipeThrough(transformStream);

        return new Response(transformStream.readable, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-cache",
            },
        });
    } catch (error: any) {
        console.error("Error in AI Suggestion:", error);
        return NextResponse.json(
            { message: "Internal Server Error", error: error.message },
            { status: 500 }
        );
    }
}
