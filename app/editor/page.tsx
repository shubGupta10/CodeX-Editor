"use client";

import { useState, useEffect, useRef, ComponentPropsWithoutRef, ReactNode } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import EditorHeader from "./editor-header";
import FileExplorer from "./file-explorer";
import TerminalPanel from "./terminal-panel";
import SidebarNav from "./sidebar-nav";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import { defaultEditorOptions, SupportedLanguage } from "@/app/utils/editor-config";
import { toast } from "react-hot-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import useFileStore from "@/app/store/useFileStore";
import { Button } from "@/components/ui/button";
import { Save, LightbulbIcon } from "lucide-react";
import { useAIStore } from "../store/useAIStore";

interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: ReactNode;
}

export default function EditorPage() {
  const {
    selectedFile,
    fileContent,
    setFileContent,
    saveFileContent,
    isLoading: isFileLoading,
    isDirty
  } = useFileStore();

  const [language, setLanguage] = useState<SupportedLanguage>("javascript");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [activeTab, setActiveTab] = useState("files");
  const [collapsedSidebar, setCollapsedSidebar] = useState(false);
  const { code, setCode } = useAIStore();
  
  const [suggestions, setSuggestions] = useState("");
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    if (selectedFile && selectedFile.language) {
      setLanguage(selectedFile.language as SupportedLanguage);
    }
  }, [selectedFile]);

  const fetchCodeSuggestions = async (code: string) => {
    if (!code || code.trim().length < 10) return;
    
    try {
      setIsFetchingSuggestions(true);
      
      const response = await fetch("/api/ai-helper/code-suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codeSnippet: code }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to get suggestions");
      }
      
      const reader = response.body?.getReader();
      if (!reader) return;
      
      let accumulatedSuggestions = "";
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const text = decoder.decode(value);
        accumulatedSuggestions += text;
        setSuggestions(accumulatedSuggestions);
        
        if (accumulatedSuggestions.trim().length > 0) {
          setShowSuggestions(true);
        }
      }
    } catch (error) {
      console.error("Error fetching code suggestions:", error);
    } finally {
      setIsFetchingSuggestions(false);
    }
  };

  const applySuggestion = () => {
    if (editorRef.current && suggestions) {
      const editor = editorRef.current;
      const currentValue = editor.getValue();
      
      const extractedCode = extractCodeFromMarkdown(suggestions);
      const updatedValue = currentValue + "\n\n" + extractedCode;
      
      editor.setValue(updatedValue);
      setFileContent(updatedValue);
      setCode(updatedValue);
      
      setSuggestions("");
      setShowSuggestions(false);
    }
  };

  const extractCodeFromMarkdown = (markdown: string) => {
    const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)```/g;
    let match;
    let extractedCode = "";
    
    while ((match = codeBlockRegex.exec(markdown)) !== null) {
      extractedCode += match[1] + "\n\n";
    }
    
    return extractedCode.trim() || markdown;
  };

  const handleEditorChange = (value: string | undefined) => {
    const updatedValue = value || "";
    setFileContent(updatedValue);
    setCode(updatedValue);
    
    if (suggestionsTimeoutRef.current) {
      clearTimeout(suggestionsTimeoutRef.current);
    }
    
    suggestionsTimeoutRef.current = setTimeout(() => {
      fetchCodeSuggestions(updatedValue);
    }, 600);
  };

  useEffect(() => {
    return () => {
      if (suggestionsTimeoutRef.current) {
        clearTimeout(suggestionsTimeoutRef.current);
      }
    };
  }, []);

  const handleSaveFile = async () => {
    try {
      await saveFileContent();
      toast.success("File saved successfully!");
    } catch (error) {
      toast.error("Failed to save file");
      console.error("Error saving file:", error);
    }
  };

  const handleLanguageChange = (newLanguage: SupportedLanguage) => {
    setLanguage(newLanguage);
    if (!selectedFile) {
      setFileContent(defaultEditorOptions.snippets[newLanguage] || "");
    }
  };

  const runCode = async () => {
    setLoading(true);
    setOutput("Running...");
    setStatus("idle");
    const toastId = toast.loading("Running code...");

    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: fileContent, language }),
      });
      const data = await response.json();

      if (response.status === 429) {
        toast.error("Rate limit exceeded! Please try again later.");
        setOutput("⚠️ Rate limit exceeded.");
        setStatus("error");
        return;
      }

      if (data.error) {
        setOutput(`Error: ${data.error.trim()}`);
        setStatus("error");
      } else {
        const cleanOutput = (data.output || "")
          .split("\n")
          .filter((line: string) => line.trim() !== "")
          .join("\n")
          .trim();

        setOutput(cleanOutput || "No output generated");
        setStatus("success");
        toast.success("Code executed successfully!");
      }
    } catch (error) {
      toast.error("Failed to execute code. Please try again.");
      setOutput("Failed to execute code.");
      setStatus("error");
      console.error("Execution error:", error);
    } finally {
      setLoading(false);
      toast.dismiss(toastId);
    }
  };

  const toggleSidebar = () => {
    setCollapsedSidebar(!collapsedSidebar);
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  return (
    <div className="h-screen flex flex-col bg-[#1e1e1e] text-gray-100">
      <EditorHeader
        language={language}
        onLanguageChange={handleLanguageChange}
        onRun={runCode}
        loading={loading || isFileLoading || isFetchingSuggestions}
        onToggleSidebar={toggleSidebar}
        onSave={handleSaveFile}
        isDirty={isDirty}
        fileName={selectedFile?.name}
      />
      <div className="flex-1 flex overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel
            defaultSize={collapsedSidebar ? 5 : 20}
            minSize={collapsedSidebar ? 5 : 15}
            maxSize={30}
            className="flex"
          >
            <div className="flex h-full flex-1">
              <SidebarNav
                activeTab={activeTab}
                onTabChange={setActiveTab}
                collapsed={collapsedSidebar}
              />
              {!collapsedSidebar && (
                <div className="flex-1 border-r border-gray-800">
                  <FileExplorer />
                </div>
              )}
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle className="bg-[#252525] hover:bg-[#2a2a2a] transition-colors" />

          <ResizablePanel defaultSize={80} className="flex flex-col">
            <ResizablePanelGroup direction="vertical" className="h-full">
              <ResizablePanel defaultSize={70} className="min-h-[30%]">
                <div className="h-full w-full overflow-hidden">
                  {selectedFile ? (
                    <div className="flex flex-col h-full">
                      <div className="px-4 py-1 border-b border-gray-800 bg-[#1e1e1e] flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-300">{selectedFile.name}</span>
                          {isDirty && <span className="ml-2 text-xs text-gray-500">(unsaved)</span>}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-emerald-400 hover:text-emerald-300 hover:bg-[#252525] transition-colors"
                          onClick={handleSaveFile}
                          disabled={isFileLoading || !isDirty}
                        >
                          <Save className="h-3.5 w-3.5 mr-1" />
                          Save
                        </Button>
                      </div>
                      <div className="flex-1 relative">
                        <Editor
                          height="100%"
                          theme="vs-dark"
                          language={language}
                          value={fileContent}
                          onChange={handleEditorChange}
                          onMount={handleEditorDidMount}
                          options={{
                            ...defaultEditorOptions.monaco,
                            minimap: { enabled: true },
                            quickSuggestions: {other: true, comments: true, strings: true},
                            suggestOnTriggerCharacters: true,
                            autoClosingBrackets: "always",
                            autoIndent: 'full',
                            tabCompletion: "on",
                            inlineSuggest: { enabled: true },
                            suggest: {
                              showInlineDetails: true,
                              showMethods: true,
                              showFunctions: true,
                              showConstructors: true,
                              showFields: true,
                              showVariables: true,
                              showClasses: true,
                              showStructs: true,
                              showInterfaces: true,
                              showModules: true,
                              showProperties: true,
                              showEvents: true,
                              showOperators: true,
                              showUnits: true,
                              showValues: true,
                              showConstants: true,
                              showEnums: true,
                              showEnumMembers: true,
                              showKeywords: true,
                              showWords: true,
                              showColors: true,
                              showFiles: true,
                              showReferences: true,
                              showFolders: true,
                              showTypeParameters: true,
                              showSnippets: true,
                              showUsers: true,
                              showIssues: true
                            }
                          }}
                          loading={
                            <div className="h-full w-full flex items-center justify-center bg-[#1e1e1e]">
                              <div className="text-emerald-400">Loading editor...</div>
                            </div>
                          }
                        />
                        
                        {showSuggestions && suggestions && (
                          <div className="absolute bottom-4 right-4 w-1/2 max-w-lg bg-[#252525] border border-gray-700 rounded-lg shadow-lg overflow-hidden z-10">
                            <div className="flex items-center justify-between bg-[#2d2d2d] px-3 py-2 border-b border-gray-700">
                              <div className="flex items-center">
                                <LightbulbIcon className="h-4 w-4 text-yellow-400 mr-2" />
                                <span className="text-sm font-medium">AI Suggestions</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-6 px-2 text-xs hover:bg-[#3a3a3a]"
                                  onClick={applySuggestion}
                                >
                                  Apply
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-6 px-2 text-xs hover:bg-[#3a3a3a]"
                                  onClick={() => setShowSuggestions(false)}
                                >
                                  Dismiss
                                </Button>
                              </div>
                            </div>
                            <ScrollArea className="max-h-64 p-3">
                              <div className="text-xs text-gray-300 prose prose-invert prose-sm max-w-none">
                                <ReactMarkdown
                                  components={{
                                    code({node, inline, className, children, ...props}: CodeProps) {
                                      if (inline) {
                                        return <code className="bg-gray-800 px-1 py-0.5 rounded text-gray-200" {...props}>{children}</code>;
                                      }
                                      return (
                                        <div className="bg-gray-800 rounded p-2 my-2 overflow-x-auto">
                                          <code className="text-gray-200 font-mono text-xs" {...props}>{children}</code>
                                        </div>
                                      )
                                    },
                                    pre({children}) {
                                      return <>{children}</>;
                                    },
                                    p({children}) {
                                      return <p className="mb-2">{children}</p>;
                                    },
                                    h1({children}) {
                                      return <h1 className="text-base font-bold my-2">{children}</h1>;
                                    },
                                    h2({children}) {
                                      return <h2 className="text-sm font-bold my-2">{children}</h2>;
                                    },
                                    ul({children}) {
                                      return <ul className="list-disc pl-4 mb-2">{children}</ul>;
                                    },
                                    ol({children}) {
                                      return <ol className="list-decimal pl-4 mb-2">{children}</ol>;
                                    },
                                    li({children}) {
                                      return <li className="mb-1">{children}</li>;
                                    }
                                  }}
                                >
                                  {suggestions}
                                </ReactMarkdown>
                              </div>
                            </ScrollArea>
                          </div>
                        )}
                        
                        {isFetchingSuggestions && !showSuggestions && (
                          <div className="absolute bottom-4 right-4 bg-[#252525] border border-gray-700 rounded-lg shadow-lg p-3 flex items-center">
                            <div className="animate-spin h-4 w-4 border-2 border-emerald-400 border-t-transparent rounded-full mr-2"></div>
                            <span className="text-xs">Generating suggestions...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center bg-[#1e1e1e] text-gray-400">
                      <p className="mb-2">No file selected</p>
                      <p className="text-sm">Select a file from the explorer or create a new one</p>
                    </div>
                  )}
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle className="bg-[#252525] hover:bg-[#2a2a2a] transition-colors" />

              <ResizablePanel defaultSize={30} className="min-h-[15%]">
                <TerminalPanel
                  output={output}
                  status={status}
                />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}