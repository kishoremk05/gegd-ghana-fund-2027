import { useState } from 'react';
import { Building, User, Boxes, Layout, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';

const STEPS = [
  { num: '01', label: 'Company Information', icon: Building, fields: ['Company Name', 'Industry', 'Country', 'Website'] },
  { num: '02', label: 'Authorised Contact', icon: User, fields: ['Full Name', 'Position', 'Email', 'Mobile'] },
  { num: '03', label: 'Exhibition Information', icon: Boxes, fields: ['Stand Package', 'Products to Exhibit', 'Space Requirements'] },
  { num: '04', label: 'Stand Selection', icon: Layout, fields: ['Preferred Block', 'Stand Number', 'Special Requirements'] },
];

export function BookingPreview() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="py-24 md:py-32 bg-ink-50">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <SectionHeading
          label="Booking Preview"
          title={<>Online Booking <span className="text-gradient-gold">Preview</span></>}
          subtitle="A visual preview of the intended booking workflow. This is a demo interface — no real submission or payment is processed."
        />

        <Reveal delay={100} className="mt-14">
          {/* Stepper */}
          <div className="flex flex-col md:flex-row gap-2 md:gap-0">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const isActive = i === activeStep;
              const isComplete = i < activeStep;
              return (
                <div key={step.num} className="flex-1 flex items-center">
                  <button
                    onClick={() => setActiveStep(i)}
                    className={`flex-1 flex items-center gap-3 p-4 rounded-sm border-2 transition-all duration-300 text-left ${
                      isActive
                        ? 'border-gold-400 bg-white shadow-premium'
                        : isComplete
                        ? 'border-success-200 bg-white'
                        : 'border-ink-100 bg-white/50'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-11 h-11 rounded-sm flex items-center justify-center transition-colors ${
                      isActive ? 'bg-gold-500' : isComplete ? 'bg-success-500' : 'bg-ink-100'
                    }`}>
                      {isComplete ? (
                        <Check size={20} className="text-white" strokeWidth={3} />
                      ) : (
                        <Icon size={20} className={isActive ? 'text-ink-950' : 'text-ink-400'} strokeWidth={1.5} />
                      )}
                    </div>
                    <div>
                      <div className={`text-xs font-bold tracking-wide ${isActive ? 'text-gold-600' : isComplete ? 'text-success-600' : 'text-ink-400'}`}>
                        {step.num}
                      </div>
                      <div className={`text-sm font-semibold ${isActive || isComplete ? 'text-ink-900' : 'text-ink-400'}`}>
                        {step.label}
                      </div>
                    </div>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className={`hidden md:block w-8 h-0.5 mx-1 ${isComplete ? 'bg-success-300' : 'bg-ink-200'}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Form preview */}
          <div className="mt-8 bg-white rounded-sm border border-ink-100 p-8 md:p-10 shadow-premium">
            <h3 className="font-display text-2xl font-bold text-ink-900">{STEPS[activeStep].label}</h3>
            <p className="mt-1 text-sm text-ink-500">Step {activeStep + 1} of {STEPS.length} — Demo form preview</p>

            <div className="mt-8 grid sm:grid-cols-2 gap-5">
              {STEPS[activeStep].fields.map((field) => (
                <div key={field}>
                  <label className="block text-xs font-semibold tracking-wide uppercase text-ink-500 mb-2">{field}</label>
                  <div className="h-11 bg-ink-50 border border-ink-200 rounded-sm flex items-center px-4">
                    <span className="text-sm text-ink-300">Enter {field.toLowerCase()}...</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                disabled={activeStep === 0}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-ink-600 disabled:opacity-30 disabled:cursor-not-allowed hover:text-ink-900 transition-colors"
              >
                <ArrowLeft size={16} />
                Previous
              </button>
              {activeStep < STEPS.length - 1 ? (
                <button
                  onClick={() => setActiveStep(Math.min(STEPS.length - 1, activeStep + 1))}
                  className="btn-dark"
                >
                  Next Step
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button className="btn-primary">
                  Submit Application
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
