"use client"

import { useState, useTransition, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { addReaction, getUserReaction } from "@/lib/actions/post-reactions"

interface PostReactionsProps {
  postId: string
  initialReactions?: Record<string, number>
}

export function PostReactions({ postId, initialReactions = {} }: PostReactionsProps) {
  const [reactions, setReactions] = useState(initialReactions)
  const [userReaction, setUserReaction] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const loadUserReaction = async () => {
      const result = await getUserReaction(postId)
      if (result.success) {
        setUserReaction(result.reaction)
      }
    }
    loadUserReaction()
  }, [postId])

  const handleReaction = async (reactionType: "👍" | "👎" | "❤️") => {
    startTransition(async () => {
      const previousUserReaction = userReaction
      const previousReactions = { ...reactions }

      // Optimistically update the UI
      if (userReaction === reactionType) {
        // User is removing their current reaction
        setUserReaction(null)
        setReactions((prev) => ({
          ...prev,
          [reactionType]: Math.max(0, (prev[reactionType] || 0) - 1),
        }))
      } else {
        // User is changing to a new reaction
        const updates: Record<string, number> = { ...reactions }

        // Remove count from previous reaction if exists
        if (userReaction) {
          updates[userReaction] = Math.max(0, (updates[userReaction] || 0) - 1)
        }

        // Add count to new reaction
        updates[reactionType] = (updates[reactionType] || 0) + 1

        setUserReaction(reactionType)
        setReactions(updates)
      }

      // Call the server action
      const result = await addReaction(postId, reactionType)

      if (result.error) {
        // Revert optimistic update on error
        setUserReaction(previousUserReaction)
        setReactions(previousReactions)
      }
    })
  }

  const reactionButtons = [
    { emoji: "👍", label: "Like" },
    { emoji: "👎", label: "Dislike" },
    { emoji: "❤️", label: "Love" },
  ] as const

  return (
    <div className="flex items-center gap-2 mt-3">
      {reactionButtons.map(({ emoji, label }) => {
        const count = reactions[emoji] || 0
        const isSelected = userReaction === emoji

        return (
          <Button
            key={emoji}
            variant="ghost"
            size="sm"
            onClick={() => handleReaction(emoji)}
            disabled={isPending}
            className={`
              flex items-center gap-1 px-2 py-1 h-8 text-xs
              ${
                isSelected
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : "text-gray-400 hover:text-gray-300 hover:bg-gray-800"
              }
              transition-all duration-200
            `}
          >
            <span className="text-sm">{emoji}</span>
            {count > 0 && <span className="font-medium">{count}</span>}
          </Button>
        )
      })}
    </div>
  )
}
