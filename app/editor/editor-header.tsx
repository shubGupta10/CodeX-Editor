import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Play, Menu, Save, Download } from "lucide-react";
import { languageOptions } from "../utils/constants";
import { SupportedLanguage } from "../utils/editor-config";
import AiButton from "@/components/AiButton";
import ConversionCodePanel from "@/components/codeConversion/conversion";

interface EditorHeaderProps {
  language: SupportedLanguage;
  onLanguageChange: (language: SupportedLanguage) => void;
  onRun: () => void;
  loading: boolean;
  onToggleSidebar: () => void;
  onSave: () => void;
  onExport: () => void;
  isDirty: boolean;
  fileName?: string;
}

export default function EditorHeader({
  language,
  onLanguageChange,
  onRun,
  loading,
  onToggleSidebar,
  onSave,
  onExport,
  isDirty,
  fileName
}: EditorHeaderProps) {
  return (
    <header className="h-12 bg-[#1e1e1e] border-b border-gray-800 flex items-center justify-between px-3 shadow-sm flex-shrink-0">
      {/* Left: Menu + Filename */}
      <div className="flex items-center gap-2">
        <Button
          onClick={onToggleSidebar}
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-400 hover:text-white hover:bg-[#252525] transition-colors"
        >
          <Menu className="w-4 h-4" />
        </Button>
        {fileName && (
          <div className="flex items-center gap-1.5 ml-1">
            <span className="text-gray-300 text-sm font-medium">{fileName}</span>
            {isDirty && <span className="text-yellow-500 text-[10px]">●</span>}
          </div>
        )}
      </div>
      
      {/* Center: Convert + AI */}
      <div className="flex items-center gap-3">
        <ConversionCodePanel/>
        <AiButton />
      </div>

      {/* Right: Export + Save + Language + Run */}
      <div className="flex items-center gap-2.5">
        <Button
          onClick={onExport}
          size="sm"
          variant="ghost"
          className="gap-1.5 h-8 px-3 text-sm text-gray-400 hover:text-emerald-300 hover:bg-[#2a2a2a] transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Export
        </Button>
        <Button
          onClick={onSave}
          disabled={loading || !isDirty}
          size="sm"
          variant="ghost"
          className={`gap-1.5 h-8 px-3 text-sm transition-colors ${
            isDirty 
              ? 'text-emerald-400 hover:text-emerald-300 hover:bg-[#2a2a2a]' 
              : 'text-gray-500'
          }`}
        >
          <Save className="w-3.5 h-3.5" />
          Save
          <kbd className="ml-1 text-[10px] text-gray-500 font-sans hidden xl:inline">⌘S</kbd>
        </Button>
        
        <div className="h-5 w-px bg-gray-800 mx-1" />
        
        <Select value={language} onValueChange={onLanguageChange}>
          <SelectTrigger className="w-[140px] bg-[#252525] border-gray-800 h-8 text-sm text-gray-200 focus:ring-emerald-500 focus:ring-opacity-30">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent className="bg-[#1e1e1e] text-gray-200 border-gray-800">
            {languageOptions.map((lang) => (
              <SelectItem 
                key={lang.value} 
                value={lang.value}
                className="hover:bg-[#2a2a2a] focus:bg-[#2a2a2a] focus:text-emerald-400 text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs">{lang.icon}</span>
                  {lang.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button
          onClick={onRun}
          disabled={loading}
          size="sm"
          className={`text-white gap-1.5 h-8 px-4 text-sm font-medium transition-colors ${
            loading 
              ? 'bg-emerald-600 opacity-80 cursor-not-allowed' 
              : 'bg-emerald-600 hover:bg-emerald-500'
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          {loading ? "Running..." : "Run"}
          {!loading && <kbd className="ml-1 text-[10px] text-emerald-200/50 font-sans hidden xl:inline">⌘⏎</kbd>}
        </Button>
      </div>
    </header>
  );
}