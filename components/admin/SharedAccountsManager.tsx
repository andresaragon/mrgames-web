"use client"
import NewSharedAccountForm from '@/components/admin/NewSharedAccountForm'
import NewSlotForm from '@/components/admin/NewSlotForm'

export interface SharedAccountUsage {
  id: string
  platform: string
  identifier: string
  capacity: number
  status: string
  used: number
  available: number
  slots: {
    id: string
    shared_account_id: string
    customer_name: string
    ends_at: string
    status: string
  }[]
}

interface SharedAccountsManagerProps {
  accounts: SharedAccountUsage[]
}

export default function SharedAccountsManager({ accounts }: SharedAccountsManagerProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-navy-700/80 bg-navy-900/50 p-6">
        <h2 className="font-display text-xl font-bold uppercase tracking-wide text-white mb-4">
          Registrar Nueva Cuenta Compartida
        </h2>
        <NewSharedAccountForm />
      </div>

      <div className="space-y-4">
        <h2 className="font-display text-xl font-bold uppercase tracking-wide text-white">
          Cuentas Activas y Cupos ({accounts.length})
        </h2>

        {accounts.length === 0 ? (
          <div className="card-glow rounded-xl p-8 text-center text-gray-500">
            No hay cuentas compartidas registradas en este momento.
          </div>
        ) : (
          accounts.map((account) => (
            <div key={account.id} className="card-glow rounded-xl p-5 border border-navy-700/80 bg-navy-900/40">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block rounded-full bg-navy-800 px-2.5 py-0.5 text-xs font-bold text-gray-300 border border-navy-700">
                    {account.platform}
                  </span>
                  <p className="font-mono text-sm font-semibold text-gray-200 mt-1">{account.identifier}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    account.available > 0
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                      : 'bg-red-950/80 text-red-300 border border-red-500/40'
                  }`}>
                    {account.used}/{account.capacity} cupos ocupados
                  </span>
                  <p className="text-[11px] text-gray-500 mt-1">
                    {account.available > 0 ? `${account.available} disponibles` : 'Agotada'}
                  </p>
                </div>
              </div>

              {account.slots.length > 0 && (
                <div className="mt-4 pt-3 border-t border-navy-800/80">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    Clientes asignados:
                  </p>
                  <ul className="space-y-1.5 text-xs text-gray-300">
                    {account.slots.map((slot) => (
                      <li key={slot.id} className="flex items-center justify-between rounded bg-navy-950/50 px-3 py-1.5 border border-navy-800">
                        <span className="font-medium text-gray-200">👤 {slot.customer_name}</span>
                        <span className="text-gray-400">
                          Vence: {new Date(slot.ends_at).toLocaleDateString('es-CO')}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-navy-800/80">
                {account.available > 0 ? (
                  <NewSlotForm sharedAccountId={account.id} />
                ) : (
                  <p className="text-xs font-semibold text-red-400">
                    ⚠️ Cuenta con capacidad completa. No admite más cupos activos.
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
