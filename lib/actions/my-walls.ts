"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface MyWall {
  id: string
  name: string
  description: string | null
  tags: string[] | null
  is_public: boolean
  pin: string | null
  expires_at: string | null
  created_at: string
  post_count: number
  is_active: boolean
}

export async function getMyWalls(): Promise<MyWall[]> {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return []
  }

  // Fetch user's walls with post counts
  const { data, error } = await supabase
    .from("walls")
    .select(`
      id,
      name,
      description,
      tags,
      is_public,
      pin,
      expires_at,
      created_at,
      posts(count)
    `)
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching user walls:", error)
    return []
  }

  // Transform the data to include post count and active status
  return (data || []).map((wall: any) => {
    const isExpired = wall.expires_at && new Date(wall.expires_at) < new Date()
    return {
      ...wall,
      post_count: wall.posts?.[0]?.count || 0,
      is_active: !isExpired,
    }
  })
}

export async function deleteWall(wallId: string) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "You must be logged in to delete walls" }
  }

  // Verify ownership
  const { data: wall, error: wallError } = await supabase.from("walls").select("creator_id").eq("id", wallId).single()

  if (wallError || !wall) {
    return { error: "Wall not found" }
  }

  if (wall.creator_id !== user.id) {
    return { error: "You can only delete your own walls" }
  }

  // Delete the wall (posts will be deleted automatically due to CASCADE)
  const { error: deleteError } = await supabase.from("walls").delete().eq("id", wallId)

  if (deleteError) {
    console.error("Error deleting wall:", deleteError)
    return { error: "Failed to delete wall. Please try again." }
  }

  // Revalidate pages
  revalidatePath("/my-walls")
  revalidatePath("/public-walls")

  return { success: true }
}
