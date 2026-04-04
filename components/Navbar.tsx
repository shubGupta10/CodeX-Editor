"use client"

import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Menu, User, LogOut, X, Shield, TrendingUp, HelpCircle, Layout, Code2 } from "lucide-react"
import Link from "next/link"
import useAuthStore from "@/app/store/userAuthStore"
import { signOut, useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { CurrentUser } from "@/types/User"
import { cn } from "@/lib/utils"

function Navbar() {
  const { data: session } = useSession()
  const { user, setUser, logout } = useAuthStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)

  // Hydration safety
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (session?.user) {
      setUser({
        id: session.user.id || "",
        username: session.user.name || "",
        email: session.user.email || "",
        isAdmin: (session.user as any).isAdmin || false,
        profileImage: session.user.image || "",
        lastLogin: new Date() || "",
      })
    }
  }, [session, setUser])

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 150) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const getCurrentUser = async () => {
      if (!session?.user) return;
      try {
        const response = await fetch("/api/user/profile", {
          method: "GET",
          cache: "no-store",
        })
        if (response.ok) {
          const data = await response.json()
          setCurrentUser(data.user)
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error)
      }
    }
    getCurrentUser()
  }, [session])

  if (pathname === "/editor") return null;

  if (!isMounted) {
    return (
      <nav className="sticky top-0 z-50 bg-[#1e1e1e] border-b border-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <img src="/apple-touch-icon.png" width={24} height={24} alt="CodeX Logo" className="rounded-md" />
                <span className="text-xl font-bold">
                  <span className="text-white">Code</span><span className="text-emerald-400">X</span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  // Emerald Standard Styling
  const linkClasses = (active: boolean) => cn(
    "px-4 py-2 text-sm font-medium transition-colors rounded-lg",
    "focus:text-emerald-400 active:text-emerald-400",
    active ? "text-emerald-400 font-bold" : "text-gray-400 hover:text-emerald-400"
  );

  return (
    <nav className={cn(
      "sticky top-0 z-50 bg-[#1e1e1e] border-b border-gray-800 text-white transition-transform duration-300",
      isHidden ? "-translate-y-full" : "translate-y-0"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 shrink-0 group">
              <img src="/apple-touch-icon.png" width={28} height={28} alt="CodeX Logo" className="rounded-md" />
              <span className="text-2xl font-bold tracking-tight">
                <span className="text-white group-hover:text-emerald-400 transition-colors">Code</span>
                <span className="text-emerald-400">X</span>
              </span>
            </Link>
          </div>

          {/* Corrected Navigation Menu With Localization Fix */}
          <div className="hidden md:block">
            <NavigationMenu className="relative">
              <NavigationMenuList className="gap-x-1">
                {user ? (
                  /* Logged In: No Home, No Platform Group, Direct Editor */
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link href="/editor" className={linkClasses(pathname === "/editor")}>
                        Editor
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ) : (
                  /* Guests: Home and Editor */
                  <>
                    <NavigationMenuItem>
                      <NavigationMenuLink asChild>
                        <Link href="/" className={linkClasses(pathname === "/")}>
                          Home
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationMenuLink asChild>
                        <Link href="/editor" className={linkClasses(pathname === "/editor")}>
                          Editor
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  </>
                )}

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/pricing" className={linkClasses(pathname === "/pricing")}>
                      Pricing
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                {user && (
                   <NavigationMenuItem>
                    <NavigationMenuTrigger className={linkClasses(pathname === "/feedback-form" || pathname === "/profile")}>
                      Account
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[200px] gap-1 p-2 bg-[#252525]">
                        <ListItem href="/profile" title="Profile" active={pathname === "/profile"} icon={<User className="h-4 w-4" />} />
                        <ListItem href="/feedback-form" title="Feedback" active={pathname === "/feedback-form"} icon={<HelpCircle className="h-4 w-4" />} />
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                )}

                {user && currentUser?.isAdmin && (
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className={linkClasses(pathname.startsWith("/admin"))}>
                      Portal
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[220px] gap-1 p-2 bg-[#252525]">
                        <ListItem href="/admin/fetch-details" title="Users" active={pathname === "/admin/fetch-details"} icon={<Shield className="h-4 w-4" />} />
                        <ListItem href="/admin/analytics" title="Analytics" active={pathname === "/admin/analytics"} icon={<TrendingUp className="h-4 w-4" />} />
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex items-center gap-x-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="bg-[#252525] border border-gray-800 text-white hover:text-emerald-400 h-10 px-4 rounded-lg">
                    <span className="text-sm font-bold mr-3">{currentUser?.username || user?.username}</span>
                    <User className="h-4 w-4 text-emerald-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-[#252525] text-white border-gray-800 p-1">
                  <DropdownMenuItem onClick={() => router.push("/profile")} className="hover:text-emerald-400 focus:text-emerald-400 cursor-pointer">
                    <User className="mr-2 h-4 w-4" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <DropdownMenuItem onClick={() => { signOut(); logout(); }} className="text-red-400 hover:text-red-400 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => router.push("/auth/login")} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-10 px-6 rounded-lg transition-transform active:scale-95">
                Sign In
              </Button>
            )}

            <div className="md:hidden">
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-[#252525]">
                    {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] bg-[#1e1e1e] text-white border-l border-gray-800">
                  <SheetTitle className="sr-only">Nav</SheetTitle>
                  <div className="flex flex-col gap-6 mt-10 px-4">
                    <Link href="/" className={cn("text-xl", pathname === "/" ? "text-emerald-400 font-bold" : "text-gray-400")} onClick={() => setIsMenuOpen(false)}>Home</Link>
                    <Link href="/editor" className={cn("text-xl", pathname === "/editor" ? "text-emerald-400 font-bold" : "text-gray-400")} onClick={() => setIsMenuOpen(false)}>Editor</Link>
                    <Link href="/pricing" className={cn("text-xl", pathname === "/pricing" ? "text-emerald-400 font-bold" : "text-gray-400")} onClick={() => setIsMenuOpen(false)}>Pricing</Link>
                    {user && (
                      <>
                        <Link href="/profile" className={cn("text-xl", pathname === "/profile" ? "text-emerald-400 font-bold" : "text-gray-400")} onClick={() => setIsMenuOpen(false)}>Profile</Link>
                        <Link href="/feedback-form" className={cn("text-xl", pathname === "/feedback-form" ? "text-emerald-400 font-bold" : "text-gray-400")} onClick={() => setIsMenuOpen(false)}>Feedback</Link>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

const ListItem = ({ title, href, active, icon }: any) => (
  <li>
    <NavigationMenuLink asChild>
      <Link href={href} className={cn("flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-emerald-500/10", active ? "text-emerald-400 bg-emerald-500/5 font-bold" : "text-gray-300 hover:text-emerald-400")}>
        <div className={cn("flex items-center justify-center p-1 rounded bg-gray-800/80", active && "text-emerald-400")}>{icon}</div>
        <span className="text-sm">{title}</span>
      </Link>
    </NavigationMenuLink>
  </li>
);

export default Navbar