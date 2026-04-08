'use client'

import { useEffect, useState, useRef } from 'react'
import { CherryBlossoms } from './CherryBlossoms'

interface SamuraiWidgetProps {
  transitioning?: boolean
}

export function SamuraiWidget({ transitioning = false }: SamuraiWidgetProps) {
  const [current, setCurrent] = useState(0)
  const [visible, setVisible] = useState(true)
  const katanaContainerRef = useRef<HTMLDivElement>(null)

  // FRASES BUSHIDO SAKURA - VERSION ESTACIONAL
  const quotes = [
    {
      text: '"Como los cerezos florecen,\ntu riqueza crecerá"',
      kanji: '桜',
      romaji: 'Sakura · Flor de cerezo',
      color: '#F9A8D4'
    },
    {
      text: '"Cada peso ahorrado\nes un pétalo de primavera"',
      kanji: '春',
      romaji: 'Haru · Primavera',
      color: '#84CC16'
    },
    {
      text: '"La belleza del ahorro\nes como la sakura efímera"',
      kanji: '美',
      romaji: 'Bi · Belleza',
      color: '#E9D5FF'
    },
    {
      text: '"En cada flor hay una\nlección de economía"',
      kanji: '花',
      romaji: 'Hana · Flor',
      color: '#C084FC'
    },
  ]

  const quoteInterval = 6000 // Más lento para ser relajante

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

      {/* WIDGET SAMURAI ORIGINAL */}
      <div
        ref={katanaContainerRef}
        style={{
          position: 'relative',
          width: '100%',
          height: '160px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}
      >
        {/* Cherry blossoms sakura estacional */}
        <CherryBlossoms />

        {/* Círculo de meditación sutil */}
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '120px', height: '120px',
          borderRadius: '50%',
          border: '1px solid rgba(124,58,237,0.08)',
          background: 'radial-gradient(circle, rgba(124,58,237,0.02) 0%, transparent 70%)',
        }}/>

        {/* Aura dinámica original */}
        <div className="k-aura" style={{
          position: 'absolute',
          top: '15%', left: '15%', right: '15%', bottom: '15%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, rgba(124,58,237,0.15) 30%, rgba(76,29,149,0.08) 60%, transparent 80%)',
          border: '1px solid rgba(124,58,237,0.1)',
        }}/>

        {/* KATANA ELEGANTE - animación original diagonal */}
        <div className="k-float k-glow" style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(-45deg)',
          transformOrigin: 'center',
          zIndex: 10,
        }}>
          <svg width="100" height="100" viewBox="0 0 100 100">
            {/* Hoja larga y delgada — diagonal */}
            <rect x="48.5" y="2" width="3" height="65" rx="1.5"
              fill="#C084FC" transform="rotate(0 50 50)"/>
            <rect x="49" y="2" width="1" height="63" rx="1"
              fill="#EDE9FE" opacity="0.8"
              transform="rotate(0 50 50)"/>
            {/* Punta afilada */}
            <polygon points="47.5,2 51.5,2 50,0" fill="#EDE9FE"/>
            {/* Hamon (línea de temple) sutil */}
            <path d="M 49 10 Q 50 20 49 30 Q 50 40 49 50 Q 50 60 49 65"
              fill="none" stroke="#9F7AEA" strokeWidth="0.5" opacity="0.5"/>
            {/* Tsuba más detallada */}
            <ellipse cx="50" cy="68" rx="10" ry="4" fill="#7C3AED"/>
            <ellipse cx="50" cy="68" rx="8" ry="3" fill="#6D28D9"/>
            {/* Mango con grip */}
            <rect x="47" y="71" width="6" height="22" rx="2" fill="#1A0A2E"/>
            {/* Ito (vendaje) diagonal */}
            <rect x="47" y="73" width="6" height="2" rx="0"
              fill="#4C1D95" opacity="0.8"/>
            <rect x="47" y="77" width="6" height="2" rx="0"
              fill="#4C1D95" opacity="0.8"/>
            <rect x="47" y="81" width="6" height="2" rx="0"
              fill="#4C1D95" opacity="0.8"/>
            <rect x="47" y="85" width="6" height="2" rx="0"
              fill="#4C1D95" opacity="0.8"/>
            {/* Kashira (pommel) */}
            <ellipse cx="50" cy="94" rx="5" ry="3" fill="#6D28D9"/>
            {/* Pétalos sakura decorativos */}
            <circle cx="50" cy="96" r="2.5" fill="#F9A8D4" opacity="0.8"/>
            <circle cx="35" cy="25" r="1.5" fill="#FFC0CB" opacity="0.6"/>
            <circle cx="65" cy="35" r="1" fill="#E9D5FF" opacity="0.7"/>
            <circle cx="45" cy="55" r="1.2" fill="#F9A8D4" opacity="0.5"/>
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

        {/* Sombra bajo la katana */}
        <div style={{
          position: 'absolute',
          bottom: '5%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60px',
          height: '3px',
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

      {/* FOOTER SAKURA ESTACIONAL */}
      <div style={{
        borderTop: '1px solid rgba(249,168,212,0.25)',
        marginTop: '10px',
        paddingTop: '8px',
        textAlign: 'center',
        fontSize: '7px',
        color: '#8B5A80',
        letterSpacing: '0.1em',
      }}>
        桜の季節 · Sakura no Kisetsu
      </div>
    </div>
  )
}