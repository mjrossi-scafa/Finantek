import { FinantekLogo } from '@/components/logo/finantek-logo'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.12),transparent_50%)]" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.03] rounded-full blur-3xl" />

        <div className="relative">
          <FinantekLogo variant="full" />
        </div>

        <div className="relative space-y-6">
          <h2 className="text-4xl font-extrabold leading-tight">
            Toma el control de tus finanzas personales
          </h2>
          <p className="text-lg text-white/70 max-w-md">
            Registra gastos, analiza tus habitos y recibe insights inteligentes con IA. Todo en pesos chilenos.
          </p>
          <div className="flex gap-6 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <span className="h-9 w-9 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
                📊
              </span>
              Dashboard inteligente
            </div>
            <div className="flex items-center gap-2">
              <span className="h-9 w-9 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
                🤖
              </span>
              Bot de Telegram
            </div>
            <div className="flex items-center gap-2">
              <span className="h-9 w-9 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
                📸
              </span>
              Escaneo de boletas
            </div>
          </div>
        </div>

        <p className="relative text-sm text-white/30">
          FINANTEK © 2024 · Powered by AI
        </p>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
