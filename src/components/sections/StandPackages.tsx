import { Check, ArrowRight, Star } from 'lucide-react';
import { STAND_PACKAGES } from '@/data/content';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';

export function StandPackages() {
  return (
    <section id="stands" className="py-24 md:py-32 bg-ink-50">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <SectionHeading
          label="Stand Packages"
          title={<>Choose Your <span className="text-gradient-gold">Exhibition Space</span></>}
          subtitle="Four premium exhibition packages designed for every scale of business — from standard enclosed units to large outdoor display areas."
        />

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STAND_PACKAGES.map((pkg, i) => (
            <Reveal
              key={pkg.name}
              delay={i * 100}
              className={`relative flex flex-col bg-white rounded-sm border-2 transition-all duration-400 hover:-translate-y-1.5 ${
                pkg.highlighted
                  ? 'border-gold-400 shadow-gold-gold lg:scale-105 lg:-mt-2'
                  : 'border-ink-100 hover:border-gold-300 hover:shadow-premium-lg'
              }`}
            >
              {pkg.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-gold-500 text-ink-950 px-4 py-1 rounded-sm text-xs font-bold uppercase tracking-wide">
                  <Star size={12} fill="currentColor" />
                  Recommended
                </div>
              )}

              <div className="p-6 pb-4">
                <h3 className="font-display text-xl font-bold text-ink-900">{pkg.name}</h3>
                <div className="mt-1 text-sm text-ink-500 font-medium">{pkg.dimensions} · {pkg.size}</div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-display text-3xl font-black text-ink-900">{pkg.price}</span>
                </div>
              </div>

              <div className="px-6 pb-6 flex-1">
                <ul className="space-y-2.5">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <span className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-sm flex items-center justify-center ${
                        pkg.highlighted ? 'bg-gold-100' : 'bg-ink-50'
                      }`}>
                        <Check size={11} className="text-gold-600" strokeWidth={3} />
                      </span>
                      <span className="text-sm text-ink-600 leading-snug">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-6 pt-0">
                <button
                  onClick={() => {
                    const initiateEvent = new CustomEvent('initiate-booking', {
                      detail: {
                        step: 0, // Always start at Step 1 (Company Information) step 0
                        package: pkg.name
                      }
                    });
                    window.dispatchEvent(initiateEvent);
                  }}
                  className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 font-bold text-sm tracking-wide uppercase rounded-sm transition-all duration-300 hover:-translate-y-0.5 ${
                    pkg.highlighted
                      ? 'bg-gold-500 text-ink-950 hover:bg-gold-400 hover:shadow-gold-glow'
                      : 'bg-ink-900 text-white hover:bg-ink-800'
                  }`}
                >
                  {pkg.buttonText}
                  <ArrowRight size={16} />
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
