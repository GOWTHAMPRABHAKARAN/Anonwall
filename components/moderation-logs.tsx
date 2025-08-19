"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Shield, Ban, Flag, CheckCircle, XCircle, AlertTriangle, Search, Calendar, User } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"

interface ModerationLog {
  id: string
  post_id: string | null
  wall_id: string | null
  action: string
  reason: string
  moderator_id: string | null
  details: any
  created_at: string
  walls?: {
    name: string
  }
}

interface ModerationLogsProps {
  logs: ModerationLog[]
}

export function ModerationLogs({ logs }: ModerationLogsProps) {
  const [filter, setFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredLogs = logs.filter((log) => {
    const matchesFilter = filter === "all" || log.action.includes(filter)
    const matchesSearch =
      log.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.walls?.name && log.walls.name.toLowerCase().includes(searchTerm.toLowerCase()))

    return matchesFilter && matchesSearch
  })

  const getActionIcon = (action: string) => {
    if (action.includes("blocked")) return <Ban className="h-4 w-4" />
    if (action.includes("flagged")) return <Flag className="h-4 w-4" />
    if (action.includes("approved")) return <CheckCircle className="h-4 w-4" />
    if (action.includes("rejected")) return <XCircle className="h-4 w-4" />
    if (action.includes("spam")) return <AlertTriangle className="h-4 w-4" />
    return <Shield className="h-4 w-4" />
  }

  const getActionColor = (action: string) => {
    if (action.includes("blocked") || action.includes("rejected")) return "bg-red-500/20 text-red-400 border-red-500/50"
    if (action.includes("flagged")) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
    if (action.includes("approved")) return "bg-green-500/20 text-green-400 border-green-500/50"
    if (action.includes("spam")) return "bg-orange-500/20 text-orange-400 border-orange-500/50"
    return "bg-blue-500/20 text-blue-400 border-blue-500/50"
  }

  const formatAction = (action: string) => {
    return action
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const actionTypes = [...new Set(logs.map((log) => log.action))]

  if (logs.length === 0) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-8 text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Moderation History</h3>
          <p className="text-gray-400">No moderation actions have been taken yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search logs by reason, action, or wall name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-600 text-white"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className="bg-purple-600 hover:bg-purple-700"
          >
            All ({logs.length})
          </Button>
          {actionTypes.slice(0, 4).map((actionType) => (
            <Button
              key={actionType}
              variant={filter === actionType ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(actionType)}
              className="text-xs"
            >
              {formatAction(actionType)} ({logs.filter((l) => l.action === actionType).length})
            </Button>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Total Actions</p>
                <p className="text-xl font-bold text-white">{logs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-red-400" />
              <div>
                <p className="text-sm text-gray-400">Blocked</p>
                <p className="text-xl font-bold text-white">
                  {logs.filter((l) => l.action.includes("blocked")).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-yellow-400" />
              <div>
                <p className="text-sm text-gray-400">Flagged</p>
                <p className="text-xl font-bold text-white">
                  {logs.filter((l) => l.action.includes("flagged")).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Today</p>
                <p className="text-xl font-bold text-white">
                  {logs.filter((l) => new Date(l.created_at).toDateString() === new Date().toDateString()).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs List */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6 text-center">
              <p className="text-gray-400">No logs match your search criteria.</p>
            </CardContent>
          </Card>
        ) : (
          filteredLogs.map((log) => (
            <Card key={log.id} className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Badge className={getActionColor(log.action)}>
                      {getActionIcon(log.action)}
                      <span className="ml-1">{formatAction(log.action)}</span>
                    </Badge>

                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium mb-1">{log.reason}</p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                        {log.walls?.name && (
                          <span className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            Wall: {log.walls.name}
                          </span>
                        )}

                        {log.moderator_id && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Moderator: {log.moderator_id.slice(0, 8)}...
                          </span>
                        )}

                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(log.created_at), "MMM d, yyyy HH:mm")}
                        </span>
                      </div>

                      {log.details && Object.keys(log.details).length > 0 && (
                        <div className="mt-2 p-2 bg-gray-900 rounded text-xs">
                          <pre className="text-gray-300 whitespace-pre-wrap">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 ml-4">
                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
