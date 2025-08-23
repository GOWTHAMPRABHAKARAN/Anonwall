import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

interface ShortUrlPageProps {
  params: Promise<{ code: string; slug: string }>
}

export default async function ShortUrlPage({ params }: ShortUrlPageProps) {
  const { code, slug } = await params
  const supabase = await createClient()

  try {
    // Find the short URL mapping
    const { data: shortUrl, error } = await supabase
      .from("short_urls")
      .select("wall_id, pin, created_at")
      .eq("short_code", code.toUpperCase())
      .single()

    if (error || !shortUrl) {
      redirect("/public-walls")
    }

    // Check if the short URL is not too old (optional security measure)
    const createdAt = new Date(shortUrl.created_at)
    const now = new Date()
    const daysOld = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
    
    // Optional: Expire short URLs after 30 days for security
    if (daysOld > 30) {
      redirect("/public-walls")
    }

    // Redirect to the actual wall
    const redirectUrl = shortUrl.pin 
      ? `/wall/${shortUrl.wall_id}?pin=${shortUrl.pin}`
      : `/wall/${shortUrl.wall_id}`

    redirect(redirectUrl)

  } catch (error) {
    console.error("Error processing short URL:", error)
    redirect("/public-walls")
  }
}
