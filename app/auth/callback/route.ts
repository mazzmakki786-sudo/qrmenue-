import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const redirectParam = searchParams.get("redirect")

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Check restaurant ownership for smarter redirect
        const { data: restaurant } = await supabase
          .from("restaurants")
          .select("id")
          .eq("owner_id", user.id)
          .maybeSingle()
        const isOwner = !!restaurant

        if (redirectParam) {
          // Explicit dashboard/signup redirects should be trusted as-is
          if (redirectParam.startsWith("/dashboard") || redirectParam.startsWith("/signup")) {
            return NextResponse.redirect(`${origin}${redirectParam}`)
          }
          // Restaurant owners should never be sent to customer-side pages
          if (isOwner) {
            return NextResponse.redirect(`${origin}/dashboard`)
          }
          // Non-owners follow the original redirect param
          return NextResponse.redirect(`${origin}${redirectParam}`)
        }

        // No redirect param — standard logic
        // For non-owners (new Google signups), send to signup page, not customer side
        const redirectTo = isOwner ? "/dashboard" : "/signup/restaurant"
        return NextResponse.redirect(`${origin}${redirectTo}`)
      }
    }
  }

  // On failure, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
