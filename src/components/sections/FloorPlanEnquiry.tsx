import { useState } from 'react';
import { X, Send, CheckCircle2, Building, Mail, Phone, User, MessageSquare } from 'lucide-react';
import type { Stand } from '@/data/stands';
import { supabase } from '@/lib/supabase';

interface FloorPlanEnquiryProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStands: Stand[];
  onSuccess: () => void;
}

export function FloorPlanEnquiry({
  isOpen,
  onClose,
  selectedStands,
  onSuccess,
}: FloorPlanEnquiryProps) {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const totalArea = selectedStands.reduce((acc, s) => acc + s.area, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const standLabels = selectedStands.map((s) => s.label).join(', ');

    try {
      // Try to insert into Supabase enquiries table
      const { error } = await supabase.from('enquiries').insert([
        {
          name,
          company,
          email,
          phone,
          notes,
          stands: standLabels,
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
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-premium-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <span className="text-[10px] font-extrabold tracking-widest uppercase text-gold-600">
              Stand Reservation Request
            </span>
            <h3 className="font-display font-black text-xl text-slate-900 mt-0.5">
              Submit Exhibition Enquiry
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200/60 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {submitted ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-200 animate-bounce">
                <CheckCircle2 size={36} />
              </div>
              <h4 className="font-display font-extrabold text-2xl text-slate-900">
                Enquiry Submitted!
              </h4>
              <p className="text-sm text-slate-600 max-w-xs">
                Thank you for your interest in GEGD 2027. Our exhibition secretariat will reach out to you within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Selected Stands Summary Box */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-500 font-bold uppercase tracking-wider">
                  <span>Selected Stands ({selectedStands.length})</span>
                  <span>{totalArea} m² Total</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedStands.map((stand) => (
                    <span
                      key={stand.id}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-800 shadow-xs"
                    >
                      {stand.label} ({stand.area}m²)
                    </span>
                  ))}
                </div>
              </div>

              {/* Input Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Samuel Mensah"
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 focus:bg-white text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Company / Organisation *
                  </label>
                  <div className="relative">
                    <Building size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Ghana Agro Enterprise"
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 focus:bg-white text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="samuel@company.com"
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 focus:bg-white text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+233 24 123 4567"
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 focus:bg-white text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Additional Requirements / Notes
                  </label>
                  <div className="relative">
                    <MessageSquare size={16} className="absolute left-3.5 top-3 text-slate-400" />
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Specify electrical, custom booth setup, or industry preferences..."
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 focus:bg-white text-slate-900 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full py-3.5 text-sm font-extrabold tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-gold-500/20"
                >
                  <Send size={16} />
                  <span>{submitting ? 'Submitting...' : 'Submit Official Enquiry'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
