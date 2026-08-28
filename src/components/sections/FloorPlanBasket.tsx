import { ShoppingBag, X, ArrowRight, Trash2 } from 'lucide-react';
import { type Stand, calculateTotalStandsPrice, formatCurrency } from '@/data/stands';

interface FloorPlanBasketProps {
  selectedStands: Stand[];
  onRemoveStand: (standId: string) => void;
  onClearAll: () => void;
  onEnquire: () => void;
}

export function FloorPlanBasket({
  selectedStands,
  onRemoveStand,
  onClearAll,
  onEnquire,
}: FloorPlanBasketProps) {
  if (selectedStands.length === 0) return null;

  // Calculate total price sum if price strings can be parsed, or count total area
  const totalArea = selectedStands.reduce((acc, s) => acc + s.area, 0);
  const totalPrice = calculateTotalStandsPrice(selectedStands);

  return (
    <div className="absolute bottom-4 left-4 right-4 z-40 animate-slide-up pointer-events-auto">
      <div className="max-w-4xl mx-auto bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/80 rounded-xl p-4 shadow-premium-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Selected count & chips */}
        <div className="flex items-center gap-3 w-full md:w-auto overflow-hidden">
          <div className="w-10 h-10 rounded-lg bg-gold-500/20 border border-gold-500/40 flex items-center justify-center flex-shrink-0 text-gold-400">
            <ShoppingBag size={20} />
          </div>
          
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Selected Stands ({selectedStands.length})
              </span>
              <span className="text-xs text-slate-400">• {totalArea} m² Total</span>
              <span className="text-xs text-gold-400 font-extrabold">• {formatCurrency(totalPrice)} Est. Total</span>
            </div>
            
            {/* Chips scroll container */}
            <div className="flex items-center gap-1.5 mt-1 overflow-x-auto max-w-full pb-1 [&::-webkit-scrollbar]:hidden">
              {selectedStands.map((stand) => (
                <span
                  key={stand.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-md text-xs font-bold text-slate-200 whitespace-nowrap flex-shrink-0"
                >
                  <span className="w-2 h-2 rounded-full bg-gold-400" />
                  {stand.label}
                  <button
                    onClick={() => onRemoveStand(stand.id)}
                    className="hover:text-red-400 transition-colors ml-0.5 p-0.5"
                    aria-label={`Remove ${stand.label}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
          <button
            onClick={onClearAll}
            className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors px-2 py-2 flex items-center gap-1"
          >
            <Trash2 size={13} />
            <span>Clear</span>
          </button>

          <button
            onClick={onEnquire}
            className="btn-primary !py-2.5 !px-5 text-xs font-extrabold tracking-wider uppercase flex items-center gap-2 shadow-lg shadow-gold-500/20"
          >
            <span>Enquire for {selectedStands.length} {selectedStands.length === 1 ? 'Stand' : 'Stands'}</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
