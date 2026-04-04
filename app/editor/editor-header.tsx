import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Play, Menu, Save, Download } from "lucide-react";
import { languageOptions } from "../utils/constants";
import { SupportedLanguage } from "../utils/editor-config";
import ConversionCodePanel from "@/components/codeConversion/conversion";
import AiButton from "@/components/AiButton";

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
    <header className="h-14 bg-[#1e1e1e] border-b border-gray-800 flex items-center justify-between px-3 md:px-4 shadow-sm flex-shrink-0">
      {/* Left: Menu + File Actions */}
      <div className="flex items-center gap-1 xl:gap-2 w-1/3">
        <Button
          onClick={onToggleSidebar}
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-400 hover:text-white hover:bg-[#252525] transition-colors flex-shrink-0"
        >
          <Menu className="w-4 h-4" />
        </Button>

        {fileName && (
          <div className="hidden md:flex items-center gap-1.5 ml-1 mr-2 px-2.5 py-1">
            <span className="text-gray-300 text-xs font-medium truncate max-w-[120px]">{fileName}</span>
            {isDirty && <span className="text-yellow-500 text-[10px]">●</span>}
          </div>
        )}

        <div className="hidden sm:flex items-center gap-1">
          <Button
            onClick={onSave}
            disabled={loading || !isDirty}
            size="sm"
            variant="ghost"
            title="Save (⌘S)"
            className={`gap-1.5 h-8 px-2 xl:px-3 text-xs xl:text-sm transition-colors ${isDirty
              ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
              : 'text-gray-500'
              }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Save</span>
          </Button>
          <Button
            onClick={onExport}
            size="sm"
            variant="ghost"
            title="Export"
            className="gap-1.5 h-8 px-2 xl:px-3 text-xs xl:text-sm text-gray-400 hover:text-emerald-300 hover:bg-[#2a2a2a] transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* Center: Execution Console */}
      <div className="flex items-center justify-end sm:justify-center w-full sm:w-1/3">
        <div className="flex items-center bg-[#252525] rounded-full p-1 border border-gray-800 shadow-sm hover:border-gray-700 transition-colors">
          <Select value={language} onValueChange={onLanguageChange}>
            <SelectTrigger className="w-[100px] sm:w-[130px] xl:w-[140px] bg-transparent border-none h-7 text-xs sm:text-sm text-gray-200 focus:ring-0 focus:ring-offset-0 shadow-none">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent className="bg-[#1e1e1e] text-gray-200 border-gray-800">
              {languageOptions.map((lang) => (
                <SelectItem
                  key={lang.value}
                  value={lang.value}
                  className="hover:bg-[#2a2a2a] focus:bg-[#2a2a2a] focus:text-emerald-400 text-sm cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">{lang.icon}</span>
                    {lang.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="h-4 w-px bg-gray-700 mx-1" />

          <Button
            onClick={onRun}
            disabled={loading}
            size="sm"
            className={`text-white gap-1.5 h-7 px-3 sm:px-4 xl:px-5 rounded-full text-xs sm:text-sm font-medium transition-all ${loading
              ? 'bg-emerald-600 opacity-80 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/20'
              }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">{loading ? "Running..." : "Run"}</span>
          </Button>
        </div>
      </div>
      {/* Right: Convert Button (Both) & AI Assistant (Desktop Only) */}
      <div className="flex items-center justify-end gap-2 xl:gap-3 w-1/3">
        <div className="hidden md:flex">
          <AiButton />
        </div>
        <ConversionCodePanel />
      </div>
    </header>
  );
}