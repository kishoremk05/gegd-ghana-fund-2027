import { ArrowRight, Briefcase, Search, Calendar, Handshake, Package, TrendingUp, Building2, Globe } from 'lucide-react';
import { BUYER_TARGETS, BUYER_FEATURES } from '@/data/content';
import { IMAGES } from '@/data/images';
import { Reveal } from '@/components/ui/Reveal';

const FEATURE_ICONS = [Calendar, Search, Handshake, Briefcase, Package, TrendingUp, Building2, Globe];

export function BuyerProgramme() {
  return (
    <section id="buyers" className="relative py-24 md:py-32 bg-ink-950 overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={IMAGES.businessHandshake}
          alt="Business professionals meeting"
          className="w-full h-full object-cover opacity-10"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/95 to-ink-950/80" />
      </div>

      <div className="relative max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: text */}
          <div>
            <Reveal>
              <span className="section-label">
                <span className="h-px w-8 bg-gold-500" />
                Buyer Programme
              </span>
              <h2 className="mt-4 font-display text-4xl md:text-5xl font-extrabold text-white leading-[1.1]">
                The GEGD <span className="text-gradient-gold">Buyer Programme</span>
              </h2>
              <p className="mt-6 text-lg text-ink-300 leading-relaxed">
                Designed for people who want to buy, source, distribute, invest and establish commercial relationships. The Buyer Programme connects qualified buyers with exhibitors through structured meetings and curated introductions.
              </p>
            </Reveal>

            <Reveal delay={150} className="mt-8">
              <h3 className="text-sm font-bold tracking-widest uppercase text-gold-400 mb-4">Target Buyers</h3>
              <div className="flex flex-wrap gap-2">
                {BUYER_TARGETS.map((target) => (
                  <span
                    key={target}
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-white/5 border border-white/10 rounded-sm text-sm text-ink-200 font-medium hover:bg-white/10 hover:border-gold-500/30 transition-all duration-300"
                  >
                    <span className="w-1 h-1 bg-gold-400 rounded-full" />
                    {target}
                  </span>
                ))}
              </div>
            </Reveal>

            <Reveal delay={300} className="mt-8">
              <button className="btn-primary">
                Join the Buyer Programme
                <ArrowRight size={18} />
              </button>
            </Reveal>
          </div>

          {/* Right: features grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {BUYER_FEATURES.map((feature, i) => {
              const Icon = FEATURE_ICONS[i % FEATURE_ICONS.length];
              return (
                <Reveal
                  key={feature}
                  delay={i * 70}
                  className="group bg-white/5 border border-white/10 p-5 rounded-sm hover:bg-white/10 hover:border-gold-500/30 transition-all duration-300"
                >
                  <div className="w-10 h-10 bg-gold-500/10 rounded-sm flex items-center justify-center mb-3 group-hover:bg-gold-500/20 transition-colors">
                    <Icon size={20} className="text-gold-400" strokeWidth={1.5} />
                  </div>
                  <p className="text-sm font-semibold text-white leading-snug">{feature}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
