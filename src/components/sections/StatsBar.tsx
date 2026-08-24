import { STATS } from '@/data/content';
import { Reveal } from '@/components/ui/Reveal';

export function StatsBar() {
  return (
    <section className="relative bg-ink-950 py-12 md:py-16 border-y border-white/5">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <Reveal className="text-center mb-8">
          <span className="section-label justify-center">
            <span className="h-px w-8 bg-gold-500" />
            Programme Targets
            <span className="h-px w-8 bg-gold-500" />
          </span>
        </Reveal>

        {/* Desktop grid */}
        <div className="hidden md:grid grid-cols-7 gap-px bg-white/5 rounded-sm overflow-hidden">
          {STATS.map((stat, i) => (
            <Reveal
              key={stat.label}
              delay={i * 80}
              className="bg-ink-950 p-6 text-center flex flex-col justify-center min-h-[140px]"
            >
              <div className="font-display text-3xl lg:text-4xl font-black text-gradient-gold leading-none">
                {stat.value}
              </div>
              <div className="mt-3 text-xs text-ink-400 font-medium leading-tight tracking-wide">
                {stat.label}
              </div>
            </Reveal>
          ))}
        </div>

        {/* Mobile horizontal scroll */}
        <div className="md:hidden flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-4 px-4 pb-2">
          {STATS.map((stat, i) => (
            <Reveal
              key={stat.label}
              delay={i * 50}
              className="flex-shrink-0 w-[180px] bg-ink-900 p-5 text-center rounded-sm border border-white/5 snap-center"
            >
              <div className="font-display text-2xl font-black text-gradient-gold leading-none">
                {stat.value}
              </div>
              <div className="mt-2 text-xs text-ink-400 font-medium leading-tight">
                {stat.label}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
