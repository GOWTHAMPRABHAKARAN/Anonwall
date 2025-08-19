import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

function isSafeRelativePath(path: string): boolean {
  if (!path) return false
  // Must start with single '/'; disallow '//' and absolute URLs
  if (!path.startsWith("/") || path.startsWith("//")) return false
  if (/^https?:\/\//i.test(path)) return false
  return true
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const rawNext = searchParams.get("next") ?? "/"
  const next = isSafeRelativePath(rawNext) ? rawNext : "/"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host")
      const isLocalEnv = process.env.NODE_ENV === "development"

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=AuthCallbackError`)
}
