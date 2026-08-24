import { ArrowRight, Download, UserPlus } from 'lucide-react';
import { IMAGES } from '@/data/images';

export function Hero() {
  return (
    <section id="top" className="relative min-h-screen flex items-center overflow-hidden bg-ink-950">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={IMAGES.heroExhibition}
          alt="Modern industrial exhibition hall"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/85 to-ink-950/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-ink-950/30" />
      </div>

      {/* Decorative grid lines */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      <div className="relative max-w-[1400px] mx-auto px-4 md:px-8 w-full pt-28 pb-20">
        <div className="max-w-3xl">
          {/* Date badge */}
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-gold-500/10 border border-gold-500/30 rounded-sm mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-gold-400 rounded-full animate-pulse" />
            <span className="text-gold-300 text-sm font-semibold tracking-wide">16–23 January 2027 · Accra, Ghana</span>
          </div>

          {/* Main headline */}
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[0.95] tracking-tight">
            <span className="block animate-fade-up" style={{ animationDelay: '100ms', opacity: 0 }}>GEGD 2027</span>
            <span className="block text-gradient-gold animate-fade-up" style={{ animationDelay: '250ms', opacity: 0 }}>
              EXHIBITION
            </span>
            <span className="block text-gradient-gold animate-fade-up" style={{ animationDelay: '350ms', opacity: 0 }}>
              MARKETPLACE
            </span>
          </h1>

          {/* Supporting headline */}
          <p className="mt-8 text-xl md:text-2xl text-ink-200 font-light leading-snug max-w-2xl animate-fade-up" style={{ animationDelay: '500ms', opacity: 0 }}>
            Where Products Meet Markets, Buyers Meet Suppliers, and Business Becomes Opportunity.
          </p>

          {/* Additional copy */}
          <p className="mt-6 text-base text-ink-400 leading-relaxed max-w-2xl animate-fade-up" style={{ animationDelay: '650ms', opacity: 0 }}>
            GEGD 2027 brings manufacturers, producers, technology companies, exporters, investors, financial institutions, governments, distributors, buyers and professional service providers together in one of Africa's most commercially focused economic development programmes.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap gap-4 animate-fade-up" style={{ animationDelay: '800ms', opacity: 0 }}>
            <a href="#register" onClick={(e) => { e.preventDefault(); document.querySelector('#register')?.scrollIntoView({ behavior: 'smooth' }); }} className="btn-primary">
              Reserve Your Stand
              <ArrowRight size={18} />
            </a>
            <a href="#buyers" onClick={(e) => { e.preventDefault(); document.querySelector('#buyers')?.scrollIntoView({ behavior: 'smooth' }); }} className="btn-secondary">
              <UserPlus size={18} />
              Become a Buyer
            </a>
            <a href="#manual" onClick={(e) => { e.preventDefault(); document.querySelector('#manual')?.scrollIntoView({ behavior: 'smooth' }); }} className="btn-secondary">
              <Download size={18} />
              Exhibitor Manual
            </a>
          </div>

          {/* Secondary */}
          <div className="mt-8 animate-fade-up" style={{ animationDelay: '950ms', opacity: 0 }}>
            <a href="#login" onClick={(e) => e.preventDefault()} className="inline-flex items-center gap-1.5 text-ink-300 hover:text-gold-400 transition-colors text-sm font-medium">
              Already registered? Exhibitor Login
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </div>

      {/* Artist's impression caption */}
      <div className="absolute bottom-6 right-6 z-10 hidden md:block">
        <span className="text-xs text-ink-500 font-medium tracking-wider uppercase bg-ink-950/60 px-3 py-1.5 rounded-sm border border-white/5">
          Artist's Impression — GEGD 2027
        </span>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: '1200ms' }}>
        <span className="text-xs text-ink-500 tracking-widest uppercase">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-gold-500/50 to-transparent" />
      </div>
    </section>
  );
}
