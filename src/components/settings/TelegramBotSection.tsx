'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { GradientButton } from '@/components/shared/GradientButton'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Bot, Copy, RotateCcw, Unlink } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface TelegramBotSectionProps {
  userId: string
}

interface TelegramUser {
  telegram_username?: string
}

export function TelegramBotSection({ userId }: TelegramBotSectionProps) {
  const [isLinked, setIsLinked] = useState(false)
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null)
  const [linkCode, setLinkCode] = useState<string>('')
  const [codeExpires, setCodeExpires] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    checkLinkStatus()
  }, [])

  async function checkLinkStatus() {
    setLoading(true)

    // Check if user is linked
    const { data: telegramLink } = await supabase
      .from('telegram_users')
      .select('telegram_username')
      .eq('user_id', userId)
      .single()

    if (telegramLink) {
      setIsLinked(true)
      setTelegramUser(telegramLink)
    } else {
      // Check for existing code
      const { data: profile } = await supabase
        .from('profiles')
        .select('telegram_link_code, telegram_link_expires_at')
        .eq('id', userId)
        .single()

      if (profile?.telegram_link_code && profile?.telegram_link_expires_at) {
        const expires = new Date(profile.telegram_link_expires_at)
        if (expires > new Date()) {
          setLinkCode(profile.telegram_link_code)
          setCodeExpires(expires)
        }
      }
    }

    setLoading(false)
  }

  async function generateCode() {
    setGenerating(true)

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    const { error } = await supabase
      .from('profiles')
      .update({
        telegram_link_code: code,
        telegram_link_expires_at: expires.toISOString()
      })
      .eq('id', userId)

    if (error) {
      toast.error('Error al generar código')
    } else {
      setLinkCode(code)
      setCodeExpires(expires)
      toast.success('Código generado')
    }

    setGenerating(false)
  }

  async function unlinkBot() {
    const { error } = await supabase
      .from('telegram_users')
      .delete()
      .eq('user_id', userId)

    if (error) {
      toast.error('Error al desvincular')
    } else {
      setIsLinked(false)
      setTelegramUser(null)
      toast.success('Bot desvinculado')
      router.refresh()
    }
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(linkCode)
      toast.success('Código copiado')
    } catch {
      toast.error('Error al copiar')
    }
  }

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-white/10 rounded w-32"></div>
          <div className="h-20 bg-white/10 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Bot className="h-4 w-4 text-violet-primary" />
        <h2 className="text-sm font-bold text-text-primary">Bot de Telegram</h2>
      </div>

      {isLinked ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-success/10 border border-success/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-success"></div>
              <span className="text-sm font-medium text-success">Bot vinculado</span>
            </div>
            {telegramUser?.telegram_username && (
              <p className="text-xs text-text-secondary">
                Usuario: @{telegramUser.telegram_username}
              </p>
            )}
            <p className="text-xs text-text-secondary mt-1">
              Puedes enviar gastos y recibos a @risky_finance_bot
            </p>
          </div>

          <Button
            variant="outline"
            onClick={unlinkBot}
            className="w-full text-danger hover:bg-danger/10 border-danger/20"
          >
            <Unlink className="h-4 w-4 mr-2" />
            Desvincular bot
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {linkCode ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-violet-primary/10 border border-violet-primary/20">
                <p className="text-sm font-medium text-text-primary mb-3">
                  Envía este código a @risky_finance_bot:
                </p>
                <div className="flex items-center gap-2 mb-3">
                  <div className="font-mono text-4xl font-bold text-violet-primary bg-white/10 px-4 py-2 rounded-lg flex-1 text-center">
                    {linkCode}
                  </div>
                  <Button variant="outline" size="sm" onClick={copyCode}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                {codeExpires && (
                  <div className="text-xs text-text-secondary">
                    Expira: {codeExpires.toLocaleString('es')}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={generateCode}
                  disabled={generating}
                  className="flex-1"
                >
                  <RotateCcw className={`h-4 w-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
                  {generating ? 'Generando...' : 'Regenerar código'}
                </Button>
                <Button
                  onClick={() => window.open(`https://t.me/risky_finance_bot?start=${linkCode}`, '_blank')}
                  className="flex-1"
                >
                  <Bot className="h-4 w-4 mr-2" />
                  Abrir bot
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-surface-subtle border border-surface-border">
                <p className="text-sm text-text-secondary mb-2">
                  Conecta el bot de Telegram para registrar gastos desde cualquier lugar.
                </p>
                <p className="text-xs text-text-tertiary">
                  Bot: @risky_finance_bot
                </p>
              </div>

              <GradientButton onClick={generateCode} disabled={generating} fullWidth>
                <Bot className="h-4 w-4 mr-2" />
                Generar código de vinculación
              </GradientButton>
            </div>
          )}
        </div>
      )}
    </div>
  )
}