"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setError("")
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError("Correo o contraseña incorrectos")
      return
    }
    router.push("/admin")
    router.refresh()
  }

  return (
    <main className="mx-auto mt-16 max-w-sm p-6">
      <div className="card-glow rounded-xl p-6">
        <h1 className="font-display mb-6 text-center text-2xl font-bold uppercase">Acceso admin</h1>
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button onClick={handleLogin} disabled={loading} className="btn-primary w-full">
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </div>
      </div>
    </main>
  )
}