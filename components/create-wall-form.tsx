"use client"

import { useActionState, useState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Globe, Lock, Calendar, Tag, MessageSquare } from "lucide-react"
import { createWall } from "@/lib/actions/create-wall"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-lg font-medium"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Creating Wall...
        </>
      ) : (
        "Create Wall"
      )}
    </Button>
  )
}

export function CreateWallForm() {
  const [state, formAction] = useActionState(createWall, null)
  const [isPublic, setIsPublic] = useState(true)
  const [hasExpiry, setHasExpiry] = useState(false)
  const [threadingEnabled, setThreadingEnabled] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (state?.success && state?.wallId) {
      router.push(`/wall/${state.wallId}`)
    }
  }, [state, router])

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <Card className="bg-gray-900 border-gray-800 max-w-2xl mx-auto">
        <CardHeader className="text-center px-4 sm:px-6">
          <CardTitle className="text-xl sm:text-2xl font-bold text-white">Create Your Wall</CardTitle>
          <CardDescription className="text-gray-400 text-sm sm:text-base">
            Set up an anonymous discussion space in seconds
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <form action={formAction} className="space-y-4 sm:space-y-6">
            {state?.error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-3 sm:px-4 py-2 sm:py-3 rounded text-sm">
                {state.error}
              </div>
            )}

            {state?.success && (
              <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-3 sm:px-4 py-2 sm:py-3 rounded text-sm">
                Wall created successfully! Redirecting...
              </div>
            )}

            {/* Wall Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white font-medium text-sm sm:text-base">
                Wall Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="e.g., Team Feedback, Q&A Session"
                required
                maxLength={255}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-purple-500 text-sm sm:text-base"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-white font-medium text-sm sm:text-base">
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe the purpose and context of this wall..."
                maxLength={500}
                rows={3}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-purple-500 resize-none text-sm sm:text-base"
              />
              <p className="text-xs sm:text-sm text-gray-500">0/500 characters</p>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags" className="text-white font-medium flex items-center text-sm sm:text-base">
                <Tag className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                Tags (Optional)
              </Label>
              <Input
                id="tags"
                name="tags"
                type="text"
                placeholder="e.g., feedback, work, team, anonymous"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-purple-500 text-sm sm:text-base"
              />
              <p className="text-xs sm:text-sm text-gray-500">
                Separate tags with commas. Helps others discover your wall.
              </p>
            </div>

            {/* Public/Private Toggle */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-800 rounded-lg space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-3">
                  {isPublic ? (
                    <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                  ) : (
                    <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
                  )}
                  <div>
                    <Label htmlFor="isPublic" className="text-white font-medium text-sm sm:text-base">
                      Public Wall
                    </Label>
                    <p className="text-xs sm:text-sm text-gray-400">Discoverable by everyone</p>
                  </div>
                </div>
                <Switch
                  id="isPublic"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                  className="data-[state=checked]:bg-green-600"
                />
              </div>
              <input type="hidden" name="isPublic" value={isPublic.toString()} />

              {!isPublic && (
                <div className="p-3 sm:p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg">
                  <p className="text-yellow-400 text-xs sm:text-sm">
                    <Lock className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                    Private walls are only accessible through a PIN and QR code that will be generated after creation.
                  </p>
                </div>
              )}
            </div>

            {/* Expiry Date Toggle */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-800 rounded-lg space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
                  <div>
                    <Label htmlFor="hasExpiry" className="text-white font-medium text-sm sm:text-base">
                      Set Expiry Date
                    </Label>
                    <p className="text-xs sm:text-sm text-gray-400">Automatically close wall after date</p>
                  </div>
                </div>
                <Switch
                  id="hasExpiry"
                  name="hasExpiry"
                  checked={hasExpiry}
                  onCheckedChange={setHasExpiry}
                  className="data-[state=checked]:bg-purple-600"
                />
              </div>
              <input type="hidden" name="hasExpiry" value={hasExpiry.toString()} />

              {hasExpiry && (
                <div className="space-y-2">
                  <Label htmlFor="expiryDate" className="text-white font-medium text-sm sm:text-base">
                    Expiry Date & Time
                  </Label>
                  <Input
                    id="expiryDate"
                    name="expiryDate"
                    type="datetime-local"
                    min={new Date().toISOString().slice(0, 16)}
                    className="bg-gray-800 border-gray-700 text-white focus:border-purple-500 text-sm sm:text-base"
                  />
                </div>
              )}
            </div>

            {/* Threading Toggle */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-800 rounded-lg space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                  <div>
                    <Label htmlFor="threadingEnabled" className="text-white font-medium text-sm sm:text-base">
                      Enable Threading
                    </Label>
                    <p className="text-xs sm:text-sm text-gray-400">Allow replies to specific posts</p>
                  </div>
                </div>
                <Switch
                  id="threadingEnabled"
                  checked={threadingEnabled}
                  onCheckedChange={setThreadingEnabled}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>
              <input type="hidden" name="threadingEnabled" value={threadingEnabled.toString()} />

              {threadingEnabled && (
                <div className="p-3 sm:p-4 bg-blue-500/10 border border-blue-500/50 rounded-lg">
                  <p className="text-blue-400 text-xs sm:text-sm">
                    <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                    Users will be able to reply to specific posts, creating threaded conversations.
                  </p>
                </div>
              )}
            </div>

            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
