/**
 * ParadiseAurora — "cascade de couleurs" : nappes de lumière chaude
 * (orange → corail → or) qui dérivent lentement en fond du contenu,
 * pour une ambiance tropicale/lumineuse sur le thème clair. CSS pur
 * (transform only under the hood), aucun coût JS/canvas.
 */
export default function ParadiseAurora() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div
        className="aurora-blob"
        style={{
          top: '-10%',
          left: '-8%',
          width: '55vw',
          height: '55vw',
          background: 'rgb(var(--accent-rgb) / 0.16)',
          animationDelay: '0s',
        }}
      />
      <div
        className="aurora-blob"
        style={{
          top: '20%',
          right: '-12%',
          width: '48vw',
          height: '48vw',
          background: 'rgb(var(--accent2-rgb) / 0.13)',
          animationDelay: '-9s',
        }}
      />
      <div
        className="aurora-blob"
        style={{
          bottom: '5%',
          left: '18%',
          width: '40vw',
          height: '40vw',
          background: 'rgb(var(--accent3-rgb) / 0.12)',
          animationDelay: '-17s',
        }}
      />
    </div>
  )
}
