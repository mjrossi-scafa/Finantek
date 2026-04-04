'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`
    })
    if (error) {
      setError('No pudimos enviar el correo. Intenta de nuevo.')
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-1/2 bg-[#0F0A1E] flex-col justify-center px-16"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(139,92,246,0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}>
        <p className="text-4xl font-black text-white">"El guerrero no</p>
        <p className="text-4xl font-black text-white">actúa sin plan."</p>
        <p className="text-purple-400 mt-4 text-sm">— Bushido financiero</p>
      </div>

      <div className="flex-1 bg-[#07050F] flex items-center justify-center px-8">
        <div className="w-full max-w-sm">
          {!success ? (
            <>
              <h1 className="text-2xl font-bold text-white mb-2">
                Recupera tu acceso
              </h1>
              <p className="text-gray-400 text-sm mb-8">
                Te enviaremos un enlace a tu correo.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-300 block mb-2">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
                {error && (
                  <p className="text-red-400 text-xs">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-full font-semibold text-white transition hover:opacity-90"
                  style={{background: 'linear-gradient(135deg, #6D28D9, #A855F7)'}}>
                  {loading ? 'Enviando...' : 'Enviar instrucciones'}
                </button>
              </form>
              <Link
                href="/login"
                className="block text-center mt-6 text-sm text-purple-400 hover:text-purple-300">
                ← Volver al inicio de sesión
              </Link>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                  stroke="#84CC16" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">¡Listo!</h2>
              <p className="text-gray-400 text-sm mb-1">Revisa tu correo.</p>
              <p className="text-gray-500 text-xs mb-8">
                Te enviamos las instrucciones a {email}
              </p>
              <Link
                href="/login"
                className="text-sm text-purple-400 hover:text-purple-300">
                ← Volver al inicio de sesión
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}