import { rateLimit } from "@/lib/ratelimit";
import { NextResponse } from "next/server";

const ONECOMPILER_API_URL = "https://api.onecompiler.com/v1/run";
const MAX_CODE_LENGTH = 50_000; // 50KB max code size

// OneCompiler language names
const languageMapping: Record<string, string> = {
  python: "python",
  javascript: "nodejs",
  typescript: "typescript",
  java: "java",
  c: "c",
  cpp: "cpp",
};

export async function POST(req: Request) {
  try {
    const apiKey = process.env.ONECOMPILER_API_KEY;
    if (!apiKey) {
      console.error("ONECOMPILER_API_KEY is not configured");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateLimitResult = await rateLimit(ip);

    if (!rateLimitResult.success) {
      return NextResponse.json({ error: rateLimitResult.message }, { status: 429 });
    }

    const { code, language, fileName: userFileName } = await req.json();

    if (!code || !language) {
      return NextResponse.json({ error: "Code and language are required" }, { status: 400 });
    }

    if (typeof code !== "string" || code.length > MAX_CODE_LENGTH) {
      return NextResponse.json({ error: `Code must be a string under ${MAX_CODE_LENGTH} characters` }, { status: 400 });
    }

    const compilerLanguage = languageMapping[language];

    if (!compilerLanguage) {
      return NextResponse.json({ error: "Unsupported language" }, { status: 400 });
    }

    // Use the user's filename if available, otherwise generate a sensible default
    let execFileName = userFileName || "code";
    if (!userFileName) {
      const defaultNames: Record<string, string> = {
        java: "Main.java",
        c: "main.c",
        cpp: "main.cpp",
        python: "main.py",
        nodejs: "index.js",
        typescript: "index.ts",
      };
      execFileName = defaultNames[compilerLanguage] || "code";
    }

    const response = await fetch(ONECOMPILER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify({
        language: compilerLanguage,
        stdin: "",
        files: [{ name: execFileName, content: code }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OneCompiler API error:", response.status, errorText);
      return NextResponse.json({ error: "Code execution failed" }, { status: 502 });
    }

    const result = await response.json();

    return NextResponse.json({
      output: result.stdout || "",
      error: result.stderr || "",
      remainingRequests: rateLimitResult.remaining,
    });
  } catch (error) {
    console.error("Execute API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
