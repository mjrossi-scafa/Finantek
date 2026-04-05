'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { SamuraiQuotes } from './SamuraiQuotes'
import { SamuraiFallback } from './SamuraiFallback'

const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

export function SamuraiWidget() {
  const [animData, setAnimData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const tryLoadAnimation = async () => {
      try {
        // Lista de posibles animaciones ordenadas por preferencia
        const animationPaths = [
          '/animations/samurai.json',
          '/animations/ninja.json',
          '/animations/warrior.json',
          '/animations/test.json' // la que sabemos que funciona
        ]

        for (const path of animationPaths) {
          try {
            const response = await fetch(path)
            if (!response.ok) continue

            const data = await response.json()

            // Validar que es una animación Lottie válida
            if (data && data.v && data.layers && data.w && data.h) {
              setAnimData(data)
              setLoading(false)
              return
            }
          } catch (err) {
            continue
          }
        }

        // No se encontró animación válida
        setError(true)
        setLoading(false)

      } catch (err) {
        setError(true)
        setLoading(false)
      }
    }

    // Dar 2 segundos para intentar cargar Lottie, luego usar fallback
    setTimeout(() => {
      if (loading) {
        setError(true)
        setLoading(false)
      }
    }, 2000)

    tryLoadAnimation()
  }, [])

  // Loading state
  if (loading) {
    return (
      <div className="px-3 py-2 hidden lg:block">
        <div style={{
          width: '100%',
          height: '120px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            animation: 'spin 1s linear infinite',
            width: '20px', height: '20px',
            border: '2px solid #7C3AED',
            borderTop: '2px solid transparent',
            borderRadius: '50%'
          }}/>
        </div>
      </div>
    )
  }

  // Si hay animación Lottie válida, usarla
  if (!error && animData) {
    return (
      <div className="px-3 py-2 hidden lg:block">
        <div style={{
          width: '100%',
          maxHeight: '180px',
          overflow: 'hidden',
          filter: 'hue-rotate(260deg) saturate(1.3) brightness(1.1)', // Ajustar a tema morado
          borderRadius: '12px'
        }}>
          <Lottie
            animationData={animData}
            loop={true}
            style={{
              width: '100%',
              height: 'auto'
            }}
          />
        </div>
        <SamuraiQuotes />
      </div>
    )
  }

  // Fallback: usar el samurai PNG existente con mejores animaciones CSS
  return (
    <div className="px-3 py-2 hidden lg:block">
      <style>{`
        @keyframes float {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-8px); }
        }
        @keyframes eyeGlow {
          0%,100% {
            filter: drop-shadow(0 0 4px #84CC16)
                    drop-shadow(0 0 8px #84CC16);
          }
          50% {
            filter: drop-shadow(0 0 12px #84CC16)
                    drop-shadow(0 0 24px #84CC16)
                    drop-shadow(0 0 4px #A855F7);
          }
        }
        @keyframes auraGlow {
          0%,100% { opacity: 0.12; transform: scale(1); }
          50%      { opacity: 0.28; transform: scale(1.08); }
        }
        @keyframes swordShine {
          0%,100% {
            filter: drop-shadow(0 0 3px #A855F7)
                    drop-shadow(0 0 6px #7C3AED);
          }
          50% {
            filter: drop-shadow(0 0 14px #A855F7)
                    drop-shadow(0 0 28px #7C3AED)
                    drop-shadow(0 0 6px #C084FC);
          }
        }
        .samurai-float {
          animation: float 4s ease-in-out infinite;
        }
        .samurai-glow {
          animation: eyeGlow 2s ease-in-out infinite,
                     swordShine 3s ease-in-out infinite;
        }
        .samurai-aura {
          animation: auraGlow 3s ease-in-out infinite;
        }
      `}</style>

      <div style={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        maxHeight: '180px',
      }}>

        {/* Aura violeta mejorada */}
        <div
          className="samurai-aura"
          style={{
            position: 'absolute',
            top: '10%', left: '10%', right: '10%', bottom: '10%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, rgba(76,29,149,0.2) 40%, transparent 70%)',
            zIndex: 0,
          }}
        />

        {/* Samurai flotando con glow mejorado */}
        <div
          className="samurai-float samurai-glow"
          style={{
            position: 'relative',
            zIndex: 1,
            background: 'transparent',
            mixBlendMode: 'lighten',
          }}>
          <img
            src="/images/samurai.png"
            alt="Katana Samurai"
            style={{
              width: '140%',
              marginLeft: '-20%',
              marginTop: '-5%',
              height: 'auto',
              mixBlendMode: 'lighten',
            }}
          />
        </div>

      </div>

      <SamuraiQuotes />
    </div>
  )
}