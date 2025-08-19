import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { ErrorBoundary } from "@/components/error-boundary"

export const metadata: Metadata = {
  title: "AnonWall - Anonymous Discussion Platform",
  description: "Create and join anonymous discussion walls. Share thoughts freely and connect with others anonymously.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%236366f1'/%3E%3Ctext x='16' y='22' fontFamily='system-ui' fontSize='18' fontWeight='bold' textAnchor='middle' fill='white'%3EA%3C/text%3E%3Ccircle cx='24' cy='8' r='3' fill='%23f59e0b'/%3E%3C/svg%3E",
        type: "image/svg+xml",
      },
    ],
    shortcut:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%236366f1'/%3E%3Ctext x='16' y='22' fontFamily='system-ui' fontSize='18' fontWeight='bold' textAnchor='middle' fill='white'%3EA%3C/text%3E%3Ccircle cx='24' cy='8' r='3' fill='%23f59e0b'/%3E%3C/svg%3E",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen animate-fade-in">
        <ErrorBoundary>
          <Navigation />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        </ErrorBoundary>
      </body>
    </html>
  )
}
