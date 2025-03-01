import { ConnectoDatabase } from "@/lib/db";
import { authOptions } from "@/lib/options";
import redis from "@/redis/redis";
import UserLimitModel from "@/models/User_limit";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { getServerSession } from "next-auth";
import { NextResponse, NextRequest } from "next/server";

const REQUEST_LIMIT = 5;
const TIME_LIMIT = 24 * 60 * 60;

export async function POST(req: NextRequest) {
    try {
        await ConnectoDatabase();
        const session = await getServerSession(authOptions);
        const userId = session?.user.id;

        if (!userId) {
            return NextResponse.json({ message: "User is not authorized" }, { status: 404 });
        }

        // Check user count in Redis
        const userKey = `conversion-limit-${userId}`;
        const requestCount = await redis.get(userKey);

        if (requestCount && parseInt(requestCount.toString()) >= REQUEST_LIMIT) {
            return NextResponse.json({ message: "Rate limit exceeded, try again after 24 hours" }, { status: 429 });
        }

        // Fetch user limits from MongoDB
        let userLimit = await UserLimitModel.findOne({ userId });

        if (!userLimit) {
            userLimit = await UserLimitModel.create({
                userId,
                conversionCount: 0,
                conversionLimit: REQUEST_LIMIT,
            });
        }

        // Reset daily limits if time has passed
        if (new Date() > userLimit.conversionResetAt) {
            userLimit.conversionCount = 0;
            userLimit.conversionResetAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
            await userLimit.save();
        }

        // Check database limit
        if (userLimit.conversionCount >= userLimit.conversionLimit) {
            return NextResponse.json({ message: "Conversion limit exceeded, try again after 24 hours" }, { status: 429 });
        }

        // Increment request count in Redis
        await redis.incr(userKey);
        await redis.expire(userKey, TIME_LIMIT);

        // Increment request count in MongoDB
        userLimit.conversionCount += 1;
        await userLimit.save();

        const { codeSnippet, sourceLanguage, targetLanguage } = await req.json();
        if (!codeSnippet || !sourceLanguage || !targetLanguage) {
            return NextResponse.json({ message: "Code Snippet, source, and target languages are required" }, { status: 400 });
        }

        const llm = new ChatGoogleGenerativeAI({
            modelName: "gemini-1.5-flash",
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

        // Generate AI response as a stream
        const stream = await llm.stream(prompt);

        // Create a transformed stream
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
        return NextResponse.json({ error: "An error occurred" }, { status: 500 });
    }
}
