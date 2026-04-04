import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, XCircle, CheckCircle2, Copy, Trash, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface TerminalPanelProps {
  output: string;
  status: "idle" | "success" | "error";
  onClear?: () => void;
}

export default function TerminalPanel({ output, status, onClear }: TerminalPanelProps) {
  const [maximized, setMaximized] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
  };

  const clearOutput = () => {
    onClear?.();
  };

  return (
    <div className={`h-full bg-[#1e1e1e] flex flex-col ${maximized ? 'fixed inset-0 z-50 p-2' : ''}`}>
      <div className="flex items-center gap-2 px-4 py-3 flex-shrink-0 bg-[#1e1e1e] sticky top-0 opacity-95 z-10 border-b border-gray-800/30">
        <Terminal className="w-3.5 h-3.5 text-emerald-400" />
        <h3 className="text-[11px] font-bold text-gray-400 tracking-widest uppercase">Output</h3>
        {status === "success" && (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-2" />
        )}
        {status === "error" && (
          <XCircle className="w-4 h-4 text-red-400 ml-2" />
        )}
        
        <div className="ml-auto flex items-center gap-1.5">
          <Button 
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-md text-gray-500 hover:text-emerald-400 hover:bg-[#2a2a2a] transition-all"
            onClick={copyToClipboard}
            title="Copy output"
          >
            <Copy className="w-3.5 h-3.5" />
          </Button>
          {output && (
            <Button 
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
              onClick={clearOutput}
              title="Clear output"
            >
              <Trash className="w-3.5 h-3.5" />
            </Button>
          )}
          <Button 
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-md text-gray-500 hover:text-emerald-400 hover:bg-[#2a2a2a] transition-all"
            onClick={() => setMaximized(!maximized)}
            title={maximized ? "Restore" : "Maximize"}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-3 font-mono text-sm">
        {output ? (
          <pre className={`whitespace-pre-wrap ${
            status === "error"
              ? "text-red-400"
              : status === "success"
                ? "text-emerald-400"
                : "text-gray-300"
          }`}>
            {output}
          </pre>
        ) : (
          <div className="text-gray-500 italic">
            No output yet. Run your code to see results.
          </div>
        )}
      </ScrollArea>
    </div>
  );
}