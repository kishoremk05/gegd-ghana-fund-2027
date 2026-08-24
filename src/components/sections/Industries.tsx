import { useState, useMemo } from 'react';
import {
  Search, Wheat, Mountain, Factory, Car, Plane, TrainFront, Ship, HardHat,
  Zap, CircuitBoard, Stethoscope, Landmark, Lightbulb, Globe, Truck,
} from 'lucide-react';
import { INDUSTRIES } from '@/data/content';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';

const ICONS: Record<string, typeof Search> = {
  Wheat, Mountain, Factory, Car, Plane, TrainFront, Ship, HardHat,
  Zap, CircuitBoard, Stethoscope, Landmark, Lightbulb, Globe, Truck,
};

export function Industries() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<string | null>(null);

  const categories = useMemo(() => {
    return INDUSTRIES.filter((c) => {
      const matchesQuery = query === '' || c.name.toLowerCase().includes(query.toLowerCase()) || c.description.toLowerCase().includes(query.toLowerCase());
      const matchesFilter = filter === null || c.name === filter;
      return matchesQuery && matchesFilter;
    });
  }, [query, filter]);

  return (
    <section id="industries" className="py-24 md:py-32 bg-ink-50">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <SectionHeading
          label="Industry Categories"
          title={<>Industry <span className="text-gradient-gold">Categories</span></>}
          subtitle="Explore the sectors represented at GEGD 2027. Search or filter to find your industry."
        />

        {/* Search & filter */}
        <Reveal delay={100} className="mt-12 max-w-2xl mx-auto">
          <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search industries..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-ink-200 rounded-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-gold-400 transition-all"
            />
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setFilter(null)}
              className={`px-4 py-2 text-xs font-semibold tracking-wide uppercase rounded-sm transition-all ${
                filter === null ? 'bg-ink-900 text-white' : 'bg-white text-ink-600 border border-ink-200 hover:border-ink-400'
              }`}
            >
              All
            </button>
            {INDUSTRIES.slice(0, 6).map((c) => (
              <button
                key={c.name}
                onClick={() => setFilter(filter === c.name ? null : c.name)}
                className={`px-4 py-2 text-xs font-semibold tracking-wide uppercase rounded-sm transition-all ${
                  filter === c.name ? 'bg-gold-500 text-ink-950' : 'bg-white text-ink-600 border border-ink-200 hover:border-gold-300'
                }`}
              >
                {c.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Grid */}
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat, i) => {
            const Icon = ICONS[cat.icon] ?? Factory;
            return (
              <Reveal
                key={cat.name}
                delay={i * 50}
                className="group bg-white p-7 rounded-sm border border-ink-100 hover:border-gold-300 hover:shadow-premium-lg transition-all duration-400 hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-ink-50 rounded-sm flex items-center justify-center group-hover:bg-gold-400 transition-colors duration-300">
                    <Icon size={24} className="text-ink-700 group-hover:text-ink-950 transition-colors" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-lg font-bold text-ink-900 leading-tight">{cat.name}</h3>
                    <p className="mt-2 text-sm text-ink-600 leading-relaxed">{cat.description}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        {categories.length === 0 && (
          <div className="mt-12 text-center py-12">
            <p className="text-ink-500 font-medium">No industries match your search.</p>
            <button onClick={() => { setQuery(''); setFilter(null); }} className="mt-3 text-gold-600 font-semibold text-sm hover:text-gold-700">
              Clear filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
