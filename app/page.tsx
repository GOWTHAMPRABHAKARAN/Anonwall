import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function HomePage() {
  const supabase = createClient()

  try {
    // Check if user is authenticated to potentially redirect to a personalized page
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Always redirect to public walls as the main landing page
    redirect("/public-walls")
  } catch (error) {
    // If there's any error, still redirect to public walls
    redirect("/public-walls")
  }
}
