"use client"
import { useState } from "react"
import { createSharedAccount } from "@/app/admin/actions"

export default function NewSharedAccountForm() {
  const [platform, setPlatform] = useState("")
  const [identifier, setIdentifier] = useState("")
  const [capacity, setCapacity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (!platform || !identifier) {
      setError("Completa plataforma y correo/usuario de la cuenta")
      return
    }
    setLoading(true)
    setError("")
    try {
      await createSharedAccount({ platform, identifier, capacity })
      setPlatform("")
      setIdentifier("")
      setCapacity(1)
    } catch {
      setError("No se pudo crear la cuenta")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card-glow rounded-xl p-4">
      <p className="mb-3 font-semibold">Agregar cuenta compartida</p>
      <div className="flex flex-wrap gap-3">
        <input
          placeholder="Plataforma (ej. Xbox Game Pass Ultimate)"
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="input-field min-w-[200px] flex-1"
        />
        <input
          placeholder="Correo/usuario de la cuenta"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="input-field min-w-[200px] flex-1"
        />
        <input
          type="number"
          min={1}
          value={capacity}
          onChange={(e) => setCapacity(Number(e.target.value))}
          className="input-field w-24"
        />
      </div>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      <button onClick={handleSubmit} disabled={loading} className="btn-primary mt-3">
        {loading ? "Guardando..." : "Agregar cuenta"}
      </button>
    </div>
  )
}