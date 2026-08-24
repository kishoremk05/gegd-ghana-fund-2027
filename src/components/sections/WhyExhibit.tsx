import {
  Handshake, ShoppingCart, Globe, Users, Cpu, Network, TrendingUp, Award,
} from 'lucide-react';
import { WHY_EXHIBIT } from '@/data/content';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';

const ICONS: Record<string, typeof Handshake> = {
  Handshake, ShoppingCart, Globe, Users, Cpu, Network, TrendingUp, Award,
};

export function WhyExhibit() {
  return (
    <section id="why-exhibit" className="py-24 md:py-32 bg-ink-50">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <SectionHeading
          label="Why Exhibit"
          title={<>Why Exhibit at <span className="text-gradient-gold">GEGD 2027?</span></>}
          subtitle="Eight reasons GEGD 2027 is the commercial platform for serious businesses ready to access African markets."
        />

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {WHY_EXHIBIT.map((card, i) => {
            const Icon = ICONS[card.icon] ?? Handshake;
            return (
              <Reveal
                key={card.title}
                delay={i * 80}
                className="group bg-white p-7 rounded-sm border border-ink-100 hover:border-gold-300 hover:shadow-premium-lg transition-all duration-400 hover:-translate-y-1"
              >
                <div className="relative w-14 h-14 mb-5">
                  <div className="absolute inset-0 bg-gold-100 rounded-sm transition-all duration-300 group-hover:bg-gold-400 group-hover:rotate-12" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icon size={26} className="text-gold-600 group-hover:text-ink-950 transition-colors duration-300" strokeWidth={1.5} />
                  </div>
                </div>
                <h3 className="font-display text-xl font-bold text-ink-900 mb-2">{card.title}</h3>
                <p className="text-sm text-ink-600 leading-relaxed">{card.description}</p>
                <div className="mt-5 h-px w-0 bg-gold-400 group-hover:w-full transition-all duration-500" />
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
