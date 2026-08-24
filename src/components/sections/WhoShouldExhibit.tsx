import { WHO_SHOULD_EXHIBIT } from '@/data/content';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

export function WhoShouldExhibit() {
  return (
    <section className="py-24 md:py-32 bg-white border-y border-ink-100">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <SectionHeading
          label="Target Exhibitors"
          title={<>Who Should <span className="text-gradient-gold">Exhibit?</span></>}
          subtitle="GEGD 2027 is built for companies and organisations across the industrial, commercial and institutional spectrum."
        />

        <div className="mt-14 flex flex-wrap justify-center gap-3">
          {WHO_SHOULD_EXHIBIT.map((item, i) => (
            <Reveal
              key={item}
              delay={i * 40}
              as="span"
              className="inline-flex items-center gap-2 px-5 py-3 bg-ink-50 border border-ink-200 rounded-sm text-ink-800 font-semibold text-sm hover:bg-ink-900 hover:text-white hover:border-ink-900 transition-all duration-300 cursor-default hover:-translate-y-0.5 hover:shadow-premium"
            >
              <span className="w-1.5 h-1.5 bg-gold-400 rounded-full" />
              {item}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
