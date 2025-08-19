"use server"

import { createClient } from "@/lib/supabase/server"

export async function reportPost(postId: string, reason: string, reporterIp: string) {
  try {
    const supabase = createClient()

    // Check if this IP has already reported this post
    const { data: existingReport } = await supabase
      .from("post_reports")
      .select("id")
      .eq("post_id", postId)
      .eq("reporter_ip", reporterIp)
      .single()

    if (existingReport) {
      return { error: "You have already reported this post" }
    }

    // Create the report
    const { error: reportError } = await supabase.from("post_reports").insert({
      post_id: postId,
      reporter_ip: reporterIp,
      reason: reason,
    })

    if (reportError) {
      console.error("Error creating report:", reportError)
      return { error: "Failed to submit report" }
    }

    // Get current report count and increment
    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("report_count")
      .eq("id", postId)
      .single()

    if (fetchError) {
      console.error("Error fetching post:", fetchError)
      return { error: "Failed to update report count" }
    }

    // Update report count
    const newCount = (post.report_count || 0) + 1
    const { error: updateError } = await supabase.from("posts").update({ report_count: newCount }).eq("id", postId)

    if (updateError) {
      console.error("Error updating report count:", updateError)
      return { error: "Failed to update report count" }
    }

    return { success: true, reportCount: newCount }
  } catch (error) {
    console.error("Unexpected error reporting post:", error)
    return { error: "An unexpected error occurred" }
  }
}
