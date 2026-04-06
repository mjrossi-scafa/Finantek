'use client'

import { useEffect, useState } from 'react'

interface SamuraiWidgetProps {
  mode?: 'active' | 'zen'
  transitioning?: boolean
}

export function SamuraiWidget({ mode = 'active', transitioning = false }: SamuraiWidgetProps) {
  const [current, setCurrent] = useState(0)
  const [visible, setVisible] = useState(true)

  // FRASES ACTUALIZADAS POR MODO
  const zenQuotes = [
    {
      text: '"El presupuesto es el\nmapa del guerrero"',
      kanji: '禅',
      romaji: 'Zen · Meditación',
      color: '#9F7AEA'
    },
    {
      text: '"Recorta lo innecesario.\nPreserva lo esencial"',
      kanji: '静',
      romaji: 'Shizuka · Quietud',
      color: '#7C3AED'
    },
    {
      text: '"El orden en tus gastos\nes orden en tu vida"',
      kanji: '整',
      romaji: 'Sei · Orden',
      color: '#9F7AEA'
    },
    {
      text: '"Ahorra con intención.\nGasta con propósito"',
      kanji: '律',
      romaji: 'Ritsu · Disciplina',
      color: '#7C3AED'
    },
  ]

  const activeQuotes = [
    {
      text: '"No gastes sin intención"',
      kanji: '武',
      romaji: 'Bu · Disciplina',
      color: '#C084FC'
    },
    {
      text: '"Cada peso, una victoria"',
      kanji: '勝',
      romaji: 'Katsu · Victoria',
      color: '#84CC16'
    },
    {
      text: '"Ahorra hoy, domina mañana"',
      kanji: '道',
      romaji: 'Dō · El camino',
      color: '#A855F7'
    },
    {
      text: '"Corta gastos.\nMultiplica libertad"',
      kanji: '斬',
      romaji: 'Zan · El corte',
      color: '#84CC16'
    },
  ]

  const quotes = mode === 'zen' ? zenQuotes : activeQuotes
  const quoteInterval = mode === 'zen' ? 8000 : 5000

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setCurrent(p => (p + 1) % quotes.length)
        setVisible(true)
      }, 400)
    }, quoteInterval)
    return () => clearInterval(interval)
  }, [quotes.length, quoteInterval])

  return (
    <div
      className="px-3 py-2 hidden lg:block"
      style={{
        opacity: transitioning ? 0 : 1,
        transition: 'opacity 0.4s ease, all 0.8s ease',
      }}
    >
      <style>{`
        @keyframes katanaFloat {
          0%,100% { transform: translateY(0) rotate(-45deg); }
          50%      { transform: translateY(-8px) rotate(-45deg); }
        }
        @keyframes zenFloat {
          0%,100% {
            transform: translateY(0px) rotate(0deg);
            filter: drop-shadow(0 0 6px #4C1D95)
                    drop-shadow(0 0 2px #7C3AED);
          }
          50% {
            transform: translateY(-8px) rotate(0deg);
            filter: drop-shadow(0 0 14px #7C3AED)
                    drop-shadow(0 0 6px #A855F7)
                    drop-shadow(0 0 2px #84CC16);
          }
        }
        @keyframes katanaGlow {
          0%,100% {
            filter: drop-shadow(0 0 6px #7C3AED)
                    drop-shadow(0 0 2px #A855F7);
          }
          50% {
            filter: drop-shadow(0 0 14px #A855F7)
                    drop-shadow(0 0 6px #84CC16)
                    drop-shadow(0 0 2px #C084FC);
          }
        }
        @keyframes auraKatana {
          0%,100% { opacity: 0.15; transform: scale(1); }
          50%      { opacity: 0.35; transform: scale(1.12); }
        }
        @keyframes auraZen {
          0%,100% { opacity: 0.08; transform: scale(1); }
          50%      { opacity: 0.18; transform: scale(1.05); }
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
        .zen-float { animation: zenFloat 4s ease-in-out infinite; }
        .k-glow  { animation: katanaGlow 2.5s ease-in-out infinite; }
        .k-aura  { animation: auraKatana 3.5s ease-in-out infinite; }
        .k-aura-zen { animation: auraZen 4s ease-in-out infinite; }
        .k-particle { animation: particleFloat 4.5s ease-in-out infinite; }
        .k-energy { animation: energyLine 2s ease-in-out infinite; }
      `}</style>

      {/* WIDGET DIFERENCIADO POR MODO */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: mode === 'zen' ? '200px' : '160px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible'
      }}>

        {/* ENSO para modo ZEN */}
        {mode === 'zen' && (
          <svg style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '130px',
            height: '130px',
            opacity: 0.12,
            overflow: 'visible'
          }}>
            <circle
              cx="65" cy="65" r="55"
              fill="none"
              stroke="#7C3AED"
              strokeWidth="2.5"
              strokeDasharray="300 50"
              strokeLinecap="round"
            />
          </svg>
        )}

        {/* Partículas - solo en modo activo */}
        {mode === 'active' && (
          <>
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
          </>
        )}

        {/* Líneas de energía - solo en modo activo */}
        {mode === 'active' && (
          <>
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
          </>
        )}

        {/* Aura diferenciada por modo */}
        <div className={mode === 'zen' ? 'k-aura-zen' : 'k-aura'} style={{
          position: 'absolute',
          top: '15%', left: '15%', right: '15%', bottom: '15%',
          borderRadius: '50%',
          background: mode === 'zen'
            ? 'radial-gradient(circle, #4C1D95 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, rgba(124,58,237,0.15) 30%, rgba(76,29,149,0.08) 60%, transparent 80%)',
          border: `1px solid rgba(124,58,237,${mode === 'zen' ? '0.05' : '0.1'})`,
        }}/>

        {/* KATANA ELEGANTE - comportamiento por modo */}
        <div className={mode === 'zen' ? 'zen-float' : 'k-float k-glow'} style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: mode === 'zen'
            ? 'translate(-50%, -50%) rotate(0deg)'
            : 'translate(-50%, -50%) rotate(-45deg)',
          transformOrigin: 'center',
          zIndex: 10,
        }}>
          <svg width="100" height="100" viewBox="0 0 100 100">
            {/* Hoja larga y delgada — diagonal */}
            <rect x="48" y="2" width="3" height="65" rx="1.5"
              fill="#C084FC" transform="rotate(0 50 50)"/>
            <rect x="48.5" y="2" width="1" height="63" rx="1"
              fill="#EDE9FE" opacity="0.8"
              transform="rotate(0 50 50)"/>
            {/* Punta afilada */}
            <polygon points="47,2 51,2 49,0" fill="#EDE9FE"/>
            {/* Hamon (línea de temple) sutil */}
            <path d="M 48.5 10 Q 50 20 48.5 30 Q 50 40 48.5 50 Q 50 60 48.5 65"
              fill="none" stroke="#9F7AEA" strokeWidth="0.5" opacity="0.5"/>
            {/* Tsuba más detallada */}
            <ellipse cx="49" cy="68" rx="10" ry="4" fill="#7C3AED"/>
            <ellipse cx="49" cy="68" rx="8" ry="3" fill="#6D28D9"/>
            {/* Mango con grip */}
            <rect x="46" y="71" width="6" height="22" rx="2" fill="#1A0A2E"/>
            {/* Ito (vendaje) diagonal */}
            <rect x="46" y="73" width="6" height="2" rx="0"
              fill="#4C1D95" opacity="0.8"/>
            <rect x="46" y="77" width="6" height="2" rx="0"
              fill="#4C1D95" opacity="0.8"/>
            <rect x="46" y="81" width="6" height="2" rx="0"
              fill="#4C1D95" opacity="0.8"/>
            <rect x="46" y="85" width="6" height="2" rx="0"
              fill="#4C1D95" opacity="0.8"/>
            {/* Kashira (pommel) */}
            <ellipse cx="49" cy="94" rx="5" ry="3" fill="#6D28D9"/>
            {/* Punto verde acento */}
            <circle cx="49" cy="96" r="2.5" fill="#84CC16"/>
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

      {/* FRASES JAPONESAS REVERENTES */}
      <div style={{
        height: '80px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 8px',
        overflow: 'hidden',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.5s ease',
        marginTop: '6px',
      }}>
        {/* Kanji grande y sutil */}
        <div style={{
          fontSize: '20px',
          fontFamily: 'serif',
          color: quotes[current].color,
          opacity: 0.08,
          lineHeight: 1,
          marginBottom: '4px',
        }}>
          {quotes[current].kanji}
        </div>
        {/* Frase */}
        <p style={{
          fontSize: '9.5px',
          color: '#E9D5FF',
          fontWeight: '500',
          fontStyle: 'italic',
          whiteSpace: 'pre-line',
          lineHeight: '1.5',
          textAlign: 'center',
        }}>
          {quotes[current].text}
        </p>
        {/* Romaji */}
        <p style={{
          fontSize: '8px',
          color: '#7C3AED',
          letterSpacing: '0.12em',
          marginTop: '5px',
          textTransform: 'uppercase',
        }}>
          {quotes[current].romaji}
        </p>
      </div>

      {/* FOOTER BUSHIDO */}
      <div style={{
        borderTop: '1px solid rgba(76,29,149,0.25)',
        marginTop: '10px',
        paddingTop: '8px',
        textAlign: 'center',
        fontSize: '7px',
        color: '#2D1F4E',
        letterSpacing: '0.1em',
      }}>
        武士道 · Bushido
      </div>
    </div>
  )
}