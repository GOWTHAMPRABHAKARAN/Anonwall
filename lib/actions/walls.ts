"use server"

import { createClient, createClientNoCookies } from "@/lib/supabase/server"
import { unstable_cache } from "next/cache"

export interface Wall {
  id: string
  name: string
  description: string | null
  tags: string[] | null
  is_public: boolean
  creator_id: string | null
  expires_at: string | null
  created_at: string
  post_count?: number
  is_trending?: boolean
  trending_score?: number
  last_activity_at?: string
}

export async function checkDatabaseSetup(): Promise<boolean> {
  try {
    const supabase = createClientNoCookies()

    // Test the actual database connection by querying a simple table
    const { data, error } = await supabase.from("walls").select("id").limit(1)

    if (error) {
      console.log("[v0] Database setup check failed:", error.message)
      return false
    }

    console.log("[v0] Database setup check passed")
    return true
  } catch (error) {
    console.log("[v0] Database setup check error:", error)
    return false
  }
}

export async function checkTrendingColumnsExist(): Promise<boolean> {
  const supabase = createClientNoCookies()

  try {
    const { error } = await supabase.from("walls").select("is_trending").limit(1)
    return !error
  } catch (error) {
    return false
  }
}

export async function updateTrendingWalls(): Promise<void> {
  const supabase = createClientNoCookies()

  try {
    const hasTrendingColumns = await checkTrendingColumnsExist()
    if (!hasTrendingColumns) {
      return
    }

    await supabase.rpc("update_trending_walls")
    await supabase.rpc("record_daily_trending")
    await supabase.rpc("update_user_streaks")
  } catch (error) {
    console.error("Error updating trending walls:", error)
  }
}

export async function getUserStreak(userId: string): Promise<{ currentStreak: number; bestStreak: number } | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("users")
    .select("current_streak, best_streak")
    .eq("id", userId)
    .maybeSingle()

  if (error) {
    console.error("Error fetching user streak:", error.message)
    return null
  }

  if (!data) {
    console.log("User not found in database, returning default streak values")
    return { currentStreak: 0, bestStreak: 0 }
  }

  return {
    currentStreak: data.current_streak || 0,
    bestStreak: data.best_streak || 0,
  }
}

export const getCachedPublicWalls = unstable_cache(
  async (searchQuery?: string): Promise<Wall[]> => {
    return getPublicWalls(searchQuery)
  },
  ["public-walls"],
  {
    revalidate: 30, // Cache for 30 seconds
    tags: ["walls", "public-walls"],
  },
)

export async function getPublicWalls(searchQuery?: string): Promise<Wall[]> {
  const supabase = createClientNoCookies()

  const isSetup = await checkDatabaseSetup()
  if (!isSetup) {
    console.log("[v0] Database tables not found - setup required")
    return []
  }

  const hasTrendingColumns = await checkTrendingColumnsExist()

  // Update trending scores before fetching (only if trending system exists)
  if (hasTrendingColumns) {
    await updateTrendingWalls()
  }

  const selectFields = hasTrendingColumns
    ? `
      id,
      name,
      description,
      tags,
      is_public,
      creator_id,
      expires_at,
      created_at,
      is_trending,
      trending_score,
      last_activity_at
    `
    : `
      id,
      name,
      description,
      tags,
      is_public,
      creator_id,
      expires_at,
      created_at
    `

  let query = supabase.from("walls").select(selectFields).eq("is_public", true)

  if (hasTrendingColumns) {
    query = query
      .order("is_trending", { ascending: false })
      .order("trending_score", { ascending: false })
      .order("created_at", { ascending: false })
  } else {
    query = query.order("created_at", { ascending: false })
  }

  // Add search functionality if query provided
  if (searchQuery && searchQuery.trim()) {
    query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,tags.cs.{${searchQuery}}`)
  }

  const { data: walls, error } = await query

  if (error) {
    console.error("Error fetching public walls:", error)
    return []
  }

  if (!walls || walls.length === 0) {
    return []
  }

  const wallIds = walls.map((wall) => wall.id)
  const { data: postCounts } = await supabase.from("posts").select("wall_id").in("wall_id", wallIds)

  const countMap =
    postCounts?.reduce(
      (acc, post) => {
        acc[post.wall_id] = (acc[post.wall_id] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ) || {}

  return walls.map((wall) => ({
    ...wall,
    post_count: countMap[wall.id] || 0,
  }))
}
