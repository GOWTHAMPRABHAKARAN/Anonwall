import { getModerationLogs } from "@/lib/actions/moderation"
import { ModerationLogs } from "@/components/moderation-logs"

export default async function ModerationLogsPage() {
  const logs = await getModerationLogs()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Moderation Logs</h1>
          <p className="text-gray-400">Complete history of all moderation actions for transparency</p>
        </div>

        <ModerationLogs logs={logs} />
      </div>
    </div>
  )
}
