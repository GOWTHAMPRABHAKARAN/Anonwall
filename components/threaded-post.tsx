"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Reply, Trash2 } from "lucide-react"
import { PostReactions } from "@/components/post-reactions"
import { ReplyForm } from "@/components/reply-form"
import { deletePost } from "@/lib/actions/wall-data"

interface ThreadedPostProps {
  post: {
    id: string
    content: string
    anonymous_author: string | null
    created_at: string
    reaction_counts: Record<string, number>
    replies?: Array<{
      id: string
      content: string
      anonymous_author: string | null
      created_at: string
      reaction_counts: Record<string, number>
    }>
  }
  wallId: string
  isCreator: boolean
  threadingEnabled: boolean
}

export function ThreadedPost({ post, wallId, isCreator, threadingEnabled }: ThreadedPostProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [showReplies, setShowReplies] = useState(false)

  const handleDelete = async (postId: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      await deletePost(postId)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="space-y-3">
      {/* Main Post */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-purple-400">{post.anonymous_author || "Anonymous"}</span>
            <span className="text-xs text-muted-foreground">{formatDate(post.created_at)}</span>
          </div>

          {isCreator && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(post.id)}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1 h-auto"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>

        <p className="text-foreground text-sm leading-relaxed mb-3">{post.content}</p>

        <div className="flex items-center justify-between">
          <PostReactions postId={post.id} initialReactions={post.reaction_counts} />

          {threadingEnabled && (
            <div className="flex items-center gap-2">
              {post.replies && post.replies.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplies(!showReplies)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  {showReplies ? "Hide" : "Show"} {post.replies.length} replies
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                <Reply className="mr-1 h-3 w-3" />
                Reply
              </Button>
            </div>
          )}
        </div>

        {showReplyForm && (
          <ReplyForm
            wallId={wallId}
            parentPostId={post.id}
            onCancel={() => setShowReplyForm(false)}
            onSuccess={() => setShowReplyForm(false)}
          />
        )}
      </div>

      {/* Replies */}
      {threadingEnabled && post.replies && post.replies.length > 0 && showReplies && (
        <div className="ml-6 space-y-3 border-l-2 border-gray-700 pl-4">
          {post.replies.map((reply) => (
            <div key={reply.id} className="bg-card/50 border border-border/50 rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-blue-400">{reply.anonymous_author || "Anonymous"}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(reply.created_at)}</span>
                </div>

                {isCreator && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(reply.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1 h-auto"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>

              <p className="text-foreground text-sm leading-relaxed mb-2">{reply.content}</p>

              <PostReactions postId={reply.id} initialReactions={reply.reaction_counts} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
