import useFileStore from "@/app/store/useFileStore";
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Copy, Check, MessageSquareCode, AlertCircle, ArrowLeft, Eye, LogIn, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useSession, signIn } from "next-auth/react";

interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

interface AiButtonProps {
  variant?: "default" | "sidebar" | "editor";
}

function AiButton({ variant = "default" }: AiButtonProps) {
  const { data: session } = useSession();
  const code = useFileStore((s) => s.fileContent);
  const [userPrompt, setUserPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [showOutputPanel, setShowOutputPanel] = useState(false);
  const [hasResponse, setHasResponse] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [isDailyLimitExceeded, setIsDailyLimitExceeded] = useState(false);
  const [conversationCount, setConversationCount] = useState(0);
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const panelRef = useRef<HTMLDivElement>(null);
  const outputPanelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const MAX_CONVERSATIONS = session?.user ? 5 : 2;

  useEffect(() => {
    setMounted(true);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const handleAISuggestion = async () => {
    if (!session?.user) {
      await signIn();
      return;
    }
    if (!userPrompt.trim()) return;
    if (conversationCount >= MAX_CONVERSATIONS) {
      setIsDailyLimitExceeded(true);
      return;
    }

    setIsLoading(true);
    setAiResponse("");
    setError(null);
    setIsRateLimited(false);
    setShowOutputPanel(true);

    try {
      if (!code) throw new Error("No code available to analyze");

      const response = await fetch("/api/ai-helper/code-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, prompt: userPrompt, isGuest: !session?.user }),
      });

      if (response.status === 429) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || "Rate limit exceeded.";
        if (errorMessage.includes("limit")) {
          setIsDailyLimitExceeded(true);
          throw new Error(errorMessage);
        } else {
          setIsRateLimited(true);
          throw new Error("Rate limit exceeded. Please try again after 1 hour.");
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `API error: ${response.status}`);
      }

      if (!response.body) throw new Error("Response body is empty");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullResponse += chunk;
          setAiResponse(fullResponse);
        }
      } catch (streamError) {
        if (!fullResponse) throw new Error("Failed while reading response stream");
      }

      const finalChunk = decoder.decode();
      if (finalChunk) {
        fullResponse += finalChunk;
        setAiResponse(fullResponse);
      }

      setConversationCount(prev => prev + 1);
      setHasResponse(true);
    } catch (error: any) {
      console.error("AI Assistant Error:", error);
      setError(error.message || "Something went wrong with the AI response.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = (code: string, index: number | string) => {
    navigator.clipboard.writeText(code);
    setCopiedStates(prev => ({ ...prev, [index]: true }));
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [index]: false }));
    }, 2000);
  };

  const closeOutputPanel = () => setShowOutputPanel(false);
  const openOutputPanel = () => setShowOutputPanel(true);

  const isBlockElement = (child: React.ReactNode): boolean => {
    if (!React.isValidElement(child)) return false;
    const element = child as React.ReactElement;
    const elementType = element.type as any;
    let typeName: string;
    if (typeof elementType === 'string') {
      typeName = elementType.toLowerCase();
    } else if (elementType && typeof elementType === 'function') {
      typeName = (elementType.displayName || elementType.name || '').toLowerCase();
    } else {
      return false;
    }
    return ['div', 'pre', 'table', 'ul', 'ol', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(typeName);
  };

  const containsBlockElements = (children: React.ReactNode) => {
    return React.Children.toArray(children).some(isBlockElement);
  };

  return (
    <>
      {/* AI Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={
          variant === "sidebar"
            ? "w-10 h-10 rounded-xl text-violet-400 hover:text-white hover:bg-violet-600/20 bg-violet-600/10 transition-all duration-200 flex items-center justify-center shadow-sm"
            : variant === "editor"
            ? "h-7 w-7 flex items-center justify-center rounded-md text-gray-500 hover:text-violet-400 hover:bg-[#252525] transition-colors"
            : "flex items-center gap-1.5 px-3 h-8 rounded-md text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white transition-colors"
        }
        aria-label="AI Code Assistant"
      >
        <MessageSquareCode size={variant === "sidebar" ? 22 : 16} />
        {variant === "default" && <span>AI Assistant</span>}
      </button>

      {/* AI Input Panel */}
      {mounted && isOpen && !showOutputPanel && createPortal(
        <>
          {isMobile && <div className="fixed inset-0 bg-black/50 z-[55]" onClick={() => setIsOpen(false)} />}
          <div
            ref={panelRef}
            className="fixed shadow-2xl bg-[#1e1e1e] border border-gray-700/50 backdrop-blur-md \
                       max-md:inset-x-4 max-md:top-[50%] max-md:-translate-y-1/2 max-md:w-auto max-md:rounded-2xl \
                       md:rounded-xl md:top-[var(--desk-top)] md:right-[var(--desk-right)] md:w-[var(--desk-width)] md:max-w-[90vw]"
            style={{
              "--desk-top": `${buttonPosition.y + 44}px`,
              "--desk-right": "16px",
              "--desk-width": "400px",
              zIndex: 60,
            } as React.CSSProperties}
          >
            <div className="p-5">
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <MessageSquareCode size={18} className="text-violet-400" />
                  <h3 className="text-base font-medium text-gray-100">AI Assistant</h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-[#2a2a2a] text-gray-500 hover:text-gray-300 transition-colors"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Rate Limit Alert */}
              {isDailyLimitExceeded && (
                <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg flex items-start gap-2.5">
                  <AlertCircle size={16} className="text-orange-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-orange-300">
                    <p className="font-medium">Daily limit exceeded</p>
                    <p className="mt-1 text-orange-300/80 text-xs">You've reached your daily limit. Try again tomorrow.</p>
                  </div>
                </div>
              )}

              {/* Guest Login Prompt */}
              {!session?.user && (
                <div className="mb-4 p-4 bg-violet-500/10 border border-violet-500/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <LogIn size={18} className="text-violet-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-gray-300">
                      <p className="font-medium text-violet-300">Sign in required</p>
                      <p className="mt-1 text-gray-400 text-xs">Sign in to use the AI Assistant</p>
                      <button
                        onClick={() => signIn()}
                        className="mt-3 px-4 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-md text-sm font-medium transition-colors"
                      >
                        Sign In
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Input Area */}
              {session?.user && (
                <>
                  <div className="relative">
                    <textarea
                      value={userPrompt}
                      onChange={(e) => setUserPrompt(e.target.value)}
                      placeholder="Ask about your code..."
                      className="w-full p-3.5 pr-12 text-sm border border-gray-700/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50 bg-[#252525] text-gray-200 resize-none placeholder-gray-500 min-h-[100px]"
                      rows={3}
                      disabled={isRateLimited || isDailyLimitExceeded}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAISuggestion();
                        }
                      }}
                    />
                    <button
                      onClick={handleAISuggestion}
                      disabled={isLoading || !userPrompt.trim() || isRateLimited || isDailyLimitExceeded}
                      className="absolute bottom-3 right-3 h-8 w-8 flex items-center justify-center rounded-md bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                      <Send size={14} className="ml-0.5" />
                    </button>
                  </div>

                  {/* View Previous */}
                  {hasResponse && (
                    <button
                      onClick={openOutputPanel}
                      className="mt-2 w-full text-center text-[11px] text-violet-400 hover:text-violet-300 flex items-center justify-center gap-1 py-1 rounded-md hover:bg-violet-500/10 transition-colors"
                    >
                      <Eye size={11} />
                      View previous response
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </>,
        document.body
      )}

      {/* AI Output Panel */}
      {mounted && showOutputPanel && createPortal(
        <div
          ref={outputPanelRef}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
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
                <div className="flex items-center gap-2">
                  <MessageSquareCode size={14} className="text-violet-400" />
                  <h2 className="text-sm font-medium text-gray-200">AI Response</h2>
                </div>
              </div>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${isLoading
                ? "bg-yellow-500/10 text-yellow-400"
                : "bg-emerald-500/10 text-emerald-400"
                }`}>
                {isLoading ? "Generating..." : "Complete"}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {error && !isRateLimited && !isDailyLimitExceeded ? (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              ) : isLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <div className="h-8 w-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-gray-400">Generating response...</p>
                </div>
              ) : aiResponse ? (
                <div className="text-sm text-gray-200 leading-relaxed">
                  <ReactMarkdown
                    components={{
                      code({ node, inline, className, children, ...props }: CodeProps) {
                        const match = /language-(\w+)/.exec(className || '');
                        const codeString = String(children).replace(/\n$/, '');

                        if (inline) {
                          return (
                            <code className="bg-gray-800 px-1.5 py-0.5 rounded text-emerald-300 text-xs" {...props}>
                              {children}
                            </code>
                          );
                        }

                        const language = match ? match[1] : 'text';
                        const codeIndex = `block-${Object.keys(copiedStates).length}`;

                        return (
                          <div className="relative rounded-lg overflow-hidden my-3 border border-gray-700/50">
                            <div className="flex justify-between items-center py-1.5 px-3 bg-[#252525] text-gray-400 text-[10px]">
                              <span className="font-mono uppercase tracking-wider">{language}</span>
                              <button
                                onClick={() => handleCopyCode(codeString, codeIndex)}
                                className="text-gray-400 hover:text-emerald-400 p-0.5 rounded transition-colors"
                                aria-label="Copy code"
                              >
                                {copiedStates[codeIndex] ? (
                                  <Check size={12} className="text-emerald-400" />
                                ) : (
                                  <Copy size={12} />
                                )}
                              </button>
                            </div>
                            <SyntaxHighlighter
                              style={coldarkDark}
                              language={language}
                              customStyle={{
                                margin: 0,
                                borderRadius: '0 0 8px 8px',
                                fontSize: '0.8rem',
                                backgroundColor: '#161616'
                              }}
                            >
                              {codeString}
                            </SyntaxHighlighter>
                          </div>
                        );
                      },
                      p({ children }) {
                        return containsBlockElements(children) ?
                          <>{children}</> :
                          <p className="my-2 leading-relaxed">{children}</p>;
                      },
                      ul({ children }) {
                        return <ul className="list-disc pl-5 my-3 space-y-1">{children}</ul>;
                      },
                      ol({ children }) {
                        return <ol className="list-decimal pl-5 my-3 space-y-1">{children}</ol>;
                      },
                      li({ children }) {
                        return containsBlockElements(children) ?
                          <li className="mb-1"><>{children}</></li> :
                          <li className="mb-1">{children}</li>;
                      },
                      h1({ children }) {
                        return <h1 className="text-lg font-semibold my-3 text-gray-100">{children}</h1>;
                      },
                      h2({ children }) {
                        return <h2 className="text-base font-semibold my-3 text-gray-100">{children}</h2>;
                      },
                      h3({ children }) {
                        return <h3 className="text-sm font-semibold my-2 text-gray-200">{children}</h3>;
                      },
                      pre({ children }) {
                        return <>{children}</>;
                      },
                      strong({ children }) {
                        return <strong className="font-semibold text-gray-100">{children}</strong>;
                      }
                    }}
                  >
                    {aiResponse}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-xs text-gray-500">Waiting for response...</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-800 flex justify-between items-center flex-shrink-0">
              <button
                onClick={closeOutputPanel}
                className="px-3 py-1.5 rounded-md text-xs bg-[#252525] hover:bg-[#2a2a2a] text-gray-300 transition-colors"
              >
                Close
              </button>
              {aiResponse && (
                <button
                  onClick={() => handleCopyCode(aiResponse, 'full-response')}
                  className="px-3 py-1.5 rounded-md text-xs bg-violet-600 hover:bg-violet-500 text-white flex items-center gap-1.5 transition-colors"
                >
                  {copiedStates['full-response'] ? (
                    <><Check size={12} /> Copied</>
                  ) : (
                    <><Copy size={12} /> Copy All</>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default AiButton;