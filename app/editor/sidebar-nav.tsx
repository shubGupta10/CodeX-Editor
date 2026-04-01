import { Button } from "@/components/ui/button";
import {
  FilesIcon,
  Home,
  User,
  LogOut,
  MessageSquare,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import useAuthStore from "@/app/store/userAuthStore";
import Link from "next/link";

interface SidebarNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  collapsed?: boolean;
}

export default function SidebarNav({ activeTab, onTabChange, collapsed = false }: SidebarNavProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const topIcons = [
    { id: "files", icon: <FilesIcon className="w-5 h-5" />, tooltip: "Explorer", action: () => onTabChange("files") },
  ];

  const bottomLinks = [
    { icon: <Home className="w-5 h-5" />, tooltip: "Home", href: "/" },
    { icon: <User className="w-5 h-5" />, tooltip: "Profile", href: "/profile" },
    { icon: <MessageSquare className="w-5 h-5" />, tooltip: "Feedback", href: "/feedback-form" },
  ];

  return (
    <div className="h-full bg-[#1e1e1e] w-[52px] flex flex-col items-center justify-between py-3 border-r border-gray-800 flex-shrink-0">
      {/* Top: Editor tools */}
      <div className="flex flex-col items-center gap-2">
        <TooltipProvider delayDuration={200}>
          {topIcons.map((item) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`w-10 h-10 rounded-xl ${
                    activeTab === item.id
                      ? "bg-[#252525] text-emerald-400 border-l-[3px] border-emerald-500 rounded-l-none"
                      : "text-gray-400 hover:text-white hover:bg-[#2a2a2a] transition-colors"
                  }`}
                  onClick={item.action}
                >
                  {item.icon}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-[#2a2a2a] text-white border-gray-700 text-xs py-1.5 px-2.5">
                {item.tooltip}
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
      
      {/* Bottom: Navigation + Logout */}
      <div className="flex flex-col items-center gap-2">
        <TooltipProvider delayDuration={200}>
          {bottomLinks.map((link) => (
            <Tooltip key={link.href}>
              <TooltipTrigger asChild>
                <Link
                  href={link.href}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#2a2a2a] transition-colors"
                >
                  {link.icon}
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-[#2a2a2a] text-white border-gray-700 text-xs py-1.5 px-2.5">
                {link.tooltip}
              </TooltipContent>
            </Tooltip>
          ))}

          {/* Divider */}
          <div className="w-6 h-px bg-gray-800 my-1" />

          {/* Logout */}
          {user && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  onClick={() => {
                    signOut({ callbackUrl: "/" });
                    logout();
                  }}
                >
                  <LogOut className="w-5 h-5 ml-1" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-[#2a2a2a] text-white border-gray-700 text-xs py-1.5 px-2.5">
                Logout
              </TooltipContent>
            </Tooltip>
          )}
        </TooltipProvider>
      </div>
    </div>
  );
}