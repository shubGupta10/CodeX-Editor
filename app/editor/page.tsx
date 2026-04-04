"use client";

import { useState, useEffect, useRef, Suspense } from "react";
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
import AiButton from "@/components/AiButton";
import ConversionCodePanel from "@/components/codeConversion/conversion";

function EditorPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session = useSession();

  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const handleExportFile = () => {
    if (session.status !== 'authenticated') {
      toast('Sign in to export files!', { icon: '🔒' });
      setIsLimitModalOpen(true);
      return;
    }

    if (!fileContent) {
      toast.error("File is empty");
      return;
    }

    let exportName = selectedFile?.name || "code_snippet";
    if (!exportName.includes(".")) {
      const extMap: Record<SupportedLanguage, string> = {
        javascript: ".js",
        python: ".py",
        cpp: ".cpp",
        java: ".java",
        c: ".c",
        typescript: ".ts",
      };
      exportName += extMap[language] || ".txt";
    }

    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = exportName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${exportName}`);
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


  return (
    <div className="h-screen flex flex-col bg-[#1e1e1e] text-gray-100">
      <EditorHeader
        language={language}
        onLanguageChange={handleLanguageChange}
        onRun={runCode}
        loading={loading || isFileLoading}
        onToggleSidebar={toggleSidebar}
        onSave={handleSaveFile}
        onExport={handleExportFile}
        isDirty={session.status === 'authenticated' ? isDirty : !!selectedFile?.content}
        fileName={selectedFile?.name}
      />
      <div className="flex-1 flex overflow-hidden relative">
        {/* Fixed Activity Bar (Icon Strip) */}
        <div className="flex-shrink-0 z-50 h-full relative">
          <SidebarNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
            collapsed={collapsedSidebar}
          />
        </div>

        {/* Mobile File Explorer Overlay */}
        {isMobileView && !collapsedSidebar && (
          <div className="absolute inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={toggleSidebar}>
            <div
              className="absolute top-0 left-[52px] bottom-0 w-[85%] max-w-[320px] bg-[#1e1e1e] shadow-2xl border-r border-gray-800/50 flex flex-col shadow-emerald-500/10 animate-in slide-in-from-left duration-200"
              onClick={(e) => e.stopPropagation()} // Prevent touches inside picker from closing
            >
              <FileExplorer onClose={() => isMobileView && setCollapsedSidebar(true)} />
            </div>
          </div>
        )}

        <ResizablePanelGroup key={isMobileView ? 'mobile' : 'desktop'} direction="horizontal" className="flex-1 z-0 auto-cols-auto">
          {!collapsedSidebar && !isMobileView && (
            <>
              <ResizablePanel
                id="sidebar"
                order={1}
                defaultSize={isMobileView ? 85 : 20}
                minSize={isMobileView ? 50 : 15}
                maxSize={isMobileView ? 100 : 40}
                className="flex border-r border-gray-800 z-20"
              >
                <div className="flex h-full flex-1 bg-[#1e1e1e] overflow-hidden">
                  <FileExplorer onClose={() => isMobileView && setCollapsedSidebar(true)} />
                </div>
              </ResizablePanel>
              <ResizableHandle id="sidebar-handle" withHandle className="bg-[#252525] hover:bg-[#2a2a2a] transition-colors" />
            </>
          )}

          <ResizablePanel id="main" order={2} defaultSize={collapsedSidebar || isMobileView ? 100 : 80} className="flex flex-col">
            <ResizablePanelGroup direction="vertical" className="h-full">
              <ResizablePanel id="editor-area" order={1} defaultSize={70} className="min-h-[30%]">
                <div className="h-full w-full overflow-hidden">
                  {selectedFile ? (
                    <div className="flex flex-col h-full bg-[#1e1e1e]">
                      <div className="px-4 pt-3 pb-2 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#252525]/40 rounded-full border border-gray-800/60 shadow-sm">
                            <span className="text-xs text-gray-300 font-medium tracking-wide">{selectedFile.name}</span>
                            {isDirty && <span className="text-[10px] text-yellow-500">●</span>}
                          </div>
                          {/* Info tooltip */}
                          <div className="relative group flex items-center">
                            <Info className="h-3.5 w-3.5 text-gray-500 hover:text-gray-300 cursor-help transition-colors" />
                            <div className="absolute left-0 top-6 z-50 hidden group-hover:block bg-[#252525] border border-gray-700 rounded-lg px-3 py-2.5 text-xs text-gray-300 whitespace-nowrap shadow-xl">
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

                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <div className="md:hidden">
                            <AiButton />
                          </div>
                          {/* AI Suggestions Feature Disabled per request 
                          <Button
                            size="sm"
                            variant="ghost"
                            className={`h-7 px-3 rounded-full transition-all duration-200 ${aiSuggestionsEnabled ? 'text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20' : 'text-gray-500 hover:text-gray-300 hover:bg-[#2a2a2a]'}`}
                            onClick={toggleAiSuggestions}
                            title="AI Suggestions"
                          >
                            <Lightbulb className="h-3.5 w-3.5 sm:mr-1.5" />
                            <span className="hidden xl:inline text-xs font-medium">AI Suggestions</span>
                          </Button>
                          */}
                        </div>
                      </div>

                      {/* AI Settings Panel */}
                      {showAiSettingsPanel && (
                        <div className="px-4 py-2 mx-4 mb-2 rounded-lg border border-gray-800/80 bg-[#252525]/30 flex items-center justify-between flex-shrink-0">
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-400 font-medium tracking-wide uppercase">AI Settings</span>
                            <Switch
                              checked={aiSuggestionsEnabled}
                              onCheckedChange={(checked: boolean) => {
                                setAiSuggestionsEnabled(checked);
                                if (checked) {
                                  handleForceSuggestions();
                                }
                              }}
                              className="data-[state=checked]:bg-emerald-600 scale-[0.7]"
                            />
                          </div>
                          {aiSuggestionsEnabled && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-3 text-[11px] font-medium text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-full"
                              onClick={handleForceSuggestions}
                            >
                              Generate
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

              <ResizableHandle id="terminal-handle" withHandle className="bg-[#252525] hover:bg-[#2a2a2a] transition-colors" />

              <ResizablePanel id="terminal-area" order={2} defaultSize={30} className="min-h-[15%]">
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

export default function EditorPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-screen items-center justify-center bg-[#1e1e1e] text-emerald-500 font-mono">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-500"></div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm font-medium tracking-wide uppercase">Initializing Editor</p>
            <p className="text-xs text-emerald-500/60 lowercase">Please wait...</p>
          </div>
        </div>
      </div>
    }>
      <EditorPageContent />
    </Suspense>
  );
}