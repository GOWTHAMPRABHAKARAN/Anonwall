"use server"

import { createClient } from "@/lib/supabase/server"
import { moderateContent } from "@/lib/actions/moderation"

export interface WallWithPosts {
  id: string
  name: string
  description: string | null
  tags: string[] | null
  is_public: boolean
  pin: string | null
  creator_id: string | null
  expires_at: string | null
  created_at: string
  threading_enabled: boolean
  posts: Post[]
  is_creator: boolean
}

export interface Post {
  id: string
  wall_id: string
  content: string
  anonymous_author: string | null
  created_at: string
  parent_post_id?: string | null
  reaction_counts?: Record<string, number>
  replies?: Post[]
}

export async function getWallWithPosts(wallId: string, pin?: string): Promise<WallWithPosts | null> {
  const supabase = createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch wall data
  const { data: wall, error: wallError } = await supabase.from("walls").select("*").eq("id", wallId).single()

  if (wallError || !wall) {
    return null
  }

  // Check access permissions
  const isCreator = user && wall.creator_id === user.id
  const isPublic = wall.is_public
  const hasValidPin = !wall.is_public && wall.pin === pin

  // If it's a private wall and user doesn't have access, return null
  if (!isPublic && !isCreator && !hasValidPin) {
    return null
  }

  // Check if wall is expired
  if (wall.expires_at && new Date(wall.expires_at) < new Date()) {
    // Only allow creator to view expired walls
    if (!isCreator) {
      return null
    }
  }

  let posts: Post[] = []

  if (wall.threading_enabled) {
    // Use the threaded posts function for threading-enabled walls
    const { data: threadedPosts, error: postsError } = await supabase.rpc("get_threaded_posts", {
      wall_uuid: wallId,
    })

    if (postsError) {
      console.error("Error fetching threaded posts:", postsError)
    } else {
      // Organize posts into threads
      const topLevelPosts = threadedPosts.filter((post: any) => !post.parent_post_id)
      const replies = threadedPosts.filter((post: any) => post.parent_post_id)

      posts = topLevelPosts.map((post: any) => ({
        ...post,
        reaction_counts: post.reaction_counts || {},
        replies: replies.filter((reply: any) => reply.parent_post_id === post.id),
      }))
    }
  } else {
    // Fetch regular posts with reactions for non-threading walls
    const { data: regularPosts, error: postsError } = await supabase
      .from("posts")
      .select(`
        id,
        wall_id,
        content,
        anonymous_author,
        created_at,
        parent_post_id,
        post_reactions (
          reaction_type
        )
      `)
      .eq("wall_id", wallId)
      .is("parent_post_id", null)
      .order("created_at", { ascending: false }) // Changed from ascending: true to show newest posts first

    if (postsError) {
      console.error("Error fetching posts:", postsError)
    } else {
      posts = regularPosts.map((post: any) => {
        const reactionCounts = post.post_reactions.reduce((acc: Record<string, number>, reaction: any) => {
          acc[reaction.reaction_type] = (acc[reaction.reaction_type] || 0) + 1
          return acc
        }, {})

        return {
          ...post,
          reaction_counts: reactionCounts,
          post_reactions: undefined,
        }
      })
    }
  }

  return {
    ...wall,
    posts: posts || [],
    is_creator: isCreator || false,
  }
}

export async function createPost(wallId: string, content: string, pin?: string) {
  const supabase = createClient()

  // Validate content
  if (!content || content.trim().length === 0) {
    return { error: "Post content is required" }
  }

  if (content.length > 500) {
    return { error: "Post content must be less than 500 characters" }
  }

  const moderationResult = await moderateContent(content.trim(), wallId)

  if (!moderationResult.allowed) {
    return { error: moderationResult.reason || "Post blocked by content filter" }
  }

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch wall to check permissions
  const { data: wall, error: wallError } = await supabase.from("walls").select("*").eq("id", wallId).single()

  if (wallError || !wall) {
    return { error: "Wall not found" }
  }

  // Check if wall is expired
  if (wall.expires_at && new Date(wall.expires_at) < new Date()) {
    return { error: "This wall has expired and is no longer accepting posts" }
  }

  // Check access permissions
  const isCreator = user && wall.creator_id === user.id
  const isPublic = wall.is_public
  const hasValidPin = !wall.is_public && wall.pin === pin

  if (!isPublic && !isCreator && !hasValidPin) {
    return { error: "You don't have permission to post to this wall" }
  }

  // Create the post
  const { error: insertError } = await supabase.from("posts").insert({
    wall_id: wallId,
    content: content.trim(),
          anonymous_author: "Anonymous",
  })

  if (insertError) {
    console.error("Error creating post:", insertError)
    return { error: "Failed to create post. Please try again." }
  }

  if (moderationResult.flaggedKeywords?.length > 0) {
    console.log(`[v0] Post created with flagged content: ${moderationResult.flaggedKeywords.join(", ")}`)
  }

  return { success: true }
}

export async function deletePost(postId: string) {
  const supabase = createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to delete posts" }
  }

  // Check if user is the wall creator
  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("wall_id, walls!inner(creator_id)")
    .eq("id", postId)
    .single()

  if (postError || !post) {
    return { error: "Post not found" }
  }

  // @ts-ignore - Supabase types are complex here
  if (post.walls.creator_id !== user.id) {
    return { error: "You can only delete posts from your own walls" }
  }

  // Delete the post
  const { error: deleteError } = await supabase.from("posts").delete().eq("id", postId)

  if (deleteError) {
    console.error("Error deleting post:", deleteError)
    return { error: "Failed to delete post. Please try again." }
  }

  return { success: true }
}
