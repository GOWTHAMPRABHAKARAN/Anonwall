"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Globe, Plus, User, Info } from "lucide-react"
import { cn } from "@/lib/utils"

const iconMap = {
  Info,
  Globe,
  Plus,
  User,
}

interface NavItem {
  href: string
  label: string
  icon: keyof typeof iconMap
  requiresAuth: boolean
}

interface NavigationClientProps {
  items: NavItem[]
}

export function NavigationClient({ items }: NavigationClientProps) {
  const pathname = usePathname()

  return (
    <>
      {items.map((item) => {
        const Icon = iconMap[item.icon]
        const isActive = pathname === item.href

        return (
          <Button
            key={item.href}
            asChild
            variant={isActive ? "default" : "ghost"}
            size="sm"
            className={cn(
              "text-sm font-medium transition-all duration-150 ease-out px-2 sm:px-3 hover:scale-105 active:scale-95",
              isActive
                ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-500 hover:to-purple-600 shadow-lg hover:shadow-purple-500/25"
                : "text-gray-300 hover:text-white hover:bg-purple-600/10 backdrop-blur-sm border border-transparent hover:border-purple-500/20",
            )}
          >
            <Link href={item.href} className="flex items-center space-x-1 sm:space-x-2">
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          </Button>
        )
      })}
    </>
  )
}
