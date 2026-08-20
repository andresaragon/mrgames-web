"use server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { createClient } from "@/utils/supabase/server"
import { createAdminClient } from "@/utils/supabase/admin"

async function requireUser() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autorizado")
  return user
}

export async function createSharedAccount(formData: {
  platform: string
  identifier: string
  capacity: number
}) {
  await requireUser()
  const admin = createAdminClient()
  const { error } = await admin.from("shared_accounts").insert({
    platform: formData.platform,
    identifier: formData.identifier,
    capacity: formData.capacity,
  })
  if (error) throw new Error("No se pudo crear la cuenta compartida")
  revalidatePath("/admin")
}

export async function createSlot(formData: {
  sharedAccountId: string
  customerName: string
  customerPhone: string
  startsAt: string
  endsAt: string
}) {
  await requireUser()
  const admin = createAdminClient()
  const { data: account } = await admin
    .from("shared_accounts")
    .select("capacity")
    .eq("id", formData.sharedAccountId)
    .single()
  const { count } = await admin
    .from("account_slots")
    .select("id", { count: "exact", head: true })
    .eq("shared_account_id", formData.sharedAccountId)
    .eq("status", "active")
  if (account && count !== null && count >= account.capacity) {
    throw new Error("Esta cuenta ya no tiene cupos disponibles")
  }
  const { error } = await admin.from("account_slots").insert({
    shared_account_id: formData.sharedAccountId,
    customer_name: formData.customerName,
    customer_phone: formData.customerPhone,
    starts_at: formData.startsAt,
    ends_at: formData.endsAt,
    status: "active",
  })
  if (error) throw new Error("No se pudo crear el cupo")
  revalidatePath("/admin")
}