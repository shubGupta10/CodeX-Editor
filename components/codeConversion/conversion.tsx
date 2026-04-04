"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import useFileStore from "@/app/store/useFileStore";
import { useSession } from "next-auth/react";
import { X, Copy, Check, Loader2, RefreshCw, AlertCircle, ArrowLeft, Code } from "lucide-react";
import DisplayConvertedResponse from "./displayConvertedResponse";

const MAX_LOGGED_IN_CONVERSIONS = 5;
const MAX_GUEST_CONVERSIONS = 2;
const RATE_LIMIT_STORAGE_KEY = "code_conversion_rate_limit";

type RateLimitData = {
  count: number;
  resetTime: number;
};

const ConversionCodePanel = () => {
  const { data: session } = useSession();
  const codeForConversion = useFileStore((s) => s.fileContent);
  const [sourceLanguage, setSourceLanguage] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [convertedCode, setConvertedCode] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [showOutputPanel, setShowOutputPanel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState<boolean>(false);
  const [usageCount, setUsageCount] = useState<number>(0);
  const [timeUntilReset, setTimeUntilReset] = useState<string>("");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  const MAX_CONVERSIONS = session?.user ? MAX_LOGGED_IN_CONVERSIONS : MAX_GUEST_CONVERSIONS;

  useEffect(() => {
    setMounted(true);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const checkRateLimit = () => {
      const savedData = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
      if (savedData) {
        const data: RateLimitData = JSON.parse(savedData);
        const now = Date.now();
        if (now > data.resetTime) {
          const newData: RateLimitData = { count: 0, resetTime: now + 24 * 60 * 60 * 1000 };
          localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(newData));
          setUsageCount(0);
          setRateLimited(false);
        } else {
          setUsageCount(data.count);
          setRateLimited(data.count >= MAX_CONVERSIONS);
          const timeLeft = data.resetTime - now;
          const hours = Math.floor(timeLeft / (1000 * 60 * 60));
          const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
          setTimeUntilReset(`${hours}h ${minutes}m`);
        }
      } else {
        const newData: RateLimitData = { count: 0, resetTime: Date.now() + 24 * 60 * 60 * 1000 };
        localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(newData));
        setUsageCount(0);
        setRateLimited(false);
      }
    };
    checkRateLimit();
    const intervalId = setInterval(checkRateLimit, 60000);
    return () => clearInterval(intervalId);
  }, [MAX_CONVERSIONS]);

  useEffect(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setButtonPosition({ x: rect.left, y: rect.top });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(event.target as Node) &&
        !showOutputPanel) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showOutputPanel]);

  const incrementUsageCount = () => {
    const savedData = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    if (savedData) {
      const data: RateLimitData = JSON.parse(savedData);
      const newCount = data.count + 1;
      const newData: RateLimitData = { count: newCount, resetTime: data.resetTime };
      localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(newData));
      setUsageCount(newCount);
      if (newCount >= MAX_CONVERSIONS) setRateLimited(true);
      return newCount;
    }
    return 1;
  };

  const handleCodeConversion = async () => {
    if (!sourceLanguage || !targetLanguage || !codeForConversion) {
      setError("Please select both languages and ensure code is available.");
      return;
    }
    if (rateLimited) {
      setError(`Rate limit exceeded. Try again in ${timeUntilReset}.`);
      setShowOutputPanel(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setShowOutputPanel(true);

    try {
      const response = await fetch("/api/code-converter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codeSnippet: codeForConversion, sourceLanguage, targetLanguage }),
      });

      if (response.status === 429) {
        const errorData = await response.json();
        incrementUsageCount();
        setRateLimited(true);
        if (errorData.requiresSignIn) {
          setError("Guest limit reached. Please sign in for more conversions.");
        } else {
          setError(`Rate limit exceeded. Try again in ${timeUntilReset}.`);
        }
        throw new Error(errorData.message);
      }

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      incrementUsageCount();
      const result = await response.text();
      setConvertedCode(result);
    } catch (error: any) {
      console.error("Error converting code:", error);
      setError(error.message || "Failed to convert code.");
    } finally {
      setIsLoading(false);
    }
  };

  const closeOutputPanel = () => setShowOutputPanel(false);

  const languages = [
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "csharp", label: "C#" },
    { value: "cpp", label: "C++" },
    { value: "go", label: "Go" },
    { value: "rust", label: "Rust" },
    { value: "php", label: "PHP" },
    { value: "ruby", label: "Ruby" },
    { value: "swift", label: "Swift" },
    { value: "kotlin", label: "Kotlin" }
  ];

  return (
    <>
      {/* Convert Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 h-8 rounded-md text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
        aria-label="Code Converter"
      >
        <RefreshCw size={16} />
        <span>Convert</span>
      </button>

      {/* Input Panel */}
      {mounted && isOpen && !showOutputPanel && createPortal(
        <>
          {isMobile && (
            <div className="fixed inset-0 bg-black/60 z-[55]" onClick={() => setIsOpen(false)} />
          )}
          <div
            ref={panelRef}
            className="fixed shadow-2xl bg-[#1e1e1e] border border-gray-700/50 backdrop-blur-md z-[60] \
                     max-md:inset-x-4 max-md:top-[50%] max-md:-translate-y-1/2 max-md:w-auto max-md:rounded-2xl \
                     md:rounded-xl md:top-[var(--desk-top)] md:right-[var(--desk-right)] md:w-[var(--desk-width)] md:max-w-[90vw]"
            style={{
              "--desk-top": `${buttonPosition.y + 44}px`,
              "--desk-right": "16px",
              "--desk-width": "400px",
            } as React.CSSProperties}
          >
            <div className="p-5">
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <RefreshCw size={18} className="text-emerald-400" />
                  <h3 className="text-base font-medium text-gray-100">Code Converter</h3>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${MAX_CONVERSIONS - usageCount <= 1
                    ? "bg-red-500/10 text-red-400"
                    : "bg-emerald-500/10 text-emerald-400"
                    }`}>
                    {Math.max(0, MAX_CONVERSIONS - usageCount)}/{MAX_CONVERSIONS} left
                  </span>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-[#2a2a2a] text-gray-500 hover:text-gray-300 transition-colors"
                    aria-label="Close"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Rate Limit Warning */}
              {rateLimited && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2.5">
                  <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-300">
                    <p className="font-medium">Rate limit exceeded</p>
                    <p className="mt-1 text-red-300/80 text-xs">
                      {session?.user
                        ? `Max ${MAX_CONVERSIONS} conversions per day.`
                        : "Guest limit reached. Sign in for more."
                      } Resets in {timeUntilReset}.
                    </p>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && !rateLimited && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* Language Selection */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-gray-400 text-[11px] font-medium uppercase tracking-wider mb-1.5">From</label>
                  <select
                    value={sourceLanguage}
                    onChange={(e) => setSourceLanguage(e.target.value)}
                    className="w-full p-2.5 text-sm border border-gray-700/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500/50 bg-[#252525] text-gray-200"
                    disabled={rateLimited}
                  >
                    <option value="">Select format...</option>
                    {languages.map((lang) => (
                      <option key={`source-${lang.value}`} value={lang.value}>{lang.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-[11px] font-medium uppercase tracking-wider mb-1.5">To</label>
                  <select
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    className="w-full p-2.5 text-sm border border-gray-700/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500/50 bg-[#252525] text-gray-200"
                    disabled={rateLimited}
                  >
                    <option value="">Select format...</option>
                    {languages.map((lang) => (
                      <option key={`target-${lang.value}`} value={lang.value}>{lang.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Code Preview */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-gray-500 text-[10px] uppercase tracking-wider">Code Preview</label>
                  <span className="text-[10px] text-gray-600">{codeForConversion?.length || 0} chars</span>
                </div>
                <div className="p-2 text-xs border border-gray-700/50 rounded-md bg-[#252525] text-gray-400 h-20 overflow-y-auto">
                  {codeForConversion ? (
                    <pre className="whitespace-pre-wrap break-words font-mono text-[11px] text-gray-400">
                      {codeForConversion.length > 300
                        ? `${codeForConversion.substring(0, 300)}...`
                        : codeForConversion}
                    </pre>
                  ) : (
                    <span className="text-gray-600 italic">No code selected</span>
                  )}
                </div>
              </div>

              {/* Convert Button */}
              <button
                onClick={handleCodeConversion}
                disabled={isLoading || !sourceLanguage || !targetLanguage || !codeForConversion || rateLimited}
                className={`w-full p-2 text-xs rounded-md transition-colors flex items-center justify-center gap-1.5 font-medium ${isLoading || !sourceLanguage || !targetLanguage || !codeForConversion || rateLimited
                  ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500'
                  }`}
              >
                {isLoading ? (
                  <><Loader2 size={13} className="animate-spin" /> Converting...</>
                ) : rateLimited ? (
                  <><AlertCircle size={13} /> Rate Limited</>
                ) : (
                  <><RefreshCw size={13} /> Convert Code</>
                )}
              </button>

              {sourceLanguage && targetLanguage && (
                <p className="mt-2 text-center text-[10px] text-gray-600">
                  {languages.find(l => l.value === sourceLanguage)?.label} → {languages.find(l => l.value === targetLanguage)?.label}
                </p>
              )}
            </div>
          </div>
        </>,
        document.body
      )}

      {/* Output Panel */}
      {mounted && showOutputPanel && createPortal(
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-3xl h-[75vh] bg-[#1e1e1e] border border-gray-700/50 rounded-xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-800 flex-shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={closeOutputPanel}
                  className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-[#252525] text-gray-400 hover:text-gray-200 transition-colors"
                  aria-label="Back"
                >
                  <ArrowLeft size={16} />
                </button>
                <div>
                  <h2 className="text-sm font-medium text-gray-200 flex items-center gap-1.5">
                    {languages.find(l => l.value === sourceLanguage)?.label}
                    <span className="text-gray-600">→</span>
                    {languages.find(l => l.value === targetLanguage)?.label}
                  </h2>
                </div>
              </div>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${isLoading
                ? "bg-yellow-500/10 text-yellow-400"
                : rateLimited
                  ? "bg-red-500/10 text-red-400"
                  : "bg-emerald-500/10 text-emerald-400"
                }`}>
                {isLoading ? "Converting..." : rateLimited ? "Rate Limited" : "Complete"}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {rateLimited ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl max-w-md">
                    <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
                    <h3 className="text-base font-medium text-red-400 mb-2">Rate Limit Exceeded</h3>
                    <p className="text-xs text-gray-400 mb-3">
                      {session?.user
                        ? `You've reached the maximum of ${MAX_CONVERSIONS} conversions per day.`
                        : "Guest users are limited. Please sign in for more."
                      }
                    </p>
                    <p className="text-lg font-mono text-red-400">{timeUntilReset}</p>
                  </div>
                </div>
              ) : error && !rateLimited ? (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              ) : isLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <div className="h-8 w-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-gray-400">Converting your code...</p>
                </div>
              ) : convertedCode ? (
                <DisplayConvertedResponse
                  codeSnippet={convertedCode}
                  language={targetLanguage}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-xs text-gray-500">No converted code yet.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-800 flex justify-between items-center flex-shrink-0">
              <div className="text-[10px] text-gray-600">
                {usageCount}/{MAX_CONVERSIONS} used
                {rateLimited && <span className="text-red-400 ml-2">· {timeUntilReset}</span>}
              </div>
              {!isLoading && convertedCode && !rateLimited && (
                <div className="flex gap-2">
                  <button
                    onClick={() => navigator.clipboard.writeText(convertedCode)}
                    className="px-3 py-1.5 rounded-md text-xs bg-[#252525] hover:bg-[#2a2a2a] text-gray-300 flex items-center gap-1.5 transition-colors"
                  >
                    <Copy size={12} /> Copy
                  </button>
                  <button
                    onClick={() => {
                      let cleanCode = convertedCode;
                      const fenceMatch = cleanCode.match(/^```[\w]*\n?([\s\S]*?)```$/);
                      if (fenceMatch) cleanCode = fenceMatch[1].trim();
                      useFileStore.getState().setFileContent(cleanCode);
                      closeOutputPanel();
                      setIsOpen(false);
                    }}
                    className="px-3 py-1.5 rounded-md text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors"
                  >
                    <Code size={12} /> Insert to Editor
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default ConversionCodePanel;