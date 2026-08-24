import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search, ZoomIn, ZoomOut, RotateCcw, Download, X, MapPin, Maximize2, DollarSign, Tag, ArrowRight, Building,
} from 'lucide-react';
import { STATUS_LABELS, STATUS_COLORS, type Stand, type StandStatus, STANDS, ZONE_MAP, ZONE_TINTS } from '@/data/stands';
import { INDUSTRIES } from '@/data/content';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { supabase } from '@/lib/supabase';

const VIEWBOX_W = 1440;
const VIEWBOX_H = 1120; // Expanded to accommodate the Outdoor strip

const FACILITY_ZONES = [
  { x: 62, y: 84, w: 28, h: 30, label: 'restroom' },
  { x: 672, y: 84, w: 28, h: 64, label: 'office\nmanagement' },
  { x: 1350, y: 84, w: 28, h: 30, label: 'restroom' },
  { x: 672, y: 324, w: 28, h: 30, label: 'ATM' },
  { x: 62, y: 684, w: 28, h: 30, label: 'restroom' },
  { x: 672, y: 684, w: 28, h: 64, label: 'office\npolice' },
  { x: 1350, y: 684, w: 28, h: 30, label: 'restroom' },
];

const AISLE_LABELS = [
  { x: 400, y: 142, label: '4m' },
  { x: 740, y: 142, label: '4m' },
  { x: 1080, y: 142, label: '4m' },
  { x: 400, y: 302, label: '4m' },
  { x: 740, y: 302, label: '4m' },
  { x: 1080, y: 302, label: '4m' },
  { x: 400, y: 462, label: '4m' },
  { x: 740, y: 462, label: '4m' },
  { x: 1080, y: 462, label: '4m' },
  { x: 400, y: 622, label: '4m' },
  { x: 740, y: 622, label: '4m' },
  { x: 1080, y: 622, label: '4m' },
  { x: 400, y: 782, label: '4m' },
  { x: 740, y: 782, label: '4m' },
  { x: 1080, y: 782, label: '4m' },
];

export function FloorPlan() {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StandStatus | null>(null);
  const [industryFilter, setIndustryFilter] = useState<string | null>(null);
  const [selected, setSelected] = useState<Stand | null>(null);
  const [hovered, setHovered] = useState<Stand | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const [stands, setStands] = useState<Stand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function fetchStands() {
      try {
        const { data, error } = await supabase
          .from('stands')
          .select('*')
          .order('number', { ascending: true });

        if (error) {
          console.error('Error fetching stands, using local fallback:', error);
          if (active) {
            setStands(STANDS);
          }
          return;
        }

        if (active && data) {
          setStands(data.length > 0 ? (data as Stand[]) : STANDS);
        }
      } catch (err) {
        console.error('Failed to load stands, using local fallback:', err);
        if (active) {
          setStands(STANDS);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchStands();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('public:stands')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'stands',
        },
        (payload) => {
          if (!active) return;
          const updatedStand = payload.new as Stand;
          setStands((prevStands) =>
            prevStands.map((s) => (s.id === updatedStand.id ? updatedStand : s))
          );
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredStands = useMemo(() => {
    return stands.filter((s) => {
      const matchesSearch = search === '' 
        || s.label.toLowerCase().includes(search.toLowerCase())
        || (s.company ?? '').toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === null || s.status === statusFilter;
      const matchesIndustry = industryFilter === null || s.industry === industryFilter;
      return matchesSearch && matchesStatus && matchesIndustry;
    });
  }, [stands, search, statusFilter, industryFilter]);

  const isDimmed = (stand: Stand) => {
    if (search === '' && statusFilter === null && industryFilter === null) return false;
    return !filteredStands.some((s) => s.id === stand.id);
  };

  const selectedStand = useMemo(() => {
    if (!selected) return null;
    return stands.find((s) => s.id === selected.id) || selected;
  }, [stands, selected]);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 2.5));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.4));
  const handleReset = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    if (isDragging.current) {
      setPan({
        x: dragStart.current.panX + (e.clientX - dragStart.current.x),
        y: dragStart.current.panY + (e.clientY - dragStart.current.y),
      });
    }
  };
  
  const handleMouseUp = () => { isDragging.current = false; };

  const transform = `translate(${pan.x}, ${pan.y}) scale(${zoom})`;

  return (
    <section id="floor-plan" className="py-24 md:py-32 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <SectionHeading
          label="Floor Plan"
          title={<>Explore the <span className="text-gradient-gold">Exhibition Floor</span></>}
          subtitle="The interactive plan follows the supplied technical drawing: 480 indoor stands across 24 blocks categorized into 15 logical industry zones, facility zones, and a dedicated outdoor heavy equipment area."
        />

        <Reveal delay={100} className="mt-12">
          {/* Controls */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search stand or company (e.g. A-001, AgroGold)..."
                className="w-full pl-11 pr-4 py-3 bg-ink-50 border border-ink-200 rounded-sm text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-gold-400"
              />
            </div>

            <select
              value={industryFilter ?? ''}
              onChange={(e) => setIndustryFilter(e.target.value || null)}
              className="px-4 py-3 bg-ink-50 border border-ink-200 rounded-sm text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-gold-400 cursor-pointer"
            >
              <option value="">All Zones</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind.name} value={ind.name}>{ind.name}</option>
              ))}
            </select>

            <select
              value={statusFilter ?? ''}
              onChange={(e) => setStatusFilter((e.target.value || null) as StandStatus | null)}
              className="px-4 py-3 bg-ink-50 border border-ink-200 rounded-sm text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-gold-400 cursor-pointer"
            >
              <option value="">All Statuses</option>
              {(Object.keys(STATUS_LABELS) as StandStatus[]).map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>

            <div className="flex gap-1">
              <button onClick={handleZoomOut} className="p-3 bg-ink-50 border border-ink-200 rounded-sm hover:bg-ink-900 hover:text-white transition-colors" aria-label="Zoom out">
                <ZoomOut size={18} />
              </button>
              <button onClick={handleZoomIn} className="p-3 bg-ink-50 border border-ink-200 rounded-sm hover:bg-ink-900 hover:text-white transition-colors" aria-label="Zoom in">
                <ZoomIn size={18} />
              </button>
              <button onClick={handleReset} className="p-3 bg-ink-50 border border-ink-200 rounded-sm hover:bg-ink-900 hover:text-white transition-colors" aria-label="Reset view">
                <RotateCcw size={18} />
              </button>
            </div>

            <button className="btn-dark !py-3 !px-5 !text-xs">
              <Download size={16} />
              Floor Plan
            </button>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-4">
            {(Object.keys(STATUS_LABELS) as StandStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(statusFilter === s ? null : s)}
                className={`flex items-center gap-2 text-xs font-medium transition-all ${
                  statusFilter === s ? 'text-ink-900 font-bold' : 'text-ink-500'
                }`}
              >
                <span className={`w-3 h-3 rounded-sm border ${STATUS_COLORS[s].bg} border-ink-300`} />
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>

          {/* Floor plan canvas */}
          <div className="relative">
            {/* SVG canvas */}
            <div
              className="relative bg-ink-50 border border-ink-200 rounded-sm overflow-hidden cursor-grab active:cursor-grabbing select-none w-full"
              style={{ aspectRatio: `${VIEWBOX_W / VIEWBOX_H}` }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <svg
                viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
                className="w-full h-full"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#eceef2" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width={VIEWBOX_W} height={VIEWBOX_H} fill="url(#grid)" />

                <g transform={transform}>
                  {/* Zone background overlays inside the hall (24 blocks) */}
                  {Array.from({ length: 6 }).map((_, blockRow) =>
                    Array.from({ length: 4 }).map((_, blockColumn) => {
                      const zoneName = ZONE_MAP[blockRow][blockColumn];
                      const tint = ZONE_TINTS[zoneName] || { fill: '#ffffff', stroke: '#eceef2', text: '#64748b' };
                      const blockX = 60 + blockColumn * 340; // 300 + 40
                      const blockY = 82 + blockRow * 120; // 80 + 40
                      return (
                        <g key={`zone-bg-${blockRow}-${blockColumn}`} className="pointer-events-none select-none">
                          <rect
                            x={blockX}
                            y={blockY}
                            width={300}
                            height={80}
                            fill={tint.fill}
                            stroke={tint.stroke}
                            strokeWidth={0.5}
                            opacity={0.8}
                            rx={2}
                          />
                          <text
                            x={blockX + 150}
                            y={blockY + 40}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize="8"
                            fontWeight="800"
                            fill={tint.text}
                            opacity={0.16}
                            className="uppercase tracking-wider pointer-events-none select-none"
                          >
                            {zoneName}
                          </text>
                        </g>
                      );
                    })
                  )}

                  {/* Hall outline — 140m × 76m */}
                  <rect x="40" y="50" width={VIEWBOX_W - 80} height={740} fill="none" stroke="#aeb6c4" strokeWidth="2" rx="4" className="pointer-events-none" />

                  {/* Top dimensions from the supplied technical drawing */}
                  <line x1="40" y1="28" x2={VIEWBOX_W - 40} y2="28" stroke="#828d9f" strokeWidth="0.5" />
                  <text x={VIEWBOX_W / 2} y="23" textAnchor="middle" fontSize="9" fill="#828d9f" fontWeight="600">140,000 mm (140m) — Overall</text>
                  <line x1="60" y1="38" x2={VIEWBOX_W - 60} y2="38" stroke="#aeb6c4" strokeWidth="0.5" />
                  <text x={VIEWBOX_W / 2} y="36" textAnchor="middle" fontSize="7" fill="#aeb6c4" fontWeight="500">132,000 mm — Internal</text>

                  {/* Side dimensions from the supplied technical drawing */}
                  <line x1="28" y1="50" x2="28" y2={790} stroke="#828d9f" strokeWidth="0.5" />
                  <text x="22" y={420} textAnchor="middle" fontSize="8" fill="#828d9f" fontWeight="600" transform={`rotate(-90 22 420)`}>76,000 mm (76m) — Overall</text>
                  <line x1={VIEWBOX_W - 28} y1="82" x2={VIEWBOX_W - 28} y2="762" stroke="#aeb6c4" strokeWidth="0.5" />
                  <text x={VIEWBOX_W - 22} y={420} textAnchor="middle" fontSize="7" fill="#aeb6c4" fontWeight="500" transform={`rotate(90 ${VIEWBOX_W - 22} 420)`}>68,000 mm — Internal</text>

                  {/* Block dimension annotations: 30,000 mm per block */}
                  {[60, 400, 740, 1080].map((x) => (
                    <text key={`bw-${x}`} x={x + 150} y={782} textAnchor="middle" fontSize="7" fill="#aeb6c4" fontWeight="500">30,000 mm</text>
                  ))}

                  {/* Aisle labels */}
                  {AISLE_LABELS.map((a) => (
                    <text key={`${a.x}-${a.y}`} x={a.x} y={a.y} textAnchor="middle" fontSize="8" fill="#aeb6c4" fontWeight="500">{a.label}</text>
                  ))}

                  {/* Perimeter clearance shown on the supplied plan */}
                  <text x="48" y={776} fontSize="7" fill="#aeb6c4" fontWeight="500">4,000 mm perimeter</text>
                  <text x={VIEWBOX_W - 48} y={776} textAnchor="end" fontSize="7" fill="#aeb6c4" fontWeight="500">4,000 mm perimeter</text>

                  {/* Entrance */}
                  <rect x={VIEWBOX_W / 2 - 70} y="42" width="140" height="8" fill="#e9b43e" opacity="0.3" />
                  <text x={VIEWBOX_W / 2} y="46" textAnchor="middle" fontSize="8" fill="#975c20" fontWeight="700">MAIN ENTRANCE</text>

                  {/* Outdoor Zone separator, background, and header */}
                  <line x1="40" y1="815" x2={VIEWBOX_W - 40} y2="815" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" />
                  <rect x={140} y={830} width={1160} height={250} fill="#fafbfc" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2" rx="4" />
                  <rect x={VIEWBOX_W / 2 - 120} y="805" width="240" height="20" fill="#f8fafc" rx="10" stroke="#cbd5e1" strokeWidth="1" />
                  <text x={VIEWBOX_W / 2} y="818" textAnchor="middle" fontSize="8" fill="#475569" fontWeight="700" className="tracking-widest uppercase">
                    Outdoor Heavy Equipment Zone
                  </text>

                  {/* Stands */}
                  {loading ? (
                    <text x={VIEWBOX_W / 2} y={VIEWBOX_H / 2} textAnchor="middle" fill="#828d9f" fontSize="16" fontWeight="600">Loading Floor Plan...</text>
                  ) : (
                    stands.map((stand) => {
                      const colors = STATUS_COLORS[stand.status];
                      const dimmed = isDimmed(stand);
                      const isSelected = selectedStand?.id === stand.id;
                      const isHovered = hovered?.id === stand.id;
                      return (
                        <g
                          key={stand.id}
                          className="cursor-pointer transition-all"
                          opacity={dimmed ? 0.2 : 1}
                          onMouseEnter={() => setHovered(stand)}
                          onMouseLeave={() => setHovered(null)}
                          onClick={() => setSelected(stand)}
                        >
                          <rect
                            x={stand.x}
                            y={stand.y}
                            width={stand.w}
                            height={stand.h}
                            fill={isSelected ? '#e9b43e' : colors.fill}
                            stroke={isSelected ? '#bc7d23' : colors.stroke}
                            strokeWidth={isSelected ? 1.5 : 0.8}
                            rx={0}
                            className="transition-all"
                            style={isHovered && !isSelected ? { filter: 'brightness(0.92)' } : undefined}
                          />
                          <text
                            x={stand.x + stand.w / 2}
                            y={stand.y + stand.h / 2 + 2.5}
                            textAnchor="middle"
                            fontSize={stand.status === 'outdoor' ? '8' : '5'}
                            fontWeight="600"
                            fill={isSelected ? '#1a1d23' : colors.text}
                            className="pointer-events-none"
                          >
                            {stand.label}
                          </text>
                        </g>
                      );
                    })
                  )}

                  {/* Facility cutouts shown on the supplied plan */}
                  {FACILITY_ZONES.map((facility) => (
                    <g key={`${facility.x}-${facility.y}`}>
                      <rect x={facility.x} y={facility.y} width={facility.w} height={facility.h} fill="white" stroke="#1a1d23" strokeWidth="1" />
                      {facility.label.split(/\\n/).map((line, index) => (
                        <text key={line} x={facility.x + facility.w / 2} y={facility.y + 13 + index * 10} textAnchor="middle" fontSize="5" fill="#3f4654" fontWeight="600">{line}</text>
                      ))}
                    </g>
                  ))}
                </g>
              </svg>

              {/* Hover tooltip */}
              {hovered && !selected && (
                <div
                  className="absolute pointer-events-none z-10 bg-ink-950 text-white px-3 py-2 rounded-sm shadow-premium-lg text-xs whitespace-nowrap"
                  style={{
                    left: mousePos.x + 16,
                    top: mousePos.y + 16,
                  }}
                >
                  <div className="font-bold">{hovered.label}</div>
                  <div className="text-ink-300 mt-0.5">{hovered.area} m² · {STATUS_LABELS[hovered.status]}</div>
                  <div className="text-gold-400 mt-0.5 text-[10px] font-semibold">{hovered.industry}</div>
                  {hovered.company && <div className="text-emerald-400 mt-0.5 text-[10px] italic">Exhibitor: {hovered.company}</div>}
                </div>
              )}

              {/* Zoom indicator */}
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-sm text-xs font-semibold text-ink-600 border border-ink-200">
                {Math.round(zoom * 100)}%
              </div>
            </div>

            {/* Stand detail panel (Slide-out Drawer) */}
            <>
              {/* Backdrop overlay */}
              <div 
                className={`fixed inset-0 bg-ink-950/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${selectedStand ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
                onClick={() => setSelected(null)}
              />
              
              {/* Drawer */}
              <div 
                className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-premium-2xl transform transition-transform duration-300 ease-in-out flex flex-col border-l border-ink-200 ${
                  selectedStand ? 'translate-x-0' : 'translate-x-full'
                }`}
              >
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                  {selectedStand && (
                    <div className="animate-fade-in">
                      <div className="flex items-start justify-between mb-8">
                        <div>
                          <span className="text-xs font-bold tracking-widest uppercase text-gold-600">Stand Detail</span>
                          <h3 className="mt-1 font-display text-4xl font-black text-ink-900">{selectedStand.label}</h3>
                        </div>
                        <button onClick={() => setSelected(null)} className="p-2 text-ink-400 hover:text-ink-900 bg-ink-50 rounded-full transition-colors" aria-label="Close detail">
                          <X size={24} />
                        </button>
                      </div>

                      <div className="space-y-5">
                        {selectedStand.company && (
                          <div className="flex items-center gap-4 pb-5 border-b border-ink-200">
                            <div className="w-12 h-12 bg-white rounded-sm flex items-center justify-center border border-ink-200 shadow-sm">
                              <Building size={20} className="text-ink-600" />
                            </div>
                            <div>
                              <div className="text-xs text-ink-500 font-medium uppercase tracking-wide">Exhibitor</div>
                              <div className="font-bold text-ink-900 text-lg">{selectedStand.company}</div>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-4 pb-5 border-b border-ink-200">
                          <div className="w-12 h-12 bg-white rounded-sm flex items-center justify-center border border-ink-200 shadow-sm">
                            <Maximize2 size={20} className="text-ink-600" />
                          </div>
                          <div>
                            <div className="text-xs text-ink-500 font-medium uppercase tracking-wide">Area</div>
                            <div className="font-bold text-ink-900 text-lg">{selectedStand.area} m²</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 pb-5 border-b border-ink-200">
                          <div className="w-12 h-12 bg-white rounded-sm flex items-center justify-center border border-ink-200 shadow-sm">
                            <Tag size={20} className="text-ink-600" />
                          </div>
                          <div>
                            <div className="text-xs text-ink-500 font-medium uppercase tracking-wide">Type</div>
                            <div className="font-bold text-ink-900 text-lg">{selectedStand.type}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 pb-5 border-b border-ink-200">
                          <div className="w-12 h-12 bg-white rounded-sm flex items-center justify-center border border-ink-200 shadow-sm">
                            <DollarSign size={20} className="text-ink-600" />
                          </div>
                          <div>
                            <div className="text-xs text-ink-500 font-medium uppercase tracking-wide">Price</div>
                            <div className="font-bold text-ink-900 text-lg">{selectedStand.price}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 pb-5 border-b border-ink-200">
                          <div className="w-12 h-12 bg-white rounded-sm flex items-center justify-center border border-ink-200 shadow-sm">
                            <MapPin size={20} className="text-ink-600" />
                          </div>
                          <div>
                            <div className="text-xs text-ink-500 font-medium uppercase tracking-wide">Status</div>
                            <div className="flex items-center gap-2">
                              <span className={`w-3 h-3 rounded-full ${STATUS_COLORS[selectedStand.status].dot}`} />
                              <span className="font-bold text-ink-900 text-lg">{STATUS_LABELS[selectedStand.status]}</span>
                            </div>
                          </div>
                        </div>

                        {selectedStand.industry && (
                          <div className="pb-5 border-b border-ink-200">
                            <div className="text-xs text-ink-500 font-medium uppercase tracking-wide mb-1">Zone</div>
                            <div className="font-semibold text-ink-700 text-base">{selectedStand.industry}</div>
                          </div>
                        )}
                      </div>

                      {selectedStand.status === 'available' && (
                        <button className="btn-primary w-full mt-8 py-4 text-base">
                          Reserve This Stand
                          <ArrowRight size={20} />
                        </button>
                      )}
                      {selectedStand.status === 'premium' && (
                        <button className="btn-primary w-full mt-8 py-4 text-base">
                          Reserve Premium Stand
                          <ArrowRight size={20} />
                        </button>
                      )}
                      {selectedStand.status === 'outdoor' && (
                        <button className="btn-primary w-full mt-8 py-4 text-base !bg-blue-600 hover:!bg-blue-500 text-white flex items-center justify-center gap-2">
                          Enquire for Outdoor Space
                          <ArrowRight size={20} />
                        </button>
                      )}
                      {(selectedStand.status === 'reserved' || selectedStand.status === 'confirmed') && (
                        <button disabled className="w-full mt-8 py-4 bg-ink-200 text-ink-400 font-bold text-sm tracking-wide uppercase rounded-sm border border-ink-300 cursor-not-allowed flex items-center justify-center gap-2">
                          Already Reserved
                        </button>
                      )}
                      {selectedStand.status === 'sponsor' && (
                        <button disabled className="w-full mt-8 py-4 bg-purple-100 text-purple-400 font-bold text-sm tracking-wide uppercase rounded-sm border border-purple-200 cursor-not-allowed flex items-center justify-center gap-2">
                          Sponsor / Pavilion
                        </button>
                      )}

                      <p className="mt-4 text-xs text-ink-400 text-center">
                        Demo only — not connected to a live booking system.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
