"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowLeft, Share2, Globe, Lock, Calendar, Copy, Check, Loader2 } from "lucide-react"
import Link from "next/link"
import { generateQRCodeUrl } from "@/lib/utils/qr-code"
import { generateShortUrl } from "@/lib/utils/short-url"
import type { WallWithPosts } from "@/lib/actions/wall-data"

interface WallHeaderProps {
  wall: WallWithPosts
  pin?: string
}

export function WallHeader({ wall, pin }: WallHeaderProps) {
  const [copied, setCopied] = useState(false)
  const [shortUrl, setShortUrl] = useState<string>("")
  const [isGeneratingShortUrl, setIsGeneratingShortUrl] = useState(false)
  const [showShortUrl, setShowShortUrl] = useState(false)

  const longUrl =
    typeof window !== "undefined" ? `${window.location.origin}/wall/${wall.id}${pin ? `?pin=${pin}` : ""}` : ""

  // Generate short URL when component mounts
  useEffect(() => {
    const generateUrl = async () => {
      setIsGeneratingShortUrl(true)
      try {
        const result = await generateShortUrl(wall.id, wall.name, pin)
        if (result) {
          setShortUrl(result.shortUrl)
        }
      } catch (error) {
        console.error("Failed to generate short URL:", error)
      } finally {
        setIsGeneratingShortUrl(false)
      }
    }

    generateUrl()
  }, [wall.id, wall.name, pin])

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy link:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  const isExpired = wall.expires_at && new Date(wall.expires_at) < new Date()

  return (
    <div className="space-y-4">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" className="text-gray-400 hover:text-white">
          <Link href="/public-walls">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-800 text-white">
            <DialogHeader>
              <DialogTitle>Share Wall</DialogTitle>
              <DialogDescription className="text-gray-400">
                Share this wall with others to collect anonymous feedback and discussions.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Short URL */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <span className="bg-green-600 text-white px-2 py-1 rounded text-xs mr-2">RECOMMENDED</span>
                  Short Link
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={isGeneratingShortUrl ? "Generating..." : shortUrl || "Failed to generate"}
                    readOnly
                    className="flex-1 bg-gray-800 border-gray-700 rounded px-3 py-2 text-sm font-mono"
                    placeholder={isGeneratingShortUrl ? "Generating short URL..." : "Short URL will appear here"}
                  />
                  <Button 
                    onClick={() => handleCopyLink(shortUrl)} 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700"
                    disabled={!shortUrl || isGeneratingShortUrl}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-gray-400">
                  {isGeneratingShortUrl ? (
                    <span className="flex items-center">
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      Generating secure short link...
                    </span>
                  ) : (
                    "Short, secure, and branded with your wall name"
                  )}
                </p>
              </div>

              {/* Long URL (fallback) */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Full Link (Fallback)</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={longUrl}
                    readOnly
                    className="flex-1 bg-gray-800 border-gray-700 rounded px-3 py-2 text-sm text-gray-400"
                  />
                  <Button 
                    onClick={() => handleCopyLink(longUrl)} 
                    size="sm" 
                    className="bg-gray-600 hover:bg-gray-700"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">Use this if the short link doesn't work</p>
              </div>

              {!wall.is_public && pin && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">QR Code</label>
                  <div className="flex justify-center p-4 bg-white rounded">
                    <img
                      src={generateQRCodeUrl(shortUrl || longUrl, pin) || "/placeholder.svg"}
                      alt="QR Code for wall access"
                      className="w-48 h-48"
                    />
                  </div>
                  <p className="text-xs text-gray-400 text-center">
                    Scan this QR code to access the private wall
                    {shortUrl && (
                      <span className="block mt-1 text-green-400">
                        Uses secure short link
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Wall Info */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold text-white">{wall.name}</CardTitle>
              {wall.description && (
                <CardDescription className="text-gray-400 text-base">{wall.description}</CardDescription>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {wall.is_public ? (
                <Badge className="bg-green-600 text-white">
                  <Globe className="h-3 w-3 mr-1" />
                  Public
                </Badge>
              ) : (
                <Badge className="bg-yellow-600 text-white">
                  <Lock className="h-3 w-3 mr-1" />
                  Private
                </Badge>
              )}
              {isExpired && (
                <Badge variant="destructive">
                  <Calendar className="h-3 w-3 mr-1" />
                  Expired
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
            <span>{wall.posts.length} posts</span>
            <span>Created {formatDate(wall.created_at)}</span>
            {wall.expires_at && <span>Expires {formatDate(wall.expires_at)}</span>}
          </div>

          {wall.tags && wall.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {wall.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-gray-800 text-gray-300">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <p className="text-gray-400 mt-4">Share your thoughts anonymously. All posts and replies are anonymous.</p>
        </CardContent>
      </Card>
    </div>
  )
}
