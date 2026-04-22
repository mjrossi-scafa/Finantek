'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { KatanaLogo } from '@/components/logo/katana-logo'
import { Lock, Eye, EyeOff, Loader2, CheckCircle, ArrowLeft } from 'lucide-react'
import { translateAuthError } from '@/lib/utils/authErrors'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [validSession, setValidSession] = useState<boolean | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Verify the user has a valid session from the email link
  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession()
      setValidSession(!!session)
    }
    checkSession()
  }, [supabase])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      toast.error(translateAuthError(error))
    } else {
      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
        router.refresh()
      }, 2500)
    }
    setLoading(false)
  }

  // Loading state while checking session
  if (validSession === null) {
    return (
      <div className="px-6 py-8 lg:px-0 lg:py-0 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
      </div>
    )
  }

  // Invalid session (link expired or not coming from email)
  if (validSession === false) {
    return (
      <div className="px-6 py-8 lg:px-0 lg:py-0">
        <div className="flex justify-center mb-8 lg:hidden">
          <div className="w-48">
            <KatanaLogo variant="sidebar" />
          </div>
        </div>

        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-vermillion-shu/20 flex items-center justify-center">
              <Lock className="h-8 w-8 text-vermillion-shu" />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Enlace inválido o expirado</h1>
            <p className="text-gray-400">
              El enlace para restablecer tu contraseña ya no es válido. Solicita uno nuevo.
            </p>
          </div>

          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #6D28D9, #A855F7)' }}
          >
            Solicitar nuevo enlace
          </Link>

          <div>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm hover:text-violet-light transition-colors"
              style={{ color: '#A855F7' }}
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Success state
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
            <h1 className="text-2xl font-bold tracking-tight text-white mb-2">¡Contraseña actualizada!</h1>
            <p className="text-gray-400">
              Tu contraseña ha sido cambiada exitosamente.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Redirigiendo al inicio de sesión...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Main form
  return (
    <div className="px-6 py-8 lg:px-0 lg:py-0">
      <div className="flex justify-center mb-8 lg:hidden">
        <div className="w-48">
          <KatanaLogo variant="sidebar" />
        </div>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white">Nueva contraseña</h1>
        <p className="text-gray-400 mt-1">Elige una contraseña segura</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-300 text-sm font-medium">Nueva contraseña</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="pl-10 pr-10 h-12 py-4 lg:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-base lg:text-sm"
              required
              minLength={6}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-gray-300 text-sm font-medium">Confirmar contraseña</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite la contraseña"
              className="pl-10 h-12 py-4 lg:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-base lg:text-sm"
              required
              minLength={6}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !password || !confirmPassword}
          className="w-full py-4 lg:py-3 rounded-full font-semibold text-base lg:text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg, #6D28D9, #A855F7)' }}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Actualizando...
            </div>
          ) : (
            'Actualizar contraseña'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-400">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 hover:text-violet-light transition-colors"
          style={{ color: '#A855F7' }}
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al login
        </Link>
      </p>
    </div>
  )
}
