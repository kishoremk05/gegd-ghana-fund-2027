import { useEffect, useState } from 'react';
import { ShieldCheck, Zap, Headphones, Loader2 } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';

export function BookingPreview() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Handle scroll when initiate-booking event is dispatched
    const handleInitiate = () => {
      const el = document.getElementById('booking');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    };

    window.addEventListener('initiate-booking', handleInitiate);

    // Dynamically load Cognito Forms iframe resizing script
    const script = document.createElement('script');
    script.src = 'https://www.cognitoforms.com/f/iframe.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      window.removeEventListener('initiate-booking', handleInitiate);
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <section id="booking" className="py-24 md:py-32 bg-ink-50 relative overflow-hidden">
      {/* Background visual accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-gold-500/5 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">
        <SectionHeading
          label="Booth Reservation"
          title={<>Reserve Your <span className="text-gradient-gold">Exhibition Space</span></>}
          subtitle="Complete the official reservation form below to select your stand package, submit exhibitor details, and secure your location at GEGD 2027."
        />

        {/* Form Container Card */}
        <Reveal delay={100} className="mt-10 max-w-5xl mx-auto">
          <div className="bg-white rounded-lg border border-ink-200/80 shadow-2xl overflow-hidden relative transition-all duration-300">
            {/* Top decorative gold bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600" />

            {/* Loading Overlay */}
            {isLoading && (
              <div className="py-24 flex flex-col items-center justify-center text-center space-y-3 bg-white">
                <Loader2 size={36} className="text-gold-500 animate-spin" />
                <p className="text-sm font-medium text-ink-600">Loading Reservation Form...</p>
              </div>
            )}

            {/* Form Iframe */}
            <div className={`p-2 sm:p-6 md:p-8 transition-opacity duration-500 ${isLoading ? 'hidden' : 'block'}`}>
              <iframe
                src="https://www.cognitoforms.com/f/zV4gbMUrkkG3qp4fcOwzMg/26"
                allow="payment"
                onLoad={() => setIsLoading(false)}
                style={{ border: 0, width: '100%' }}
                height="1573"
                title="GEGD Exhibition Booth Reservation Form"
              ></iframe>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}



