export function generateQRCodeUrl(url: string, pin?: string): string {
  // If a full URL is provided, use it directly
  if (url.startsWith('http')) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`
  }

  // Legacy support for wallId + pin format
  const baseUrl =
    typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const wallUrl = pin ? `${baseUrl}/wall/${url}?pin=${pin}` : `${baseUrl}/wall/${url}`

  // Using QR Server API for QR code generation
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(wallUrl)}`
}
