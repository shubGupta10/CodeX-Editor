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
    const getCurrentUser = async () => {
      if (!session?.user) return;
      try {
        const response = await fetch("/api/user/profile", {
          method: "GET",
          cache: "no-store"
        })
        if (response.ok) {
          const data = await response.json()
          setCurrentUser(data.user)
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    }
    getCurrentUser()
  }, [session])

  // Hide navbar on editor page
  if (pathname === "/editor") return null;

  // Prevent hydration mismatch — render skeleton until mounted
  if (!isMounted) {
    return (
      <nav className="sticky top-0 z-50 bg-[#1e1e1e] border-b border-gray-800 text-white shadow-md">
        <div className="container mx-auto">
          <div className="flex items-center justify-between h-14 px-4 md:px-6 lg:px-8">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2 hover:text-white">
                <Code className="h-5 w-5 text-emerald-400" />
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
    <nav className="sticky top-0 z-50 bg-[#1e1e1e] border-b border-gray-800 text-white shadow-md">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-14 px-4 md:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 hover:text-white">
              <Code className="h-5 w-5 text-emerald-400" />
              <span className="text-xl font-bold">
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
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    pathname === link.href
                      ? "text-emerald-400 bg-emerald-400/10"
                      : "text-gray-400 hover:text-white hover:bg-[#252525]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {currentUser?.isAdmin === true && (
                <Link
                  href="/admin/fetch-details"
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    pathname === "/admin/fetch-details"
                      ? "text-emerald-400 bg-emerald-400/10"
                      : "text-gray-400 hover:text-white hover:bg-[#252525]"
                  }`}
                >
                  Admin
                </Link>
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
                    size="sm"
                    className="relative rounded-md bg-[#252525] border border-gray-700 text-white hover:bg-[#2a2a2a] hover:text-white hover:border-emerald-500/50 transition-all h-8"
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="flex items-center gap-x-2">
                      <span className="text-sm">{currentUser?.username || user?.username}</span>
                      <div className="h-5 w-5 rounded-full bg-emerald-400/10 flex items-center justify-center text-emerald-400">
                        <User className="h-3 w-3" />
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
                size="sm"
                className="hidden md:flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white transition-colors h-8"
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
                      <Code className="h-5 w-5 text-emerald-400 mr-2" />
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
                        className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                          pathname === link.href
                            ? "text-emerald-400 bg-emerald-400/10"
                            : "text-gray-300 hover:text-white hover:bg-[#252525]"
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                    {currentUser?.isAdmin === true && (
                      <Link
                        href="/admin/fetch-details"
                        className="block px-3 py-2 rounded-md text-sm text-gray-300 hover:text-white hover:bg-[#252525] transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Admin
                      </Link>
                    )}

                    {!user ? (
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white"
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
                        size="sm"
                        className="w-full mt-6 border-gray-700 text-red-400 hover:bg-[#252525] hover:text-white"
                        onClick={() => {
                          signOut()
                          logout()
                          setIsMenuOpen(false)
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
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