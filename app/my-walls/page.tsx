"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, Globe } from "lucide-react"
import { getMyWalls } from "@/lib/actions/my-walls"
import { MyWallCard } from "@/components/my-wall-card"
import { getUserStreak } from "@/lib/actions/walls"
import { UserStreakBadge } from "@/components/user-streak-badge"
import { LoadingSpinner } from "@/components/loading-spinner"
import { createClient } from "@/lib/supabase/client"
import type { MyWall } from "@/lib/actions/my-walls"

function MyWallsList({ userId }: { userId: string }) {
  const [walls, setWalls] = useState<MyWall[]>([])
  const [streakData, setStreakData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadWalls = async () => {
    try {
      setLoading(true)
      setError(null)
      const [wallsData, streakDataResult] = await Promise.all([
        getMyWalls(),
        getUserStreak(userId)
      ])
      setWalls(wallsData)
      setStreakData(streakDataResult)
    } catch (err) {
      console.error("Error loading walls:", err)
      setError("Failed to load walls")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWalls()
  }, [userId])

  const handleDelete = () => {
    // Reload walls after deletion
    loadWalls()
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading your walls..." />
        <p className="text-gray-400 text-sm mt-4">Gathering your conversations...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-white mb-2">Failed to load walls</h3>
        <p className="text-gray-400 mb-6">{error}</p>
        <Button onClick={loadWalls} className="bg-purple-600 hover:bg-purple-700">
          Try Again
        </Button>
      </div>
    )
  }

  const activeWalls = walls.filter((wall) => wall.is_active)
  const expiredWalls = walls.filter((wall) => !wall.is_active)

  if (walls.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">💬</div>
        <h3 className="text-xl font-semibold text-white mb-2">No active walls yet</h3>
        <p className="text-gray-400 mb-6">
          Create your first wall to start collecting anonymous feedback and discussions.
        </p>
        <Button asChild className="bg-purple-600 hover:bg-purple-700">
          <Link href="/create-wall">
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Wall
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {streakData && (streakData.currentStreak > 0 || streakData.bestStreak > 0) && (
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Your Trending Achievement</h3>
              <p className="text-sm text-gray-600">Keep creating engaging walls to maintain your streak!</p>
            </div>
            <UserStreakBadge
              currentStreak={streakData.currentStreak}
              bestStreak={streakData.bestStreak}
              className="flex-shrink-0"
            />
          </div>
        </div>
      )}

      {/* Active Walls */}
      {activeWalls.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">Active Walls</h2>
            <span className="text-sm text-gray-400">Walls that are currently accepting posts</span>
          </div>
          <div className="space-y-4">
            {activeWalls.map((wall) => (
              <MyWallCard key={wall.id} wall={wall} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {/* Expired Walls */}
      {expiredWalls.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">Expired Walls</h2>
            <span className="text-sm text-gray-400">Walls that are no longer accepting posts</span>
          </div>
          <div className="space-y-4">
            {expiredWalls.map((wall) => (
              <MyWallCard key={wall.id} wall={wall} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading your walls..." />
        <p className="text-gray-400 text-sm mt-4">Gathering your conversations...</p>
      </div>

      <div className="bg-gradient-to-r from-orange-50/10 to-yellow-50/10 border border-orange-200/20 rounded-lg p-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-6 bg-gradient-to-r from-muted to-muted/50 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gradient-to-r from-muted to-muted/50 rounded w-2/3"></div>
          </div>
          <div className="h-12 w-24 bg-gradient-to-r from-orange-600/20 to-yellow-600/20 rounded-full"></div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="h-8 bg-gradient-to-r from-muted to-muted/50 rounded w-1/4"></div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-lg p-6 animate-pulse hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="h-6 bg-gradient-to-r from-muted to-muted/50 rounded w-1/2 mb-3"></div>
                  <div className="h-4 bg-gradient-to-r from-muted to-muted/50 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gradient-to-r from-muted to-muted/50 rounded w-3/4"></div>
                </div>
                <div className="flex gap-2 ml-4">
                  <div className="h-8 w-8 bg-muted rounded"></div>
                  <div className="h-8 w-8 bg-muted rounded"></div>
                  <div className="h-8 w-8 bg-muted rounded"></div>
                </div>
              </div>
              <div className="flex gap-2 mb-4">
                <div className="h-6 bg-gradient-to-r from-purple-600/20 to-purple-700/20 rounded-full w-16"></div>
                <div className="h-6 bg-gradient-to-r from-muted to-muted/50 rounded-full w-20"></div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="h-4 bg-muted rounded w-20"></div>
                  <div className="h-4 bg-muted rounded w-16"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-8 bg-gradient-to-r from-purple-600/20 to-purple-700/20 rounded w-16"></div>
                  <div className="h-8 bg-muted rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function MyWallsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error("Error getting user:", error)
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner size="lg" text="Loading..." />
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
      {/* Header */}
      <div className="text-center space-y-3 sm:space-y-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">My Walls</h1>
        <p className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto px-2">
          Manage your created walls, monitor discussions, and moderate content.
        </p>
      </div>

      {/* Browse Public Walls Button */}
      <div className="flex justify-center mb-6 sm:mb-8">
        <Button
          asChild
          variant="outline"
          className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent w-full sm:w-auto max-w-xs"
        >
          <Link href="/public-walls">
            <Globe className="h-4 w-4 mr-2" />
            Browse Public Walls
          </Link>
        </Button>
      </div>

      {/* Walls List */}
      <Suspense fallback={<LoadingSkeleton />}>
        <MyWallsList userId={user.id} />
      </Suspense>
    </div>
  )
}
