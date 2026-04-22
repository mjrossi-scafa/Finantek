'use client'

import { cn } from '@/lib/utils'

export type KenjiPose = 'saludo' | 'explicando' | 'celebrando' | 'meditando'

interface SamuraiKenjiProps {
  pose: KenjiPose
  size?: number
  animated?: boolean
  className?: string
}

export function SamuraiKenji({
  pose,
  size = 200,
  animated = true,
  className,
}: SamuraiKenjiProps) {
  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center transition-all duration-500',
        animated && 'animate-kenji-breathe',
        className
      )}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        shapeRendering="crispEdges"
        style={{ imageRendering: 'pixelated' }}
      >
        {pose === 'saludo' && <PoseSaludo />}
        {pose === 'explicando' && <PoseExplicando />}
        {pose === 'celebrando' && <PoseCelebrando />}
        {pose === 'meditando' && <PoseMeditando />}
      </svg>
    </div>
  )
}

function PoseSaludo() {
  return (
    <>
      <ellipse cx="32" cy="58" rx="14" ry="2" fill="#000" opacity="0.5" />

      <rect x="18" y="12" width="28" height="3" fill="#5B21B6" />
      <rect x="16" y="14" width="32" height="2" fill="#5B21B6" />
      <rect x="20" y="10" width="24" height="2" fill="#7C3AED" />
      <rect x="22" y="8" width="20" height="2" fill="#7C3AED" />
      <rect x="24" y="6" width="16" height="2" fill="#9333EA" />
      <rect x="22" y="8" width="6" height="2" fill="#C084FC" />

      <rect x="22" y="16" width="20" height="8" fill="#E9D5FF" />
      <rect x="22" y="16" width="20" height="2" fill="#FAF5FF" />
      <rect x="22" y="22" width="20" height="2" fill="#C084FC" />

      <rect x="26" y="19" width="3" height="1" fill="#0A0416" />
      <rect x="35" y="19" width="3" height="1" fill="#0A0416" />

      <rect x="28" y="24" width="8" height="2" fill="#C084FC" />

      <rect x="20" y="26" width="24" height="4" fill="#9333EA" />
      <rect x="18" y="28" width="28" height="8" fill="#9333EA" />
      <rect x="18" y="28" width="28" height="2" fill="#C084FC" />
      <rect x="18" y="34" width="28" height="2" fill="#5B21B6" />

      <rect x="20" y="34" width="24" height="2" fill="#FCD34D" />

      <rect x="22" y="30" width="6" height="6" fill="#7C3AED" />
      <rect x="36" y="30" width="6" height="6" fill="#7C3AED" />
      <rect x="22" y="30" width="6" height="2" fill="#A855F7" />
      <rect x="36" y="30" width="6" height="2" fill="#A855F7" />

      <rect x="28" y="32" width="8" height="3" fill="#E9D5FF" />

      <rect x="18" y="36" width="28" height="14" fill="#1E0B3A" />
      <rect x="18" y="36" width="28" height="2" fill="#4C1D95" />
      <rect x="22" y="38" width="1" height="12" fill="#4C1D95" />
      <rect x="32" y="38" width="1" height="12" fill="#4C1D95" />
      <rect x="42" y="38" width="1" height="12" fill="#4C1D95" />

      <rect x="46" y="30" width="2" height="16" fill="#84CC16" opacity="0.8" />
      <rect x="47" y="29" width="1" height="2" fill="#FCD34D" />

      <rect x="22" y="50" width="8" height="3" fill="#0A0416" />
      <rect x="34" y="50" width="8" height="3" fill="#0A0416" />

      <circle cx="54" cy="10" r="2.5" fill="#84CC16" opacity="0.4" />
      <circle cx="54" cy="10" r="1.5" fill="#84CC16" />
      <circle cx="53.5" cy="9.5" r="0.6" fill="#FFF" />
    </>
  )
}

function PoseExplicando() {
  return (
    <>
      <ellipse cx="32" cy="58" rx="14" ry="2" fill="#000" opacity="0.5" />

      <rect x="30" y="4" width="4" height="3" fill="#0A0416" />
      <rect x="29" y="6" width="6" height="2" fill="#0A0416" />

      <rect x="24" y="8" width="16" height="12" fill="#E9D5FF" />
      <rect x="24" y="8" width="16" height="2" fill="#FAF5FF" />
      <rect x="24" y="18" width="16" height="2" fill="#C084FC" />

      <rect x="22" y="10" width="2" height="6" fill="#0A0416" />
      <rect x="40" y="10" width="2" height="6" fill="#0A0416" />

      <rect x="27" y="12" width="2" height="2" fill="#0A0416" />
      <rect x="35" y="12" width="2" height="2" fill="#0A0416" />
      <rect x="28" y="12" width="1" height="1" fill="#FFF" />
      <rect x="36" y="12" width="1" height="1" fill="#FFF" />

      <rect x="29" y="16" width="6" height="1" fill="#0A0416" />

      <rect x="28" y="20" width="8" height="2" fill="#C084FC" />

      <rect x="20" y="22" width="24" height="4" fill="#9333EA" />
      <rect x="18" y="24" width="28" height="14" fill="#9333EA" />
      <rect x="18" y="24" width="28" height="2" fill="#C084FC" />
      <rect x="18" y="36" width="28" height="2" fill="#FCD34D" />
      <rect x="30" y="28" width="4" height="4" fill="#84CC16" />
      <rect x="31" y="29" width="2" height="2" fill="#A3E635" />

      <rect x="16" y="26" width="4" height="12" fill="#7C3AED" />
      <rect x="16" y="26" width="4" height="2" fill="#A855F7" />

      <rect x="44" y="20" width="4" height="10" fill="#7C3AED" />
      <rect x="44" y="20" width="4" height="2" fill="#A855F7" />
      <rect x="46" y="14" width="4" height="8" fill="#7C3AED" />
      <rect x="46" y="10" width="4" height="4" fill="#E9D5FF" />
      <rect x="47" y="6" width="2" height="4" fill="#E9D5FF" />

      <rect x="18" y="38" width="28" height="12" fill="#1E0B3A" />
      <rect x="18" y="38" width="28" height="2" fill="#4C1D95" />
      <rect x="22" y="40" width="1" height="10" fill="#4C1D95" />
      <rect x="32" y="40" width="1" height="10" fill="#4C1D95" />
      <rect x="42" y="40" width="1" height="10" fill="#4C1D95" />

      <rect x="14" y="32" width="2" height="14" fill="#84CC16" opacity="0.8" />
      <rect x="13" y="31" width="4" height="2" fill="#FCD34D" />

      <rect x="22" y="50" width="8" height="3" fill="#0A0416" />
      <rect x="34" y="50" width="8" height="3" fill="#0A0416" />

      <circle cx="10" cy="12" r="2.5" fill="#84CC16" opacity="0.4" />
      <circle cx="10" cy="12" r="1.5" fill="#84CC16" />
      <circle cx="9.5" cy="11.5" r="0.6" fill="#FFF" />
    </>
  )
}

function PoseCelebrando() {
  return (
    <>
      <ellipse cx="32" cy="58" rx="14" ry="2" fill="#000" opacity="0.5" />

      <circle cx="12" cy="18" r="1" fill="#84CC16" opacity="0.6" />
      <circle cx="52" cy="22" r="1" fill="#84CC16" opacity="0.6" />
      <circle cx="8" cy="30" r="1" fill="#A3E635" opacity="0.5" />
      <circle cx="56" cy="34" r="1" fill="#A3E635" opacity="0.5" />
      <circle cx="14" cy="42" r="1" fill="#84CC16" opacity="0.6" />

      <rect x="30" y="18" width="4" height="3" fill="#0A0416" />
      <rect x="29" y="20" width="6" height="2" fill="#0A0416" />

      <rect x="24" y="22" width="16" height="12" fill="#E9D5FF" />
      <rect x="24" y="22" width="16" height="2" fill="#FAF5FF" />
      <rect x="24" y="32" width="16" height="2" fill="#C084FC" />
      <rect x="22" y="24" width="2" height="6" fill="#0A0416" />
      <rect x="40" y="24" width="2" height="6" fill="#0A0416" />

      <rect x="27" y="26" width="2" height="2" fill="#0A0416" />
      <rect x="35" y="26" width="2" height="2" fill="#0A0416" />
      <rect x="28" y="26" width="1" height="1" fill="#84CC16" />
      <rect x="36" y="26" width="1" height="1" fill="#84CC16" />

      <rect x="29" y="30" width="6" height="2" fill="#0A0416" />
      <rect x="30" y="31" width="4" height="1" fill="#7C3AED" />

      <rect x="28" y="34" width="8" height="2" fill="#C084FC" />

      <rect x="20" y="36" width="24" height="14" fill="#9333EA" />
      <rect x="20" y="36" width="24" height="2" fill="#C084FC" />
      <rect x="20" y="48" width="24" height="2" fill="#FCD34D" />

      <rect x="30" y="40" width="4" height="4" fill="#84CC16" />
      <rect x="31" y="41" width="2" height="2" fill="#A3E635" />

      <rect x="44" y="30" width="4" height="8" fill="#7C3AED" />
      <rect x="44" y="30" width="4" height="2" fill="#A855F7" />
      <rect x="46" y="20" width="4" height="12" fill="#7C3AED" />
      <rect x="45" y="16" width="6" height="4" fill="#E9D5FF" />

      <rect x="47" y="14" width="2" height="2" fill="#FCD34D" />
      <rect x="46" y="12" width="4" height="2" fill="#78350F" />
      <rect x="47" y="4" width="2" height="8" fill="#E5E7EB" />
      <rect x="47" y="2" width="2" height="2" fill="#F3F4F6" />
      <rect x="48" y="4" width="1" height="8" fill="#9CA3AF" />
      <rect x="47" y="3" width="2" height="1" fill="#FFF" />

      <rect x="14" y="36" width="4" height="10" fill="#7C3AED" />
      <rect x="18" y="42" width="4" height="4" fill="#E9D5FF" />

      <rect x="20" y="50" width="24" height="10" fill="#1E0B3A" />
      <rect x="20" y="50" width="24" height="2" fill="#4C1D95" />
      <rect x="24" y="52" width="1" height="8" fill="#4C1D95" />
      <rect x="32" y="52" width="1" height="8" fill="#4C1D95" />
      <rect x="40" y="52" width="1" height="8" fill="#4C1D95" />

      <circle cx="32" cy="12" r="3" fill="#84CC16" opacity="0.4" />
      <circle cx="32" cy="12" r="2" fill="#84CC16" />
      <circle cx="31.5" cy="11.5" r="0.7" fill="#FFF" />
    </>
  )
}

function PoseMeditando() {
  return (
    <>
      <ellipse cx="32" cy="56" rx="18" ry="2" fill="#000" opacity="0.5" />

      <circle cx="32" cy="32" r="28" fill="none" stroke="#84CC16" strokeWidth="0.5" opacity="0.2" />
      <circle cx="32" cy="32" r="22" fill="none" stroke="#C084FC" strokeWidth="0.3" opacity="0.3" />

      <rect x="30" y="10" width="4" height="3" fill="#0A0416" />
      <rect x="29" y="12" width="6" height="2" fill="#0A0416" />

      <rect x="24" y="14" width="16" height="12" fill="#E9D5FF" />
      <rect x="24" y="14" width="16" height="2" fill="#FAF5FF" />
      <rect x="24" y="24" width="16" height="2" fill="#C084FC" />
      <rect x="22" y="16" width="2" height="6" fill="#0A0416" />
      <rect x="40" y="16" width="2" height="6" fill="#0A0416" />

      <rect x="26" y="19" width="4" height="1" fill="#0A0416" />
      <rect x="34" y="19" width="4" height="1" fill="#0A0416" />

      <rect x="29" y="22" width="6" height="1" fill="#0A0416" />
      <rect x="28" y="21" width="1" height="1" fill="#0A0416" />
      <rect x="35" y="21" width="1" height="1" fill="#0A0416" />

      <rect x="28" y="26" width="8" height="2" fill="#C084FC" />

      <rect x="16" y="28" width="32" height="4" fill="#9333EA" />
      <rect x="14" y="30" width="36" height="14" fill="#9333EA" />
      <rect x="14" y="30" width="36" height="2" fill="#C084FC" />
      <rect x="14" y="40" width="36" height="2" fill="#FCD34D" />

      <rect x="30" y="34" width="4" height="4" fill="#84CC16" />
      <rect x="31" y="35" width="2" height="2" fill="#A3E635" />

      <rect x="10" y="32" width="6" height="10" fill="#7C3AED" />
      <rect x="10" y="32" width="6" height="2" fill="#A855F7" />
      <rect x="48" y="32" width="6" height="10" fill="#7C3AED" />
      <rect x="48" y="32" width="6" height="2" fill="#A855F7" />

      <rect x="10" y="42" width="6" height="4" fill="#E9D5FF" />
      <rect x="48" y="42" width="6" height="4" fill="#E9D5FF" />

      <rect x="16" y="42" width="32" height="6" fill="#1E0B3A" />
      <rect x="16" y="42" width="32" height="2" fill="#4C1D95" />
      <rect x="14" y="46" width="36" height="6" fill="#1E0B3A" />
      <rect x="14" y="46" width="36" height="2" fill="#4C1D95" />
      <rect x="18" y="46" width="4" height="4" fill="#2E1065" />
      <rect x="42" y="46" width="4" height="4" fill="#2E1065" />

      <rect x="52" y="50" width="10" height="2" fill="#78350F" />
      <rect x="56" y="50" width="2" height="2" fill="#FCD34D" />
      <rect x="52" y="51" width="10" height="1" fill="#E5E7EB" />

      <circle cx="8" cy="20" r="0.5" fill="#84CC16" opacity="0.6" />
      <circle cx="56" cy="22" r="0.5" fill="#C084FC" opacity="0.6" />
      <circle cx="6" cy="32" r="0.5" fill="#84CC16" opacity="0.5" />
      <circle cx="58" cy="34" r="0.5" fill="#C084FC" opacity="0.5" />

      <circle cx="32" cy="6" r="3" fill="#84CC16" opacity="0.3" />
      <circle cx="32" cy="6" r="1.5" fill="#84CC16" />
      <circle cx="31.5" cy="5.5" r="0.5" fill="#FFF" />
    </>
  )
}
