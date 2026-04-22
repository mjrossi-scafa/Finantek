import { cn } from '@/lib/utils'

interface KatanaLogoProps {
  variant?: 'full' | 'sidebar' | 'icon'
  className?: string
}

/**
 * KATANA LOGO · Premium Pixel
 *
 * Pixel-art refinado con:
 * - Gradiente vertical en cada bloque (claro arriba → oscuro abajo)
 * - Highlight top y shadow bottom (profundidad)
 * - Hamon diagonal sutil (sugiere corte de katana)
 * - Baseline con gradiente + shimmer dots
 * - Green dot triple capa (glow + sólido + highlight)
 * - Kanji 武 (bu) sub-sutil como easter egg
 * - N con diagonal clara conectada
 */
export function KatanaLogo({ variant = 'sidebar', className }: KatanaLogoProps) {
  if (variant === 'full') {
    return (
      <div className={cn('inline-block', className)}>
        <svg width="100%" viewBox="0 0 520 160" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="kl-block-full" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D8B4FE" />
              <stop offset="50%" stopColor="#C084FC" />
              <stop offset="100%" stopColor="#A855F7" />
            </linearGradient>
            <linearGradient id="kl-hl-full" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EDE9FE" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#EDE9FE" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="kl-sh-full" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5B21B6" stopOpacity="0" />
              <stop offset="100%" stopColor="#5B21B6" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="kl-base-full" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#7C3AED" stopOpacity="0" />
              <stop offset="50%" stopColor="#C084FC" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="kl-hamon-full" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#EDE9FE" stopOpacity="0" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#EDE9FE" stopOpacity="0" />
            </linearGradient>
            <filter id="kl-glow-full" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>
          {/* K */}
          <rect x="30" y="8" width="10" height="90" rx="3" fill="url(#kl-block-full)" />
          <rect x="30" y="8" width="10" height="3" rx="1" fill="url(#kl-hl-full)" />
          <rect x="30" y="93" width="10" height="5" rx="1" fill="url(#kl-sh-full)" />
          <rect x="44" y="40" width="10" height="30" rx="3" fill="url(#kl-block-full)" />
          <rect x="58" y="22" width="10" height="34" rx="3" fill="url(#kl-block-full)" />
          <rect x="72" y="8" width="10" height="22" rx="3" fill="url(#kl-block-full)" />
          <rect x="72" y="8" width="10" height="3" rx="1" fill="url(#kl-hl-full)" />
          <rect x="58" y="62" width="10" height="36" rx="3" fill="url(#kl-block-full)" />
          <rect x="72" y="76" width="10" height="22" rx="3" fill="url(#kl-block-full)" />
          <rect x="72" y="93" width="10" height="5" rx="1" fill="url(#kl-sh-full)" />
          {/* A */}
          <rect x="100" y="26" width="10" height="72" rx="3" fill="url(#kl-block-full)" />
          <rect x="100" y="26" width="10" height="3" rx="1" fill="url(#kl-hl-full)" />
          <rect x="100" y="93" width="10" height="5" rx="1" fill="url(#kl-sh-full)" />
          <rect x="114" y="8" width="10" height="24" rx="3" fill="url(#kl-block-full)" />
          <rect x="114" y="8" width="10" height="3" rx="1" fill="url(#kl-hl-full)" />
          <rect x="128" y="8" width="10" height="24" rx="3" fill="url(#kl-block-full)" />
          <rect x="128" y="8" width="10" height="3" rx="1" fill="url(#kl-hl-full)" />
          <rect x="142" y="26" width="10" height="72" rx="3" fill="url(#kl-block-full)" />
          <rect x="142" y="26" width="10" height="3" rx="1" fill="url(#kl-hl-full)" />
          <rect x="142" y="93" width="10" height="5" rx="1" fill="url(#kl-sh-full)" />
          <rect x="114" y="50" width="10" height="12" rx="3" fill="url(#kl-block-full)" />
          <rect x="128" y="50" width="10" height="12" rx="3" fill="url(#kl-block-full)" />
          {/* T */}
          <rect x="156" y="8" width="10" height="12" rx="3" fill="url(#kl-block-full)" />
          <rect x="170" y="8" width="10" height="12" rx="3" fill="url(#kl-block-full)" />
          <rect x="184" y="8" width="10" height="90" rx="3" fill="url(#kl-block-full)" />
          <rect x="184" y="8" width="10" height="3" rx="1" fill="url(#kl-hl-full)" />
          <rect x="184" y="93" width="10" height="5" rx="1" fill="url(#kl-sh-full)" />
          <rect x="198" y="8" width="10" height="12" rx="3" fill="url(#kl-block-full)" />
          <rect x="212" y="8" width="10" height="12" rx="3" fill="url(#kl-block-full)" />
          {/* A */}
          <rect x="240" y="26" width="10" height="72" rx="3" fill="url(#kl-block-full)" />
          <rect x="240" y="26" width="10" height="3" rx="1" fill="url(#kl-hl-full)" />
          <rect x="240" y="93" width="10" height="5" rx="1" fill="url(#kl-sh-full)" />
          <rect x="254" y="8" width="10" height="24" rx="3" fill="url(#kl-block-full)" />
          <rect x="268" y="8" width="10" height="24" rx="3" fill="url(#kl-block-full)" />
          <rect x="282" y="26" width="10" height="72" rx="3" fill="url(#kl-block-full)" />
          <rect x="282" y="26" width="10" height="3" rx="1" fill="url(#kl-hl-full)" />
          <rect x="282" y="93" width="10" height="5" rx="1" fill="url(#kl-sh-full)" />
          <rect x="254" y="50" width="10" height="12" rx="3" fill="url(#kl-block-full)" />
          <rect x="268" y="50" width="10" height="12" rx="3" fill="url(#kl-block-full)" />
          {/* N fixeada */}
          <rect x="310" y="8" width="10" height="90" rx="3" fill="url(#kl-block-full)" />
          <rect x="310" y="8" width="10" height="3" rx="1" fill="url(#kl-hl-full)" />
          <rect x="310" y="93" width="10" height="5" rx="1" fill="url(#kl-sh-full)" />
          <rect x="324" y="14" width="10" height="34" rx="3" fill="url(#kl-block-full)" />
          <rect x="324" y="14" width="10" height="3" rx="1" fill="url(#kl-hl-full)" />
          <rect x="338" y="34" width="10" height="34" rx="3" fill="url(#kl-block-full)" />
          <rect x="338" y="58" width="10" height="34" rx="3" fill="url(#kl-block-full)" />
          <rect x="352" y="8" width="10" height="90" rx="3" fill="url(#kl-block-full)" />
          <rect x="352" y="8" width="10" height="3" rx="1" fill="url(#kl-hl-full)" />
          <rect x="352" y="93" width="10" height="5" rx="1" fill="url(#kl-sh-full)" />
          {/* A */}
          <rect x="380" y="26" width="10" height="72" rx="3" fill="url(#kl-block-full)" />
          <rect x="380" y="26" width="10" height="3" rx="1" fill="url(#kl-hl-full)" />
          <rect x="380" y="93" width="10" height="5" rx="1" fill="url(#kl-sh-full)" />
          <rect x="394" y="8" width="10" height="24" rx="3" fill="url(#kl-block-full)" />
          <rect x="408" y="8" width="10" height="24" rx="3" fill="url(#kl-block-full)" />
          <rect x="422" y="26" width="10" height="72" rx="3" fill="url(#kl-block-full)" />
          <rect x="422" y="26" width="10" height="3" rx="1" fill="url(#kl-hl-full)" />
          <rect x="422" y="93" width="10" height="5" rx="1" fill="url(#kl-sh-full)" />
          <rect x="394" y="50" width="10" height="12" rx="3" fill="url(#kl-block-full)" />
          <rect x="408" y="50" width="10" height="12" rx="3" fill="url(#kl-block-full)" />
          <line x1="10" y1="118" x2="440" y2="-10" stroke="url(#kl-hamon-full)" strokeWidth="1" opacity="0.4" />
          <rect x="20" y="108" width="420" height="1.5" fill="url(#kl-base-full)" rx="0.75" />
          <circle cx="80" cy="108.75" r="0.8" fill="#C084FC" opacity="0.5" />
          <circle cx="200" cy="108.75" r="0.8" fill="#C084FC" opacity="0.5" />
          <circle cx="320" cy="108.75" r="0.8" fill="#C084FC" opacity="0.5" />
          <circle cx="448" cy="94" r="8" fill="#84CC16" opacity="0.3" filter="url(#kl-glow-full)" />
          <circle cx="448" cy="94" r="5" fill="#84CC16" />
          <circle cx="448" cy="94" r="3" fill="#A3E635" />
          <circle cx="447" cy="93" r="1.2" fill="#FFFFFF" opacity="0.9" />
          <text x="450" y="128" fontFamily="monospace" fontSize="7" fill="#5B21B6" opacity="0.6">武</text>
          <text x="30" y="145" fill="#C084FC" fontFamily="monospace" fontSize="10" fontWeight="500" letterSpacing="5" opacity="0.6">FINANZAS · SAMURAI · DISCIPLINA</text>
        </svg>
      </div>
    )
  }

  if (variant === 'sidebar') {
    return (
      <div className={cn('inline-block min-w-[200px] max-w-[220px]', className)}>
        <svg width="100%" height="auto" viewBox="0 0 485 130" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="kl-block-side" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D8B4FE" />
              <stop offset="50%" stopColor="#C084FC" />
              <stop offset="100%" stopColor="#A855F7" />
            </linearGradient>
            <linearGradient id="kl-hl-side" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EDE9FE" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#EDE9FE" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="kl-sh-side" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5B21B6" stopOpacity="0" />
              <stop offset="100%" stopColor="#5B21B6" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="kl-base-side" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#7C3AED" stopOpacity="0" />
              <stop offset="50%" stopColor="#C084FC" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="kl-hamon-side" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#EDE9FE" stopOpacity="0" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#EDE9FE" stopOpacity="0" />
            </linearGradient>
            <filter id="kl-glow-side" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>
          {/* K */}
          <rect x="30" y="8" width="10" height="90" rx="3" fill="url(#kl-block-side)" />
          <rect x="30" y="8" width="10" height="3" rx="1" fill="url(#kl-hl-side)" />
          <rect x="30" y="93" width="10" height="5" rx="1" fill="url(#kl-sh-side)" />
          <rect x="44" y="40" width="10" height="30" rx="3" fill="url(#kl-block-side)" />
          <rect x="58" y="22" width="10" height="34" rx="3" fill="url(#kl-block-side)" />
          <rect x="72" y="8" width="10" height="22" rx="3" fill="url(#kl-block-side)" />
          <rect x="72" y="8" width="10" height="3" rx="1" fill="url(#kl-hl-side)" />
          <rect x="58" y="62" width="10" height="36" rx="3" fill="url(#kl-block-side)" />
          <rect x="72" y="76" width="10" height="22" rx="3" fill="url(#kl-block-side)" />
          <rect x="72" y="93" width="10" height="5" rx="1" fill="url(#kl-sh-side)" />
          {/* A */}
          <rect x="100" y="26" width="10" height="72" rx="3" fill="url(#kl-block-side)" />
          <rect x="100" y="26" width="10" height="3" rx="1" fill="url(#kl-hl-side)" />
          <rect x="100" y="93" width="10" height="5" rx="1" fill="url(#kl-sh-side)" />
          <rect x="114" y="8" width="10" height="24" rx="3" fill="url(#kl-block-side)" />
          <rect x="114" y="8" width="10" height="3" rx="1" fill="url(#kl-hl-side)" />
          <rect x="128" y="8" width="10" height="24" rx="3" fill="url(#kl-block-side)" />
          <rect x="128" y="8" width="10" height="3" rx="1" fill="url(#kl-hl-side)" />
          <rect x="142" y="26" width="10" height="72" rx="3" fill="url(#kl-block-side)" />
          <rect x="142" y="26" width="10" height="3" rx="1" fill="url(#kl-hl-side)" />
          <rect x="142" y="93" width="10" height="5" rx="1" fill="url(#kl-sh-side)" />
          <rect x="114" y="50" width="10" height="12" rx="3" fill="url(#kl-block-side)" />
          <rect x="128" y="50" width="10" height="12" rx="3" fill="url(#kl-block-side)" />
          {/* T */}
          <rect x="156" y="8" width="10" height="12" rx="3" fill="url(#kl-block-side)" />
          <rect x="170" y="8" width="10" height="12" rx="3" fill="url(#kl-block-side)" />
          <rect x="184" y="8" width="10" height="90" rx="3" fill="url(#kl-block-side)" />
          <rect x="184" y="8" width="10" height="3" rx="1" fill="url(#kl-hl-side)" />
          <rect x="184" y="93" width="10" height="5" rx="1" fill="url(#kl-sh-side)" />
          <rect x="198" y="8" width="10" height="12" rx="3" fill="url(#kl-block-side)" />
          <rect x="212" y="8" width="10" height="12" rx="3" fill="url(#kl-block-side)" />
          {/* A */}
          <rect x="240" y="26" width="10" height="72" rx="3" fill="url(#kl-block-side)" />
          <rect x="240" y="26" width="10" height="3" rx="1" fill="url(#kl-hl-side)" />
          <rect x="240" y="93" width="10" height="5" rx="1" fill="url(#kl-sh-side)" />
          <rect x="254" y="8" width="10" height="24" rx="3" fill="url(#kl-block-side)" />
          <rect x="268" y="8" width="10" height="24" rx="3" fill="url(#kl-block-side)" />
          <rect x="282" y="26" width="10" height="72" rx="3" fill="url(#kl-block-side)" />
          <rect x="282" y="26" width="10" height="3" rx="1" fill="url(#kl-hl-side)" />
          <rect x="282" y="93" width="10" height="5" rx="1" fill="url(#kl-sh-side)" />
          <rect x="254" y="50" width="10" height="12" rx="3" fill="url(#kl-block-side)" />
          <rect x="268" y="50" width="10" height="12" rx="3" fill="url(#kl-block-side)" />
          {/* N fixeada */}
          <rect x="310" y="8" width="10" height="90" rx="3" fill="url(#kl-block-side)" />
          <rect x="310" y="8" width="10" height="3" rx="1" fill="url(#kl-hl-side)" />
          <rect x="310" y="93" width="10" height="5" rx="1" fill="url(#kl-sh-side)" />
          <rect x="324" y="14" width="10" height="34" rx="3" fill="url(#kl-block-side)" />
          <rect x="324" y="14" width="10" height="3" rx="1" fill="url(#kl-hl-side)" />
          <rect x="338" y="34" width="10" height="34" rx="3" fill="url(#kl-block-side)" />
          <rect x="338" y="58" width="10" height="34" rx="3" fill="url(#kl-block-side)" />
          <rect x="352" y="8" width="10" height="90" rx="3" fill="url(#kl-block-side)" />
          <rect x="352" y="8" width="10" height="3" rx="1" fill="url(#kl-hl-side)" />
          <rect x="352" y="93" width="10" height="5" rx="1" fill="url(#kl-sh-side)" />
          {/* A */}
          <rect x="380" y="26" width="10" height="72" rx="3" fill="url(#kl-block-side)" />
          <rect x="380" y="26" width="10" height="3" rx="1" fill="url(#kl-hl-side)" />
          <rect x="380" y="93" width="10" height="5" rx="1" fill="url(#kl-sh-side)" />
          <rect x="394" y="8" width="10" height="24" rx="3" fill="url(#kl-block-side)" />
          <rect x="408" y="8" width="10" height="24" rx="3" fill="url(#kl-block-side)" />
          <rect x="422" y="26" width="10" height="72" rx="3" fill="url(#kl-block-side)" />
          <rect x="422" y="26" width="10" height="3" rx="1" fill="url(#kl-hl-side)" />
          <rect x="422" y="93" width="10" height="5" rx="1" fill="url(#kl-sh-side)" />
          <rect x="394" y="50" width="10" height="12" rx="3" fill="url(#kl-block-side)" />
          <rect x="408" y="50" width="10" height="12" rx="3" fill="url(#kl-block-side)" />
          <line x1="10" y1="118" x2="440" y2="-10" stroke="url(#kl-hamon-side)" strokeWidth="1" opacity="0.4" />
          <rect x="20" y="108" width="420" height="1.5" fill="url(#kl-base-side)" rx="0.75" />
          <circle cx="80" cy="108.75" r="0.8" fill="#C084FC" opacity="0.5" />
          <circle cx="200" cy="108.75" r="0.8" fill="#C084FC" opacity="0.5" />
          <circle cx="320" cy="108.75" r="0.8" fill="#C084FC" opacity="0.5" />
          <circle cx="448" cy="94" r="8" fill="#84CC16" opacity="0.3" filter="url(#kl-glow-side)" />
          <circle cx="448" cy="94" r="5" fill="#84CC16" />
          <circle cx="448" cy="94" r="3" fill="#A3E635" />
          <circle cx="447" cy="93" r="1.2" fill="#FFFFFF" opacity="0.9" />
        </svg>
      </div>
    )
  }

  if (variant === 'icon') {
    return (
      <div className={cn('inline-block', className)}>
        <svg width="32" height="32" viewBox="0 0 90 110" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="kl-block-ico" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D8B4FE" />
              <stop offset="50%" stopColor="#C084FC" />
              <stop offset="100%" stopColor="#A855F7" />
            </linearGradient>
            <linearGradient id="kl-hl-ico" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EDE9FE" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#EDE9FE" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="kl-sh-ico" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5B21B6" stopOpacity="0" />
              <stop offset="100%" stopColor="#5B21B6" stopOpacity="0.6" />
            </linearGradient>
            <filter id="kl-glow-ico" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="2.5" />
            </filter>
          </defs>
          <rect x="4" y="8" width="10" height="90" rx="3" fill="url(#kl-block-ico)" />
          <rect x="4" y="8" width="10" height="3" rx="1" fill="url(#kl-hl-ico)" />
          <rect x="4" y="93" width="10" height="5" rx="1" fill="url(#kl-sh-ico)" />
          <rect x="18" y="40" width="10" height="30" rx="3" fill="url(#kl-block-ico)" />
          <rect x="32" y="22" width="10" height="34" rx="3" fill="url(#kl-block-ico)" />
          <rect x="46" y="8" width="10" height="22" rx="3" fill="url(#kl-block-ico)" />
          <rect x="46" y="8" width="10" height="3" rx="1" fill="url(#kl-hl-ico)" />
          <rect x="32" y="62" width="10" height="36" rx="3" fill="url(#kl-block-ico)" />
          <rect x="46" y="76" width="10" height="22" rx="3" fill="url(#kl-block-ico)" />
          <rect x="46" y="93" width="10" height="5" rx="1" fill="url(#kl-sh-ico)" />
          <circle cx="68" cy="92" r="9" fill="#84CC16" opacity="0.3" filter="url(#kl-glow-ico)" />
          <circle cx="68" cy="92" r="6" fill="#84CC16" />
          <circle cx="68" cy="92" r="3.5" fill="#A3E635" />
          <circle cx="67" cy="91" r="1.4" fill="#FFFFFF" opacity="0.9" />
        </svg>
      </div>
    )
  }

  return null
}
