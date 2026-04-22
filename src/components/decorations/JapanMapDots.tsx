// Pixel-art map of Japan rendered as SVG dots.
// Coordinates approximate main islands: Hokkaido, Honshu, Shikoku, Kyushu.
const JAPAN_DOTS: [number, number][] = [
  // Hokkaido (north)
  [34, 4], [36, 4], [38, 4],
  [32, 5], [34, 5], [36, 5], [38, 5], [40, 5],
  [30, 6], [32, 6], [34, 6], [36, 6], [38, 6], [40, 6],
  [30, 7], [32, 7], [34, 7], [36, 7], [38, 7],
  [32, 8], [34, 8], [36, 8],

  // Tsugaru strait
  [34, 11], [36, 11],

  // Honshu (main island) - northern part
  [32, 13], [34, 13], [36, 13], [38, 13],
  [30, 14], [32, 14], [34, 14], [36, 14], [38, 14],
  [28, 15], [30, 15], [32, 15], [34, 15], [36, 15],
  [26, 16], [28, 16], [30, 16], [32, 16], [34, 16],
  [24, 17], [26, 17], [28, 17], [30, 17], [32, 17],

  // Honshu curving to southwest
  [22, 18], [24, 18], [26, 18], [28, 18], [30, 18],
  [20, 19], [22, 19], [24, 19], [26, 19], [28, 19],
  [18, 20], [20, 20], [22, 20], [24, 20], [26, 20],
  [16, 21], [18, 21], [20, 21], [22, 21], [24, 21],
  [14, 22], [16, 22], [18, 22], [20, 22], [22, 22],
  [12, 23], [14, 23], [16, 23], [18, 23], [20, 23],

  // Shikoku (small island south of Honshu)
  [18, 25], [20, 25], [22, 25],

  // Kyushu (southwestern island)
  [10, 25], [12, 25], [14, 25],
  [8, 26], [10, 26], [12, 26], [14, 26],
  [8, 27], [10, 27], [12, 27],
  [10, 28], [12, 28],

  // Okinawa chain hint (bottom-left small dots)
  [6, 30],
  [4, 32],
]

interface JapanMapDotsProps {
  className?: string
  /** Size multiplier for dots */
  dotSize?: number
  /** Opacity of dots */
  opacity?: number
}

export function JapanMapDots({
  className,
  dotSize = 3,
  opacity = 0.55,
}: JapanMapDotsProps) {
  return (
    <svg
      viewBox="0 0 50 40"
      preserveAspectRatio="xMidYMid meet"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="japanDotGradient" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#84CC16" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#C084FC" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
        </radialGradient>
        <filter id="japanDotGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="0.3" />
        </filter>
      </defs>

      <g opacity={opacity} filter="url(#japanDotGlow)">
        {JAPAN_DOTS.map(([x, y], i) => (
          <circle
            key={`${x}-${y}-${i}`}
            cx={x}
            cy={y}
            r={dotSize * 0.25}
            fill="url(#japanDotGradient)"
          />
        ))}
      </g>

      {/* Brighter core dots for depth */}
      <g opacity={opacity * 0.8}>
        {JAPAN_DOTS.map(([x, y], i) => (
          <circle
            key={`core-${x}-${y}-${i}`}
            cx={x}
            cy={y}
            r={dotSize * 0.15}
            fill="#C084FC"
          />
        ))}
      </g>
    </svg>
  )
}
