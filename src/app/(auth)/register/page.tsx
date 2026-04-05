'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EmailInput } from '@/components/ui/EmailInput'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { toast } from 'sonner'
import { KatanaLogo } from '@/components/logo/katana-logo'
import { Loader2, User } from 'lucide-react'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('Ingresa un correo electrónico válido')
      return
    }

    // Validar contraseña
    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    if (!name.trim()) {
      toast.error('Ingresa tu nombre')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name } },
    })
    if (error) {
      toast.error('Error al registrarse', { description: error.message })
    } else {
      toast.success('¡Cuenta creada!')
      router.push('/dashboard')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="px-6 py-8 lg:px-0 lg:py-0">
      <div className="flex justify-center mb-8 lg:hidden">
        <div className="w-48">
          <KatanaLogo variant="sidebar" />
        </div>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl lg:text-2xl font-extrabold tracking-tight text-white">Crea tu cuenta</h1>
        <p className="text-gray-400 mt-1">Empieza a controlar tus finanzas hoy</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-gray-300 text-sm font-medium">Nombre</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              className="pl-10 h-12 py-4 lg:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-base lg:text-sm"
            />
          </div>
        </div>

        <EmailInput value={email} onChange={setEmail} />

        <PasswordInput
          value={password}
          onChange={setPassword}
          showRequirements={true}
        />

        <PasswordInput
          value={confirmPassword}
          onChange={setConfirmPassword}
          label="Confirmar contraseña"
          placeholder="Confirma tu contraseña"
          showRequirements={false}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 lg:py-3 rounded-full font-semibold text-base lg:text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #6D28D9, #A855F7)' }}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Creando cuenta...
            </div>
          ) : (
            'Crear cuenta'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-400">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="font-semibold hover:text-violet-light transition-colors" style={{ color: '#A855F7' }}>
          Inicia sesión
        </Link>
      </p>
    </div>
  )
}
