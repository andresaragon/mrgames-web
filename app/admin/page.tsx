import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { requireAdmin } from '@/utils/supabase/require-admin'
import NewSharedAccountForm from '@/components/admin/NewSharedAccountForm'
import NewSlotForm from '@/components/admin/NewSlotForm'

export default async function AdminPage() {
  await requireAdmin()
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
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
    return { ...account, used: activeSlots.length, available: account.capacity - activeSlots.length, slots: activeSlots }
  })
  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="font-display mb-6 text-2xl font-bold uppercase">Cuentas compartidas</h1>
      <NewSharedAccountForm />
      <div className="mt-8 space-y-6">
        {accountsWithUsage.map((account) => (
          <div key={account.id} className="card-glow rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold">{account.platform}</p>
                <p className="text-sm text-gray-500">{account.identifier}</p>
              </div>
              <p className="text-sm text-gray-400">{account.used}/{account.capacity} cupos ocupados</p>
            </div>
            <ul className="mt-3 space-y-1 text-sm text-gray-400">
              {account.slots.map((slot) => (
                <li key={slot.id}>{slot.customer_name} — hasta {new Date(slot.ends_at).toLocaleDateString('es-CO')}</li>
              ))}
            </ul>
            {account.available > 0 ? (
              <NewSlotForm sharedAccountId={account.id} />
            ) : (
              <p className="mt-3 text-sm text-red-400">Sin cupos disponibles</p>
            )}
          </div>
        ))}
      </div>
    </main>
  )
}