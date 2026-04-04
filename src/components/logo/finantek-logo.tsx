import { cn } from '@/lib/utils'

interface FinantekLogoProps {
  variant?: "full" | "sidebar" | "icon"
  className?: string
}

export function FinantekLogo({ variant = "sidebar", className }: FinantekLogoProps) {
  // Variante completa con fondo y subtítulo
  if (variant === "full") {
    return (
      <div className={cn("inline-block", className)}>
        <svg width="100%" viewBox="0 0 680 200" xmlns="http://www.w3.org/2000/svg">
          <rect width="680" height="200" fill="#0F0A1E" rx="12"/>
          {/* F */}
          <rect x="30"  y="58"  width="10" height="90" rx="3" fill="#A855F7"/>
          <rect x="44"  y="58"  width="10" height="12" rx="3" fill="#A855F7"/>
          <rect x="58"  y="58"  width="10" height="12" rx="3" fill="#7C3AED"/>
          <rect x="72"  y="58"  width="10" height="12" rx="3" fill="#5B21B6"/>
          <rect x="44"  y="100" width="10" height="12" rx="3" fill="#A855F7"/>
          <rect x="58"  y="100" width="10" height="12" rx="3" fill="#7C3AED"/>
          {/* I */}
          <rect x="96"  y="58"  width="10" height="90" rx="3" fill="#A855F7"/>
          {/* N */}
          <rect x="120" y="58"  width="10" height="90" rx="3" fill="#A855F7"/>
          <rect x="134" y="72"  width="10" height="76" rx="3" fill="#7C3AED"/>
          <rect x="148" y="86"  width="10" height="62" rx="3" fill="#5B21B6"/>
          <rect x="162" y="58"  width="10" height="90" rx="3" fill="#A855F7"/>
          {/* A */}
          <rect x="190" y="76"  width="10" height="72" rx="3" fill="#A855F7"/>
          <rect x="204" y="58"  width="10" height="24" rx="3" fill="#84CC16"/>
          <rect x="218" y="58"  width="10" height="24" rx="3" fill="#84CC16"/>
          <rect x="232" y="76"  width="10" height="72" rx="3" fill="#A855F7"/>
          <rect x="204" y="100" width="10" height="12" rx="3" fill="#7C3AED"/>
          <rect x="218" y="100" width="10" height="12" rx="3" fill="#7C3AED"/>
          {/* N */}
          <rect x="260" y="58"  width="10" height="90" rx="3" fill="#A855F7"/>
          <rect x="274" y="72"  width="10" height="76" rx="3" fill="#7C3AED"/>
          <rect x="288" y="86"  width="10" height="62" rx="3" fill="#5B21B6"/>
          <rect x="302" y="58"  width="10" height="90" rx="3" fill="#A855F7"/>
          {/* T */}
          <rect x="330" y="58"  width="10" height="12" rx="3" fill="#5B21B6"/>
          <rect x="344" y="58"  width="10" height="90" rx="3" fill="#A855F7"/>
          <rect x="358" y="58"  width="10" height="12" rx="3" fill="#7C3AED"/>
          <rect x="372" y="58"  width="10" height="12" rx="3" fill="#5B21B6"/>
          {/* E */}
          <rect x="400" y="58"  width="10" height="90" rx="3" fill="#A855F7"/>
          <rect x="414" y="58"  width="10" height="12" rx="3" fill="#A855F7"/>
          <rect x="428" y="58"  width="10" height="12" rx="3" fill="#7C3AED"/>
          <rect x="442" y="58"  width="10" height="12" rx="3" fill="#5B21B6"/>
          <rect x="414" y="100" width="10" height="12" rx="3" fill="#A855F7"/>
          <rect x="428" y="100" width="10" height="12" rx="3" fill="#7C3AED"/>
          <rect x="414" y="136" width="10" height="12" rx="3" fill="#A855F7"/>
          <rect x="428" y="136" width="10" height="12" rx="3" fill="#7C3AED"/>
          <rect x="442" y="136" width="10" height="12" rx="3" fill="#5B21B6"/>
          {/* K */}
          <rect x="466" y="58"  width="10" height="90" rx="3" fill="#A855F7"/>
          <rect x="480" y="90"  width="10" height="30" rx="3" fill="#84CC16"/>
          <rect x="494" y="72"  width="10" height="34" rx="3" fill="#7C3AED"/>
          <rect x="508" y="58"  width="10" height="22" rx="3" fill="#5B21B6"/>
          <rect x="494" y="112" width="10" height="36" rx="3" fill="#7C3AED"/>
          <rect x="508" y="126" width="10" height="22" rx="3" fill="#5B21B6"/>
          {/* Baseline */}
          <rect x="30" y="153" width="492" height="2" fill="#7C3AED" opacity="0.35" rx="1"/>
          {/* Subtítulo */}
          <text x="30" y="174" fill="#E9D5FF" fontFamily="monospace"
                fontSize="9" letterSpacing="3">FINANZAS  INTELIGENTES</text>
        </svg>
      </div>
    )
  }

  // Variante sidebar sin fondo ni subtítulo
  if (variant === "sidebar") {
    return (
      <div className={cn("inline-block max-w-[140px]", className)}>
        <svg width="100%" height="auto" viewBox="0 0 545 110" xmlns="http://www.w3.org/2000/svg">
          {/* F */}
          <rect x="30"  y="8"   width="10" height="90" rx="3" fill="#A855F7"/>
          <rect x="44"  y="8"   width="10" height="12" rx="3" fill="#A855F7"/>
          <rect x="58"  y="8"   width="10" height="12" rx="3" fill="#7C3AED"/>
          <rect x="72"  y="8"   width="10" height="12" rx="3" fill="#5B21B6"/>
          <rect x="44"  y="50"  width="10" height="12" rx="3" fill="#A855F7"/>
          <rect x="58"  y="50"  width="10" height="12" rx="3" fill="#7C3AED"/>
          {/* I */}
          <rect x="96"  y="8"   width="10" height="90" rx="3" fill="#A855F7"/>
          {/* N */}
          <rect x="120" y="8"   width="10" height="90" rx="3" fill="#A855F7"/>
          <rect x="134" y="22"  width="10" height="76" rx="3" fill="#7C3AED"/>
          <rect x="148" y="36"  width="10" height="62" rx="3" fill="#5B21B6"/>
          <rect x="162" y="8"   width="10" height="90" rx="3" fill="#A855F7"/>
          {/* A */}
          <rect x="190" y="26"  width="10" height="72" rx="3" fill="#A855F7"/>
          <rect x="204" y="8"   width="10" height="24" rx="3" fill="#84CC16"/>
          <rect x="218" y="8"   width="10" height="24" rx="3" fill="#84CC16"/>
          <rect x="232" y="26"  width="10" height="72" rx="3" fill="#A855F7"/>
          <rect x="204" y="50"  width="10" height="12" rx="3" fill="#7C3AED"/>
          <rect x="218" y="50"  width="10" height="12" rx="3" fill="#7C3AED"/>
          {/* N */}
          <rect x="260" y="8"   width="10" height="90" rx="3" fill="#A855F7"/>
          <rect x="274" y="22"  width="10" height="76" rx="3" fill="#7C3AED"/>
          <rect x="288" y="36"  width="10" height="62" rx="3" fill="#5B21B6"/>
          <rect x="302" y="8"   width="10" height="90" rx="3" fill="#A855F7"/>
          {/* T */}
          <rect x="330" y="8"   width="10" height="12" rx="3" fill="#5B21B6"/>
          <rect x="344" y="8"   width="10" height="90" rx="3" fill="#A855F7"/>
          <rect x="358" y="8"   width="10" height="12" rx="3" fill="#7C3AED"/>
          <rect x="372" y="8"   width="10" height="12" rx="3" fill="#5B21B6"/>
          {/* E */}
          <rect x="400" y="8"   width="10" height="90" rx="3" fill="#A855F7"/>
          <rect x="414" y="8"   width="10" height="12" rx="3" fill="#A855F7"/>
          <rect x="428" y="8"   width="10" height="12" rx="3" fill="#7C3AED"/>
          <rect x="442" y="8"   width="10" height="12" rx="3" fill="#5B21B6"/>
          <rect x="414" y="50"  width="10" height="12" rx="3" fill="#A855F7"/>
          <rect x="428" y="50"  width="10" height="12" rx="3" fill="#7C3AED"/>
          <rect x="414" y="86"  width="10" height="12" rx="3" fill="#A855F7"/>
          <rect x="428" y="86"  width="10" height="12" rx="3" fill="#7C3AED"/>
          <rect x="442" y="86"  width="10" height="12" rx="3" fill="#5B21B6"/>
          {/* K */}
          <rect x="466" y="8"   width="10" height="90" rx="3" fill="#A855F7"/>
          <rect x="480" y="40"  width="10" height="30" rx="3" fill="#84CC16"/>
          <rect x="494" y="22"  width="10" height="34" rx="3" fill="#7C3AED"/>
          <rect x="508" y="8"   width="10" height="22" rx="3" fill="#5B21B6"/>
          <rect x="494" y="62"  width="10" height="36" rx="3" fill="#7C3AED"/>
          <rect x="508" y="76"  width="10" height="22" rx="3" fill="#5B21B6"/>
          {/* Baseline */}
          <rect x="30" y="103" width="492" height="2" fill="#7C3AED" opacity="0.35" rx="1"/>
        </svg>
      </div>
    )
  }

  // Variante icon - solo la F, exactamente 32x32px
  if (variant === "icon") {
    return (
      <div className={cn("inline-block", className)}>
        <svg width="32" height="32" viewBox="0 0 90 110" xmlns="http://www.w3.org/2000/svg">
          {/* Solo la F */}
          <rect x="4"   y="8"   width="10" height="90" rx="3" fill="#A855F7"/>
          <rect x="18"  y="8"   width="10" height="12" rx="3" fill="#A855F7"/>
          <rect x="32"  y="8"   width="10" height="12" rx="3" fill="#7C3AED"/>
          <rect x="46"  y="8"   width="10" height="12" rx="3" fill="#5B21B6"/>
          <rect x="18"  y="50"  width="10" height="12" rx="3" fill="#A855F7"/>
          <rect x="32"  y="50"  width="10" height="12" rx="3" fill="#7C3AED"/>
          {/* Baseline de la F */}
          <rect x="4"  y="103" width="56" height="2" fill="#7C3AED" opacity="0.35" rx="1"/>
        </svg>
      </div>
    )
  }

  return null
}