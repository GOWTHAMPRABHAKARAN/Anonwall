import { PrivateAccessForm } from "@/components/private-access-form"
import { Button } from "@/components/ui/button"
import { Globe, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AccessPrivatePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Back Navigation */}
        <div className="flex justify-center">
          <Button asChild variant="ghost" className="text-gray-400 hover:text-white">
            <Link href="/public-walls">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Public Walls
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">Access Private Wall</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Enter the PIN provided by the wall creator to join the private discussion.
          </p>
        </div>

        {/* Access Form */}
        <PrivateAccessForm />

        {/* Help Section */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">How to Access Private Walls</h3>
            <div className="space-y-3 text-gray-400">
              <div className="flex items-start space-x-3">
                <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">
                  1
                </div>
                <p>Get the 6-digit PIN from the wall creator</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">
                  2
                </div>
                <p>Enter the PIN in the form above</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">
                  3
                </div>
                <p>Start participating in the anonymous discussion</p>
              </div>
            </div>
          </div>
        </div>

        {/* Alternative Options */}
        <div className="text-center space-y-4">
          <p className="text-gray-400">Don't have a PIN?</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              asChild
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
            >
              <Link href="/public-walls">
                <Globe className="h-4 w-4 mr-2" />
                Browse Public Walls
              </Link>
            </Button>
            <Button asChild className="bg-purple-600 hover:bg-purple-700">
              <Link href="/create-wall">Create Your Own Wall</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
