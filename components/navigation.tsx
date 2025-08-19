import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogOut, LogIn } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { signOut } from "@/lib/actions/auth"
import { NavigationClient } from "./navigation-client"

interface NavItem {
  href: string
  label: string
  icon: "Info" | "Globe" | "Plus" | "User"
  requiresAuth: boolean
}

export async function Navigation() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const navItems: NavItem[] = [
    {
      href: "/about",
      label: "About",
      icon: "Info",
      requiresAuth: false,
    },
    {
      href: "/public-walls",
      label: "Public Walls",
      icon: "Globe",
      requiresAuth: false,
    },
    {
      href: "/create-wall",
      label: "Create Wall",
      icon: "Plus",
      requiresAuth: true,
    },
    {
      href: "/my-walls",
      label: "My Walls",
      icon: "User",
      requiresAuth: true,
    },
  ]

  const visibleNavItems = navItems.filter((item) => !item.requiresAuth || user)

  return (
    <nav className="border-b border-gray-800 bg-black/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/public-walls" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center group-hover:from-purple-500 group-hover:to-purple-600 transition-all duration-150 ease-out shadow-lg hover:shadow-xl hover:shadow-purple-500/25 hover:scale-110 active:scale-95">
                <span className="text-white font-bold text-lg sm:text-xl">A</span>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full group-hover:bg-amber-400 transition-all duration-150 ease-out shadow-sm animate-pulse"></div>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold text-white group-hover:text-purple-300 transition-colors duration-150 ease-out">
                AnonWall
              </span>
              <span className="text-xs text-gray-400 opacity-75 hidden sm:block group-hover:text-purple-300/70 transition-colors duration-150 ease-out">
                Anonymous Discussions
              </span>
            </div>
          </Link>

          <div className="flex items-center space-x-1 sm:space-x-2">
            <NavigationClient items={visibleNavItems} />

            {user ? (
              <form action={signOut}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="text-sm font-medium transition-all duration-150 ease-out px-2 sm:px-3 hover:scale-105 active:scale-95 text-gray-300 hover:text-white hover:bg-purple-600/10 border border-transparent hover:border-purple-500/20"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1 sm:ml-2">Sign Out</span>
                </Button>
              </form>
            ) : (
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-sm font-medium transition-all duration-150 ease-out px-2 sm:px-3 hover:scale-105 active:scale-95 text-gray-300 hover:text-white hover:bg-purple-600/10 border border-transparent hover:border-purple-500/20"
              >
                <Link href="/auth/login" className="flex items-center space-x-1 sm:space-x-2">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
