"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, XCircle, Clock, Flag } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface ModerationItem {
  id: string
  post_id: string
  wall_id: string
  reason: string
  severity: string
  status: string
  flagged_keywords: string[]
  created_at: string
  posts?: {
    content: string
    created_at: string
  }
  walls?: {
    name: string
  }
}

interface ModerationQueueProps {
  items: ModerationItem[]
}

export function ModerationQueue({ items }: ModerationQueueProps) {
  const [filter, setFilter] = useState<string>("all")
  const [processing, setProcessing] = useState<string | null>(null)

  const filteredItems = items.filter((item) => {
    if (filter === "all") return true
    return item.severity === filter
  })

  const handleAction = async (itemId: string, action: "approve" | "reject") => {
    setProcessing(itemId)
    // TODO: Implement moderation action
    console.log(`${action} item ${itemId}`)
    setTimeout(() => setProcessing(null), 1000)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/50"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
      case "low":
        return "bg-blue-500/20 text-blue-400 border-blue-500/50"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/50"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return <AlertTriangle className="h-4 w-4" />
      case "medium":
        return <Flag className="h-4 w-4" />
      case "low":
        return <Clock className="h-4 w-4" />
      default:
        return <Flag className="h-4 w-4" />
    }
  }

  if (items.length === 0) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">All Clear!</h3>
          <p className="text-gray-400">No posts are currently in the moderation queue.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
          className="bg-purple-600 hover:bg-purple-700"
        >
          All ({items.length})
        </Button>
        <Button
          variant={filter === "high" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("high")}
          className="bg-red-600 hover:bg-red-700"
        >
          High ({items.filter((i) => i.severity === "high").length})
        </Button>
        <Button
          variant={filter === "medium" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("medium")}
          className="bg-yellow-600 hover:bg-yellow-700"
        >
          Medium ({items.filter((i) => i.severity === "medium").length})
        </Button>
        <Button
          variant={filter === "low" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("low")}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Low ({items.filter((i) => i.severity === "low").length})
        </Button>
      </div>

      {/* Queue Items */}
      <div className="space-y-4">
        {filteredItems.map((item) => (
          <Card key={item.id} className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className={getSeverityColor(item.severity)}>
                    {getSeverityIcon(item.severity)}
                    <span className="ml-1 capitalize">{item.severity}</span>
                  </Badge>
                  <span className="text-sm text-gray-400">
                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAction(item.id, "approve")}
                    disabled={processing === item.id}
                    className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAction(item.id, "reject")}
                    disabled={processing === item.id}
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-white mb-1">Reason</h4>
                <p className="text-gray-300">{item.reason}</p>
              </div>

              {item.flagged_keywords && item.flagged_keywords.length > 0 && (
                <div>
                  <h4 className="font-medium text-white mb-2">Flagged Keywords</h4>
                  <div className="flex flex-wrap gap-1">
                    {item.flagged_keywords.map((keyword) => (
                      <Badge key={keyword} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-medium text-white mb-1">Post Content</h4>
                <div className="bg-gray-900 p-3 rounded border border-gray-600">
                  <p className="text-gray-300">{item.posts?.content}</p>
                  <div className="mt-2 text-xs text-gray-500">
                    Wall: {item.walls?.name} • Posted{" "}
                    {item.posts?.created_at &&
                      formatDistanceToNow(new Date(item.posts.created_at), { addSuffix: true })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
