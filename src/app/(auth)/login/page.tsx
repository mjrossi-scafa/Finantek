'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { GradientButton } from '@/components/shared/GradientButton'
import { FinantekLogo } from '@/components/logo/finantek-logo'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error('Error al iniciar sesion', { description: error.message })
    } else {
      router.push('/dashboard')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div>
      <div className="mb-8 lg:hidden">
        <FinantekLogo variant="sidebar" />
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">Bienvenido de vuelta</h1>
        <p className="text-text-secondary mt-1">Ingresa tus credenciales para continuar</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-text-secondary text-sm font-medium">Correo electronico</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className="h-12 bg-surface border-surface-border text-text-primary placeholder:text-text-tertiary rounded-xl focus:border-violet-primary focus:ring-violet-primary/20"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-text-secondary text-sm font-medium">Contrasena</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="h-12 bg-surface border-surface-border text-text-primary placeholder:text-text-tertiary rounded-xl focus:border-violet-primary focus:ring-violet-primary/20"
            required
          />
        </div>
        <GradientButton type="submit" loading={loading} fullWidth size="lg">
          Iniciar sesion
        </GradientButton>
      </form>

      <p className="mt-6 text-center text-sm text-text-tertiary">
        ¿No tienes cuenta?{' '}
        <Link href="/register" className="font-semibold text-violet-light hover:text-violet-primary transition-colors">
          Registrate
        </Link>
      </p>
    </div>
  )
}
