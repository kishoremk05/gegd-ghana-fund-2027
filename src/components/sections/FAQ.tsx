import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { FAQS } from '@/data/content';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-24 md:py-32 bg-ink-50">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <SectionHeading
          label="FAQ"
          title={<>Frequently Asked <span className="text-gradient-gold">Questions</span></>}
          subtitle="Everything you need to know about exhibiting at, visiting, or participating in GEGD 2027."
        />

        <Reveal delay={100} className="mt-14 max-w-3xl mx-auto">
          <div className="space-y-3">
            {FAQS.map((faq, i) => {
              const isOpen = open === i;
              return (
                <div
                  key={i}
                  className={`bg-white rounded-sm border transition-all duration-300 ${
                    isOpen ? 'border-gold-300 shadow-premium' : 'border-ink-100'
                  }`}
                >
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left group"
                    aria-expanded={isOpen}
                  >
                    <span className={`font-display text-base md:text-lg font-bold transition-colors ${
                      isOpen ? 'text-gold-600' : 'text-ink-900 group-hover:text-gold-600'
                    }`}>
                      {faq.question}
                    </span>
                    <span className={`flex-shrink-0 w-8 h-8 rounded-sm flex items-center justify-center transition-all duration-300 ${
                      isOpen ? 'bg-gold-500 text-ink-950 rotate-180' : 'bg-ink-50 text-ink-600'
                    }`}>
                      {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                    </span>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-400 ${
                      isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-5 pb-5 pt-1">
                      <p className="text-sm text-ink-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
