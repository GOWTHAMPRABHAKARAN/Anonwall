"use client"

import { useEffect, useState, use, useCallback, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { WallHeader } from "@/components/wall-header"
import { PostForm } from "@/components/post-form"
import { PostItem } from "@/components/post-item"
import { ThreadedPost } from "@/components/threaded-post"
import { getWallWithPosts } from "@/lib/actions/wall-data"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertTriangle } from "lucide-react"
import type { WallWithPosts } from "@/lib/actions/wall-data"

interface WallPageProps {
  params: Promise<{ id: string }>
}

export default function WallPage({ params }: WallPageProps) {
  const { id } = use(params)
  const searchParams = useSearchParams()
  const pin = searchParams.get("pin") || undefined
  const [wall, setWall] = useState<WallWithPosts | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const loadWall = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const wallData = await getWallWithPosts(id, pin)
      if (!wallData) {
        setError("Wall not found or you don't have permission to access it")
      } else {
        setWall(wallData)
        setError(null)
      }
    } catch (err) {
      console.error("Error loading wall:", err)
      setError("Failed to load wall")
    } finally {
      setLoading(false)
    }
  }, [id, pin])

  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1)
    loadWall()
  }, [loadWall])

  const handleContinueAnyway = useCallback(() => {
    setError(null)
    setLoading(false)
  }, [])

  const handlePostCreated = useCallback(() => {
    loadWall()
  }, [loadWall])

  useEffect(() => {
    loadWall()
  }, [loadWall])

  // Memoize filtered posts for better performance
  const { activeWalls, expiredWalls } = useMemo(() => {
    if (!wall) return { activeWalls: [], expiredWalls: [] }
    
    const active = wall.posts.filter((post) => !post.parent_post_id)
    const expired = wall.posts.filter((post) => post.parent_post_id)
    
    return { activeWalls: active, expiredWalls: expired }
  }, [wall])

  const isExpired = useMemo(() => {
    return wall?.expires_at && new Date(wall.expires_at) < new Date()
  }, [wall?.expires_at])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <LoadingSpinner size="lg" text="Loading wall..." />
          <div className="animate-pulse space-y-6">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="h-32 bg-gray-700 rounded mb-4"></div>
              <div className="h-10 bg-gray-700 rounded w-32"></div>
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <div className="h-4 bg-gray-700 rounded w-1/4 mb-3"></div>
                <div className="h-16 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error && !wall) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
              <p className="text-gray-400 text-sm">
                {error === "Failed to load wall" 
                  ? "We're having trouble connecting to our services. This might be a temporary issue."
                  : error}
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={handleRetry}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 transition-fast"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              
              {error === "Failed to load wall" && (
                <Button 
                  onClick={handleContinueAnyway}
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 transition-fast"
                >
                  Continue Anyway
                </Button>
              )}
            </div>

            {retryCount > 0 && (
              <p className="text-xs text-gray-500 mt-4">
                Retry attempt {retryCount}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!wall) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold text-white mb-4">Wall Not Found</h1>
          <p className="text-gray-400 mb-6">
            The wall you're looking for doesn't exist or you don't have permission to access it.
          </p>
          <Button 
            onClick={() => window.history.back()}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800 transition-fast"
          >
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <WallHeader wall={wall} pin={pin} />

        {/* Post Form */}
        {!isExpired && <PostForm wallId={wall.id} pin={pin} onPostCreated={handlePostCreated} />}

        {/* Posts */}
        <div className="space-y-6">
          {wall.posts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No posts yet. Be the first to start the conversation!
              </h3>
              <p className="text-gray-400">
                {isExpired
                  ? "This wall has expired and is no longer accepting posts."
                  : "Share your thoughts anonymously and get the discussion started."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {wall.threading_enabled
                ? // Render threaded posts with replies
                  activeWalls.map((post) => (
                    <ThreadedPost
                      key={post.id}
                      post={post}
                      wallId={wall.id}
                      isCreator={wall.is_creator}
                      threadingEnabled={wall.threading_enabled}
                    />
                  ))
                : // Render regular posts with reactions
                  wall.posts.map((post) => (
                    <PostItem
                      key={post.id}
                      post={post}
                      isCreator={wall.is_creator}
                      onDelete={handlePostCreated}
                      showReactions={true}
                    />
                  ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
