import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Code2, Play, Menu, Save, Upload } from "lucide-react";
import { languageOptions } from "../utils/constants";
import { SupportedLanguage } from "../utils/editor-config";
import AiButton from "@/components/AiButton";

interface EditorHeaderProps {
  language: SupportedLanguage;
  onLanguageChange: (language: SupportedLanguage) => void;
  onRun: () => void;
  loading: boolean;
  onToggleSidebar: () => void;
  onSave: () => void;
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
  isDirty,
  fileName
}: EditorHeaderProps) {
  return (
    <header className="h-12 bg-[#252526] border-b border-[#1e1e1e] flex items-center justify-between px-2">
      <div className="flex items-center gap-2">
        <Button 
          onClick={onToggleSidebar}
          variant="ghost" 
          size="icon" 
          className="text-gray-400 hover:text-white hover:bg-[#3c3c3c]"
        >
          <Menu className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-blue-400" />
          <span className="font-medium text-gray-200">Code Editor</span>
          {fileName && (
            <>
              <span className="text-gray-500 mx-1">-</span>
              <span className="text-gray-300 text-sm">{fileName}</span>
              {isDirty && <span className="text-xs text-gray-500 ml-1">*</span>}
            </>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <AiButton/>
        <Button
          onClick={onSave}
          disabled={loading || !isDirty}
          size="sm"
          variant="ghost"
          className="text-gray-300 hover:text-black gap-1 h-8 px-3"
        >
          <Save className="w-3.5 h-3.5" />
          Save
        </Button>
        
        <div className="h-6 w-px bg-gray-700" />
        
        <Select value={language} onValueChange={onLanguageChange}>
          <SelectTrigger className="w-[150px] bg-[#3c3c3c] border-[#2d2d2d] h-8 text-sm">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent className="bg-[#252526] text-gray-200 border-[#3c3c3c]">
            {languageOptions.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{lang.icon}</span>
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
          className="bg-[#0e639c] hover:bg-[#1177bb] text-white gap-1 h-8 px-3"
        >
          <Play className="w-3.5 h-3.5" />
          {loading ? "Running..." : "Run Code"}
        </Button>
      </div>
    </header>
  );
}