"use client";

import { useState, useEffect, useRef } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import EditorHeader from "./editor-header";
import FileExplorer from "./file-explorer";
import TerminalPanel from "./terminal-panel";
import SidebarNav from "./sidebar-nav";
import Editor from "@monaco-editor/react";
import { defaultEditorOptions, SupportedLanguage } from "@/app/utils/editor-config";
import { toast } from "react-hot-toast";
import useFileStore from "@/app/store/useFileStore";
import { Button } from "@/components/ui/button";
import { Save, Lightbulb, Laptop, Smartphone, XCircle, Code2, Info } from "lucide-react";

import CodeSuggestion from "@/components/CodeSuggestion/codeSuggesstion";
import { Switch } from "@/components/ui/switch";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { FeedbackModal } from "@/components/FeedbackModal";
import { SignInLimitModal } from "@/components/SignInLimitModal";

export default function EditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session = useSession();

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

  const editorRef = useRef<any>(null);

  const [aiSuggestionsEnabled, setAiSuggestionsEnabled] = useState(false);
  const [showAiSettingsPanel, setShowAiSettingsPanel] = useState(false);
  const codeSuggestionRef = useRef<any>(null);

  const [isMobile, setIsMobile] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);

  useEffect(() => {
    const langParam = searchParams.get("lang") as SupportedLanguage;
    const validLanguages: SupportedLanguage[] = ["javascript", "python", "cpp", "java", "c", "typescript"];

    if (langParam && validLanguages.includes(langParam)) {
      setLanguage(langParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const checkMobile = () => {
      const mobileCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && window.innerWidth < 768;
      setIsMobile(mobileCheck);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    if (selectedFile?.name) {
      const ext = selectedFile.name.split('.').pop()?.toLowerCase();

      const langMap: Record<string, SupportedLanguage> = {
        'js': 'javascript',
        'jsx': 'javascript',
        'ts': 'typescript',
        'tsx': 'typescript',
        'py': 'python',
        'java': 'java',
        'cpp': 'cpp',
        'cc': 'cpp',
        'cxx': 'cpp',
        'c': 'c'
      };

      if (ext && langMap[ext]) {
        setLanguage(langMap[ext]);
      } else if (selectedFile.language) {
        setLanguage(selectedFile.language as SupportedLanguage);
      }
    }
  }, [selectedFile]);

  const localSaveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleEditorChange = (value: string | undefined) => {
    const updatedValue = value || "";
    setFileContent(updatedValue);

    // Debounce localStorage save for unauthenticated users
    if (session.status !== 'authenticated' && selectedFile) {
      clearTimeout(localSaveTimeoutRef.current);
      localSaveTimeoutRef.current = setTimeout(() => {
        const localFiles = JSON.parse(localStorage.getItem('localFiles') || '[]');
        const updatedFiles = localFiles.map((file: any) =>
          file.name === selectedFile.name
            ? { ...file, content: updatedValue }
            : file
        );
        localStorage.setItem('localFiles', JSON.stringify(updatedFiles));
      }, 500);
    }
  };



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

  const GUEST_EXECUTION_LIMIT = 1;

  const runCode = async () => {
    // Guest execution limit — allow 1 free run, then prompt login
    if (session.status !== 'authenticated') {
      const guestRuns = parseInt(localStorage.getItem('guestExecutionCount') || '0', 10);
      if (guestRuns >= GUEST_EXECUTION_LIMIT) {
        setIsLimitModalOpen(true);
        return;
      }
      // Increment guest run count
      localStorage.setItem('guestExecutionCount', String(guestRuns + 1));
    }

    setLoading(true);
    setOutput("Running...");
    setStatus("idle");
    const toastId = toast.loading("Running code...");

    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: fileContent, language, fileName: selectedFile?.name }),
      });
      const data = await response.json();

      if (response.status === 429 || response.status === 403) {
        setIsLimitModalOpen(true);
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

        // Track compilations for feedback prompt
        if (session.status === 'authenticated') {
          const feedbackStatus = localStorage.getItem('codex_feedback_status');
          if (feedbackStatus !== 'completed') {
            const compiles = parseInt(localStorage.getItem('codex_compile_count') || '0', 10) + 1;
            localStorage.setItem('codex_compile_count', String(compiles));

            // Trigger exactly on 2nd compile
            if (compiles === 2) {
              setTimeout(() => setShowFeedbackModal(true), 1500);
            }
          }
        }
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey;

      // Ctrl/Cmd + S → Save
      if (isMod && e.key === 's') {
        e.preventDefault();
        if (isDirty && selectedFile) {
          handleSaveFile();
        }
      }

      // Ctrl/Cmd + Enter → Run code
      if (isMod && e.key === 'Enter') {
        e.preventDefault();
        if (!loading) {
          runCode();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDirty, selectedFile, loading, fileContent, language]);

  const toggleSidebar = () => {
    setCollapsedSidebar(!collapsedSidebar);
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  // Toggle AI suggestions and panel
  const toggleAiSuggestions = () => {
    setShowAiSettingsPanel(!showAiSettingsPanel);
  };

  // Force suggestions to generate when button is clicked
  const handleForceSuggestions = () => {
    if (codeSuggestionRef.current && typeof codeSuggestionRef.current.forceFetchSuggestions === 'function') {
      codeSuggestionRef.current.forceFetchSuggestions();
    }
  };

  if (isMobile) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#1e1e1e] text-center p-6">
        <div className="max-w-md mx-auto">
          <div className="relative mx-auto mb-6 w-16 h-16">
            <Smartphone className="h-16 w-16 text-gray-500 absolute" />
            <XCircle className="h-8 w-8 text-red-500 absolute bottom-0 right-0" />
          </div>
          <h1 className="text-2xl font-bold text-emerald-400 mb-4">Nice try, but not today!</h1>
          <p className="text-gray-300 mb-6">
            We admire your enthusiasm, but coding on a phone is like trying to paint a masterpiece with your elbow.
            Some things just need the right tools.
          </p>
          <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
            <p className="text-yellow-400 text-sm mb-2">Friendly heads-up:</p>
            <p className="text-gray-400 text-sm">
              This code editor needs a larger screen and a proper keyboard to work well.
              Your phone screen is just too small for a good coding experience.
            </p>
          </div>
          <div className="flex items-center justify-center">
            <p className="text-emerald-400 text-sm">
              Come back on a laptop, desktop, or tablet with keyboard. Your code (and fingers) will thank you!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#1e1e1e] text-gray-100">
      <EditorHeader
        language={language}
        onLanguageChange={handleLanguageChange}
        onRun={runCode}
        loading={loading || isFileLoading}
        onToggleSidebar={toggleSidebar}
        onSave={handleSaveFile}
        isDirty={session.status === 'authenticated' ? isDirty : !!selectedFile?.content}
        fileName={selectedFile?.name}
      />
      <div className="flex-1 flex overflow-hidden">
        {/* Fixed Activity Bar (Icon Strip) */}
        <div className="flex-shrink-0 z-10 relative">
          <SidebarNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
            collapsed={collapsedSidebar}
          />
        </div>

        <ResizablePanelGroup direction="horizontal" className="flex-1 z-0">
          {!collapsedSidebar && (
            <>
              <ResizablePanel
                defaultSize={20}
                minSize={15}
                maxSize={40}
                className="flex border-r border-gray-800"
              >
                <div className="flex h-full flex-1 bg-[#1e1e1e] overflow-hidden">
                  <FileExplorer />
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle className="bg-[#252525] hover:bg-[#2a2a2a] transition-colors" />
            </>
          )}

          <ResizablePanel defaultSize={collapsedSidebar ? 100 : 80} className="flex flex-col">
            <ResizablePanelGroup direction="vertical" className="h-full">
              <ResizablePanel defaultSize={70} className="min-h-[30%]">
                <div className="h-full w-full overflow-hidden">
                  {selectedFile ? (
                    <div className="flex flex-col h-full">
                      <div className="px-4 h-10 border-b border-gray-800 bg-[#252525] flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-2.5">
                          <span className="text-sm text-gray-200 font-medium">{selectedFile.name}</span>
                          {isDirty && <span className="text-[10px] text-yellow-500">●</span>}
                          {/* Info tooltip */}
                          <div className="relative group flex items-center">
                            <Info className="h-3.5 w-3.5 text-gray-500 hover:text-gray-300 cursor-help transition-colors" />
                            <div className="absolute left-0 top-6 z-50 hidden group-hover:block bg-[#1e1e1e] border border-gray-700/50 rounded-lg px-3 py-2.5 text-xs text-gray-300 whitespace-nowrap shadow-xl">
                              <p className="mb-0.5"><span className="text-gray-500">File:</span> <span className="text-gray-200">{selectedFile.name}</span></p>
                              <p><span className="text-gray-500">Language:</span> <span className="text-gray-200">{language}</span></p>
                              <div className="mt-1.5 pt-1.5 border-t border-gray-700/50">
                                {language === 'java' && <p className="text-yellow-400">⚠ Class name must match filename</p>}
                                {language === 'cpp' && <p className="text-emerald-400">ℹ Requires main() entry point</p>}
                                {language === 'c' && <p className="text-emerald-400">ℹ Requires main() entry point</p>}
                                {language === 'python' && <p className="text-emerald-400">ℹ Executed via Python 3</p>}
                                {language === 'javascript' && <p className="text-emerald-400">ℹ Executed via Node.js v18+</p>}
                                {language === 'typescript' && <p className="text-emerald-400">ℹ Executed via ts-node</p>}
                              </div>
                            </div>
                          </div>
                        </div>

                        <Button
                          size="icon"
                          variant="ghost"
                          className={`h-7 w-7 ${aiSuggestionsEnabled ? 'text-yellow-400 hover:text-yellow-300 bg-yellow-500/10' : 'text-gray-500 hover:text-gray-300'} hover:bg-[#2a2a2a] transition-colors`}
                          onClick={toggleAiSuggestions}
                          title="AI Suggestions"
                        >
                          <Lightbulb className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* AI Settings Panel */}
                      {showAiSettingsPanel && (
                        <div className="px-4 h-10 border-b border-gray-800 bg-[#1e1e1e] flex items-center justify-between flex-shrink-0 shadow-inner">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-300">AI suggestions</span>
                            <Switch
                              checked={aiSuggestionsEnabled}
                              onCheckedChange={(checked: boolean) => {
                                setAiSuggestionsEnabled(checked);
                                if (checked) {
                                  handleForceSuggestions();
                                }
                              }}
                              className="data-[state=checked]:bg-emerald-600 scale-[0.8]"
                            />
                          </div>
                          {aiSuggestionsEnabled && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-3 text-xs font-medium text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                              onClick={handleForceSuggestions}
                            >
                              Generate Suggestions
                            </Button>
                          )}
                        </div>
                      )}

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
                            quickSuggestions: { other: true, comments: true, strings: true },
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

                        <CodeSuggestion
                          ref={codeSuggestionRef}
                          code={fileContent}
                          editorRef={editorRef}
                          onApplySuggestion={setFileContent}
                          isEnabled={aiSuggestionsEnabled}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center bg-[#1e1e1e] text-gray-400">
                      <Code2 className="w-12 h-12 mb-4 opacity-20" />
                      <p className="mb-1 text-gray-300">No file selected</p>
                      <p className="text-sm text-gray-500 mb-4">Select a file from the explorer or create a new one</p>
                      <div className="flex gap-4 text-xs text-gray-600">
                        <span>⌘S Save</span>
                        <span>⌘⏎ Run</span>
                      </div>
                    </div>
                  )}
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle className="bg-[#252525] hover:bg-[#2a2a2a] transition-colors" />

              <ResizablePanel defaultSize={30} className="min-h-[15%]">
                <TerminalPanel
                  output={output}
                  status={status}
                  onClear={() => { setOutput(""); setStatus("idle"); }}
                />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={(didSubmitOrDismiss) => {
          setShowFeedbackModal(false);
          if (didSubmitOrDismiss) {
            localStorage.setItem('codex_feedback_status', 'completed');
          }
        }}
        userName={session?.data?.user?.name || undefined}
      />

      <SignInLimitModal 
        isOpen={isLimitModalOpen}
        onClose={() => setIsLimitModalOpen(false)}
      />
    </div>
  );
}