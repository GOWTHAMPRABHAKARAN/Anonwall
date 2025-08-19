"use client"

import type React from "react"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Reply } from "lucide-react"
import { createReply } from "@/lib/actions/threaded-posts"

interface ReplyFormProps {
  wallId: string
  parentPostId: string
  onCancel: () => void
  onSuccess?: () => void
}

export function ReplyForm({ wallId, parentPostId, onCancel, onSuccess }: ReplyFormProps) {
  const [content, setContent] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!content.trim()) {
      setError("Reply content is required")
      return
    }

    startTransition(async () => {
      const result = await createReply(wallId, parentPostId, content)

      if (result.error) {
        setError(result.error)
      } else {
        setContent("")
        onSuccess?.()
        onCancel()
      }
    })
  }

  return (
    <div className="mt-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-3 py-2 rounded text-sm">{error}</div>
        )}

        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your anonymous reply..."
          maxLength={500}
          rows={3}
          className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500 resize-none text-sm"
          disabled={isPending}
        />

        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">{content.length}/500 characters</p>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={isPending}
              className="text-gray-400 hover:text-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending || !content.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Replying...
                </>
              ) : (
                <>
                  <Reply className="mr-1 h-3 w-3" />
                  Reply
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
