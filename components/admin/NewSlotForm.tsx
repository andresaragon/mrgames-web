"use client"
import { useState } from "react"
import { createSlot } from "@/app/admin/actions"

export default function NewSlotForm({ sharedAccountId }: { sharedAccountId: string }) {
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [startsAt, setStartsAt] = useState("")
  const [endsAt, setEndsAt] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (!customerName || !customerPhone || !startsAt || !endsAt) {
      setError("Completa todos los campos")
      return
    }
    setLoading(true)
    setError("")
    try {
      await createSlot({ sharedAccountId, customerName, customerPhone, startsAt, endsAt })
      setCustomerName("")
      setCustomerPhone("")
      setStartsAt("")
      setEndsAt("")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo asignar el cupo")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-4 border-t border-navy-700 pt-3">
      <p className="mb-2 text-sm font-semibold">Asignar cupo</p>
      <div className="flex flex-wrap gap-2">
        <input
          placeholder="Nombre cliente"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="input-field min-w-[140px] flex-1 text-sm"
        />
        <input
          placeholder="Teléfono"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          className="input-field min-w-[140px] flex-1 text-sm"
        />
        <input
          type="date"
          value={startsAt}
          onChange={(e) => setStartsAt(e.target.value)}
          className="input-field text-sm"
        />
        <input
          type="date"
          value={endsAt}
          onChange={(e) => setEndsAt(e.target.value)}
          className="input-field text-sm"
        />
      </div>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      <button onClick={handleSubmit} disabled={loading} className="btn-secondary mt-2 text-sm">
        {loading ? "Guardando..." : "Asignar"}
      </button>
    </div>
  )
}