// Pixel-art map of Japan — more accurate shape, with coastal/interior layering.
// Grid unit = 1 SVG unit. Viewbox 50x50.

const JAPAN_DOTS: [number, number][] = [
  // ============ HOKKAIDO (north) ============
  [34, 3], [36, 3], [38, 3],
  [32, 4], [34, 4], [36, 4], [38, 4], [40, 4],
  [30, 5], [32, 5], [34, 5], [36, 5], [38, 5], [40, 5], [42, 5],
  [30, 6], [32, 6], [34, 6], [36, 6], [38, 6], [40, 6], [42, 6],
  [32, 7], [34, 7], [36, 7], [38, 7], [40, 7],
  [32, 8], [34, 8], [36, 8], [38, 8],
  [34, 9], [36, 9],

  // ============ HONSHU (main island) ============
  // Northern tip (crossing Tsugaru strait)
  [34, 11], [36, 11],
  [32, 12], [34, 12], [36, 12], [38, 12],

  // Upper Honshu (Tohoku)
  [30, 13], [32, 13], [34, 13], [36, 13], [38, 13],
  [30, 14], [32, 14], [34, 14], [36, 14], [38, 14], [40, 14],
  [28, 15], [30, 15], [32, 15], [34, 15], [36, 15], [38, 15],
  [28, 16], [30, 16], [32, 16], [34, 16], [36, 16], [38, 16],
  [26, 17], [28, 17], [30, 17], [32, 17], [34, 17], [36, 17],

  // Kanto / Chubu (middle)
  [24, 18], [26, 18], [28, 18], [30, 18], [32, 18], [34, 18],
  [22, 19], [24, 19], [26, 19], [28, 19], [30, 19], [32, 19],
  [20, 20], [22, 20], [24, 20], [26, 20], [28, 20], [30, 20],

  // Kansai curve
  [18, 21], [20, 21], [22, 21], [24, 21], [26, 21],
  [16, 22], [18, 22], [20, 22], [22, 22], [24, 22],
  [14, 23], [16, 23], [18, 23], [20, 23], [22, 23],

  // Chugoku (western tip of Honshu)
  [12, 24], [14, 24], [16, 24], [18, 24],
  [10, 25], [12, 25], [14, 25], [16, 25],

  // ============ SHIKOKU (small island south of Honshu) ============
  [18, 26], [20, 26], [22, 26],
  [20, 27], [22, 27],

  // ============ KYUSHU (southwestern island) ============
  [8, 26], [10, 26], [12, 26],
  [6, 27], [8, 27], [10, 27], [12, 27],
  [6, 28], [8, 28], [10, 28], [12, 28],
  [8, 29], [10, 29], [12, 29],
  [10, 30],

  // ============ OKINAWA CHAIN (south, descending) ============
  [6, 33],
  [4, 35],
  [2, 37],
  [0, 39],
]

// Tokyo approximate position on the map
const TOKYO: [number, number] = [30, 18]

/**
 * Classify a dot as coastal or interior based on number of neighbors
 * within distance 2 on the grid. Coast = fewer than 4 neighbors.
 */
function classifyDots(dots: [number, number][]): {
  interior: Set<string>
  coastal: Set<string>
} {
  const set = new Set(dots.map(([x, y]) => `${x},${y}`))
  const interior = new Set<string>()
  const coastal = new Set<string>()
  const neighbors: [number, number][] = [
    [2, 0], [-2, 0], [0, 2], [0, -2],
    [2, 2], [-2, -2], [2, -2], [-2, 2],
  ]

  for (const [x, y] of dots) {
    const count = neighbors.reduce((acc, [dx, dy]) => {
      return acc + (set.has(`${x + dx},${y + dy}`) ? 1 : 0)
    }, 0)
    const key = `${x},${y}`
    if (count >= 4) interior.add(key)
    else coastal.add(key)
  }
  return { interior, coastal }
}

const { interior: INTERIOR_DOTS, coastal: COASTAL_DOTS } = classifyDots(JAPAN_DOTS)

interface JapanMapDotsProps {
  className?: string
}

export function JapanMapDots({ className }: JapanMapDotsProps) {
  return (
    <svg
      viewBox="0 0 50 50"
      preserveAspectRatio="xMidYMid meet"
      className={className}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <defs>
        <filter id="tokyoGlow" x="-200%" y="-200%" width="400%" height="400%">
          <feGaussianBlur stdDeviation="0.7" />
        </filter>
        <radialGradient id="tokyoGradient" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#BEF264" stopOpacity="1" />
          <stop offset="100%" stopColor="#84CC16" stopOpacity="0.8" />
        </radialGradient>
      </defs>

      {/* Coastal dots (dimmer) */}
      <g className="animate-japan-pulse">
        {JAPAN_DOTS.filter(([x, y]) => COASTAL_DOTS.has(`${x},${y}`)).map(
          ([x, y], i) => (
            <rect
              key={`coast-${i}`}
              x={x - 0.4}
              y={y - 0.4}
              width={0.8}
              height={0.8}
              fill="#A855F7"
              opacity={0.35}
            />
          )
        )}
      </g>

      {/* Interior dots (brighter) */}
      <g className="animate-japan-pulse-slow">
        {JAPAN_DOTS.filter(([x, y]) => INTERIOR_DOTS.has(`${x},${y}`)).map(
          ([x, y], i) => (
            <rect
              key={`in-${i}`}
              x={x - 0.4}
              y={y - 0.4}
              width={0.8}
              height={0.8}
              fill="#C084FC"
              opacity={0.55}
            />
          )
        )}
      </g>

      {/* Tokyo beacon */}
      <circle
        cx={TOKYO[0]}
        cy={TOKYO[1]}
        r={1.5}
        fill="#84CC16"
        opacity={0.4}
        filter="url(#tokyoGlow)"
      />
      <rect
        x={TOKYO[0] - 0.5}
        y={TOKYO[1] - 0.5}
        width={1}
        height={1}
        fill="url(#tokyoGradient)"
      />
      <rect
        x={TOKYO[0] - 0.15}
        y={TOKYO[1] - 0.15}
        width={0.3}
        height={0.3}
        fill="#FFFFFF"
        opacity={0.9}
      />
    </svg>
  )
}
