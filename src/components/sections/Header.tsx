import { useState, useRef, useEffect } from 'react';
import { Menu, X, ChevronRight, ChevronDown } from 'lucide-react';
import { useScrolled, useActiveSection } from '@/hooks/useScroll';

const PRIMARY_ITEMS = [
  { label: 'Overview', href: '#overview' },
  { label: 'Industries', href: '#industries' },
  { label: 'Floor Plan', href: '#floor-plan' },
  { label: 'Stands', href: '#stands' },
  { label: 'Register', href: '#register' },
];

const SECONDARY_ITEMS = [
  { label: 'Why Exhibit', href: '#why-exhibit' },
  { label: 'Buyers', href: '#buyers' },
  { label: 'Sponsorship', href: '#sponsorship' },
];

const SECTION_IDS = ['overview', 'why-exhibit', 'industries', 'floor-plan', 'stands', 'buyers', 'sponsorship', 'register'];

export function Header() {
  const scrolled = useScrolled(30);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const active = useActiveSection(SECTION_IDS);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    setMoreOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-ink-950/95 backdrop-blur-md shadow-premium-lg border-b border-white/5'
            : 'bg-gradient-to-b from-ink-950/80 to-transparent'
        }`}
      >
        <nav className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className={`flex items-center justify-between transition-all duration-300 ${scrolled ? 'h-16' : 'h-18'}`}>
            {/* Logo */}
            <a
              href="#top"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="flex items-center gap-2.5 group"
            >
              <div className="relative w-8 h-8 flex items-center justify-center">
                <div className="absolute inset-0 border-2 border-gold-500 rotate-45 transition-transform duration-500 group-hover:rotate-[135deg]" />
                <div className="absolute inset-1.5 bg-gold-500/20 rotate-45" />
                <span className="relative font-display font-black text-gold-400 text-xs">G</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display font-black text-white text-base tracking-tight">GEGD <span className="text-gold-400">2027</span></span>
                <span className="text-[9px] text-ink-400 font-medium tracking-wider uppercase mt-0.5 hidden sm:block">Exhibition Marketplace</span>
              </div>
            </a>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-1">
              {PRIMARY_ITEMS.map((item) => {
                const isActive = active === item.href.slice(1);
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => { e.preventDefault(); handleNavClick(item.href); }}
                    className={`px-3 py-2 text-sm font-medium rounded-sm transition-all duration-200 relative group ${
                      isActive ? 'text-gold-400' : 'text-ink-200 hover:text-white'
                    }`}
                  >
                    {item.label}
                    <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-px bg-gold-400 transition-all duration-300 ${isActive ? 'w-6' : 'w-0 group-hover:w-4'}`} />
                  </a>
                );
              })}

              {/* More dropdown */}
              <div ref={moreRef} className="relative">
                <button
                  onClick={() => setMoreOpen((v) => !v)}
                  className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-sm transition-all duration-200 ${
                    moreOpen || SECONDARY_ITEMS.some((i) => active === i.href.slice(1))
                      ? 'text-gold-400'
                      : 'text-ink-200 hover:text-white'
                  }`}
                >
                  More
                  <ChevronDown size={15} className={`transition-transform duration-300 ${moreOpen ? 'rotate-180' : ''}`} />
                </button>
                <div
                  className={`absolute top-full right-0 mt-1 w-48 bg-ink-900 border border-white/10 rounded-sm shadow-premium-lg overflow-hidden transition-all duration-300 origin-top ${
                    moreOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'
                  }`}
                >
                  {SECONDARY_ITEMS.map((item) => {
                    const isActive = active === item.href.slice(1);
                    return (
                      <a
                        key={item.href}
                        href={item.href}
                        onClick={(e) => { e.preventDefault(); handleNavClick(item.href); }}
                        className={`flex items-center justify-between px-4 py-3 text-sm font-medium transition-all ${
                          isActive ? 'text-gold-400 bg-white/5' : 'text-ink-200 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {item.label}
                        <ChevronRight size={14} className="opacity-40" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <a
                href="#login"
                onClick={(e) => e.preventDefault()}
                className="hidden md:inline-flex text-sm font-medium text-ink-200 hover:text-gold-400 transition-colors"
              >
                Exhibitor Login
              </a>
              <a
                href="#register"
                onClick={(e) => { e.preventDefault(); handleNavClick('#register'); }}
                className="hidden sm:inline-flex items-center gap-1.5 px-5 py-2.5 bg-gold-500 text-ink-950 font-bold text-sm tracking-wide uppercase rounded-sm hover:bg-gold-400 transition-all duration-300 hover:shadow-gold-glow hover:-translate-y-0.5"
              >
                Reserve Your Stand
              </a>
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 text-white hover:text-gold-400 transition-colors"
                aria-label="Open menu"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-[60] lg:hidden transition-all duration-300 ${
          mobileOpen ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
      >
        <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
        <div
          className={`absolute top-0 right-0 bottom-0 w-[85%] max-w-sm bg-ink-950 shadow-premium-lg transition-transform duration-400 ${
            mobileOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between p-5 border-b border-white/10">
            <span className="font-display font-black text-white text-lg">GEGD <span className="text-gold-400">2027</span></span>
            <button onClick={() => setMobileOpen(false)} className="p-2 text-ink-300 hover:text-white" aria-label="Close menu">
              <X size={24} />
            </button>
          </div>
          <div className="p-5 flex flex-col gap-1">
            {[...PRIMARY_ITEMS, ...SECONDARY_ITEMS].map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => { e.preventDefault(); handleNavClick(item.href); }}
                className="flex items-center justify-between px-4 py-3.5 text-ink-200 hover:text-gold-400 hover:bg-white/5 rounded-sm font-medium transition-all"
              >
                {item.label}
                <ChevronRight size={18} className="opacity-50" />
              </a>
            ))}
            <a
              href="#login"
              onClick={(e) => e.preventDefault()}
              className="px-4 py-3.5 text-ink-300 hover:text-gold-400 font-medium"
            >
              Exhibitor Login
            </a>
          </div>
          <div className="p-5 mt-auto">
            <a
              href="#register"
              onClick={(e) => { e.preventDefault(); handleNavClick('#register'); }}
              className="btn-primary w-full"
            >
              Reserve Your Stand
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
