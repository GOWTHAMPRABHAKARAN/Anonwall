"use server"

import { createClient } from "@/lib/supabase/server"
import { headers } from "next/headers"

export interface ModerationResult {
  allowed: boolean
  reason?: string
  flaggedKeywords?: string[]
  severity?: string
  action?: string
}

export async function moderateContent(content: string, wallId: string): Promise<ModerationResult> {
  try {
    const supabase = createClient()
    const headersList = headers()
    const forwardedFor = headersList.get("x-forwarded-for")
    const realIp = headersList.get("x-real-ip")
    const userIp = forwardedFor?.split(",")[0] || realIp || "127.0.0.1"

    // Check for banned keywords
    const { data: keywordCheck, error: keywordError } = await supabase.rpc("check_banned_keywords", { content })

    if (keywordError) {
      console.error("Keyword check error:", keywordError)
      return { allowed: true } // Allow on error to prevent blocking legitimate content
    }

    const keywordResult = keywordCheck?.[0]

    // Simple spam detection without ON CONFLICT issues
    try {
      // Check recent posts from same IP
      const { data: recentPosts, error: recentError } = await supabase
        .from("spam_tracking")
        .select("post_count, last_post_at")
        .eq("ip_address", userIp)
        .eq("wall_id", wallId)
        .single()

      if (!recentError && recentPosts) {
        const timeSinceLastPost = new Date().getTime() - new Date(recentPosts.last_post_at).getTime()
        const minutesSinceLastPost = timeSinceLastPost / (1000 * 60)

        // Block if more than 5 posts in 5 minutes
        if (recentPosts.post_count >= 5 && minutesSinceLastPost < 5) {
          await logModerationAction({
            wallId,
            action: "blocked_spam",
            reason: "Rate limit exceeded",
            details: { ip: userIp, post_count: recentPosts.post_count },
          })

          return {
            allowed: false,
            reason: "Too many posts. Please wait before posting again.",
            severity: "high",
          }
        }

        // Update existing record
        await supabase
          .from("spam_tracking")
          .update({
            post_count: recentPosts.post_count + 1,
            last_post_at: new Date().toISOString(),
          })
          .eq("ip_address", userIp)
          .eq("wall_id", wallId)
      } else {
        // Create new record
        await supabase.from("spam_tracking").insert({
          ip_address: userIp,
          wall_id: wallId,
          post_count: 1,
          last_post_at: new Date().toISOString(),
        })
      }

      // Check for duplicate content
      const { data: duplicateCheck } = await supabase
        .from("posts")
        .select("id")
        .eq("wall_id", wallId)
        .eq("content", content)
        .gte("created_at", new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Last 5 minutes

      if (duplicateCheck && duplicateCheck.length > 0) {
        return {
          allowed: false,
          reason: "Duplicate content detected",
          severity: "medium",
        }
      }
    } catch (spamError) {
      console.error("Spam check error:", spamError)
      // Continue with keyword check even if spam detection fails
    }

    // Handle keyword filtering
    if (keywordResult?.found_keywords?.length > 0) {
      const action = keywordResult.recommended_action

      if (action === "block") {
        await logModerationAction({
          wallId,
          action: "blocked_keywords",
          reason: "Blocked due to banned keywords",
          details: {
            keywords: keywordResult.found_keywords,
            severity: keywordResult.max_severity,
            content: content.substring(0, 100),
          },
        })

        return {
          allowed: false,
          reason: "Post contains prohibited content",
          flaggedKeywords: keywordResult.found_keywords,
          severity: keywordResult.max_severity,
        }
      }

      if (action === "flag") {
        // Add to moderation queue for review
        await addToModerationQueue({
          wallId,
          reason: "Flagged for keyword review",
          severity: keywordResult.max_severity,
          flaggedKeywords: keywordResult.found_keywords,
        })

        await logModerationAction({
          wallId,
          action: "flagged_keywords",
          reason: "Flagged for manual review",
          details: {
            keywords: keywordResult.found_keywords,
            severity: keywordResult.max_severity,
          },
        })
      }

      return {
        allowed: true,
        flaggedKeywords: keywordResult.found_keywords,
        severity: keywordResult.max_severity,
        action: keywordResult.recommended_action,
      }
    }

    return { allowed: true }
  } catch (error) {
    console.error("Moderation error:", error)
    return { allowed: true } // Allow on error to prevent blocking legitimate content
  }
}

async function addToModerationQueue({
  postId,
  wallId,
  reason,
  severity = "medium",
  flaggedKeywords = [],
}: {
  postId?: string
  wallId: string
  reason: string
  severity?: string
  flaggedKeywords?: string[]
}) {
  const supabase = createClient()

  const { error } = await supabase.from("moderation_queue").insert({
    post_id: postId,
    wall_id: wallId,
    reason,
    severity,
    flagged_keywords: flaggedKeywords,
  })

  if (error) {
    console.error("Error adding to moderation queue:", error)
  }
}

async function logModerationAction({
  postId,
  wallId,
  action,
  reason,
  moderatorId,
  details,
}: {
  postId?: string
  wallId: string
  action: string
  reason: string
  moderatorId?: string
  details?: any
}) {
  const supabase = createClient()

  const { error } = await supabase.from("moderation_logs").insert({
    post_id: postId,
    wall_id: wallId,
    action,
    reason,
    moderator_id: moderatorId,
    details,
  })

  if (error) {
    console.error("Error logging moderation action:", error)
  }
}

export async function getModerationQueue() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("moderation_queue")
    .select(`
      *,
      posts (content, created_at),
      walls (name)
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching moderation queue:", error)
    return []
  }

  return data || []
}

export async function getModerationLogs() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("moderation_logs")
    .select(`
      *,
      walls (name)
    `)
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) {
    console.error("Error fetching moderation logs:", error)
    return []
  }

  return data || []
}
