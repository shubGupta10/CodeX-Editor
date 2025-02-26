import { useAIStore } from "@/app/store/useAIStore";
import React, { useState, useRef, useEffect } from "react";
import { X, Copy, Check, MessageSquareCode, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeProps {
    node?: any;
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
}

function AiButton() {
  const { code } = useAIStore();
  const [userPrompt, setUserPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [isDailyLimitExceeded, setIsDailyLimitExceeded] = useState(false);
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setButtonPosition({ 
        x: rect.left, 
        y: rect.top 
      });
    }
  }, [isOpen]);

  // Close the panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node) && 
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAISuggestion = async () => {
    if (!userPrompt.trim()) return;
    
    setIsLoading(true);
    setAiResponse("");
    setError(null);
    setIsRateLimited(false);
    setIsDailyLimitExceeded(false);

    try {
      // Check if code is available from the store
      if (!code) {
        throw new Error("No code available to analyze");
      }

      const response = await fetch("/api/ai-helper/code-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code, prompt: userPrompt }),
      });

      // Check for rate limits
      if (response.status === 429) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || "Rate limit exceeded.";
        
        // Check if this is the daily limit (30 requests per day)
        if (errorMessage.includes("daily limit") || errorMessage.includes("30")) {
          setIsDailyLimitExceeded(true);
          throw new Error("You have exceeded the daily limit of AI requests (30). Please try again tomorrow.");
        } else {
          // This is the hourly rate limit
          setIsRateLimited(true);
          throw new Error("Rate limit exceeded. Please try again after 1 hour.");
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `API error: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("Response body is empty");
      }

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
        console.error("Streaming error:", streamError);
        if (fullResponse) {
          // If we already received some data, keep it but log the error
          console.warn("Stream ended unexpectedly, but partial response available");
        } else {
          throw new Error("Failed while reading response stream");
        }
      }

      // Finalize the decoding
      const finalChunk = decoder.decode();
      if (finalChunk) {
        fullResponse += finalChunk;
        setAiResponse(fullResponse);
      }
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

  // Fix for the "p is descendant" issue - this function checks if a node is a block element
  const isBlockElement = (child: React.ReactNode): boolean => {
    if (!React.isValidElement(child)) return false;
    
    const element = child as React.ReactElement;
    const elementType = element.type as any;
    
    // Get the type name correctly
    let typeName: string;
    if (typeof elementType === 'string') {
      typeName = elementType.toLowerCase();
    } else if (elementType && typeof elementType === 'function') {
      typeName = (elementType.displayName || elementType.name || '').toLowerCase();
    } else {
      return false;
    }
    
    // Check if it's a block element
    return ['div', 'pre', 'table', 'ul', 'ol', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(typeName);
  };

  // Helper function to detect if children array contains any block elements
  const containsBlockElements = (children: React.ReactNode) => {
    return React.Children.toArray(children).some(isBlockElement);
  };

  return (
    <>
      {/* AI Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-2 py-1 rounded text-sm bg-blue-500 hover:bg-blue-600 text-white transition"
        aria-label="AI Code Assistant"
      >
        <MessageSquareCode size={16} className="mr-1" />
        <span>AI</span>
      </button>

      {/* AI Assistant Panel */}
      {isOpen && (
        <div 
          ref={panelRef}
          className="fixed shadow-lg rounded-lg"
          style={{
            top: `${buttonPosition.y + 40}px`,
            right: '20px',
            width: '380px',
            maxWidth: '90vw',
            zIndex: 40,
            backgroundColor: 'white',
            border: '1px solid #e2e8f0'
          }}
        >
          <div className="p-3">
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-2 mb-2">
              <h3 className="text-md font-medium text-gray-800">AI Code Assistant</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Rate Limit Alert */}
            {isRateLimited && (
              <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded flex items-start">
                <AlertCircle size={16} className="text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm text-yellow-700">
                  <p className="font-medium">Rate limit exceeded</p>
                  <p>You've reached your hourly limit. Please try again after 1 hour.</p>
                </div>
              </div>
            )}

            {/* Daily Limit Alert */}
            {isDailyLimitExceeded && (
              <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded flex items-start">
                <AlertCircle size={16} className="text-orange-500 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm text-orange-700">
                  <p className="font-medium">Daily limit exceeded</p>
                  <p>You've reached your daily limit of 30 requests. Please try again tomorrow.</p>
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="mb-3">
              <textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Enter your request about the code..."
                className="w-full p-2 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800 resize-none"
                rows={3}
                disabled={isRateLimited || isDailyLimitExceeded}
              />
              <button
                onClick={handleAISuggestion}
                disabled={isLoading || !userPrompt.trim() || isRateLimited || isDailyLimitExceeded}
                className={`w-full p-2 text-sm rounded transition ${
                  isLoading || !userPrompt.trim() || isRateLimited || isDailyLimitExceeded
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {isLoading ? "Generating..." : 
                 isRateLimited ? "Rate Limited" : 
                 isDailyLimitExceeded ? "Daily Limit Exceeded" : 
                 "Ask AI"}
              </button>
            </div>

            {/* AI Response Output */}
            <div className={`border rounded ${aiResponse || error ? 'p-3' : 'p-0'} bg-gray-50 overflow-hidden max-h-80 overflow-y-auto`}>
              {error && !isRateLimited && !isDailyLimitExceeded ? (
                <p className="text-sm text-red-500">{error}</p>
              ) : aiResponse ? (
                <div className="text-sm text-gray-800 markdown-content">
                  <ReactMarkdown
                    components={{
                      code({ node, inline, className, children, ...props }: CodeProps) {
                        const match = /language-(\w+)/.exec(className || '');
                        const codeString = String(children).replace(/\n$/, '');
                        
                        // For inline code, just return a simple code tag without divs
                        if (inline) {
                          return (
                            <code className="bg-gray-200 px-1 py-0.5 rounded text-gray-800" {...props}>
                              {children}
                            </code>
                          );
                        }
                        
                        // For code blocks (not inline)
                        const language = match ? match[1] : 'text';
                        const codeIndex = `block-${Object.keys(copiedStates).length}`;
                        
                        return (
                          <div className="relative rounded overflow-hidden my-2">
                            <div className="flex justify-between items-center py-1 px-2 bg-gray-700 text-gray-200 text-xs">
                              <span>{language}</span>
                              <button
                                onClick={() => handleCopyCode(codeString, codeIndex)}
                                className="text-gray-300 hover:text-white p-1 rounded"
                                aria-label="Copy code"
                              >
                                {copiedStates[codeIndex] ? (
                                  <Check size={14} />
                                ) : (
                                  <Copy size={14} />
                                )}
                              </button>
                            </div>
                            <SyntaxHighlighter
                              style={coldarkDark}
                              language={language}
                              customStyle={{
                                margin: 0,
                                borderRadius: '0 0 4px 4px',
                                fontSize: '0.85rem'
                              }}
                            >
                              {codeString}
                            </SyntaxHighlighter>
                          </div>
                        );
                      },
                      // Fixed p component to properly handle block elements
                      p({ children }) {
                        // If children contain block elements, render as fragment
                        return containsBlockElements(children) ? 
                          <>{children}</> : 
                          <p className="my-2">{children}</p>;
                      },
                      ul({ children }) {
                        return <ul className="list-disc pl-5 my-2">{children}</ul>;
                      },
                      ol({ children }) {
                        return <ol className="list-decimal pl-5 my-2">{children}</ol>;
                      },
                      li({ children }) {
                        return containsBlockElements(children) ? 
                          <li className="mb-1"><>{children}</></li> : 
                          <li className="mb-1">{children}</li>;
                      },
                      h1({ children }) {
                        return <h1 className="text-xl font-bold my-3">{children}</h1>;
                      },
                      h2({ children }) {
                        return <h2 className="text-lg font-bold my-2">{children}</h2>;
                      },
                      h3({ children }) {
                        return <h3 className="text-md font-bold my-2">{children}</h3>;
                      },
                      pre({ children }) {
                        return <>{children}</>; 
                      }
                    }}
                  >
                    {aiResponse}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-xs text-gray-500 text-center py-3">
                  {isRateLimited 
                    ? "Rate limit exceeded. Please try again after 1 hour." 
                    : isDailyLimitExceeded
                    ? "Daily limit of 30 requests exceeded. Please try again tomorrow."
                    : "Ask a question about your code to get AI assistance"}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AiButton;