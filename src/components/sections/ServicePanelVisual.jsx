import { memo } from 'react'

/**
 * Visuels abstraits de fond par panneau — SVG/CSS légers (pas de coût
 * WebGL supplémentaire), révélés au hover, avec parallaxe via `offset`
 * ({ x, y } en -1..1, fourni par le panneau parent) et intensifiés en
 * continu quand le panneau est `active`.
 */

function Wireframe({ offset, active }) {
  const tx = offset.x * 14
  const ty = offset.y * 10
  return (
    <svg
      viewBox="0 0 400 500"
      className="h-full w-full"
      style={{ transform: `translate(${tx}px, ${ty}px) scale(1.04)` }}
    >
      <defs>
        <linearGradient id="wf-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00f2fe" stopOpacity={active ? 0.75 : 0.5} />
          <stop offset="100%" stopColor="#00f2fe" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g>
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={40 + i * 50} x2="400" y2={40 + i * 50 - i * 6} stroke="url(#wf-fade)" strokeWidth="1">
            {active && (
              <animate
                attributeName="stroke-opacity"
                values="0.35;1;0.35"
                dur={`${2.4 + i * 0.15}s`}
                repeatCount="indefinite"
              />
            )}
          </line>
        ))}
        {active && (
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0; 0 -12; 0 0"
            dur="6s"
            repeatCount="indefinite"
          />
        )}
      </g>
      {Array.from({ length: 7 }).map((_, i) => (
        <line key={`v${i}`} x1={30 + i * 58} y1="0" x2={30 + i * 58 + 20} y2="500" stroke="url(#wf-fade)" strokeWidth="1" />
      ))}
      {/* Faisceau de scan vertical, actif uniquement au focus du panneau */}
      {active && (
        <rect x="0" y="0" width="60" height="500" fill="url(#wf-fade)" opacity="0.18">
          <animateTransform attributeName="transform" type="translate" values="-60 0; 400 0; -60 0" dur="3.2s" repeatCount="indefinite" />
        </rect>
      )}
      <circle cx="200" cy="230" r={active ? 4 : 3} fill="#00f2fe">
        <animate attributeName="opacity" values="0.2;1;0.2" dur={active ? '1.4s' : '2.4s'} repeatCount="indefinite" />
        {active && <animate attributeName="r" values="3;5;3" dur="1.4s" repeatCount="indefinite" />}
      </circle>
      <circle cx="120" cy="340" r="2" fill="#00f2fe">
        <animate attributeName="opacity" values="1;0.2;1" dur={active ? '1.8s' : '3.1s'} repeatCount="indefinite" />
      </circle>
      {active && (
        <circle cx="290" cy="140" r="2.5" fill="#67e8f9">
          <animate attributeName="opacity" values="0.2;1;0.2" dur="2s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  )
}

function Graph({ offset, active }) {
  const tx = offset.x * 12
  const ty = offset.y * 8
  const path = 'M0,180 L40,150 L80,190 L120,110 L160,140 L200,70 L240,100 L280,50 L320,80 L360,30 L400,55'
  return (
    <svg
      viewBox="0 0 400 220"
      className="h-full w-full"
      style={{ transform: `translate(${tx}px, ${ty}px)` }}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <line key={i} x1="0" y1={i * 44} x2="400" y2={i * 44} stroke="#ffffff" strokeOpacity="0.06" strokeWidth="1" />
      ))}
      <path d={path} fill="none" stroke="#00f2fe" strokeOpacity={active ? 0.85 : 0.55} strokeWidth={active ? 2 : 1.5}>
        <animate attributeName="stroke-dasharray" from="0,600" to="600,0" dur="2.6s" fill="freeze" />
        {active && (
          <animate attributeName="stroke-opacity" values="0.85;0.45;0.85" dur="2.2s" repeatCount="indefinite" />
        )}
      </path>
      <path d={path} fill="none" stroke="#00f2fe" strokeOpacity="0.12" strokeWidth="6" filter="blur(2px)" />
      <circle r={active ? 5 : 4} fill="#00f2fe">
        <animateMotion dur={active ? '2.2s' : '4s'} repeatCount="indefinite" path={path} />
      </circle>
      {active && (
        <circle r="3" fill="#67e8f9" opacity="0.7">
          <animateMotion dur="2.2s" begin="1.1s" repeatCount="indefinite" path={path} />
        </circle>
      )}
      {active &&
        [40, 160, 280, 360].map((cx, i) => (
          <circle key={cx} cx={cx} cy={[150, 140, 50, 30][i]} r="2.5" fill="#67e8f9">
            <animate attributeName="opacity" values="0.3;1;0.3" dur={`${1.6 + i * 0.3}s`} repeatCount="indefinite" />
          </circle>
        ))}
    </svg>
  )
}

function Matrix({ offset, active }) {
  const tx = offset.x * 10
  const columns = 10
  return (
    <div
      className="grid h-full w-full grid-cols-10 gap-[2px] font-mono text-[10px] leading-3 text-cyan-200/40"
      style={{ transform: `translateX(${tx}px)` }}
      aria-hidden="true"
    >
      {Array.from({ length: columns }).map((_, col) => (
        <div
          key={col}
          className={`flex flex-col items-center overflow-hidden opacity-70 ${active ? 'text-cyan-100/70' : ''}`}
          style={active ? { animation: `matrix-rain ${1.6 + (col % 4) * 0.3}s linear infinite` } : undefined}
        >
          {Array.from({ length: 16 }).map((__, row) => (
            <span
              key={row}
              style={{
                animation: `matrix-flicker ${(active ? 0.9 : 2) + ((col * 3 + row) % 5)}s linear infinite`,
                animationDelay: `${(col * 0.2 + row * 0.13) % 3}s`,
              }}
            >
              {(col * 7 + row * 13) % 2 === 0 ? '1' : '0'}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

const VISUALS = { wireframe: Wireframe, graph: Graph, matrix: Matrix }

function ServicePanelVisual({ type, offset, active }) {
  const Visual = VISUALS[type] || Wireframe
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-0 transition-opacity duration-700 group-hover:opacity-100 group-focus-within:opacity-100">
      <Visual offset={offset} active={active} />
    </div>
  )
}

export default memo(ServicePanelVisual)
