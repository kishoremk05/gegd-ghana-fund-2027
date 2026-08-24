import { ArrowRight, LayoutGrid } from 'lucide-react';
import { IMAGES } from '@/data/images';
import { Reveal } from '@/components/ui/Reveal';

export function CommercialCTA() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={IMAGES.accraCityscape}
          alt="Accra, Ghana cityscape"
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/90 to-ink-950/70" />
      </div>

      <div className="relative max-w-[1400px] mx-auto px-4 md:px-8">
        <Reveal className="max-w-2xl">
          <span className="section-label">
            <span className="h-px w-8 bg-gold-500" />
            Take Action
          </span>
          <h2 className="mt-4 font-display text-4xl md:text-6xl font-black text-white leading-[1.05]">
            Ready to Take Your Business to the <span className="text-gradient-gold">Market?</span>
          </h2>
          <p className="mt-6 text-lg text-ink-200 leading-relaxed">
            Reserve your exhibition space before the preferred locations are taken. GEGD 2027 is your gateway to African markets, buyers and investors.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#register"
              onClick={(e) => { e.preventDefault(); document.querySelector('#register')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="btn-primary"
            >
              Reserve a Stand
              <ArrowRight size={18} />
            </a>
            <a
              href="#floor-plan"
              onClick={(e) => { e.preventDefault(); document.querySelector('#floor-plan')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="btn-secondary"
            >
              <LayoutGrid size={18} />
              View Floor Plan
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
