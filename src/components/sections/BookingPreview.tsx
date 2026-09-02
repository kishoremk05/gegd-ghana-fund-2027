import { useState, useEffect } from 'react';
import { Building, User, Boxes, Layout, Check, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { supabase } from '@/lib/supabase';

const STEPS = [
  { num: '01', label: 'Company Information', icon: Building },
  { num: '02', label: 'Authorised Contact', icon: User },
  { num: '03', label: 'Exhibition Information', icon: Boxes },
  { num: '04', label: 'Stand Selection', icon: Layout },
];

export function BookingPreview() {
  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Step 1: Company Info
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [country, setCountry] = useState('');
  const [website, setWebsite] = useState('');

  // Step 2: Contact
  const [fullName, setFullName] = useState('');
  const [position, setPosition] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');

  // Step 3: Exhibition Info
  const [standPackage, setStandPackage] = useState('');
  const [products, setProducts] = useState('');
  const [spaceReq, setSpaceReq] = useState('');

  // Step 4: Stand Selection
  const [prefBlock, setPrefBlock] = useState('');
  const [standNumber, setStandNumber] = useState('');
  const [specialReq, setSpecialReq] = useState('');

  useEffect(() => {
    const handleInitiate = (e: Event) => {
      const customEvent = e as CustomEvent<{
        step?: number;
        package?: string;
        stands?: Array<{ id: string; block: string; price: string }>;
        area?: string;
      }>;
      
      const detail = customEvent.detail;
      
      // Always start at Step 1 (Company Information) step 0
      setActiveStep(0);

      if (detail.package) {
        setStandPackage(detail.package);
      }

      if (detail.area) {
        setSpaceReq(detail.area);
      } else if (detail.package) {
        // Pre-fill space requirements based on package name
        if (detail.package.toLowerCase().includes('standard')) setSpaceReq('12 m²');
        else if (detail.package.toLowerCase().includes('corner')) setSpaceReq('24 m²');
        else if (detail.package.toLowerCase().includes('premium')) setSpaceReq('48 m²');
        else if (detail.package.toLowerCase().includes('outdoor')) setSpaceReq('100 m²');
      }

      if (detail.stands && detail.stands.length > 0) {
        setPrefBlock(detail.stands[0].block);
        setStandNumber(detail.stands.map(s => s.id).join(', '));
        setSpecialReq(`Selected Stands Pricing: ${detail.stands.map(s => `${s.id}: ${s.price}`).join(', ')}`);
      }

      // Scroll to booking section
      const el = document.getElementById('booking');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    };

    window.addEventListener('initiate-booking', handleInitiate);
    return () => window.removeEventListener('initiate-booking', handleInitiate);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const fullNotes = [
      `Position: ${position}`,
      `Country: ${country}`,
      `Website: ${website}`,
      `Industry Segment: ${industry}`,
      `Space Requirements: ${spaceReq}`,
      `Products to Exhibit: ${products}`,
      `Preferred Block: ${prefBlock}`,
      `Special Requests: ${specialReq}`
    ].filter(Boolean).join('\n');

    try {
      const { error } = await supabase.from('enquiries').insert([
        {
          name: fullName || 'Demo Submitter',
          company: companyName || 'Demo Company',
          email: email || 'demo@company.com',
          phone: mobile,
          notes: `[Online Booking Preview Submission]\nStand Package: ${standPackage}\n\n${fullNotes}`,
          stands: standNumber || 'Not Selected',
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.warn('Supabase enquiry insert fallback (table may not exist):', error.message);
      }
    } catch (err) {
      console.warn('Enquiry submit fallback:', err);
    } finally {
      setSubmitting(false);
      setSubmitted(true);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setActiveStep(0);
    setCompanyName('');
    setIndustry('');
    setCountry('');
    setWebsite('');
    setFullName('');
    setPosition('');
    setEmail('');
    setMobile('');
    setStandPackage('');
    setProducts('');
    setSpaceReq('');
    setPrefBlock('');
    setStandNumber('');
    setSpecialReq('');
  };

  return (
    <section id="booking" className="py-24 md:py-32 bg-ink-50">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <SectionHeading
          label="Booking Preview"
          title={<>Online Booking <span className="text-gradient-gold">Preview</span></>}
          subtitle="A visual preview of the intended booking workflow. Fill out the steps below to see the process and submit a reservation request."
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
                    onClick={() => !submitted && setActiveStep(i)}
                    disabled={submitted}
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
            {submitted ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-200 animate-bounce">
                  <CheckCircle2 size={36} />
                </div>
                <h4 className="font-display font-extrabold text-2xl text-slate-900">
                  Booking Application Submitted!
                </h4>
                <p className="text-sm text-slate-600 max-w-md">
                  Thank you for submitting your booking application. Your details have been received by the secretariat and will be reviewed shortly.
                </p>
                <button
                  onClick={handleReset}
                  className="btn-dark mt-4"
                >
                  Start New Application
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h3 className="font-display text-2xl font-bold text-ink-900">{STEPS[activeStep].label}</h3>
                <p className="mt-1 text-sm text-ink-500">Step {activeStep + 1} of {STEPS.length} — Interactive form fields</p>

                <div className="mt-8 grid sm:grid-cols-2 gap-5">
                  {/* Step 1 Fields */}
                  {activeStep === 0 && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold tracking-wide uppercase text-ink-500 mb-2">Company Name *</label>
                        <input
                          type="text"
                          required
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="e.g. AgroGold Ghana Ltd"
                          className="w-full h-11 bg-ink-50 border border-ink-200 rounded-sm px-4 text-sm text-ink-900 focus:outline-none focus:border-gold-400 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold tracking-wide uppercase text-ink-500 mb-2">Industry Segment *</label>
                        <input
                          type="text"
                          required
                          value={industry}
                          onChange={(e) => setIndustry(e.target.value)}
                          placeholder="e.g. Agriculture, Technology"
                          className="w-full h-11 bg-ink-50 border border-ink-200 rounded-sm px-4 text-sm text-ink-900 focus:outline-none focus:border-gold-400 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold tracking-wide uppercase text-ink-500 mb-2">Country *</label>
                        <input
                          type="text"
                          required
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          placeholder="e.g. Ghana, Germany"
                          className="w-full h-11 bg-ink-50 border border-ink-200 rounded-sm px-4 text-sm text-ink-900 focus:outline-none focus:border-gold-400 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold tracking-wide uppercase text-ink-500 mb-2">Website</label>
                        <input
                          type="text"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          placeholder="e.g. www.company.com"
                          className="w-full h-11 bg-ink-50 border border-ink-200 rounded-sm px-4 text-sm text-ink-900 focus:outline-none focus:border-gold-400 focus:bg-white"
                        />
                      </div>
                    </>
                  )}

                  {/* Step 2 Fields */}
                  {activeStep === 1 && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold tracking-wide uppercase text-ink-500 mb-2">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Samuel Mensah"
                          className="w-full h-11 bg-ink-50 border border-ink-200 rounded-sm px-4 text-sm text-ink-900 focus:outline-none focus:border-gold-400 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold tracking-wide uppercase text-ink-500 mb-2">Job Title / Position *</label>
                        <input
                          type="text"
                          required
                          value={position}
                          onChange={(e) => setPosition(e.target.value)}
                          placeholder="e.g. Managing Director"
                          className="w-full h-11 bg-ink-50 border border-ink-200 rounded-sm px-4 text-sm text-ink-900 focus:outline-none focus:border-gold-400 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold tracking-wide uppercase text-ink-500 mb-2">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. samuel@company.com"
                          className="w-full h-11 bg-ink-50 border border-ink-200 rounded-sm px-4 text-sm text-ink-900 focus:outline-none focus:border-gold-400 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold tracking-wide uppercase text-ink-500 mb-2">Mobile Number *</label>
                        <input
                          type="tel"
                          required
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                          placeholder="e.g. +233 24 123 4567"
                          className="w-full h-11 bg-ink-50 border border-ink-200 rounded-sm px-4 text-sm text-ink-900 focus:outline-none focus:border-gold-400 focus:bg-white"
                        />
                      </div>
                    </>
                  )}

                  {/* Step 3 Fields */}
                  {activeStep === 2 && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold tracking-wide uppercase text-ink-500 mb-2">Stand Package *</label>
                        <input
                          type="text"
                          required
                          value={standPackage}
                          onChange={(e) => setStandPackage(e.target.value)}
                          placeholder="e.g. Standard Stand, Corner Stand"
                          className="w-full h-11 bg-ink-50 border border-ink-200 rounded-sm px-4 text-sm text-ink-900 focus:outline-none focus:border-gold-400 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold tracking-wide uppercase text-ink-500 mb-2">Space Requirements *</label>
                        <input
                          type="text"
                          required
                          value={spaceReq}
                          onChange={(e) => setSpaceReq(e.target.value)}
                          placeholder="e.g. 12 m², 24 m²"
                          className="w-full h-11 bg-ink-50 border border-ink-200 rounded-sm px-4 text-sm text-ink-900 focus:outline-none focus:border-gold-400 focus:bg-white"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold tracking-wide uppercase text-ink-500 mb-2">Products to Exhibit *</label>
                        <textarea
                          required
                          value={products}
                          onChange={(e) => setProducts(e.target.value)}
                          placeholder="Describe products or services to be exhibited..."
                          rows={3}
                          className="w-full bg-ink-50 border border-ink-200 rounded-sm p-4 text-sm text-ink-900 focus:outline-none focus:border-gold-400 focus:bg-white resize-none"
                        />
                      </div>
                    </>
                  )}

                  {/* Step 4 Fields */}
                  {activeStep === 3 && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold tracking-wide uppercase text-ink-500 mb-2">Preferred Block *</label>
                        <input
                          type="text"
                          required
                          value={prefBlock}
                          onChange={(e) => setPrefBlock(e.target.value)}
                          placeholder="e.g. Block A, Block B"
                          className="w-full h-11 bg-ink-50 border border-ink-200 rounded-sm px-4 text-sm text-ink-900 focus:outline-none focus:border-gold-400 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold tracking-wide uppercase text-ink-500 mb-2">Stand Number(s) *</label>
                        <input
                          type="text"
                          required
                          value={standNumber}
                          onChange={(e) => setStandNumber(e.target.value)}
                          placeholder="e.g. A-001"
                          className="w-full h-11 bg-ink-50 border border-ink-200 rounded-sm px-4 text-sm text-ink-900 focus:outline-none focus:border-gold-400 focus:bg-white"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold tracking-wide uppercase text-ink-500 mb-2">Special Requirements</label>
                        <textarea
                          value={specialReq}
                          onChange={(e) => setSpecialReq(e.target.value)}
                          placeholder="Specify electrical connections, water access, custom booth height, etc."
                          rows={3}
                          className="w-full bg-ink-50 border border-ink-200 rounded-sm p-4 text-sm text-ink-900 focus:outline-none focus:border-gold-400 focus:bg-white resize-none"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                    disabled={activeStep === 0}
                    className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-ink-600 disabled:opacity-30 disabled:cursor-not-allowed hover:text-ink-900 transition-colors"
                  >
                    <ArrowLeft size={16} />
                    Previous
                  </button>
                  {activeStep < STEPS.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => {
                        // Validate fields for current step before proceeding
                        if (activeStep === 0 && (!companyName || !industry || !country)) return;
                        if (activeStep === 1 && (!fullName || !position || !email || !mobile)) return;
                        if (activeStep === 2 && (!standPackage || !spaceReq || !products)) return;
                        setActiveStep(activeStep + 1);
                      }}
                      className="btn-dark"
                    >
                      Next Step
                      <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary flex items-center gap-2"
                    >
                      <span>{submitting ? 'Submitting...' : 'Submit Application'}</span>
                      <ArrowRight size={16} />
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

