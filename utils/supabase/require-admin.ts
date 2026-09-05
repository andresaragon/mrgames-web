import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

/**
 * Enforces server-side administrative authorization using Supabase Auth and
 * public.is_admin(). The browser never supplies the identity or role.
 */
export async function requireAdmin() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/login")
  }

  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin")
  if (adminError || isAdmin !== true) {
    redirect("/")
  }

  return user
}
