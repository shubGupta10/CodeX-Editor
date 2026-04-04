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
    <div className="h-full bg-[#1e1e1e] w-[52px] flex flex-col items-center justify-between py-3 border-r border-gray-800 flex-shrink-0 z-20">
      {/* Top: Editor tools */}
      <div className="flex flex-col items-center gap-3">
        <TooltipProvider delayDuration={200}>
          {topIcons.map((item) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`w-10 h-10 rounded-xl transition-all duration-200 ${activeTab === item.id
                    ? "bg-emerald-500/15 text-emerald-400 shadow-sm"
                    : "text-gray-500 hover:text-gray-200 hover:bg-[#2a2a2a]"
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
      <div className="flex flex-col items-center gap-3">
        <TooltipProvider delayDuration={200}>
          {bottomLinks.map((link) => (
            <Tooltip key={link.href}>
              <TooltipTrigger asChild>
                <Link
                  href={link.href}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-200 hover:bg-[#2a2a2a] transition-all duration-200"
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
          <div className="w-5 h-px bg-gray-800 my-1 rounded-full" />

          {/* Logout */}
          {user && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                  onClick={() => {
                    signOut({ callbackUrl: "/" });
                    logout();
                  }}
                >
                  <LogOut className="w-5 h-5 ml-0.5" />
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