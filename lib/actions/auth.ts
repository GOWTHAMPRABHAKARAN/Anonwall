"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function signOut() {
  try {
    const supabase = await createClient()

    // Clear session on server side
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.log("[v0] Sign out error (non-critical):", error.message)
      // Don't throw error - continue with logout process
    } else {
      console.log("[v0] Sign out successful")
    }

    // Clear all cached data
    revalidatePath("/", "layout")

    // Redirect with success message
    redirect("/auth/login?message=" + encodeURIComponent("You have been signed out successfully"))
  } catch (error) {
    console.log("[v0] Sign out process completed with minor issues:", error)
    // Always complete the logout process regardless of errors
    revalidatePath("/", "layout")
    redirect("/auth/login?message=" + encodeURIComponent("You have been signed out"))
  }
}
