"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function accessPrivateWall(prevState: any, formData: FormData) {
  const supabase = createClient()

  const pin = formData.get("pin")?.toString()

  // Validation
  if (!pin || pin.trim().length === 0) {
    return { error: "PIN is required" }
  }

  if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
    return { error: "PIN must be exactly 6 digits" }
  }

  try {
    // Find wall with matching PIN
    const { data: wall, error } = await supabase
      .from("walls")
      .select("id, name, is_public, expires_at")
      .eq("pin", pin)
      .eq("is_public", false)
      .single()

    if (error || !wall) {
      return { error: "Invalid PIN. Please check your PIN and try again." }
    }

    // Check if wall is expired
    if (wall.expires_at && new Date(wall.expires_at) < new Date()) {
      return { error: "This wall has expired and is no longer accessible." }
    }

    // Redirect to the wall with PIN in URL
    redirect(`/wall/${wall.id}?pin=${pin}`)
  } catch (error) {
    console.error("Error accessing private wall:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function findWallByPin(pin: string) {
  const supabase = createClient()

  if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
    return null
  }

  const { data: wall, error } = await supabase
    .from("walls")
    .select("id, name, description, is_public, expires_at")
    .eq("pin", pin)
    .eq("is_public", false)
    .single()

  if (error || !wall) {
    return null
  }

  // Check if wall is expired
  if (wall.expires_at && new Date(wall.expires_at) < new Date()) {
    return null
  }

  return wall
}
