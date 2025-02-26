import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  FilesIcon, 
  Search, 
  SettingsIcon,
  Settings
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  collapsed?: boolean;
}

export default function SidebarNav({ activeTab, onTabChange, collapsed = false }: SidebarNavProps) {
  const sidebarIcons = [
    { id: "files", icon: <FilesIcon className="w-5 h-5" />, tooltip: "Explorer" },
    { id: "search", icon: <Search className="w-5 h-5" />, tooltip: "Search" },
    // { id: "git", icon: <GitBranchIcon className="w-5 h-5" />, tooltip: "Source Control" },
    // { id: "debug", icon: <BugIcon className="w-5 h-5" />, tooltip: "Run and Debug" },
    { id: "settings", icon: <Settings  className="w-5 h-5" />, tooltip: "Settings" },
  ];

  return (
    <div className="h-full bg-[#333333] w-12 flex flex-col items-center justify-between py-2">
      <div className="flex flex-col items-center space-y-4">
        <TooltipProvider delayDuration={300}>
          {sidebarIcons.map((item) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`w-10 h-10 rounded-sm ${
                    activeTab === item.id
                      ? "bg-[#252526] text-white border-l-2 border-blue-500"
                      : "text-gray-400 hover:text-black"
                  }`}
                  onClick={() => onTabChange(item.id)}
                >
                  {item.icon}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-[#252526] text-white border-[#3c3c3c]">
                {item.tooltip}
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-10 h-10 rounded-sm text-gray-400 hover:text-white mt-auto"
            >
              <SettingsIcon className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-[#252526] text-white border-[#3c3c3c]">
            Settings
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}