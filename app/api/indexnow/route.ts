import { NextRequest, NextResponse } from "next/server"

/**
 * IndexNow endpoint for Bing and other search engines.
 * Called by search engines to verify the site owns the submitted URLs.
 * Returns 200 OK with the provided key for verification.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const key = url.searchParams.get("key")

  // IndexNow key file: https://www.digitalmenue.com/xxxxxxxx.txt
  if (key) {
    return new NextResponse(key, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    })
  }

  return NextResponse.json({ status: "ok" })
}
