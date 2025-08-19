export function generateQRCodeUrl(wallId: string, pin: string): string {
  const baseUrl =
    typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const wallUrl = `${baseUrl}/wall/${wallId}?pin=${pin}`

  // Using QR Server API for QR code generation
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(wallUrl)}`
}
