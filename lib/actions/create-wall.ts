"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface CreateWallData {
  name: string
  description?: string
  tags?: string
  isPublic: boolean
  hasExpiry: boolean
  expiryDate?: string
  threadingEnabled: boolean
}

function generatePin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function createWall(prevState: any, formData: FormData) {
  const supabase = await createClient()

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "You must be logged in to create a wall" }
  }

  // Ensure a corresponding user row exists to satisfy the foreign key (older accounts may be missing)
  try {
    const { data: existingUser, error: fetchUserRowError } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .maybeSingle()

    if (fetchUserRowError) {
      console.error("[v0] Failed to fetch user row:", fetchUserRowError)
    } else if (!existingUser) {
      const { error: insertUserRowError } = await supabase
        .from("users")
        .insert({ id: user.id, email: user.email })
      if (insertUserRowError) {
        console.error("[v0] Failed to create missing user row:", insertUserRowError)
      }
    }
  } catch (e) {
    console.error("[v0] Unexpected error ensuring user row:", e)
  }

  // Extract form data
  const name = formData.get("name")?.toString()
  const description = formData.get("description")?.toString()
  const tags = formData.get("tags")?.toString()
  const isPublicRaw = formData.get("isPublic")
  const isPublic = isPublicRaw === "true"
  const hasExpiry = formData.get("hasExpiry") === "true"
  const expiryDate = formData.get("expiryDate")?.toString()
  const threadingEnabled = formData.get("threadingEnabled") === "true"

  console.log("[v0] Form data received:", {
    name,
    description,
    tags,
    isPublicRaw,
    isPublic,
    hasExpiry,
    expiryDate,
    threadingEnabled,
  })

  // Validation
  if (!name || name.trim().length === 0) {
    return { error: "Wall name is required" }
  }

  if (name.trim().length > 255) {
    return { error: "Wall name must be less than 255 characters" }
  }

  if (description && description.length > 500) {
    return { error: "Description must be less than 500 characters" }
  }

  // Process tags
  let tagsArray: string[] = []
  if (tags && tags.trim()) {
    tagsArray = tags
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length > 0)
      .slice(0, 10) // Limit to 10 tags
  }

  // Process expiry date
  let expiresAt: string | null = null
  if (hasExpiry && expiryDate) {
    const expiry = new Date(expiryDate)
    const now = new Date()

    if (expiry <= now) {
      return { error: "Expiry date must be in the future" }
    }

    expiresAt = expiry.toISOString()
  }

  // Generate PIN for private walls
  const pin = isPublic ? null : generatePin()

  const insertData = {
    name: name.trim(),
    description: description?.trim() || null,
    tags: tagsArray.length > 0 ? tagsArray : null,
    is_public: isPublic,
    pin: pin,
    creator_id: user.id,
    expires_at: expiresAt,
    threading_enabled: threadingEnabled,
  }
  console.log("[v0] Database insert data:", insertData)

  try {
    // Insert the wall
    const { data: wall, error } = await supabase.from("walls").insert(insertData).select().single()

    if (error) {
      console.error("Error creating wall:", error)
      return { error: "Failed to create wall. Please try again." }
    }

    console.log("[v0] Wall created successfully:", wall)

    // Revalidate the public walls page
    revalidatePath("/public-walls")
    revalidatePath("/my-walls")

    // Return success with wall ID instead of redirecting directly
    return { success: true, wallId: wall.id }
  } catch (error) {
    console.error("Unexpected error creating wall:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}
