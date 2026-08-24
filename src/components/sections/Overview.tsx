import { Check } from 'lucide-react';
import { OVERVIEW_POINTS } from '@/data/content';
import { IMAGES } from '@/data/images';
import { Reveal } from '@/components/ui/Reveal';

export function Overview() {
  return (
    <section id="overview" className="py-24 md:py-32 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: text */}
          <div>
            <Reveal>
              <span className="section-label">
                <span className="h-px w-8 bg-gold-500" />
                Exhibition Overview
              </span>
              <h2 className="mt-4 font-display text-4xl md:text-5xl font-extrabold text-ink-900 leading-[1.1]">
                More Than an Exhibition.<br />
                <span className="text-gradient-gold">A Marketplace.</span>
              </h2>
              <p className="mt-6 text-lg text-ink-600 leading-relaxed">
                GEGD 2027 is designed to turn exhibition participation into commercial opportunity. This is not a display — it is a marketplace where products meet markets and business becomes opportunity.
              </p>
            </Reveal>

            <Reveal delay={200} className="mt-8">
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
                {OVERVIEW_POINTS.map((point, i) => (
                  <div key={i} className="flex items-start gap-3 group">
                    <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-sm bg-gold-100 flex items-center justify-center group-hover:bg-gold-400 transition-colors duration-300">
                      <Check size={12} className="text-gold-700 group-hover:text-ink-950 transition-colors" strokeWidth={3} />
                    </span>
                    <span className="text-sm text-ink-700 font-medium leading-snug">{point}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Right: visual */}
          <Reveal delay={150} className="relative">
            <div className="relative aspect-[4/5] rounded-sm overflow-hidden shadow-premium-lg">
              <img
                src={IMAGES.tradeShowMachinery}
                alt="Industrial exhibition with machinery on display"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="text-xs text-white/80 font-medium tracking-wider uppercase bg-ink-950/60 px-3 py-1.5 rounded-sm backdrop-blur-sm">
                  Artist's Impression — GEGD 2027
                </span>
              </div>
            </div>
            {/* Decorative frame */}
            <div className="absolute -top-4 -right-4 w-32 h-32 border-2 border-gold-400/30 -z-10" />
            <div className="absolute -bottom-4 -left-4 w-24 h-24 border-2 border-gold-400/20 -z-10" />
          </Reveal>
        </div>

        {/* Big statement */}
        <Reveal delay={100} className="mt-20 md:mt-28">
          <div className="text-center py-16 md:py-20 px-6 bg-ink-950 rounded-sm relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
                backgroundSize: '60px 60px',
              }}
            />
            <p className="relative font-display text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight">
              DON'T JUST EXHIBIT.<br />
              <span className="text-gradient-gold">DO BUSINESS.</span>
            </p>
            <div className="relative mt-6 flex items-center justify-center gap-3">
              <span className="h-px w-12 bg-gold-500/50" />
              <span className="text-gold-400 text-sm tracking-[0.3em] uppercase font-semibold">The GEGD Promise</span>
              <span className="h-px w-12 bg-gold-500/50" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
