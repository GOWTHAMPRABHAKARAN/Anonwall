import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, Clock, Users, TrendingUp, Flame, ExternalLink } from "lucide-react"
import type { Wall } from "@/lib/actions/walls"

interface WallCardProps {
  wall: Wall
}

export function WallCard({ wall }: WallCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const isExpired = wall.expires_at && new Date(wall.expires_at) < new Date()

  return (
    <Card
      className={`group bg-gradient-to-br from-card to-card/80 border-border/50 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm animate-fade-in ${
        wall.is_trending ? "ring-2 ring-accent/30 border-accent/50 shadow-accent/20" : ""
      }`}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="text-foreground text-lg sm:text-xl font-bold leading-tight pr-2 group-hover:text-primary transition-colors duration-200 font-heading">
                {wall.name}
              </h3>
              <div className="flex items-center space-x-2 flex-shrink-0">
                {wall.is_trending && (
                  <Badge className="text-xs px-2 py-1 bg-gradient-to-r from-accent to-accent/80 text-accent-foreground border-0 animate-pulse">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Trending
                  </Badge>
                )}
                {isExpired && (
                  <Badge variant="destructive" className="text-xs px-2 py-1 animate-fade-in">
                    Expired
                  </Badge>
                )}
                <div className="flex items-center space-x-1 bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/20 transition-all duration-200 hover:bg-primary/20">
                  <Users className="h-3 w-3" />
                  <span className="text-xs font-medium">Public</span>
                </div>
              </div>
            </div>
          </div>

          {wall.tags && wall.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {wall.tags.slice(0, 4).map((tag) => (
                <Badge
                  key={tag}
                  className="text-xs bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30 px-2 py-1 transition-all duration-200 hover:scale-105 cursor-default font-medium"
                >
                  {tag}
                </Badge>
              ))}
              {wall.tags.length > 4 && (
                <Badge
                  className="text-xs bg-accent/10 text-accent hover:bg-accent/20 border border-accent/30 px-2 py-1 transition-colors duration-200 font-medium"
                >
                  +{wall.tags.length - 4} more
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-muted-foreground hover:text-primary transition-colors duration-200">
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm font-medium">{wall.post_count || 0} posts</span>
              </div>
              {wall.is_trending && wall.trending_score && (
                <div className="flex items-center space-x-1 text-accent animate-pulse">
                  <Flame className="h-4 w-4" />
                  <span className="text-sm font-medium">{wall.trending_score}</span>
                </div>
              )}
              <div className="flex items-center space-x-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{formatDate(wall.created_at)}</span>
              </div>
            </div>

            <Button
              asChild
              size="sm"
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground px-4 py-2 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-primary/25 active:scale-95"
            >
              <Link href={`/wall/${wall.id}`}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
