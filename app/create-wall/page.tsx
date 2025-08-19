import { CreateWallForm } from "@/components/create-wall-form"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function CreateWallPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">Create Your Wall</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Set up an anonymous discussion space in seconds. Choose between public discovery or private access with PIN
            protection.
          </p>
        </div>

        <CreateWallForm />
      </div>
    </div>
  )
}
