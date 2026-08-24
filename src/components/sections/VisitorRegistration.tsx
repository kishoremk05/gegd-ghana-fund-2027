import { ArrowRight, Calendar, MapPin } from 'lucide-react';
import { VISITOR_TYPES, INDUSTRIES } from '@/data/content';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';

export function VisitorRegistration() {
  return (
    <section id="register" className="py-24 md:py-32 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <SectionHeading
          label="Visitor Registration"
          title={<>Visit <span className="text-gradient-gold">GEGD 2027</span></>}
          subtitle="Register as a visitor to access the exhibition, meet exhibitors and explore business opportunities across 15 industry categories."
        />

        <Reveal delay={100} className="mt-14 max-w-4xl mx-auto">
          <div className="bg-ink-50 rounded-sm border border-ink-100 p-8 md:p-10">
            {/* Event info */}
            <div className="flex flex-wrap gap-6 mb-8 pb-8 border-b border-ink-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-sm flex items-center justify-center border border-ink-200">
                  <Calendar size={18} className="text-gold-600" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-xs text-ink-500 font-medium uppercase tracking-wide">Dates</div>
                  <div className="font-bold text-ink-900 text-sm">16–23 January 2027</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-sm flex items-center justify-center border border-ink-200">
                  <MapPin size={18} className="text-gold-600" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-xs text-ink-500 font-medium uppercase tracking-wide">Location</div>
                  <div className="font-bold text-ink-900 text-sm">Accra, Ghana</div>
                </div>
              </div>
            </div>

            {/* Form fields */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold tracking-wide uppercase text-ink-500 mb-2">Full Name</label>
                <input type="text" placeholder="Enter your full name..." className="w-full h-11 px-4 bg-white border border-ink-200 rounded-sm text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-gold-400 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-wide uppercase text-ink-500 mb-2">Organisation</label>
                <input type="text" placeholder="Enter your organisation..." className="w-full h-11 px-4 bg-white border border-ink-200 rounded-sm text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-gold-400 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-wide uppercase text-ink-500 mb-2">Position</label>
                <input type="text" placeholder="Enter your position..." className="w-full h-11 px-4 bg-white border border-ink-200 rounded-sm text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-gold-400 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-wide uppercase text-ink-500 mb-2">Country</label>
                <input type="text" placeholder="Enter your country..." className="w-full h-11 px-4 bg-white border border-ink-200 rounded-sm text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-gold-400 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-wide uppercase text-ink-500 mb-2">City</label>
                <input type="text" placeholder="Enter your city..." className="w-full h-11 px-4 bg-white border border-ink-200 rounded-sm text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-gold-400 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-wide uppercase text-ink-500 mb-2">Email</label>
                <input type="email" placeholder="Enter your email..." className="w-full h-11 px-4 bg-white border border-ink-200 rounded-sm text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-gold-400 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-wide uppercase text-ink-500 mb-2">Mobile</label>
                <input type="tel" placeholder="Enter your mobile..." className="w-full h-11 px-4 bg-white border border-ink-200 rounded-sm text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-gold-400 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-wide uppercase text-ink-500 mb-2">Industry</label>
                <select className="w-full h-11 px-4 bg-white border border-ink-200 rounded-sm text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-gold-400 cursor-pointer">
                  <option value="">Select industry...</option>
                  {INDUSTRIES.map((ind) => (
                    <option key={ind.name} value={ind.name}>{ind.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-wide uppercase text-ink-500 mb-2">Visitor Type</label>
                <select className="w-full h-11 px-4 bg-white border border-ink-200 rounded-sm text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-gold-400 cursor-pointer">
                  <option value="">Select visitor type...</option>
                  {VISITOR_TYPES.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold tracking-wide uppercase text-ink-500 mb-2">Products / Services of Interest</label>
                <textarea
                  rows={3}
                  placeholder="Describe the products or services you are interested in..."
                  className="w-full px-4 py-3 bg-white border border-ink-200 rounded-sm text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-gold-400 transition-all resize-none"
                />
              </div>
            </div>

            <button className="btn-primary w-full sm:w-auto mt-8">
              Register as a Visitor
              <ArrowRight size={18} />
            </button>
            <p className="mt-3 text-xs text-ink-400">
              Frontend demo only — no real registration is submitted.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
