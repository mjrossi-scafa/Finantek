'use client'

import { useEffect, useState } from 'react'

const quotes = [
  { text: '"No gastes sin intención"', color: '#C084FC', mode: 'SERIO' },
  { text: '"Cada peso, una victoria"', color: '#84CC16', mode: 'VICTORIA' },
  { text: '"Ahorra hoy, domina mañana"', color: '#A855F7', mode: 'ESTRATEGIA' },
  { text: '"El guerrero planifica\nantes de gastar"', color: '#7C3AED', mode: 'MEDITACIÓN' },
]

export function SamuraiFallback() {
  const [current, setCurrent] = useState(0)
  const [visible, setVisible] = useState(true)

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
          50%      { transform: translateY(-6px) rotate(-45deg); }
        }
        @keyframes katanaGlow {
          0%,100% { filter: drop-shadow(0 0 4px #A855F7); }
          50%      { filter: drop-shadow(0 0 12px #A855F7) drop-shadow(0 0 20px #7C3AED); }
        }
        @keyframes auraP {
          0%,100% { opacity: 0.1; transform: scale(1); }
          50%      { opacity: 0.2; transform: scale(1.1); }
        }
        @keyframes particleFloat {
          0%   { opacity: 0; transform: translateY(20px) scale(0); }
          50%  { opacity: 1; transform: translateY(-10px) scale(1); }
          100% { opacity: 0; transform: translateY(-30px) scale(0); }
        }
        .k-float { animation: katanaFloat 3s ease-in-out infinite; }
        .k-glow  { animation: katanaGlow 2s ease-in-out infinite; }
        .k-aura  { animation: auraP 3s ease-in-out infinite; }
        .k-particle { animation: particleFloat 4s ease-in-out infinite; }
      `}</style>

      {/* Katana SVG animada */}
      <div style={{ position: 'relative', width: '100%', height: '120px', overflow: 'visible' }}>

        {/* Partículas de energía */}
        <div className="k-particle" style={{
          position: 'absolute',
          top: '30%', left: '20%',
          width: '4px', height: '4px',
          borderRadius: '50%',
          background: '#84CC16',
          animationDelay: '0s'
        }}/>
        <div className="k-particle" style={{
          position: 'absolute',
          top: '60%', right: '25%',
          width: '3px', height: '3px',
          borderRadius: '50%',
          background: '#C084FC',
          animationDelay: '1.5s'
        }}/>
        <div className="k-particle" style={{
          position: 'absolute',
          top: '40%', left: '60%',
          width: '2px', height: '2px',
          borderRadius: '50%',
          background: '#7C3AED',
          animationDelay: '3s'
        }}/>

        {/* Aura de energía */}
        <div className="k-aura" style={{
          position: 'absolute',
          top: '20%', left: '20%', right: '20%', bottom: '20%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, rgba(124,58,237,0.05) 40%, transparent 70%)',
        }}/>

        {/* Katana SVG principal */}
        <div className="k-float k-glow" style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%) rotate(-45deg)',
          zIndex: 10,
        }}>
          <svg width="80" height="80" viewBox="0 0 80 80">
            {/* Hoja principal */}
            <rect x="38" y="4" width="4" height="52" rx="2" fill="#C084FC"/>

            {/* Reflejo de la hoja */}
            <rect x="39" y="4" width="1.5" height="50" rx="1" fill="#EDE9FE" opacity="0.9"/>
            <rect x="39.5" y="6" width="0.5" height="46" rx="0.5" fill="#FFFFFF" opacity="0.6"/>

            {/* Punta de la espada */}
            <polygon points="38,4 42,4 40,0" fill="#EDE9FE"/>
            <polygon points="39,3 41,3 40,0" fill="#FFFFFF" opacity="0.8"/>

            {/* Tsuba (protector) */}
            <rect x="30" y="54" width="20" height="5" rx="2" fill="#7C3AED"/>
            <rect x="32" y="55" width="16" height="3" rx="1" fill="#A855F7"/>
            <circle cx="35" cy="56.5" r="1" fill="#84CC16" opacity="0.8"/>
            <circle cx="45" cy="56.5" r="1" fill="#84CC16" opacity="0.8"/>

            {/* Mango (tsuka) */}
            <rect x="36" y="58" width="8" height="18" rx="2" fill="#1A0A2E"/>

            {/* Envolturas del mango */}
            <rect x="37" y="62" width="6" height="3" rx="1" fill="#6D28D9"/>
            <rect x="37" y="69" width="6" height="3" rx="1" fill="#6D28D9"/>

            {/* Pommel (extremo del mango) */}
            <circle cx="40" cy="78" r="3" fill="#84CC16"/>
            <circle cx="40" cy="78" r="1.5" fill="#22C55E"/>

            {/* Detalles decorativos en la hoja */}
            <line x1="39.5" y1="8" x2="39.5" y2="50" stroke="#A855F7" strokeWidth="0.3" opacity="0.5"/>
            <line x1="40.5" y1="10" x2="40.5" y2="48" stroke="#7C3AED" strokeWidth="0.2" opacity="0.4"/>
          </svg>
        </div>

        {/* Kanji lateral (Bushido) */}
        <div style={{
          position: 'absolute',
          right: '8px', top: '50%',
          transform: 'translateY(-50%)',
          fontFamily: 'serif',
          fontSize: '10px',
          color: '#3B1D6E',
          lineHeight: '1.4',
          opacity: 0.6,
          textShadow: '0 0 4px rgba(124,58,237,0.3)',
        }}>
          <div>武</div>
          <div>士</div>
          <div>道</div>
        </div>

        {/* Líneas de energía */}
        <div style={{
          position: 'absolute',
          top: '25%', left: '25%',
          width: '2px', height: '30px',
          background: 'linear-gradient(to bottom, #C084FC, transparent)',
          transform: 'rotate(-30deg)',
          opacity: 0.4,
        }}/>
        <div style={{
          position: 'absolute',
          top: '35%', right: '30%',
          width: '1px', height: '20px',
          background: 'linear-gradient(to bottom, #84CC16, transparent)',
          transform: 'rotate(45deg)',
          opacity: 0.3,
        }}/>
      </div>

      {/* Separador decorativo */}
      <div style={{
        borderTop: '1px solid rgba(76,29,149,0.3)',
        marginTop: '8px',
        paddingTop: '8px',
        position: 'relative',
      }}>
        {/* Pequeño ornamento central */}
        <div style={{
          position: 'absolute',
          top: '-3px', left: '50%',
          transform: 'translateX(-50%)',
          width: '6px', height: '6px',
          background: '#7C3AED',
          borderRadius: '50%',
          border: '2px solid #1F2937'
        }}/>
      </div>

      {/* Frases rotativas */}
      <div style={{
        textAlign: 'center',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.4s ease',
        marginTop: '4px',
      }}>
        <p style={{
          fontSize: '9px',
          color: quotes[current].color,
          fontWeight: '600',
          whiteSpace: 'pre-line',
          lineHeight: '1.4',
          textShadow: `0 0 8px ${quotes[current].color}40`,
          letterSpacing: '0.02em',
        }}>
          {quotes[current].text}
        </p>
        <p style={{
          fontSize: '7px',
          color: '#3B1D6E',
          marginTop: '4px',
          letterSpacing: '0.1em',
          fontWeight: '500',
        }}>
          — {quotes[current].mode}
        </p>
      </div>

      {/* Footer con Bushido */}
      <div style={{
        borderTop: '1px solid rgba(76,29,149,0.2)',
        marginTop: '8px',
        paddingTop: '6px',
        textAlign: 'center',
        fontSize: '7px',
        color: '#3B1D6E',
        letterSpacing: '0.05em',
        fontWeight: '500',
        opacity: 0.8,
      }}>
        武士道 · Bushido
      </div>
    </div>
  )
}