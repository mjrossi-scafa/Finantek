'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { EmailInput } from '@/components/ui/EmailInput'
import { toast } from 'sonner'
import { KatanaLogo } from '@/components/logo/katana-logo'
import { ArrowLeft, CheckCircle, Loader2, Mail } from 'lucide-react'
import { translateAuthError } from '@/lib/utils/authErrors'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('Ingresa un correo electrónico válido')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      toast.error(translateAuthError(error))
    } else {
      setSuccess(true)
      startCooldown()
    }
    setLoading(false)
  }

  function startCooldown() {
    setCooldown(60)
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  async function resend() {
    if (cooldown > 0) return
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) {
      toast.error(translateAuthError(error))
    } else {
      toast.success('Correo reenviado ✓')
      startCooldown()
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
            <h1 className="text-2xl font-bold tracking-tight text-white mb-2">¡Listo! Revisa tu correo</h1>
            <p className="text-gray-400">
              Te enviamos las instrucciones a <span className="text-white font-medium">{email}</span>
            </p>
            <p className="text-xs text-gray-500 mt-3">
              El enlace expira en 1 hora. Revisa también tu carpeta de spam.
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <button
              onClick={resend}
              disabled={loading || cooldown > 0}
              className="text-sm font-semibold hover:text-violet-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ color: '#A855F7' }}
            >
              {loading ? (
                <span className="inline-flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Reenviando...
                </span>
              ) : cooldown > 0 ? (
                `Reenviar en ${cooldown}s`
              ) : (
                'Reenviar correo'
              )}
            </button>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm hover:text-violet-light transition-colors font-medium"
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
        <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center mb-4">
          <Mail className="h-6 w-6 text-violet-300" />
        </div>
        <h1 className="text-2xl lg:text-2xl font-bold tracking-tight text-white">Recupera tu acceso</h1>
        <p className="text-gray-400 mt-1">Te enviaremos un enlace para crear una nueva contraseña</p>
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
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  )
}
