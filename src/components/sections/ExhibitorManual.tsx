import { Download, FileText, ArrowRight } from 'lucide-react';
import { IMAGES } from '@/data/images';
import { Reveal } from '@/components/ui/Reveal';

export function ExhibitorManual() {
  return (
    <section id="manual" className="py-24 md:py-32 bg-ink-50">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <Reveal className="relative bg-white rounded-sm border border-ink-100 overflow-hidden shadow-premium">
          <div className="grid md:grid-cols-2 items-center">
            {/* Left: visual */}
            <div className="relative aspect-[4/3] md:aspect-auto md:h-full overflow-hidden">
              <img
                src={IMAGES.industryFairEntrance}
                alt="Exhibition entrance"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/90" />
              <div className="absolute top-4 left-4">
                <span className="text-xs text-white/90 font-medium tracking-wider uppercase bg-ink-950/60 px-3 py-1.5 rounded-sm backdrop-blur-sm">
                  Artist's Impression — GEGD 2027
                </span>
              </div>
            </div>

            {/* Right: content */}
            <div className="p-8 md:p-12">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 bg-gold-100 rounded-sm flex items-center justify-center">
                  <FileText size={24} className="text-gold-600" strokeWidth={1.5} />
                </div>
                <span className="text-xs font-bold tracking-widest uppercase text-gold-600">Resource</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold text-ink-900 leading-tight">
                Exhibitor Manual
              </h2>
              <p className="mt-5 text-base text-ink-600 leading-relaxed">
                Everything exhibitors need to know about participation, technical specifications, installation, safety, branding, access and payment terms.
              </p>
              <button className="btn-dark mt-8">
                <Download size={18} />
                Download Exhibitor Manual
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
