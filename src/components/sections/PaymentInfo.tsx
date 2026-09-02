import { CreditCard, Smartphone, Building, Globe, AlertCircle, Info } from 'lucide-react';
import { PAYMENT_METHODS } from '@/data/content';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';

const PAYMENT_ICONS: Record<string, typeof CreditCard> = {
  'Card': CreditCard,
  'Mobile Money': Smartphone,
  'Bank Transfer': Building,
  'SWIFT': Globe,
};

export function PaymentInfo() {
  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <SectionHeading
          label="Payment Information"
          title={<>Payment <span className="text-gradient-gold">Information</span></>}
          subtitle="Understand the reservation fee, payment terms and accepted methods before securing your exhibition space."
        />

        <div className="mt-14 grid lg:grid-cols-2 gap-8">
          {/* Reservation fee */}
          <Reveal className="bg-ink-950 rounded-sm p-8 md:p-10 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
                backgroundSize: '50px 50px',
              }}
            />
            <div className="relative">
              <span className="text-xs font-bold tracking-widest uppercase text-gold-400">Reservation Fee</span>
              <div className="mt-3 font-display text-5xl md:text-6xl font-black text-gradient-gold">
                US$1,000
              </div>
              <p className="mt-2 text-sm text-ink-400 font-medium">Non-refundable reservation fee</p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3 p-4 bg-warning-500/10 border border-warning-500/20 rounded-sm">
                  <AlertCircle size={20} className="flex-shrink-0 text-warning-400 mt-0.5" />
                  <p className="text-sm text-ink-200 leading-relaxed">
                    Payment of the US$1,000 non-refundable reservation fee does <span className="font-bold text-white">not</span> constitute final stand allocation. Stand allocation is confirmed only after the full invoice has been paid and the payment verified by the GEGD Secretariat.
                  </p>
                </div>
                <div className="flex items-start gap-3 p-4 bg-info/10 border border-info/20 rounded-sm" style={{ background: 'rgba(89, 156, 255, 0.1)', borderColor: 'rgba(89, 156, 255, 0.2)' }}>
                  <Info size={20} className="flex-shrink-0 text-brand-400 mt-0.5" />
                  <p className="text-sm text-ink-200 leading-relaxed">
                    All outstanding exhibition invoices must be paid <span className="font-bold text-white">before 1 November 2026</span>.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Payment methods */}
          <Reveal delay={150} className="flex flex-col gap-5">
            <h3 className="font-display text-xl font-bold text-ink-900">Accepted Payment Methods</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {PAYMENT_METHODS.map((method) => {
                const Icon = PAYMENT_ICONS[method] ?? CreditCard;
                return (
                  <div
                    key={method}
                    className="group bg-ink-50 border border-ink-100 rounded-sm p-6 hover:border-gold-300 hover:shadow-premium transition-all duration-300"
                  >
                    <div className="w-12 h-12 bg-white rounded-sm flex items-center justify-center border border-ink-100 group-hover:bg-gold-400 transition-colors duration-300">
                      <Icon size={24} className="text-ink-700 group-hover:text-ink-950 transition-colors" strokeWidth={1.5} />
                    </div>
                    <h4 className="mt-4 font-display text-lg font-bold text-ink-900">{method}</h4>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 p-5 bg-ink-50 rounded-sm border border-ink-100">
              <p className="text-sm text-ink-600 leading-relaxed">
                Payment instructions and details will be provided by the GEGD Secretariat upon reservation.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
