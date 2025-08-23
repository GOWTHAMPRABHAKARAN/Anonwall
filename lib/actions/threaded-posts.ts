"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { moderateContent } from "@/lib/actions/moderation"

export async function createReply(wallId: string, parentPostId: string, content: string) {
  const supabase = createClient()

  // Validation
  if (!content || content.trim().length === 0) {
    return { error: "Reply content is required" }
  }

  if (content.trim().length > 500) {
    return { error: "Reply must be less than 500 characters" }
  }

  const moderationResult = await moderateContent(content.trim(), wallId)

  if (!moderationResult.allowed) {
    return { error: moderationResult.reason || "Reply blocked by content filter" }
  }

  // Check if the wall exists and allows threading
  const { data: wall, error: wallError } = await supabase
    .from("walls")
    .select("threading_enabled, is_public, creator_id")
    .eq("id", wallId)
    .single()

  if (wallError || !wall) {
    return { error: "Wall not found" }
  }

  if (!wall.threading_enabled) {
    return { error: "Threading is not enabled for this wall" }
  }

  // Check if parent post exists
  const { data: parentPost, error: parentError } = await supabase
    .from("posts")
    .select("id")
    .eq("id", parentPostId)
    .eq("wall_id", wallId)
    .single()

  if (parentError || !parentPost) {
    return { error: "Parent post not found" }
  }

  try {
    // Insert the reply
    const { data: reply, error } = await supabase
      .from("posts")
      .insert({
        wall_id: wallId,
        parent_post_id: parentPostId,
        content: content.trim(),
        anonymous_author: "Anonymous",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating reply:", error)
      return { error: "Failed to create reply. Please try again." }
    }

    // Update wall's last activity
    await supabase.from("walls").update({ last_activity_at: new Date().toISOString() }).eq("id", wallId)

    // Revalidate the wall page
    revalidatePath(`/wall/${wallId}`)

    return { success: true, reply }
  } catch (error) {
    console.error("Unexpected error creating reply:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function getThreadedPosts(wallId: string) {
  const supabase = createClient()

  try {
    // Get all posts for the wall with reaction counts
    const { data: posts, error } = await supabase
      .from("posts")
      .select(`
        id,
        content,
        anonymous_author,
        created_at,
        parent_post_id,
        report_count,
        post_reactions (
          reaction_type
        )
      `)
      .eq("wall_id", wallId)
      .order("created_at", { ascending: false }) // Changed from ascending: true to show newest posts first

    if (error) {
      console.error("Error fetching threaded posts:", error)
      return { error: "Failed to fetch posts" }
    }

    // Process posts to include reaction counts and organize by threading
    const processedPosts = posts.map((post) => {
      const reactionCounts = post.post_reactions.reduce((acc: Record<string, number>, reaction) => {
        acc[reaction.reaction_type] = (acc[reaction.reaction_type] || 0) + 1
        return acc
      }, {})

      return {
        ...post,
        reaction_counts: reactionCounts,
        post_reactions: undefined, // Remove the raw reactions array
      }
    })

    // Organize posts into threads
    const topLevelPosts = processedPosts.filter((post) => !post.parent_post_id)
    const replies = processedPosts.filter((post) => post.parent_post_id)

    // Add replies to their parent posts
    const threaded = topLevelPosts.map((post) => ({
      ...post,
      replies: replies.filter((reply) => reply.parent_post_id === post.id),
    }))

    return { success: true, posts: threaded }
  } catch (error) {
    console.error("Unexpected error fetching threaded posts:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function getPostReplies(postId: string) {
  const supabase = createClient()

  try {
    const { data: replies, error } = await supabase
      .from("posts")
      .select(`
        id,
        content,
        anonymous_author,
        created_at,
        report_count,
        post_reactions (
          reaction_type
        )
      `)
      .eq("parent_post_id", postId)
      .order("created_at", { ascending: false }) // Changed from ascending: true to show newest replies first

    if (error) {
      console.error("Error fetching post replies:", error)
      return { error: "Failed to fetch replies" }
    }

    // Process replies to include reaction counts
    const processedReplies = replies.map((reply) => {
      const reactionCounts = reply.post_reactions.reduce((acc: Record<string, number>, reaction) => {
        acc[reaction.reaction_type] = (acc[reaction.reaction_type] || 0) + 1
        return acc
      }, {})

      return {
        ...reply,
        reaction_counts: reactionCounts,
        post_reactions: undefined,
      }
    })

    return { success: true, replies: processedReplies }
  } catch (error) {
    console.error("Unexpected error fetching post replies:", error)
    return { error: "An unexpected error occurred" }
  }
}
