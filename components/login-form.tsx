"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { FcGoogle } from "react-icons/fc"
import { Loader2 } from "lucide-react"

export default function LoginForm() {
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isSigningIn, setIsSigningIn] = useState(false)

  const error = searchParams.get("error")
  const message = searchParams.get("message")

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      setIsSigningIn(true)
      
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      })

      if (error) {
        console.error('Google sign-in error:', error)
        throw error
      }
    } catch (error) {
      console.error('Sign-in failed:', error)
      setIsLoading(false)
      setIsSigningIn(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6 bg-gray-900/60 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 sm:p-8 shadow-2xl">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Welcome to AnonWall</h1>
        <p className="text-base sm:text-lg text-gray-300">
          Sign in with your Google account to start creating anonymous discussion walls
        </p>
      </div>

      {message && !error && (
        <div className="bg-green-900/40 border border-green-500/60 text-green-200 px-4 py-3 rounded-lg text-sm animate-in slide-in-from-top-2 duration-300">
          {decodeURIComponent(message)}
        </div>
      )}

      {error && (
        <div className="bg-red-900/40 border border-red-500/60 text-red-200 px-4 py-3 rounded-lg text-sm animate-in slide-in-from-top-2 duration-300">
          {message ? decodeURIComponent(message) : "An error occurred during sign-in"}
        </div>
      )}

      <div className="space-y-4">
        <Button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 sm:py-4 text-base sm:text-lg rounded-lg h-12 sm:h-14 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-gray-500/25 border border-gray-200"
        >
          {isSigningIn ? (
            <div className="flex items-center justify-center space-x-3">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Signing in with Google...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-3">
              <FcGoogle className="w-5 h-5" />
              <span>Continue with Google</span>
            </div>
          )}
        </Button>

        <div className="text-center">
          <p className="text-xs text-gray-400">
            By signing in, you agree to our{" "}
            <a href="/guidelines" className="text-purple-400 hover:text-purple-300 underline">
              Community Guidelines
            </a>
          </p>
        </div>
      </div>

    </div>
  )
}
