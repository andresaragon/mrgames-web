import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { requireAdmin } from '@/utils/supabase/require-admin'
import { getAdminProducts } from '@/app/admin/actions'
import AdminDashboard from '@/components/admin/AdminDashboard'

export default async function AdminPage() {
  const user = await requireAdmin()
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // 1. Cargar datos iniciales del catálogo
  const initialCatalogData = await getAdminProducts({ page: 1, pageSize: 25 })

  // 2. Cargar cuentas compartidas y cupos
  const { data: accounts } = await supabase
    .from('shared_accounts')
    .select('id, platform, identifier, capacity, status')
    .order('created_at', { ascending: false })

  const { data: slots } = await supabase
    .from('account_slots')
    .select('id, shared_account_id, customer_name, ends_at, status')
    .eq('status', 'active')

  const accountsWithUsage = (accounts ?? []).map((account) => {
    const activeSlots = (slots ?? []).filter((s) => s.shared_account_id === account.id)
    return {
      ...account,
      used: activeSlots.length,
      available: account.capacity - activeSlots.length,
      slots: activeSlots,
    }
  })

  return (
    <AdminDashboard
      userEmail={user.email}
      initialCatalogData={initialCatalogData}
      accounts={accountsWithUsage}
    />
  )
}