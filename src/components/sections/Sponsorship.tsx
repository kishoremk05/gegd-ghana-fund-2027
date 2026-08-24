import { Download, Phone, ArrowRight, Award } from 'lucide-react';
import { SPONSORSHIP_TYPES } from '@/data/content';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';

export function Sponsorship() {
  return (
    <section id="sponsorship" className="py-24 md:py-32 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <SectionHeading
          label="Sponsorship"
          title={<>Put Your Brand at the Centre of <span className="text-gradient-gold">GEGD 2027</span></>}
          subtitle="Position your organisation at the forefront of Africa's most commercially focused economic development programme."
        />

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SPONSORSHIP_TYPES.map((type, i) => (
            <Reveal
              key={type}
              delay={i * 50}
              className="group relative bg-ink-50 border border-ink-100 rounded-sm p-5 hover:bg-ink-900 hover:border-ink-900 transition-all duration-400 cursor-default overflow-hidden"
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-white rounded-sm flex items-center justify-center group-hover:bg-gold-500 transition-colors duration-300">
                  <Award size={20} className="text-ink-700 group-hover:text-ink-950 transition-colors" strokeWidth={1.5} />
                </div>
                <span className="font-semibold text-ink-800 group-hover:text-white transition-colors text-sm">{type}</span>
              </div>
              <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gold-400 group-hover:w-full transition-all duration-500" />
            </Reveal>
          ))}
        </div>

        <Reveal delay={200} className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <button className="btn-dark">
            <Download size={18} />
            Download Sponsorship Brochure
          </button>
          <button className="btn-primary">
            <Phone size={18} />
            Speak to the Sponsorship Team
            <ArrowRight size={16} />
          </button>
        </Reveal>
      </div>
    </section>
  );
}
