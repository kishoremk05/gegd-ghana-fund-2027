import { Check, Monitor } from 'lucide-react';
import { EXHIBITOR_BENEFITS } from '@/data/content';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';

export function ExhibitorBenefits() {
  return (
    <section className="py-24 md:py-32 bg-ink-50">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <SectionHeading
          label="Exhibitor Benefits"
          title={<>Exhibitor <span className="text-gradient-gold">Benefits</span></>}
          subtitle="Everything included with your exhibition participation — from infrastructure to commercial opportunity."
        />

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {EXHIBITOR_BENEFITS.map((benefit, i) => (
            <Reveal
              key={benefit}
              delay={i * 40}
              className="group flex items-center gap-3 p-4 bg-white rounded-sm border border-ink-100 hover:border-gold-300 hover:shadow-premium transition-all duration-300"
            >
              <span className="flex-shrink-0 w-7 h-7 bg-gold-100 rounded-sm flex items-center justify-center group-hover:bg-gold-400 transition-colors duration-300">
                <Check size={14} className="text-gold-600 group-hover:text-ink-950 transition-colors" strokeWidth={3} />
              </span>
              <span className="text-sm font-medium text-ink-700">{benefit}</span>
            </Reveal>
          ))}
        </div>

        {/* Highlighted card */}
        <Reveal delay={200} className="mt-10">
          <div className="relative bg-ink-950 rounded-sm p-8 md:p-12 text-center overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
                backgroundSize: '50px 50px',
              }}
            />
            <div className="relative flex flex-col items-center">
              <div className="w-14 h-14 bg-gold-500/10 rounded-sm flex items-center justify-center mb-5">
                <Monitor size={28} className="text-gold-400" strokeWidth={1.5} />
              </div>
              <p className="font-display text-2xl md:text-3xl font-bold text-white max-w-3xl leading-snug">
                Your exhibitor profile will become part of the <span className="text-gradient-gold">GEGD Digital Marketplace.</span>
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
