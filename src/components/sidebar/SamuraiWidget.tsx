'use client'

import { useEffect, useState } from 'react'

export function SamuraiWidget() {
  // NUEVA VERSION ULTRA-PROFESIONAL CON KATANA SVG

  const [current, setCurrent] = useState(0)
  const [visible, setVisible] = useState(true)

  const quotes = [
    { text: '"No gastes sin intención"', color: '#C084FC', mode: 'SERIO' },
    { text: '"Cada peso, una victoria"', color: '#84CC16', mode: 'VICTORIA' },
    { text: '"Ahorra hoy, domina mañana"', color: '#A855F7', mode: 'ESTRATEGIA' },
    { text: '"El guerrero planifica\nantes de gastar"', color: '#7C3AED', mode: 'MEDITACIÓN' },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setCurrent(p => (p + 1) % quotes.length)
        setVisible(true)
      }, 400)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="px-3 py-2 hidden lg:block">
      <style>{`
        @keyframes katanaFloat {
          0%,100% { transform: translateY(0) rotate(-45deg); }
          50%      { transform: translateY(-8px) rotate(-45deg); }
        }
        @keyframes katanaGlow {
          0%,100% { filter: drop-shadow(0 0 6px #A855F7) drop-shadow(0 0 12px #7C3AED); }
          50%      { filter: drop-shadow(0 0 16px #A855F7) drop-shadow(0 0 24px #7C3AED) drop-shadow(0 0 8px #C084FC); }
        }
        @keyframes auraKatana {
          0%,100% { opacity: 0.15; transform: scale(1); }
          50%      { opacity: 0.35; transform: scale(1.12); }
        }
        @keyframes particleFloat {
          0%   { opacity: 0; transform: translateY(25px) scale(0); }
          50%  { opacity: 1; transform: translateY(-12px) scale(1); }
          100% { opacity: 0; transform: translateY(-35px) scale(0); }
        }
        @keyframes energyLine {
          0%,100% { opacity: 0.2; transform: scaleY(1); }
          50%      { opacity: 0.6; transform: scaleY(1.3); }
        }
        .k-float { animation: katanaFloat 3.5s ease-in-out infinite; }
        .k-glow  { animation: katanaGlow 2.5s ease-in-out infinite; }
        .k-aura  { animation: auraKatana 3.5s ease-in-out infinite; }
        .k-particle { animation: particleFloat 4.5s ease-in-out infinite; }
        .k-energy { animation: energyLine 2s ease-in-out infinite; }
      `}</style>

      {/* NUEVO SAMURAI WIDGET PROFESIONAL */}
      <div style={{ position: 'relative', width: '100%', height: '140px', overflow: 'hidden' }}>

        {/* Partículas de energía mejoradas */}
        <div className="k-particle" style={{
          position: 'absolute',
          top: '25%', left: '15%',
          width: '6px', height: '6px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #84CC16, #22C55E)',
          boxShadow: '0 0 12px #84CC16',
          animationDelay: '0s'
        }}/>
        <div className="k-particle" style={{
          position: 'absolute',
          top: '65%', right: '20%',
          width: '4px', height: '4px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #C084FC, #A855F7)',
          boxShadow: '0 0 10px #C084FC',
          animationDelay: '1.8s'
        }}/>
        <div className="k-particle" style={{
          position: 'absolute',
          top: '45%', left: '70%',
          width: '3px', height: '3px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #7C3AED, #6D28D9)',
          boxShadow: '0 0 8px #7C3AED',
          animationDelay: '3.2s'
        }}/>

        {/* Líneas de energía cruzadas */}
        <div className="k-energy" style={{
          position: 'absolute',
          top: '20%', left: '25%',
          width: '2px', height: '40px',
          background: 'linear-gradient(to bottom, #C084FC, rgba(192,132,252,0.3), transparent)',
          transform: 'rotate(-25deg)',
          borderRadius: '1px',
          animationDelay: '0.5s'
        }}/>
        <div className="k-energy" style={{
          position: 'absolute',
          top: '30%', right: '28%',
          width: '1.5px', height: '30px',
          background: 'linear-gradient(to bottom, #84CC16, rgba(132,204,22,0.3), transparent)',
          transform: 'rotate(35deg)',
          borderRadius: '1px',
          animationDelay: '1.2s'
        }}/>

        {/* Aura principal mejorada */}
        <div className="k-aura" style={{
          position: 'absolute',
          top: '15%', left: '15%', right: '15%', bottom: '15%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, rgba(124,58,237,0.15) 30%, rgba(76,29,149,0.08) 60%, transparent 80%)',
          border: '1px solid rgba(124,58,237,0.1)',
        }}/>

        {/* KATANA SVG ULTRA-PROFESIONAL */}
        <div className="k-float k-glow" style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%) rotate(-45deg)',
          zIndex: 10,
        }}>
          <svg width="90" height="90" viewBox="0 0 90 90">
            {/* Hoja principal con gradiente */}
            <defs>
              <linearGradient id="bladeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#EDE9FE" stopOpacity="0.9"/>
                <stop offset="40%" stopColor="#C084FC" stopOpacity="0.7"/>
                <stop offset="60%" stopColor="#A855F7" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#EDE9FE" stopOpacity="0.9"/>
              </linearGradient>
              <radialGradient id="tsuba" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#7C3AED"/>
                <stop offset="80%" stopColor="#4C1D95"/>
                <stop offset="100%" stopColor="#1E1B4B"/>
              </radialGradient>
            </defs>

            {/* Hoja principal */}
            <rect x="42" y="4" width="6" height="58" rx="3" fill="url(#bladeGrad)"/>

            {/* Filo central brillante */}
            <rect x="44" y="4" width="2" height="56" rx="1" fill="#FFFFFF" opacity="0.8"/>
            <rect x="44.5" y="6" width="1" height="52" rx="0.5" fill="#FBBF24" opacity="0.4"/>

            {/* Punta perfecta */}
            <polygon points="42,4 48,4 45,0" fill="#F8FAFC"/>
            <polygon points="43,3 47,3 45,0" fill="#FFFFFF" opacity="0.9"/>

            {/* Sangre del canal */}
            <line x1="43.5" y1="8" x2="43.5" y2="54" stroke="#DC2626" strokeWidth="0.3" opacity="0.6"/>
            <line x1="46.5" y1="10" x2="46.5" y2="52" stroke="#B91C1C" strokeWidth="0.2" opacity="0.4"/>

            {/* Tsuba (protector) con detalles */}
            <rect x="32" y="60" width="26" height="7" rx="3" fill="url(#tsuba)"/>
            <rect x="34" y="61" width="22" height="5" rx="2" fill="#A855F7"/>
            <circle cx="37" cy="63.5" r="1.5" fill="#84CC16" opacity="0.9"/>
            <circle cx="53" cy="63.5" r="1.5" fill="#84CC16" opacity="0.9"/>
            <rect x="43" y="62" width="4" height="3" rx="1" fill="#22C55E" opacity="0.7"/>

            {/* Mango (tsuka) con envolturas */}
            <rect x="40" y="66" width="10" height="20" rx="3" fill="#0F0A19"/>
            <rect x="41" y="67" width="8" height="18" rx="2" fill="#1A0B2E"/>

            {/* Envolturas tradicionales */}
            <rect x="41.5" y="70" width="7" height="2.5" rx="1" fill="#6D28D9" opacity="0.9"/>
            <rect x="41.5" y="74" width="7" height="2.5" rx="1" fill="#6D28D9" opacity="0.9"/>
            <rect x="41.5" y="78" width="7" height="2.5" rx="1" fill="#6D28D9" opacity="0.9"/>

            {/* Pommel brillante */}
            <circle cx="45" cy="87" r="4" fill="#84CC16"/>
            <circle cx="45" cy="87" r="2.5" fill="#22C55E"/>
            <circle cx="45" cy="86" r="1" fill="#FFFFFF" opacity="0.8"/>

            {/* Grabados en la hoja */}
            <line x1="44.2" y1="12" x2="44.2" y2="50" stroke="#7C3AED" strokeWidth="0.2" opacity="0.3"/>
            <line x1="45.8" y1="14" x2="45.8" y2="48" stroke="#A855F7" strokeWidth="0.15" opacity="0.4"/>

            {/* Brillos dinámicos */}
            <rect x="43" y="8" width="0.5" height="44" rx="0.25" fill="#FBBF24" opacity="0.6"/>
            <rect x="46.2" y="10" width="0.3" height="40" rx="0.15" fill="#FEF3C7" opacity="0.5"/>
          </svg>
        </div>

        {/* Kanji auténticos de Bushido */}
        <div style={{
          position: 'absolute',
          right: '8px', top: '50%',
          transform: 'translateY(-50%)',
          fontFamily: 'serif',
          fontSize: '11px',
          color: '#3B1D6E',
          lineHeight: '1.3',
          opacity: 0.7,
          textShadow: '0 0 6px rgba(124,58,237,0.4)',
          fontWeight: 'bold'
        }}>
          <div>武</div>
          <div>士</div>
          <div>道</div>
        </div>

        {/* Círculo de energía sutil */}
        <div style={{
          position: 'absolute',
          bottom: '5%', left: '50%',
          transform: 'translateX(-50%)',
          width: '60px', height: '3px',
          background: 'radial-gradient(ellipse, #7C3AED, rgba(124,58,237,0.3), transparent)',
          borderRadius: '50%',
          opacity: 0.4
        }}/>
      </div>

      {/* SEPARADOR DECORATIVO */}
      <div style={{
        borderTop: '1px solid rgba(76,29,149,0.4)',
        marginTop: '12px',
        paddingTop: '10px',
        position: 'relative',
      }}>
        {/* Ornamento central */}
        <div style={{
          position: 'absolute',
          top: '-4px', left: '50%',
          transform: 'translateX(-50%)',
          width: '8px', height: '8px',
          background: 'radial-gradient(circle, #7C3AED, #4C1D95)',
          borderRadius: '50%',
          border: '2px solid #1F2937',
          boxShadow: '0 0 8px rgba(124,58,237,0.5)'
        }}/>
      </div>

      {/* FRASES ROTATIVAS MEJORADAS */}
      <div style={{
        textAlign: 'center',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.5s ease',
        marginTop: '6px',
      }}>
        <p style={{
          fontSize: '10px',
          color: quotes[current].color,
          fontWeight: '600',
          whiteSpace: 'pre-line',
          lineHeight: '1.4',
          textShadow: `0 0 10px ${quotes[current].color}50, 0 0 20px ${quotes[current].color}30`,
          letterSpacing: '0.03em',
        }}>
          {quotes[current].text}
        </p>
        <p style={{
          fontSize: '8px',
          color: '#3B1D6E',
          marginTop: '5px',
          letterSpacing: '0.12em',
          fontWeight: '600',
          textShadow: '0 0 4px rgba(59,29,110,0.5)'
        }}>
          — {quotes[current].mode}
        </p>
      </div>

      {/* FOOTER BUSHIDO */}
      <div style={{
        borderTop: '1px solid rgba(76,29,149,0.25)',
        marginTop: '10px',
        paddingTop: '8px',
        textAlign: 'center',
        fontSize: '8px',
        color: '#3B1D6E',
        letterSpacing: '0.08em',
        fontWeight: '600',
        opacity: 0.8,
        textShadow: '0 0 6px rgba(59,29,110,0.3)'
      }}>
        武士道 · Bushido
      </div>
    </div>
  )
}