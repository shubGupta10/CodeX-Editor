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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Code, User, LogOut, Settings, X } from "lucide-react"
import Link from "next/link"
import useAuthStore from "@/app/store/userAuthStore"
import { signIn, signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

function Navbar() {
  const { data: session } = useSession()
  const { user, setUser, logout } = useAuthStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (session?.user) {
      setUser({
        id: session.user.id || "",
        username: session.user.name || "",
        email: session.user.email || "",
        profileImage: session.user.image || "",
      })
    }
  }, [session, setUser])

  return (
    <nav className=" top-0 z-50 bg-[#252526] border-2 border-[#1e1e1e] text-white shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16 px-4 md:px-10 lg:px-24">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Code className="h-8 w-8 text-white-500" />
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-400 to-gray-300 bg-clip-text text-transparent">
                CodeX
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/" className="px-3 py-2 rounded-lg text-md font-medium hover:bg-[#ffff] hover:text-black transition-colors">
                Home
              </Link>
              <Link
                href="/editor"
                className="px-3 py-2 rounded-md text-lg font-medium hover:bg-[#ffffff] hover:text-black transition-colors"
              >
                Editor
              </Link>
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
                    className="relative rounded-full bg-[#1e1e1e] border-2 border-gray-500 text-white hover:bg-[#1e1e1e] hover:text-white"
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="flex gap-x-2">
                    <span>{user?.username}</span>
                    <User className="h-6 w-6" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-[#252526] text-white border-gray-800">
                  <DropdownMenuItem onClick={() => router.push("/profile")} className="hover:bg-gray-800">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem className="hover:bg-gray-800">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem> */}
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <DropdownMenuItem
                    onClick={() => {
                      signOut()
                      logout()
                    }}
                    className="text-red-500 hover:bg-gray-800"
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
                className="hidden md:flex items-center gap-2 bg-white hover:bg-gray-300 text-black"
                onClick={() => router.push("/auth/login")}
              >
                <Code className="h-4 w-4" />
                Code Now
              </Button>
            )}

            {/* Mobile Menu Button */}
            <div className="ml-4 md:hidden">
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                    onClick={() => setIsMenuOpen(true)}
                  >
                    <span className="sr-only">Open main menu</span>
                    {isMenuOpen ? (
                      <X className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Menu className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[250px] bg-gray-900 text-white p-0">
                  <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    <Link
                      href="/"
                      className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-800 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Home
                    </Link>
                    <Link
                      href="/editor"
                      className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-800 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Editor
                    </Link>
                    {!user && (
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full mt-4 bg-white hover:bg-gray-300 text-black"
                        onClick={() => router.push("/auth/login")}
                      >
                        <Code className="mr-2 h-4 w-4" />
                        Code Now
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

