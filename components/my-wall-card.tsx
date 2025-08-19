"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  MessageSquare,
  Clock,
  Globe,
  Lock,
  Calendar,
  Trash2,
  ExternalLink,
  Share2,
  Copy,
  Check,
  Shield,
} from "lucide-react"
import { deleteWall } from "@/lib/actions/my-walls"
import { generateQRCodeUrl } from "@/lib/utils/qr-code"
import type { MyWall } from "@/lib/actions/my-walls"

interface MyWallCardProps {
  wall: MyWall
  onDelete: () => void
}

export function MyWallCard({ wall, onDelete }: MyWallCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete "${wall.name}"? This action cannot be undone and will delete all posts in this wall.`,
      )
    ) {
      return
    }

    setIsDeleting(true)
    const result = await deleteWall(wall.id)

    if (result.error) {
      alert(result.error)
    } else {
      onDelete()
    }

    setIsDeleting(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/wall/${wall.id}${wall.pin ? `?pin=${wall.pin}` : ""}`
      : ""

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy link:", error)
    }
  }

  return (
    <Card className="bg-card border-border hover:shadow-xl transition-all duration-200 shadow-sm">
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          {/* Header section */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <h3 className="text-foreground text-lg sm:text-xl font-semibold leading-tight">{wall.name}</h3>
                <div className="flex items-center space-x-2">
                  {wall.is_public ? (
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-200 text-xs px-2 py-1">
                      <Globe className="h-3 w-3 mr-1" />
                      Public
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-200 text-xs px-2 py-1">
                      <Lock className="h-3 w-3 mr-1" />
                      Private
                    </Badge>
                  )}
                  {!wall.is_active && (
                    <Badge variant="destructive" className="text-xs px-2 py-1">
                      Expired
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          {wall.tags && wall.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {wall.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 px-2 py-1"
                >
                  {tag}
                </Badge>
              ))}
              {wall.tags.length > 3 && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-gray-50 text-gray-600 border border-gray-200 px-2 py-1"
                >
                  +{wall.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Private Wall PIN */}
          {!wall.is_public && wall.pin && (
            <div className="bg-amber-50 border border-amber-300 rounded-lg px-3 py-2">
              <span className="text-amber-800 text-sm font-medium">PIN: {wall.pin}</span>
            </div>
          )}

          {/* Stats and Actions section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 pt-3 border-t border-border">
            {/* Stats */}
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <MessageSquare className="h-4 w-4" />
                <span className="font-medium">{wall.post_count} posts</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{formatDate(wall.created_at)}</span>
              </div>
              {wall.expires_at && (
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs">Expires {formatDate(wall.expires_at)}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <Button asChild size="sm" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2">
                <Link href={`/wall/${wall.id}${wall.pin ? `?pin=${wall.pin}` : ""}`}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View
                </Link>
              </Button>

              <Button
                asChild
                size="sm"
                variant="outline"
                className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 px-3 py-2 bg-transparent"
              >
                <Link href={`/moderation?wall=${wall.id}`}>
                  <Shield className="h-4 w-4" />
                </Link>
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 px-3 py-2 bg-transparent"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border text-foreground max-w-md">
                  <DialogHeader>
                    <DialogTitle>Share Wall</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      Share this wall with others to collect anonymous feedback.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Wall Link</label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={shareUrl}
                          readOnly
                          className="flex-1 bg-muted border-border rounded px-3 py-2 text-sm text-foreground"
                        />
                        <Button onClick={handleCopyLink} size="sm" className="bg-purple-600 hover:bg-purple-700">
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    {!wall.is_public && wall.pin && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">QR Code</label>
                        <div className="flex justify-center p-4 bg-background rounded">
                          <img
                            src={generateQRCodeUrl(wall.id, wall.pin) || "/placeholder.svg"}
                            alt="QR Code for wall access"
                            className="w-48 h-48"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                          Scan this QR code to access the private wall
                        </p>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                size="sm"
                variant="outline"
                onClick={handleDelete}
                disabled={isDeleting}
                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 px-3 py-2 bg-transparent"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
