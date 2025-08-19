import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, User, Lock, SearchIcon } from "lucide-react"
import { getCachedPublicWalls, checkDatabaseSetup } from "@/lib/actions/walls"
import { WallCard } from "@/components/wall-card"
import { SearchWalls } from "@/components/search-walls"
import { DatabaseSetup } from "@/components/database-setup"
import { LoadingSpinner } from "@/components/loading-spinner"
import { FeedbackButton } from "@/components/feedback-button"

interface PublicWallsPageProps {
  searchParams: { search?: string }
}

async function WallsList({ searchQuery }: { searchQuery?: string }) {
  const isDatabaseSetup = await checkDatabaseSetup()

  if (!isDatabaseSetup) {
    return <DatabaseSetup />
  }

  const walls = await getCachedPublicWalls(searchQuery)

  if (walls.length === 0) {
    return (
      <div className="text-center py-16">
        <SearchIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No walls found</h3>
        <p className="text-gray-400 mb-6">
          {searchQuery
            ? "Try adjusting your search terms or create a new wall."
            : "Be the first to create a public wall and start the conversation."}
        </p>
        <Button asChild className="bg-purple-600 hover:bg-purple-700">
          <Link href="/create-wall">
            <Plus className="h-4 w-4 mr-2" />
            Create New Wall
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {walls.map((wall) => (
        <WallCard key={wall.id} wall={wall} />
      ))}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading public walls..." />
        <p className="text-gray-400 text-sm mt-4">Discovering amazing conversations...</p>
      </div>

      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="h-6 bg-gradient-to-r from-muted to-muted/50 rounded w-2/3 mb-3"></div>
                  <div className="h-4 bg-gradient-to-r from-muted to-muted/50 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gradient-to-r from-muted to-muted/50 rounded w-3/4"></div>
                </div>
                <div className="h-6 w-6 bg-muted rounded-full ml-4"></div>
              </div>
              <div className="flex gap-2 mb-4">
                <div className="h-6 bg-gradient-to-r from-muted to-muted/50 rounded-full w-16"></div>
                <div className="h-6 bg-gradient-to-r from-muted to-muted/50 rounded-full w-20"></div>
                <div className="h-6 bg-gradient-to-r from-muted to-muted/50 rounded-full w-14"></div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="h-4 bg-muted rounded w-6"></div>
                  <div className="h-4 bg-muted rounded w-16"></div>
                </div>
                <div className="h-9 bg-gradient-to-r from-purple-600/20 to-purple-700/20 rounded w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function PublicWallsPage({ searchParams }: PublicWallsPageProps) {
  const searchQuery = searchParams.search

  const isDatabaseSetup = await checkDatabaseSetup()

  if (!isDatabaseSetup) {
    return <DatabaseSetup />
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
      {/* Header with Feedback Button */}
      <div className="relative">
        <div className="absolute top-0 right-0 z-10">
          <FeedbackButton />
        </div>

        <div className="text-center space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Public Walls</h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto px-2">
            Discover anonymous discussions happening around the world. Join any conversation or start your own.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 sm:mb-8">
        <SearchWalls />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Button asChild className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto">
          <Link href="/create-wall">
            <Plus className="h-4 w-4 mr-2" />
            Create New Wall
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent w-full sm:w-auto"
        >
          <Link href="/my-walls">
            <User className="h-4 w-4 mr-2" />
            My Walls
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent w-full sm:w-auto"
        >
          <Link href="/access-private">
            <Lock className="h-4 w-4 mr-2" />
            Access Private Wall
          </Link>
        </Button>
      </div>

      {/* Walls Grid */}
      <div className="space-y-4 sm:space-y-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-white">All Public Walls</h2>
        <Suspense fallback={<LoadingSkeleton />}>
          <WallsList searchQuery={searchQuery} />
        </Suspense>
      </div>
    </div>
  )
}
