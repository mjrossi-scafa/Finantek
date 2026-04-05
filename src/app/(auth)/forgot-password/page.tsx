'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { EmailInput } from '@/components/ui/EmailInput'
import { toast } from 'sonner'
import { KatanaLogo } from '@/components/logo/katana-logo'
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Validar email antes de enviar
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('Ingresa un correo electrónico válido')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://finantek-omega.vercel.app'}/reset-password`
    })

    if (error) {
      toast.error('Error al enviar el correo', { description: error.message })
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="px-6 py-8 lg:px-0 lg:py-0">
        <div className="flex justify-center mb-8 lg:hidden">
          <div className="w-48">
            <KatanaLogo variant="sidebar" />
          </div>
        </div>

        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white mb-2">¡Listo! Revisa tu correo</h1>
            <p className="text-gray-400">
              Te enviamos las instrucciones a <span className="text-white font-medium">{email}</span>
            </p>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 hover:text-violet-light transition-colors font-medium"
            style={{ color: '#A855F7' }}
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="px-6 py-8 lg:px-0 lg:py-0">
      <div className="flex justify-center mb-8 lg:hidden">
        <div className="w-48">
          <KatanaLogo variant="sidebar" />
        </div>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl lg:text-2xl font-extrabold tracking-tight text-white">Recupera tu acceso</h1>
        <p className="text-gray-400 mt-1">Te enviaremos un enlace a tu correo</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <EmailInput value={email} onChange={setEmail} />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 lg:py-3 rounded-full font-semibold text-base lg:text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #6D28D9, #A855F7)' }}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Enviando...
            </div>
          ) : (
            'Enviar instrucciones'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 hover:text-violet-light transition-colors text-sm"
          style={{ color: '#A855F7' }}
        >
          <ArrowLeft className="h-4 w-4" />
          ← Volver al inicio de sesión
        </Link>
      </div>
    </div>
  )
}