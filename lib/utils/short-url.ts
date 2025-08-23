export async function generateShortUrl(wallId: string, wallName: string, pin?: string): Promise<{
  shortUrl: string;
  shortCode: string;
  slug: string;
} | null> {
  try {
    const response = await fetch('/api/shorten', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        wallId,
        wallName,
        pin
      })
    })

    if (!response.ok) {
      throw new Error('Failed to generate short URL')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error generating short URL:', error)
    return null
  }
}

export function formatShortUrl(shortCode: string, slug: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://anonwall.vercel.app"
  return `${baseUrl}/w/${shortCode}/${slug}`
}

export function isValidShortCode(code: string): boolean {
  // Short codes should be 6 characters, alphanumeric, uppercase
  return /^[A-Z0-9]{6}$/.test(code)
}
