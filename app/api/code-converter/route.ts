import { ConnectoDatabase } from "@/lib/db";
import { authOptions } from "@/lib/options";
import redis from "@/redis/redis";
import UserLimitModel from "@/models/User_limit";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { getServerSession } from "next-auth";
import { NextResponse, NextRequest } from "next/server";

const REQUEST_LIMIT_LOGGED_IN = 5;
const REQUEST_LIMIT_GUEST = 2;
const TIME_LIMIT = 24 * 60 * 60;

export async function POST(req: NextRequest) {
    try {
        await ConnectoDatabase();
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;

        const REQUEST_LIMIT = userId ? REQUEST_LIMIT_LOGGED_IN : REQUEST_LIMIT_GUEST;

        const userKey = userId 
            ? `conversion-limit-${userId}` 
            : `conversion-limit-guest-${req.headers.get('x-forwarded-for') || 'unknown'}`;

        // Check rate limit in Redis (fail-open if Redis is down)
        try {
            const requestCount = await redis.get(userKey);
            if (requestCount && parseInt(requestCount.toString()) >= REQUEST_LIMIT) {
                return NextResponse.json({ 
                    message: userId 
                        ? "Rate limit exceeded, try again after 24 hours" 
                        : "Guest user limit reached. Please sign in for more conversions.",
                    requiresSignIn: !userId 
                }, { status: 429 });
            }
        } catch (redisError) {
            console.error("Redis error in code-converter (skipping rate limit):", redisError);
        }

        // If logged-in user, check and increment MongoDB limits
        if (userId) {
            const userLimit = await UserLimitModel.findOneAndUpdate(
                { userId },
                {
                    $setOnInsert: {
                        conversionLimit: REQUEST_LIMIT_LOGGED_IN,
                        conversionResetAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
                    },
                },
                { upsert: true, new: true }
            );

            if (new Date() > userLimit.conversionResetAt) {
                userLimit.conversionCount = 0;
                userLimit.conversionResetAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
                await userLimit.save();
            }

            if (userLimit.conversionCount >= userLimit.conversionLimit) {
                return NextResponse.json({ 
                    message: "Conversion limit exceeded, try again after 24 hours",
                    requiresSignIn: false 
                }, { status: 429 });
            }

            userLimit.conversionCount += 1;
            await userLimit.save();
        }

        // Increment Redis counter (fail-open)
        try {
            await redis.incr(userKey);
            await redis.expire(userKey, TIME_LIMIT);
        } catch (redisError) {
            console.error("Redis incr error in code-converter:", redisError);
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