import { cn } from '@/lib/utils'

interface KatanaLogoProps {
  variant?: 'full' | 'sidebar' | 'icon' | 'retro' | 'retro-icon'
  className?: string
}

/**
 * KATANA LOGO
 *
 * Principal (Opción A): tipografía moderna con katana integrada sobre la "A"
 * - variant="full"      → Logo horizontal completo con subtítulo
 * - variant="sidebar"   → Logo horizontal para sidebar (sin subtítulo)
 * - variant="icon"      → Solo la "K" con katana atravesándola (favicon/app icon)
 *
 * Retro (pixel-art pulido): un solo violeta + acento verde
 * - variant="retro"     → Logo horizontal pixel pulido
 * - variant="retro-icon"→ K pixelada pulida
 */
export function KatanaLogo({ variant = 'sidebar', className }: KatanaLogoProps) {
  // ==========================
  // PRINCIPAL · Opción A
  // ==========================

  if (variant === 'full') {
    return (
      <div className={cn('inline-block', className)}>
        <svg width="100%" viewBox="0 0 520 160" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="katana-blade-full" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EDE9FE" />
              <stop offset="100%" stopColor="#C084FC" />
            </linearGradient>
          </defs>

          <text
            x="30"
            y="95"
            fontFamily="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif"
            fontSize="80"
            fontWeight="800"
            fill="#F8FAFC"
            letterSpacing="-4"
          >
            KATANA
          </text>

          {/* Katana diagonal sobre la primera A */}
          <g transform="translate(122 40) rotate(-50)">
            <rect x="-1.5" y="-30" width="3" height="52" rx="1.5" fill="url(#katana-blade-full)" />
            <polygon points="-1.5,-30 1.5,-30 0,-34" fill="#EDE9FE" />
            <path
              d="M 0 -24 Q 1 -12 0 0 Q 1 12 0 20"
              stroke="#A78BFA"
              strokeWidth="0.5"
              fill="none"
              opacity="0.6"
            />
            <rect x="-5" y="22" width="10" height="3" rx="0.5" fill="#7C3AED" />
            <rect x="-2.5" y="25" width="5" height="14" rx="1" fill="#1A0A2E" />
            <rect x="-2.5" y="27" width="5" height="1" fill="#4C1D95" opacity="0.8" />
            <rect x="-2.5" y="30" width="5" height="1" fill="#4C1D95" opacity="0.8" />
            <rect x="-2.5" y="33" width="5" height="1" fill="#4C1D95" opacity="0.8" />
            <rect x="-2.5" y="36" width="5" height="1" fill="#4C1D95" opacity="0.8" />
            <ellipse cx="0" cy="40" rx="3" ry="1.5" fill="#7C3AED" />
          </g>

          <rect x="30" y="110" width="392" height="1.5" fill="#7C3AED" opacity="0.3" rx="0.75" />

          <text
            x="30"
            y="135"
            fill="#C084FC"
            fontFamily="'JetBrains Mono', monospace"
            fontSize="11"
            fontWeight="500"
            letterSpacing="6"
          >
            FINANZAS · SAMURAI · DISCIPLINA
          </text>
        </svg>
      </div>
    )
  }

  if (variant === 'sidebar') {
    return (
      <div className={cn('inline-block min-w-[180px] max-w-[200px]', className)}>
        <svg width="100%" viewBox="0 0 485 90" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="katana-blade-side" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EDE9FE" />
              <stop offset="100%" stopColor="#C084FC" />
            </linearGradient>
          </defs>

          <text
            x="30"
            y="65"
            fontFamily="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif"
            fontSize="60"
            fontWeight="800"
            fill="#F8FAFC"
            letterSpacing="-3"
          >
            KATANA
          </text>

          <g transform="translate(100 25) rotate(-50)">
            <rect x="-1.2" y="-22" width="2.4" height="40" rx="1.2" fill="url(#katana-blade-side)" />
            <polygon points="-1.2,-22 1.2,-22 0,-25" fill="#EDE9FE" />
            <rect x="-4" y="18" width="8" height="2.5" rx="0.5" fill="#7C3AED" />
            <rect x="-2" y="20.5" width="4" height="10" rx="1" fill="#1A0A2E" />
            <rect x="-2" y="22" width="4" height="0.8" fill="#4C1D95" opacity="0.8" />
            <rect x="-2" y="24" width="4" height="0.8" fill="#4C1D95" opacity="0.8" />
            <rect x="-2" y="26" width="4" height="0.8" fill="#4C1D95" opacity="0.8" />
            <ellipse cx="0" cy="31" rx="2.5" ry="1.2" fill="#7C3AED" />
          </g>

          <rect x="30" y="75" width="300" height="1.5" fill="#7C3AED" opacity="0.3" rx="0.75" />
        </svg>
      </div>
    )
  }

  if (variant === 'icon') {
    return (
      <div className={cn('inline-block', className)}>
        <svg width="32" height="32" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="katana-blade-icon" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EDE9FE" />
              <stop offset="100%" stopColor="#C084FC" />
            </linearGradient>
          </defs>

          <text
            x="50"
            y="72"
            fontFamily="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif"
            fontSize="78"
            fontWeight="800"
            fill="#F8FAFC"
            textAnchor="middle"
            letterSpacing="-4"
          >
            K
          </text>

          <g transform="translate(50 50) rotate(-45)">
            <rect x="-1.5" y="-38" width="3" height="52" rx="1.5" fill="url(#katana-blade-icon)" />
            <polygon points="-1.5,-38 1.5,-38 0,-42" fill="#EDE9FE" />
            <rect x="-4.5" y="14" width="9" height="3" rx="0.5" fill="#7C3AED" />
            <rect x="-2.5" y="17" width="5" height="16" rx="1" fill="#1A0A2E" />
            <ellipse cx="0" cy="34" rx="3" ry="1.5" fill="#7C3AED" />
          </g>
        </svg>
      </div>
    )
  }

  // ==========================
  // RETRO · Pixel-art pulido
  // ==========================

  if (variant === 'retro') {
    return (
      <div className={cn('inline-block min-w-[160px] max-w-[160px]', className)}>
        <svg width="100%" height="auto" viewBox="0 0 485 110" xmlns="http://www.w3.org/2000/svg">
          <rect x="30" y="8" width="10" height="90" rx="3" fill="#C084FC" />
          <rect x="44" y="40" width="10" height="30" rx="3" fill="#C084FC" />
          <rect x="58" y="22" width="10" height="34" rx="3" fill="#C084FC" />
          <rect x="72" y="8" width="10" height="22" rx="3" fill="#C084FC" />
          <rect x="58" y="62" width="10" height="36" rx="3" fill="#C084FC" />
          <rect x="72" y="76" width="10" height="22" rx="3" fill="#C084FC" />
          <rect x="100" y="26" width="10" height="72" rx="3" fill="#C084FC" />
          <rect x="114" y="8" width="10" height="24" rx="3" fill="#C084FC" />
          <rect x="128" y="8" width="10" height="24" rx="3" fill="#C084FC" />
          <rect x="142" y="26" width="10" height="72" rx="3" fill="#C084FC" />
          <rect x="114" y="50" width="10" height="12" rx="3" fill="#C084FC" />
          <rect x="128" y="50" width="10" height="12" rx="3" fill="#C084FC" />
          <rect x="156" y="8" width="10" height="12" rx="3" fill="#C084FC" />
          <rect x="170" y="8" width="10" height="12" rx="3" fill="#C084FC" />
          <rect x="184" y="8" width="10" height="90" rx="3" fill="#C084FC" />
          <rect x="198" y="8" width="10" height="12" rx="3" fill="#C084FC" />
          <rect x="212" y="8" width="10" height="12" rx="3" fill="#C084FC" />
          <rect x="240" y="26" width="10" height="72" rx="3" fill="#C084FC" />
          <rect x="254" y="8" width="10" height="24" rx="3" fill="#C084FC" />
          <rect x="268" y="8" width="10" height="24" rx="3" fill="#C084FC" />
          <rect x="282" y="26" width="10" height="72" rx="3" fill="#C084FC" />
          <rect x="254" y="50" width="10" height="12" rx="3" fill="#C084FC" />
          <rect x="268" y="50" width="10" height="12" rx="3" fill="#C084FC" />
          <rect x="310" y="8" width="10" height="90" rx="3" fill="#C084FC" />
          <rect x="324" y="22" width="10" height="76" rx="3" fill="#C084FC" />
          <rect x="338" y="36" width="10" height="62" rx="3" fill="#C084FC" />
          <rect x="352" y="8" width="10" height="90" rx="3" fill="#C084FC" />
          <rect x="380" y="26" width="10" height="72" rx="3" fill="#C084FC" />
          <rect x="394" y="8" width="10" height="24" rx="3" fill="#C084FC" />
          <rect x="408" y="8" width="10" height="24" rx="3" fill="#C084FC" />
          <rect x="422" y="26" width="10" height="72" rx="3" fill="#C084FC" />
          <rect x="394" y="50" width="10" height="12" rx="3" fill="#C084FC" />
          <rect x="408" y="50" width="10" height="12" rx="3" fill="#C084FC" />
          <circle cx="445" cy="92" r="5" fill="#84CC16" />
        </svg>
      </div>
    )
  }

  if (variant === 'retro-icon') {
    return (
      <div className={cn('inline-block', className)}>
        <svg width="32" height="32" viewBox="0 0 90 110" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="8" width="10" height="90" rx="3" fill="#C084FC" />
          <rect x="18" y="40" width="10" height="30" rx="3" fill="#C084FC" />
          <rect x="32" y="22" width="10" height="34" rx="3" fill="#C084FC" />
          <rect x="46" y="8" width="10" height="22" rx="3" fill="#C084FC" />
          <rect x="32" y="62" width="10" height="36" rx="3" fill="#C084FC" />
          <rect x="46" y="76" width="10" height="22" rx="3" fill="#C084FC" />
          <circle cx="68" cy="92" r="6" fill="#84CC16" />
        </svg>
      </div>
    )
  }

  return null
}
