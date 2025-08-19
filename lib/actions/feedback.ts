"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function submitFeedback(formData: FormData) {
  try {
    const supabase = createClient()

    const feedbackText = formData.get("feedback") as string
    const rating = Number.parseInt(formData.get("rating") as string)
    const pageSource = (formData.get("pageSource") as string) || "public-walls"

    if (!feedbackText || feedbackText.trim().length === 0) {
      return { error: "Feedback text is required" }
    }

    if (feedbackText.length > 1000) {
      return { error: "Feedback must be less than 1000 characters" }
    }

    if (rating && (rating < 1 || rating > 5)) {
      return { error: "Rating must be between 1 and 5" }
    }

    // Get current user (optional for feedback)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase.from("feedback").insert({
      user_id: user?.id || null,
      feedback_text: feedbackText.trim(),
      rating: rating || null,
      page_source: pageSource,
    })

    if (error) {
      console.error("Feedback submission error:", error)
      return { error: "Failed to submit feedback. Please try again." }
    }

    revalidatePath("/public-walls")
    return { success: "Thank you for your feedback! We appreciate your input." }
  } catch (error) {
    console.error("Feedback submission error:", error)
    return { error: "Failed to submit feedback. Please try again." }
  }
}
