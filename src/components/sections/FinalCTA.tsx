import { ArrowRight, UserPlus, Ticket } from 'lucide-react';
import { IMAGES } from '@/data/images';
import { Reveal } from '@/components/ui/Reveal';

export function FinalCTA() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-ink-950">
      <div className="absolute inset-0">
        <img
          src={IMAGES.networking}
          alt="Business networking at exhibition"
          className="w-full h-full object-cover opacity-15"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950 via-ink-950/90 to-ink-950" />
      </div>

      <div className="relative max-w-[1400px] mx-auto px-4 md:px-8 text-center">
        <Reveal>
          <span className="section-label justify-center">
            <span className="h-px w-8 bg-gold-500" />
            Your Opportunity
            <span className="h-px w-8 bg-gold-500" />
          </span>
          <h2 className="mt-6 font-display text-5xl md:text-7xl font-black text-white leading-[1.05]">
            Your Market is <span className="text-gradient-gold">Waiting.</span>
          </h2>
          <p className="mt-8 text-lg md:text-xl text-ink-300 max-w-3xl mx-auto leading-relaxed">
            Exhibit at GEGD 2027. Display your products. Meet buyers. Secure orders. Find partners. Enter new markets.
          </p>
        </Reveal>

        <Reveal delay={200} className="mt-12 flex flex-wrap gap-4 justify-center">
          <a
            href="#booking"
            onClick={(e) => {
              e.preventDefault();
              const initiateEvent = new CustomEvent('initiate-booking', { detail: { step: 0 } });
              window.dispatchEvent(initiateEvent);
            }}
            className="btn-primary"
          >
            Reserve Your Stand
            <ArrowRight size={18} />
          </a>
          <a
            href="#buyers"
            onClick={(e) => { e.preventDefault(); document.querySelector('#buyers')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="btn-secondary"
          >
            <UserPlus size={18} />
            Join the Buyer Programme
          </a>
          <a
            href="#register"
            onClick={(e) => { e.preventDefault(); document.querySelector('#register')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="btn-secondary"
          >
            <Ticket size={18} />
            Register as a Visitor
          </a>
        </Reveal>
      </div>
    </section>
  );
}
