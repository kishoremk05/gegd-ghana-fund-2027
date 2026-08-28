import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import stadiumExhibition from '@/assets/stadium-exhibition.jpg';

const BOOTHS = [
  {
    name: 'Standard Booth',
    size: '12 m² · 3m × 4m',
    description: 'Enclosed exhibition unit with LED signage, climate control and full hospitality package.',
    visual: 'standard' as const,
  },
  {
    name: 'Corner Booth',
    size: '12 m² · 3m × 4m',
    description: 'Double visibility at aisle intersections with two open sides for increased foot traffic.',
    visual: 'corner' as const,
  },
  {
    name: 'Premium Booth',
    size: '12 m² · 3m × 4m',
    description: 'Maximum exhibition space for large displays, dedicated demo zones and premium positioning.',
    visual: 'premium' as const,
  },
  {
    name: 'Outdoor Area',
    size: '100 m² · 10m × 10m',
    description: 'Dedicated outdoor space for large machinery, equipment demonstrations and heavy displays.',
    visual: 'outdoor' as const,
  },
];

function BoothVisual({ type }: { type: 'standard' | 'corner' | 'premium' | 'outdoor' }) {
  const configs = {
    standard: { w: 120, h: 160, color: '#f0f4f8', stroke: '#aeb6c4', label: '3m × 4m' },
    corner: { w: 120, h: 160, color: '#fef3c7', stroke: '#fbbf24', label: '3m × 4m' },
    premium: { w: 120, h: 160, color: '#fdf9ed', stroke: '#e9b43e', label: '3m × 4m' },
    outdoor: { w: 200, h: 200, color: '#eef5ff', stroke: '#599cff', label: '10m × 10m' },
  };
  const c = configs[type];

  return (
    <div className="relative w-full h-56 bg-ink-50 rounded-sm flex items-center justify-center overflow-hidden border border-ink-100">
      <svg viewBox="0 0 400 224" className="w-full h-full">
        <defs>
          <pattern id={`booth-grid-${type}`} width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#eceef2" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="400" height="224" fill={`url(#booth-grid-${type})`} />

        {/* Booth shape */}
        <rect
          x={(400 - c.w) / 2}
          y={(224 - c.h) / 2}
          width={c.w}
          height={c.h}
          fill={c.color}
          stroke={c.stroke}
          strokeWidth="2"
          rx="4"
        />

        {/* LED signage strip */}
        <rect x={(400 - c.w) / 2 + 8} y={(224 - c.h) / 2 + 8} width={c.w - 16} height="14" fill={c.stroke} opacity="0.3" rx="2" />

        {/* Interior details */}
        {type !== 'outdoor' && (
          <>
            <rect x={(400 - c.w) / 2 + 16} y={(224 - c.h) / 2 + 36} width="40" height="20" fill={c.stroke} opacity="0.15" rx="2" />
            <circle cx={(400 - c.w) / 2 + 36} cy={(224 - c.h) / 2 + 80} r="8" fill={c.stroke} opacity="0.1" />
            <circle cx={(400 - c.w) / 2 + 60} cy={(224 - c.h) / 2 + 80} r="8" fill={c.stroke} opacity="0.1" />
            <circle cx={(400 - c.w) / 2 + 84} cy={(224 - c.h) / 2 + 80} r="8" fill={c.stroke} opacity="0.1" />
          </>
        )}
        {type === 'outdoor' && (
          <>
            <rect x={(400 - c.w) / 2 + 30} y={(224 - c.h) / 2 + 30} width="50" height="30" fill={c.stroke} opacity="0.15" rx="2" />
            <rect x={(400 - c.w) / 2 + 100} y={(224 - c.h) / 2 + 40} width="40" height="50" fill={c.stroke} opacity="0.15" rx="2" />
            <circle cx={(400 - c.w) / 2 + 150} cy={(224 - c.h) / 2 + 130} r="15" fill={c.stroke} opacity="0.1" />
          </>
        )}

        {/* Dimension label */}
        <text x="200" y="210" textAnchor="middle" fontSize="10" fill="#828d9f" fontWeight="600">{c.label}</text>
      </svg>
    </div>
  );
}

export function BoothDesign() {
  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <SectionHeading
          label="Booth Design"
          title={<>Booth Design <span className="text-gradient-gold">Visual</span></>}
          subtitle="Conceptual representations of each exhibition space configuration."
        />

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BOOTHS.map((booth, i) => (
            <Reveal key={booth.name} delay={i * 100} className="group">
              <BoothVisual type={booth.visual} />
              <div className="mt-4">
                <h3 className="font-display text-lg font-bold text-ink-900">{booth.name}</h3>
                <p className="text-xs text-gold-600 font-semibold tracking-wide mt-0.5">{booth.size}</p>
                <p className="mt-2 text-sm text-ink-600 leading-relaxed">{booth.description}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200} className="mt-10 text-center">
          <span className="inline-block text-xs text-ink-500 font-medium tracking-wider uppercase bg-ink-50 px-4 py-2 rounded-sm border border-ink-100 mb-4">
            Artist's Impression — GEGD 2027
          </span>
          <div className="rounded overflow-hidden shadow-md border border-ink-100 max-w-3xl mx-auto">
            <img 
              src={stadiumExhibition} 
              alt="Artist impression of the GEGD 2027 stadium exhibition layout" 
              className="w-full h-auto object-cover"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
