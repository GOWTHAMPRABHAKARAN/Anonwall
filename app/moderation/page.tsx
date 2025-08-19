import { getModerationQueue } from "@/lib/actions/moderation"
import { ModerationQueue } from "@/components/moderation-queue"
import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function ModerationPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?returnTo=/moderation")
  }

  const queueItems = await getModerationQueue()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Moderation Queue</h1>
          <p className="text-gray-400">Review flagged posts and take appropriate action</p>
        </div>

        <ModerationQueue items={queueItems} />
      </div>
    </div>
  )
}
