import { Trophy, Flame } from "lucide-react"

interface UserStreakBadgeProps {
  currentStreak: number
  bestStreak: number
  className?: string
}

export function UserStreakBadge({ currentStreak, bestStreak, className = "" }: UserStreakBadgeProps) {
  if (currentStreak === 0 && bestStreak === 0) {
    return null
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {currentStreak > 0 && (
        <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
          <Flame className="h-3 w-3" />
          {currentStreak} day streak
        </div>
      )}
      {bestStreak > 0 && (
        <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
          <Trophy className="h-3 w-3" />
          Best: {bestStreak}
        </div>
      )}
    </div>
  )
}
