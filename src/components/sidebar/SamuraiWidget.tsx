'use client'
import { SamuraiQuotes } from './SamuraiQuotes'

export function SamuraiWidget() {
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
        maxHeight: '200px',
      }}>

        {/* Aura violeta detrás */}
        <div
          className="samurai-aura"
          style={{
            position: 'absolute',
            top: '15%',
            left: '15%',
            right: '15%',
            bottom: '15%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #7C3AED 0%, #4C1D95 40%, transparent 70%)',
            zIndex: 0,
          }}
        />

        {/* Samurai flotando con glow */}
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