"use client"

import type React from "react"

import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Lock, QrCode } from "lucide-react"
import { accessPrivateWall } from "@/lib/actions/private-access"

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
          Accessing Wall...
        </>
      ) : (
        <>
          <Lock className="mr-2 h-5 w-5" />
          Access Wall
        </>
      )}
    </Button>
  )
}

export function PrivateAccessForm() {
  const [state, formAction] = useActionState(accessPrivateWall, null)
  const [pin, setPin] = useState("")

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6)
    setPin(value)
  }

  return (
    <Card className="bg-gray-900 border-gray-800 max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-yellow-600 p-3 rounded-full">
            <Lock className="h-8 w-8 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-white">Access Private Wall</CardTitle>
        <CardDescription className="text-gray-400">
          Enter the 6-digit PIN to access the private discussion wall
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          {state?.error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded text-center">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="pin" className="text-white font-medium text-center block">
              Enter PIN
            </Label>
            <Input
              id="pin"
              name="pin"
              type="text"
              value={pin}
              onChange={handlePinChange}
              placeholder="000000"
              maxLength={6}
              className="bg-gray-800 border-gray-700 text-white text-center text-2xl font-mono tracking-widest focus:border-purple-500"
              autoComplete="off"
            />
            <p className="text-sm text-gray-500 text-center">6-digit PIN provided by the wall creator</p>
          </div>

          <SubmitButton />

          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 text-gray-400 text-sm">
              <QrCode className="h-4 w-4" />
              <span>You can also scan a QR code to access the wall directly</span>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
