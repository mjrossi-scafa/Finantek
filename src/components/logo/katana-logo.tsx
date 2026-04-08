import { cn } from '@/lib/utils'

interface KatanaLogoProps {
  variant?: "full" | "sidebar" | "icon"
  className?: string
}

export function KatanaLogo({ variant = "sidebar", className }: KatanaLogoProps) {
  // Variante completa con fondo y subtítulo
  if (variant === "full") {
    return (
      <div className={cn("inline-block", className)}>
        <svg width="100%" viewBox="0 0 520 200" xmlns="http://www.w3.org/2000/svg">
          <rect width="520" height="200" fill="transparent" rx="12"/>
          {/* K */}
          <rect x="30"  y="58"  width="10" height="90" rx="3" fill="#A855F7"/>
          <rect x="44"  y="90"  width="10" height="30" rx="3" fill="#84CC16"/>
          <rect x="58"  y="72"  width="10" height="34" rx="3" fill="#7C3AED"/>
          <rect x="72"  y="58"  width="10" height="22" rx="3" fill="#5B21B6"/>
          <rect x="58"  y="112" width="10" height="36" rx="3" fill="#7C3AED"/>
          <rect x="72"  y="126" width="10" height="22" rx="3" fill="#5B21B6"/>
          {/* A */}
          <rect x="100" y="76"  width="10" height="72" rx="3" fill="#A855F7"/>
          <rect x="114" y="58"  width="10" height="24" rx="3" fill="#84CC16"/>
          <rect x="128" y="58"  width="10" height="24" rx="3" fill="#84CC16"/>
          <rect x="142" y="76"  width="10" height="72" rx="3" fill="#A855F7"/>
          <rect x="114" y="100" width="10" height="12" rx="3" fill="#7C3AED"/>
          <rect x="128" y="100" width="10" height="12" rx="3" fill="#7C3AED"/>
          {/* T */}
          <rect x="156" y="58"  width="10" height="12" rx="3" fill="#7C3AED"/>
          <rect x="170" y="58"  width="10" height="12" rx="3" fill="#5B21B6"/>
          <rect x="184" y="58"  width="10" height="90" rx="3" fill="#A855F7"/>
          <rect x="198" y="58"  width="10" height="12" rx="3" fill="#7C3AED"/>
          <rect x="212" y="58"  width="10" height="12" rx="3" fill="#5B21B6"/>
          {/* A */}
          <rect x="240" y="76"  width="10" height="72" rx="3" fill="#A855F7"/>
          <rect x="254" y="58"  width="10" height="24" rx="3" fill="#84CC16"/>
          <rect x="268" y="58"  width="10" height="24" rx="3" fill="#84CC16"/>
          <rect x="282" y="76"  width="10" height="72" rx="3" fill="#A855F7"/>
          <rect x="254" y="100" width="10" height="12" rx="3" fill="#7C3AED"/>
          <rect x="268" y="100" width="10" height="12" rx="3" fill="#7C3AED"/>
          {/* N */}
          <rect x="310" y="58"  width="10" height="90" rx="3" fill="#A855F7"/>
          <rect x="324" y="72"  width="10" height="76" rx="3" fill="#7C3AED"/>
          <rect x="338" y="86"  width="10" height="62" rx="3" fill="#5B21B6"/>
          <rect x="352" y="58"  width="10" height="90" rx="3" fill="#A855F7"/>
          {/* A */}
          <rect x="380" y="76"  width="10" height="72" rx="3" fill="#A855F7"/>
          <rect x="394" y="58"  width="10" height="24" rx="3" fill="#84CC16"/>
          <rect x="408" y="58"  width="10" height="24" rx="3" fill="#84CC16"/>
          <rect x="422" y="76"  width="10" height="72" rx="3" fill="#A855F7"/>
          <rect x="394" y="100" width="10" height="12" rx="3" fill="#7C3AED"/>
          <rect x="408" y="100" width="10" height="12" rx="3" fill="#7C3AED"/>
          {/* Baseline */}
          <rect x="30" y="153" width="392" height="2" fill="#7C3AED" opacity="0.35" rx="1"/>
          {/* Subtítulo */}
          <text x="30" y="174" fill="#E9D5FF" fontFamily="monospace"
                fontSize="9" letterSpacing="3">財務インテリジェンス</text>
        </svg>
      </div>
    )
  }

  // Variante sidebar sin fondo ni subtítulo
  if (variant === "sidebar") {
    return (
      <div className={cn("inline-block min-w-[160px] max-w-[160px]", className)}>
        <svg width="100%" height="auto" viewBox="0 0 485 110" xmlns="http://www.w3.org/2000/svg">
          {/* K */}
          <rect x="30"  y="8"   width="10" height="90" rx="3" fill="#A855F7"/>
          <rect x="44"  y="40"  width="10" height="30" rx="3" fill="#84CC16"/>
          <rect x="58"  y="22"  width="10" height="34" rx="3" fill="#7C3AED"/>
          <rect x="72"  y="8"   width="10" height="22" rx="3" fill="#5B21B6"/>
          <rect x="58"  y="62"  width="10" height="36" rx="3" fill="#7C3AED"/>
          <rect x="72"  y="76"  width="10" height="22" rx="3" fill="#5B21B6"/>
          {/* A */}
          <rect x="100" y="26"  width="10" height="72" rx="3" fill="#A855F7"/>
          <rect x="114" y="8"   width="10" height="24" rx="3" fill="#84CC16"/>
          <rect x="128" y="8"   width="10" height="24" rx="3" fill="#84CC16"/>
          <rect x="142" y="26"  width="10" height="72" rx="3" fill="#A855F7"/>
          <rect x="114" y="50"  width="10" height="12" rx="3" fill="#7C3AED"/>
          <rect x="128" y="50"  width="10" height="12" rx="3" fill="#7C3AED"/>
          {/* T */}
          <rect x="156" y="8"   width="10" height="12" rx="3" fill="#7C3AED"/>
          <rect x="170" y="8"   width="10" height="12" rx="3" fill="#5B21B6"/>
          <rect x="184" y="8"   width="10" height="90" rx="3" fill="#A855F7"/>
          <rect x="198" y="8"   width="10" height="12" rx="3" fill="#7C3AED"/>
          <rect x="212" y="8"   width="10" height="12" rx="3" fill="#5B21B6"/>
          {/* A */}
          <rect x="240" y="26"  width="10" height="72" rx="3" fill="#A855F7"/>
          <rect x="254" y="8"   width="10" height="24" rx="3" fill="#84CC16"/>
          <rect x="268" y="8"   width="10" height="24" rx="3" fill="#84CC16"/>
          <rect x="282" y="26"  width="10" height="72" rx="3" fill="#A855F7"/>
          <rect x="254" y="50"  width="10" height="12" rx="3" fill="#7C3AED"/>
          <rect x="268" y="50"  width="10" height="12" rx="3" fill="#7C3AED"/>
          {/* N */}
          <rect x="310" y="8"   width="10" height="90" rx="3" fill="#A855F7"/>
          <rect x="324" y="22"  width="10" height="76" rx="3" fill="#7C3AED"/>
          <rect x="338" y="36"  width="10" height="62" rx="3" fill="#5B21B6"/>
          <rect x="352" y="8"   width="10" height="90" rx="3" fill="#A855F7"/>
          {/* A */}
          <rect x="380" y="26"  width="10" height="72" rx="3" fill="#A855F7"/>
          <rect x="394" y="8"   width="10" height="24" rx="3" fill="#84CC16"/>
          <rect x="408" y="8"   width="10" height="24" rx="3" fill="#84CC16"/>
          <rect x="422" y="26"  width="10" height="72" rx="3" fill="#A855F7"/>
          <rect x="394" y="50"  width="10" height="12" rx="3" fill="#7C3AED"/>
          <rect x="408" y="50"  width="10" height="12" rx="3" fill="#7C3AED"/>
          {/* Baseline */}
          <rect x="30" y="103" width="392" height="2" fill="#7C3AED" opacity="0.35" rx="1"/>
        </svg>
      </div>
    )
  }

  // Variante icon - solo la K, exactamente 32x32px
  if (variant === "icon") {
    return (
      <div className={cn("inline-block", className)}>
        <svg width="32" height="32" viewBox="0 0 90 110" xmlns="http://www.w3.org/2000/svg">
          {/* Solo la K */}
          <rect x="4"   y="8"   width="10" height="90" rx="3" fill="#A855F7"/>
          <rect x="18"  y="40"  width="10" height="30" rx="3" fill="#84CC16"/>
          <rect x="32"  y="22"  width="10" height="34" rx="3" fill="#7C3AED"/>
          <rect x="46"  y="8"   width="10" height="22" rx="3" fill="#5B21B6"/>
          <rect x="32"  y="62"  width="10" height="36" rx="3" fill="#7C3AED"/>
          <rect x="46"  y="76"  width="10" height="22" rx="3" fill="#5B21B6"/>
          {/* Baseline de la K */}
          <rect x="4"  y="103" width="56" height="2" fill="#7C3AED" opacity="0.35" rx="1"/>
        </svg>
      </div>
    )
  }

  return null
}