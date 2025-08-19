"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Clock, Flag, MessageSquare } from "lucide-react"
import { deletePost } from "@/lib/actions/wall-data"
import { reportPost } from "@/lib/actions/report-post"
import { getPostReplies } from "@/lib/actions/threaded-posts"
import { PostReactions } from "@/components/post-reactions"
import type { Post } from "@/lib/actions/wall-data"

interface PostItemProps {
  post: Post & { reply_count?: number }
  isCreator: boolean
  onDelete: () => void
  showReactions?: boolean
  showReplies?: boolean
}

export function PostItem({ post, isCreator, onDelete, showReactions = false, showReplies = false }: PostItemProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isReporting, setIsReporting] = useState(false)
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const [reportReason, setReportReason] = useState("")
  const [repliesDialogOpen, setRepliesDialogOpen] = useState(false)
  const [replies, setReplies] = useState<any[]>([])
  const [loadingReplies, setLoadingReplies] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return
    }

    setIsDeleting(true)
    const result = await deletePost(post.id)

    if (result.error) {
      alert(result.error)
    } else {
      onDelete()
    }

    setIsDeleting(false)
  }

  const handleReport = async () => {
    if (!reportReason) {
      alert("Please select a reason for reporting")
      return
    }

    setIsReporting(true)

    // Get user's IP address (simplified - in production you'd get this server-side)
    const reporterIp = Math.random().toString(36).substring(7) // Temporary solution

    const result = await reportPost(post.id, reportReason, reporterIp)

    if (result.error) {
      alert(result.error)
    } else {
      alert("Post reported successfully. Thank you for helping keep our community safe.")
      setReportDialogOpen(false)
      setReportReason("")
    }

    setIsReporting(false)
  }

  const handleViewReplies = async () => {
    setLoadingReplies(true)
    const result = await getPostReplies(post.id)

    if (result.error) {
      alert(result.error)
    } else {
      setReplies(result.replies || [])
      setRepliesDialogOpen(true)
    }

    setLoadingReplies(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card className="group bg-gradient-to-br from-card to-card/80 border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 animate-slide-up backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span className="font-medium text-primary bg-primary/10 px-2 py-1 rounded-full border border-primary/20 transition-colors duration-200 hover:bg-primary/20">
              {post.anonymous_author || "Anonymous"}
            </span>
            <Clock className="h-3 w-3" />
            <span>{formatDate(post.created_at)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-1 h-auto transition-all duration-200 hover:scale-110 active:scale-95"
                >
                  <Flag className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Report Post</DialogTitle>
                  <DialogDescription>
                    Help us maintain a safe community by reporting inappropriate content.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Select value={reportReason} onValueChange={setReportReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spam">Spam</SelectItem>
                      <SelectItem value="harassment">Harassment</SelectItem>
                      <SelectItem value="inappropriate">Inappropriate Content</SelectItem>
                      <SelectItem value="misinformation">Misinformation</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleReport}
                      disabled={isReporting || !reportReason}
                      className="bg-destructive hover:bg-destructive/80"
                    >
                      {isReporting ? "Reporting..." : "Submit Report"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            {isCreator && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-destructive hover:text-destructive/80 hover:bg-destructive/10 p-1 h-auto transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <p className="text-foreground whitespace-pre-wrap break-words font-body leading-relaxed">{post.content}</p>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-4">
            {showReactions && post.reaction_counts && (
              <PostReactions postId={post.id} initialReactions={post.reaction_counts} />
            )}
          </div>

          {showReplies && post.reply_count && post.reply_count > 0 && (
            <Dialog open={repliesDialogOpen} onOpenChange={setRepliesDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleViewReplies}
                  disabled={loadingReplies}
                  className="text-primary hover:text-primary/80 hover:bg-primary/10 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  {loadingReplies
                    ? "Loading..."
                    : `View ${post.reply_count} ${post.reply_count === 1 ? "Reply" : "Replies"}`}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto animate-slide-up">
                <DialogHeader>
                  <DialogTitle>Replies</DialogTitle>
                  <DialogDescription>All replies to this post</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {replies.map((reply) => (
                    <Card key={reply.id} className="bg-muted/30 border-border/30 animate-fade-in">
                      <CardContent className="p-3">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                          <span className="font-medium text-primary bg-primary/10 px-2 py-1 rounded-full border border-primary/20 transition-colors duration-200 hover:bg-primary/20">
                            {reply.anonymous_author || "Anonymous"}
                          </span>
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(reply.created_at)}</span>
                        </div>
                        <p className="text-foreground whitespace-pre-wrap break-words font-body leading-relaxed">
                          {reply.content}
                        </p>
                        {showReactions && reply.reaction_counts && (
                          <div className="mt-2">
                            <PostReactions postId={reply.id} initialReactions={reply.reaction_counts} />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
