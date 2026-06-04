import { createClient } from "@/lib/supabase/server"
import SuperAdminClient from "./SuperAdminClient"

export const dynamic = "force-dynamic"

export default async function SuperAdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const currentEmail = user?.email || ""

  return <SuperAdminClient currentUserEmail={currentEmail} />
}
