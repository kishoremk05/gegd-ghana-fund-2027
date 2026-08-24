import { Mail, Phone, ArrowRight, MapPin } from 'lucide-react';

const FOOTER_LINKS = [
  { label: 'Exhibition', href: '#overview' },
  { label: 'Buyers', href: '#buyers' },
  { label: 'Visitors', href: '#register' },
  { label: 'Sponsorship', href: '#sponsorship' },
  { label: 'Exhibitor Manual', href: '#manual' },
  { label: 'Registration', href: '#register' },
  { label: 'Contact', href: '#contact' },
];

const CONTACTS = [
  { label: 'Exhibition Enquiries', emails: ['info@ghana-fund.com', 'frontdesk@ghana-fund.com'] },
  { label: 'Sponsorship', emails: ['sponsorship@ghana-fund.com'] },
  { label: 'General', emails: ['media@ghana-fund.com'] },
];

export function Footer() {
  return (
    <footer id="contact" className="bg-ink-950 border-t border-white/5">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-16 md:py-20">
        <div className="grid lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <div className="absolute inset-0 border-2 border-gold-500 rotate-45" />
                <div className="absolute inset-2 bg-gold-500/20 rotate-45" />
                <span className="relative font-display font-black text-gold-400 text-sm">G</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display font-black text-white text-lg tracking-tight">GEGD <span className="text-gold-400">2027</span></span>
                <span className="text-[10px] text-ink-400 font-medium tracking-wider uppercase mt-0.5">Exhibition Marketplace</span>
              </div>
            </div>
            <p className="text-sm text-ink-400 leading-relaxed">
              Ghana Economic Growth & Development Week
            </p>
            <div className="mt-3 flex items-start gap-2 text-sm text-ink-500">
              <MapPin size={16} className="flex-shrink-0 mt-0.5 text-gold-500" />
              <span>Accra, Ghana</span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm text-ink-500">
              <Phone size={16} className="text-gold-500" />
              <span>900 600 100</span>
            </div>
          </div>

          {/* Links */}
          <div className="lg:col-span-1">
            <h4 className="text-xs font-bold tracking-widest uppercase text-gold-400 mb-5">Quick Links</h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(e) => { e.preventDefault(); document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' }); }}
                    className="group flex items-center gap-2 text-sm text-ink-300 hover:text-gold-400 transition-colors"
                  >
                    <ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-gold-500" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold tracking-widest uppercase text-gold-400 mb-5">Contact</h4>
            <div className="grid sm:grid-cols-3 gap-6">
              {CONTACTS.map((contact) => (
                <div key={contact.label}>
                  <p className="text-sm font-semibold text-white mb-2">{contact.label}</p>
                  <ul className="space-y-1.5">
                    {contact.emails.map((email) => (
                      <li key={email}>
                        <a href={`mailto:${email}`} className="flex items-center gap-2 text-sm text-ink-400 hover:text-gold-400 transition-colors">
                          <Mail size={13} className="text-gold-500/60" />
                          {email}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-ink-500">
            © 2027 GEGD — Ghana Economic Growth & Development Week. All rights reserved.
          </p>
          <p className="text-xs text-ink-500">
            16–23 January 2027 · Accra, Ghana
          </p>
        </div>
      </div>
    </footer>
  );
}
