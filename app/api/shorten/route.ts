import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { wallId, wallName, pin } = await request.json()

    if (!wallId || !wallName) {
      return NextResponse.json({ error: "Wall ID and name are required" }, { status: 400 })
    }

    // Generate a short, secure code (6 characters)
    const shortCode = crypto.randomBytes(3).toString('hex').toUpperCase()
    
    // Create a slug from the wall name
    const slug = wallName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
      .substring(0, 30) // Limit length

    // Store the short URL mapping
    const { error } = await supabase
      .from("short_urls")
      .insert({
        short_code: shortCode,
        wall_id: wallId,
        wall_slug: slug,
        pin: pin || null,
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error("Error creating short URL:", error)
      return NextResponse.json({ error: "Failed to create short URL" }, { status: 500 })
    }

    // Generate the short URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://anonwall.vercel.app"
    const shortUrl = `${baseUrl}/w/${shortCode}/${slug}`

    return NextResponse.json({ 
      shortUrl,
      shortCode,
      slug 
    })

  } catch (error) {
    console.error("Error in shorten API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
