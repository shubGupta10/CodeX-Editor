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
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Menu, Code, User, LogOut, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import useAuthStore from "@/app/store/userAuthStore"
import { signOut, useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { CurrentUser } from "@/types/User"


function Navbar() {
  const { data: session, status } = useSession()
  const { user, setUser, logout } = useAuthStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)

  // Hydration safety — only render dynamic content after mount
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

  // Hide navbar on editor page
  if (pathname === "/editor") return null;

  // Prevent hydration mismatch — render skeleton until mounted
  if (!isMounted) {
    return (
      <nav className="sticky top-0 z-50 bg-[#1e1e1e] border-b border-gray-800 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2 hover:text-white">
                <img src="/apple-touch-icon.png" width={24} height={24} alt="CodeX Logo" className="rounded-md" />
                <span className="text-xl font-bold">
                  <span className="text-white">Code</span>
                  <span className="text-emerald-400">X</span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className={`sticky top-0 z-50 bg-[#1e1e1e] border-b border-gray-800 text-white transition-transform duration-300 ${
      isHidden ? "-translate-y-full" : "translate-y-0"
    }`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <img src="/apple-touch-icon.png" width={28} height={28} alt="CodeX Logo" className="group-hover:scale-110 transition-transform rounded-md" />
              <span className="text-2xl font-bold tracking-tight">
                <span className="text-white">Code</span>
                <span className="text-emerald-400">X</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-1">
              {[
                { href: "/", label: "Home" },
                { href: "/editor", label: "Editor" },
                { href: "/profile", label: "Profile" },
                { href: "/feedback-form", label: "Feedback" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-md text-[15px] font-medium transition-colors ${pathname === link.href
                      ? "text-white"
                      : "text-gray-400 hover:text-gray-200"
                    }`}
                >
                  {link.label}
                </Link>
              ))}
              {currentUser?.isAdmin === true && (
                <div className="relative group">
                  <button
                    className={`px-4 py-2 rounded-md text-[15px] font-medium transition-colors ${pathname.startsWith("/admin")
                        ? "text-white"
                        : "text-gray-400 group-hover:text-gray-200"
                      }`}
                  >
                    Admin
                  </button>
                  {/* Invisible padding block prevents hover from dropping when moving mouse down */}
                  <div className="absolute left-0 top-full pt-1 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="rounded-md shadow-xl bg-[#252525] border border-gray-800 py-1 flex flex-col overflow-hidden">
                      <Link
                        href="/admin/fetch-details"
                        className={`px-4 py-2.5 text-sm transition-colors ${pathname === "/admin/fetch-details" ? "text-emerald-400 bg-[#2b2b2b]" : "text-gray-300 hover:bg-[#2b2b2b] hover:text-white"}`}
                      >
                        User & Feedbacks
                      </Link>
                      <Link
                        href="/admin/analytics"
                        className={`px-4 py-2.5 text-sm transition-colors ${pathname === "/admin/analytics" ? "text-emerald-400 bg-[#2b2b2b]" : "text-gray-300 hover:bg-[#2b2b2b] hover:text-white"}`}
                      >
                        Analytics Dashboard
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons & User Menu */}
          <div className="flex items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative rounded-md bg-[#252525] border border-gray-800 text-white hover:bg-[#2a2a2a] hover:text-white hover:border-emerald-500/30 transition-all h-10 px-4"
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="flex items-center gap-x-3">
                      <span className="text-[15px] font-medium">{currentUser?.username || user?.username}</span>
                      <div className="h-6 w-6 rounded-full bg-emerald-400/10 flex items-center justify-center text-emerald-400">
                        <User className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-[#252525] text-white border-gray-800">
                  <DropdownMenuItem
                    onClick={() => router.push("/profile")}
                    className="hover:bg-[#2a2a2a] hover:text-white focus:bg-[#2a2a2a] focus:text-white cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <DropdownMenuItem
                    onClick={() => {
                      signOut()
                      logout()
                    }}
                    className="text-red-400 hover:bg-[#2a2a2a] hover:text-white focus:bg-[#2a2a2a] focus:text-white cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="default"
                className="hidden md:flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white transition-all h-10 px-6 text-[15px] font-semibold rounded-lg shadow-lg shadow-emerald-500/10 active:scale-95"
                onClick={() => router.push("/auth/login")}
              >
                Try CodeX
              </Button>
            )}

            {/* Mobile Menu Button */}
            <div className="ml-3 md:hidden">
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:bg-[#252525]"
                    onClick={() => setIsMenuOpen(true)}
                  >
                    <span className="sr-only">Open main menu</span>
                    {isMenuOpen ? (
                      <X className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Menu className="h-5 w-5" aria-hidden="true" />
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[250px] bg-[#1e1e1e] text-white p-0 border-l border-gray-800">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  <div className="px-4 py-6 space-y-1">
                    <div className="flex items-center mb-6">
                      <img src="/apple-touch-icon.png" width={28} height={28} alt="CodeX Logo" className="mr-2 rounded-md" />
                      <span className="text-lg font-bold">
                        <span className="text-white">Code</span>
                        <span className="text-emerald-400">X</span>
                      </span>
                    </div>

                    {[
                      { href: "/", label: "Home" },
                      { href: "/editor", label: "Editor" },
                      { href: "/feedback-form", label: "Feedback" },
                    ].map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`block px-3 py-3 rounded-md text-base transition-colors ${pathname === link.href
                            ? "text-white font-medium pl-4 border-l-2 border-emerald-500"
                            : "text-gray-400 hover:text-gray-200 pl-4 border-l-2 border-transparent"
                          }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                    {currentUser?.isAdmin === true && (
                      <div className="pt-2 pb-1 border-t border-gray-800/50 mt-2">
                        <span className="block px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider pl-4">Admin</span>
                        <Link
                          href="/admin/fetch-details"
                          className={`block px-3 py-3 rounded-md text-base transition-colors pl-4 ${pathname === "/admin/fetch-details" ? "text-emerald-400 font-medium bg-[#252525]/50" : "text-gray-300 hover:text-white hover:bg-[#252525]"}`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          User & Feedbacks
                        </Link>
                        <Link
                          href="/admin/analytics"
                          className={`block px-3 py-3 rounded-md text-base transition-colors pl-4 ${pathname === "/admin/analytics" ? "text-emerald-400 font-medium bg-[#252525]/50" : "text-gray-300 hover:text-white hover:bg-[#252525]"}`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Analytics Dashboard
                        </Link>
                      </div>
                    )}

                    {!user ? (
                      <Button
                        variant="default"
                        className="w-full mt-8 bg-emerald-600 hover:bg-emerald-500 text-white h-12 text-[15px] font-semibold rounded-lg transition-all active:scale-[0.98]"
                        onClick={() => {
                          router.push("/auth/login")
                          setIsMenuOpen(false)
                        }}
                      >
                        Try CodeX
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full mt-6 border-gray-700 text-red-400 hover:bg-[#252525] hover:text-white h-12 text-[15px] font-medium rounded-lg"
                        onClick={() => {
                          signOut()
                          logout()
                          setIsMenuOpen(false)
                        }}
                      >
                        <LogOut className="mr-2 h-5 w-5" />
                        Logout
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar