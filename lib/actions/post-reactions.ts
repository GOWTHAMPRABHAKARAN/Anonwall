"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface ReactionData {
	postId: string
	reactionType: "👍" | "👎" | "❤️"
}

export async function addReaction(postId: string, reactionType: "👍" | "👎" | "❤️") {
	const supabase = createClient()

	try {
		const userIp = "127.0.0.1" // This will be replaced by actual IP in production

		// First, check if user already has any reaction on this post
		const { data: existingReactions, error: fetchError } = await supabase
			.from("post_reactions")
			.select("reaction_type")
			.eq("post_id", postId)
			.eq("user_ip", userIp)

		if (fetchError) {
			console.error("Error fetching existing reactions:", fetchError)
			return { error: "Failed to check existing reactions" }
		}

		// If user already has this exact reaction, remove it (toggle off)
		if (existingReactions.some((r) => r.reaction_type === reactionType)) {
			return await removeReaction(postId, reactionType)
		}

		// If user has a different reaction, remove all existing reactions first
		if (existingReactions.length > 0) {
			const { error: removeError } = await supabase
				.from("post_reactions")
				.delete()
				.eq("post_id", postId)
				.eq("user_ip", userIp)

			if (removeError) {
				console.error("Error removing existing reactions:", removeError)
				return { error: "Failed to update reaction" }
			}
		}

		// Add the new reaction
		const { data: reaction, error } = await supabase
			.from("post_reactions")
			.insert({
				post_id: postId,
				reaction_type: reactionType,
				user_ip: userIp,
			})
			.select()
			.single()

		if (error) {
			console.error("Error adding reaction:", error)
			return { error: "Failed to add reaction" }
		}

		// Find the wall for this post and revalidate that specific page
		const { data: postRow, error: postError } = await supabase
			.from("posts")
			.select("wall_id")
			.eq("id", postId)
			.single()

		if (!postError && postRow?.wall_id) {
			revalidatePath(`/wall/${postRow.wall_id}`, "page")
		}

		return { success: true, reaction }
	} catch (error) {
		console.error("Unexpected error adding reaction:", error)
		return { error: "An unexpected error occurred" }
	}
}

export async function removeReaction(postId: string, reactionType: "👍" | "👎" | "❤️") {
	const supabase = createClient()

	try {
		const { error } = await supabase
			.from("post_reactions")
			.delete()
			.eq("post_id", postId)
			.eq("reaction_type", reactionType)
			.eq("user_ip", "127.0.0.1") // This will be replaced by actual IP in production

		if (error) {
			console.error("Error removing reaction:", error)
			return { error: "Failed to remove reaction" }
		}

		// Find the wall for this post and revalidate that specific page
		const { data: postRow, error: postError } = await supabase
			.from("posts")
			.select("wall_id")
			.eq("id", postId)
			.single()

		if (!postError && postRow?.wall_id) {
			revalidatePath(`/wall/${postRow.wall_id}`, "page")
		}

		return { success: true }
	} catch (error) {
		console.error("Unexpected error removing reaction:", error)
		return { error: "An unexpected error occurred" }
	}
}

export async function getPostReactions(postId: string) {
	const supabase = createClient()

	try {
		const { data: reactions, error } = await supabase
			.from("post_reactions")
			.select("reaction_type")
			.eq("post_id", postId)

		if (error) {
			console.error("Error fetching reactions:", error)
			return { error: "Failed to fetch reactions" }
		}

		// Count reactions by type
		const reactionCounts = reactions.reduce((acc: Record<string, number>, reaction) => {
			acc[reaction.reaction_type] = (acc[reaction.reaction_type] || 0) + 1
			return acc
		}, {})

		return { success: true, reactions: reactionCounts }
	} catch (error) {
		console.error("Unexpected error fetching reactions:", error)
		return { error: "An unexpected error occurred" }
	}
}

export async function getUserReaction(postId: string) {
	const supabase = createClient()

	try {
		const { data: reaction, error } = await supabase
			.from("post_reactions")
			.select("reaction_type")
			.eq("post_id", postId)
			.eq("user_ip", "127.0.0.1") // This will be replaced by actual IP in production
			.single()

		if (error && error.code !== "PGRST116") {
			// PGRST116 is "no rows returned"
			console.error("Error fetching user reaction:", error)
			return { error: "Failed to fetch user reaction" }
		}

		return { success: true, reaction: reaction?.reaction_type || null }
	} catch (error) {
		console.error("Unexpected error fetching user reaction:", error)
		return { error: "An unexpected error occurred" }
	}
}
