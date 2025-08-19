"use client"

import type React from "react"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Send, Shield } from "lucide-react"
import { createPost } from "@/lib/actions/wall-data"
import Link from "next/link"

interface PostFormProps {
  wallId: string
  pin?: string
  onPostCreated: () => void
}

export function PostForm({ wallId, pin, onPostCreated }: PostFormProps) {
  const [content, setContent] = useState("")
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      const result = await createPost(wallId, content, pin)

      if (result.error) {
        setError(result.error)
      } else {
        setContent("")
        onPostCreated()
      }
    })
  }

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded">
              {error}
            </div>
          )}

          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts anonymously..."
            maxLength={500}
            rows={4}
            disabled={isPending}
            className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-primary resize-none"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{content.length}/500 characters</span>
              <Link
                href="/guidelines"
                className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
              >
                <Shield className="h-3 w-3" />
                Guidelines
              </Link>
            </div>
            <Button
              type="submit"
              disabled={isPending || content.trim().length === 0}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Post Anonymously
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
