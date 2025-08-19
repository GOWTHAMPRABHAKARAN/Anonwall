"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageSquare, Star, Send, X, CheckCircle, Heart } from "lucide-react"
import { submitFeedback } from "@/lib/actions/feedback"
import { useTransition } from "react"
import { useIsMobile } from "@/components/ui/use-mobile"

export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [rating, setRating] = useState(0)
  const [message, setMessage] = useState("")
  const [isPending, startTransition] = useTransition()
  const [showThankYou, setShowThankYou] = useState(false)
  const isMobile = useIsMobile()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!feedback.trim()) {
      setMessage("Please enter your feedback")
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.append("feedback", feedback)
      formData.append("rating", rating.toString())
      formData.append("pageSource", "public-walls")

      const result = await submitFeedback(formData)

      if (result.success) {
        setShowThankYou(true)
        setFeedback("")
        setRating(0)
        setMessage("")
        setTimeout(() => {
          setIsOpen(false)
          setShowThankYou(false)
        }, 3000)
      } else {
        setMessage(result.error || "Failed to submit feedback")
      }
    })
  }

  return (
    <>
      <div className="relative">
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          size={isMobile ? "sm" : "sm"}
          className={`bg-purple-600/10 border-purple-500/30 hover:bg-purple-600/20 text-purple-300 hover:text-purple-200 transition-all duration-300 animate-pulse ${
            isMobile ? "text-xs px-2 py-1" : ""
          }`}
        >
          <MessageSquare className={`${isMobile ? "h-3 w-3 mr-1" : "h-4 w-4 mr-2"}`} />
          {isMobile ? "Feedback" : "Feedback"}
        </Button>

        <div
          className={`absolute -right-2 top-1/2 transform -translate-y-1/2 animate-bounce ${isMobile ? "scale-75" : ""}`}
        >
          <div className="w-0 h-0 border-l-4 border-l-purple-400 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

          {/* Dialog */}
          <div
            className={`relative bg-card border border-border rounded-lg shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300 ${
              isMobile ? "w-full h-full max-h-screen p-4 m-0 rounded-none" : "p-6 w-96 max-w-[calc(100vw-2rem)] mx-4"
            }`}
          >
            {showThankYou ? (
              <div className="text-center py-8">
                <div className="relative mb-6">
                  <CheckCircle
                    className={`text-green-400 mx-auto animate-bounce ${isMobile ? "h-12 w-12" : "h-16 w-16"}`}
                  />
                  <div className="absolute -top-2 -right-2">
                    <Heart className={`text-red-400 animate-pulse ${isMobile ? "h-5 w-5" : "h-6 w-6"}`} />
                  </div>
                </div>
                <h3 className={`font-bold text-white mb-2 animate-pulse ${isMobile ? "text-xl" : "text-2xl"}`}>
                  Thank You! 🎉
                </h3>
                <p className={`text-gray-300 mb-4 ${isMobile ? "text-sm" : ""}`}>
                  Your feedback helps us make AnonWall better!
                </p>
                <div className="flex justify-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`text-amber-400 fill-current animate-pulse ${isMobile ? "h-3 w-3" : "h-4 w-4"}`}
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
                <p className={`text-gray-400 mt-4 ${isMobile ? "text-xs" : "text-sm"}`}>
                  This dialog will close automatically...
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-semibold text-white ${isMobile ? "text-base" : "text-lg"}`}>
                    Share Your Feedback
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 p-0 hover:bg-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Rating */}
                  <div>
                    <label className={`text-gray-400 mb-2 block ${isMobile ? "text-xs" : "text-sm"}`}>
                      Rate your experience (optional)
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`p-1 ${star <= rating ? "text-amber-400" : "text-gray-600"} hover:text-amber-400 transition-colors ${
                            isMobile ? "p-2" : ""
                          }`}
                        >
                          <Star className={`fill-current ${isMobile ? "h-6 w-6" : "h-5 w-5"}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Feedback Text */}
                  <div>
                    <label className={`text-gray-400 mb-2 block ${isMobile ? "text-xs" : "text-sm"}`}>
                      Your feedback
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Tell us what you think about AnonWall..."
                      className={`w-full px-3 py-2 bg-background border border-border rounded-md text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        isMobile ? "h-32 text-sm" : "h-24 text-sm"
                      }`}
                      maxLength={1000}
                    />
                    <div className={`text-gray-500 mt-1 ${isMobile ? "text-xs" : "text-xs"}`}>
                      {feedback.length}/1000 characters
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isPending || !feedback.trim()}
                    className={`w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 ${
                      isMobile ? "py-3 text-base" : ""
                    }`}
                    size={isMobile ? "default" : "sm"}
                  >
                    {isPending ? (
                      "Submitting..."
                    ) : (
                      <>
                        <Send className={`mr-2 ${isMobile ? "h-5 w-5" : "h-4 w-4"}`} />
                        Submit Feedback
                      </>
                    )}
                  </Button>

                  {/* Message */}
                  {message && (
                    <p
                      className={`${message.includes("Thank you") ? "text-green-400" : "text-red-400"} ${
                        isMobile ? "text-xs" : "text-sm"
                      }`}
                    >
                      {message}
                    </p>
                  )}
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
