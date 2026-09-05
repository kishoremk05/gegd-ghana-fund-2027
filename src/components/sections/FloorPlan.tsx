import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search, ZoomIn, ZoomOut, RotateCcw, Download, X, MapPin, Maximize2, DollarSign, Tag, ArrowRight, Building, Map, Check, ChevronUp, ChevronDown, ChevronLeft, ChevronRight
} from 'lucide-react';
import { STATUS_LABELS, STATUS_COLORS, BOOTH_TYPE_COLORS, type Stand, type StandStatus, STANDS, ZONE_MAP, ZONE_TINTS } from '@/data/stands';
import { INDUSTRIES } from '@/data/content';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { supabase } from '@/lib/supabase';
import { FloorPlanBasket } from './FloorPlanBasket';
import { FloorPlanEnquiry } from './FloorPlanEnquiry';

const VIEWBOX_X = -100;
const VIEWBOX_Y = -125;
const VIEWBOX_W = 1600;
const VIEWBOX_H = 1280; // Accommodates hall and outdoor zone with generous 50px uniform margin padding on all 4 sides

const FACILITY_ZONES = [
  { x: 40, y: 40, w: 60, h: 40, label: 'restroom' },
  { x: 620, y: 40, w: 60, h: 40, label: 'office\nmanagement' },
  { x: 1300, y: 40, w: 60, h: 40, label: 'restroom' },
  { x: 620, y: 280, w: 60, h: 40, label: 'ATM' },
  { x: 40, y: 680, w: 60, h: 40, label: 'restroom' },
  { x: 650, y: 680, w: 30, h: 40, label: 'office\npolice' },
  { x: 1300, y: 680, w: 60, h: 40, label: 'restroom' },
];

const AISLE_LABELS = [
  // 3 Vertical Aisles (x = 360, 700, 1040) positioned directly at the sides of the blocks, rendered horizontally left-to-right
  { x: 360, y: 80, label: '4m aisle' },
  { x: 700, y: 80, label: '4m aisle' },
  { x: 1040, y: 80, label: '4m aisle' },

  { x: 360, y: 200, label: '4m aisle' },
  { x: 700, y: 200, label: '4m aisle' },
  { x: 1040, y: 200, label: '4m aisle' },

  { x: 360, y: 320, label: '4m aisle' },
  { x: 700, y: 320, label: '4m aisle' },
  { x: 1040, y: 320, label: '4m aisle' },

  { x: 360, y: 440, label: '4m aisle' },
  { x: 700, y: 440, label: '4m aisle' },
  { x: 1040, y: 440, label: '4m aisle' },

  { x: 360, y: 560, label: '4m aisle' },
  { x: 700, y: 560, label: '4m aisle' },
  { x: 1040, y: 560, label: '4m aisle' },

  { x: 360, y: 680, label: '4m aisle' },
  { x: 700, y: 680, label: '4m aisle' },
  { x: 1040, y: 680, label: '4m aisle' },
];

export function FloorPlan() {
  const [viewBox, setViewBox] = useState({ x: VIEWBOX_X, y: VIEWBOX_Y, w: VIEWBOX_W, h: VIEWBOX_H });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StandStatus | null>(null);
  const [industryFilter, setIndustryFilter] = useState<string | null>(null);
  const [selected, setSelected] = useState<Stand | null>(null);
  const [selectedStands, setSelectedStands] = useState<Set<string>>(new Set());
  const [hovered, setHovered] = useState<Stand | null>(null);
  const [hoveredBlock, setHoveredBlock] = useState<{ row: number; col: number } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [selectedBlock, setSelectedBlock] = useState<{ row: number; col: number } | null>(null);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [stands, setStands] = useState<Stand[]>([]);
  const [loading, setLoading] = useState(true);

  const targetViewBox = useRef({ x: VIEWBOX_X, y: VIEWBOX_Y, w: VIEWBOX_W, h: VIEWBOX_H });
  const animFrameRef = useRef<number | null>(null);

  const zoom = VIEWBOX_W / viewBox.w;

  // Smooth viewBox animation lerp
  const animateToViewBox = (target: { x: number; y: number; w: number; h: number }) => {
    targetViewBox.current = target;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    const step = () => {
      setViewBox((prev) => {
        const dx = (targetViewBox.current.x - prev.x) * 0.25;
        const dy = (targetViewBox.current.y - prev.y) * 0.25;
        const dw = (targetViewBox.current.w - prev.w) * 0.25;
        const dh = (targetViewBox.current.h - prev.h) * 0.25;

        if (
          Math.abs(dx) < 0.1 &&
          Math.abs(dy) < 0.1 &&
          Math.abs(dw) < 0.1 &&
          Math.abs(dh) < 0.1
        ) {
          return targetViewBox.current;
        }

        animFrameRef.current = requestAnimationFrame(step);
        return {
          x: prev.x + dx,
          y: prev.y + dy,
          w: prev.w + dw,
          h: prev.h + dh,
        };
      });
    };

    animFrameRef.current = requestAnimationFrame(step);
  };

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
          if (active) setStands(STANDS);
          return;
        }

        if (active && data) {
          setStands(data.length > 0 ? (data as Stand[]) : STANDS);
        }
      } catch (err) {
        console.error('Failed to load stands, using local fallback:', err);
        if (active) setStands(STANDS);
      } finally {
        if (active) setLoading(false);
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
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const stats = useMemo(() => {
    const counts: Record<StandStatus, number> = {
      available: 0,
      reserved: 0,
      confirmed: 0,
      premium: 0,
      outdoor: 0,
      sponsor: 0,
    };
    stands.forEach((s) => {
      if (s.status in counts) {
        counts[s.status]++;
      }
    });
    return counts;
  }, [stands]);

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

  const selectedStandsList = useMemo(() => {
    return stands.filter((s) => selectedStands.has(s.id));
  }, [stands, selectedStands]);

  const handleZoomIn = () => {
    const newW = Math.max(viewBox.w * 0.75, 300);
    const newH = newW * (VIEWBOX_H / VIEWBOX_W);
    const cx = viewBox.x + viewBox.w / 2;
    const cy = viewBox.y + viewBox.h / 2;
    animateToViewBox({
      x: cx - newW / 2,
      y: cy - newH / 2,
      w: newW,
      h: newH,
    });
  };

  const handleZoomOut = () => {
    const newW = Math.min(viewBox.w * 1.3, VIEWBOX_W);
    const newH = newW * (VIEWBOX_H / VIEWBOX_W);
    const cx = viewBox.x + viewBox.w / 2;
    const cy = viewBox.y + viewBox.h / 2;
    const targetX = Math.max(0, Math.min(cx - newW / 2, VIEWBOX_W - newW));
    const targetY = Math.max(0, Math.min(cy - newH / 2, VIEWBOX_H - newH));

    if (newW >= VIEWBOX_W) {
      handleReset();
    } else {
      animateToViewBox({ x: targetX, y: targetY, w: newW, h: newH });
    }
  };

  const handleReset = () => { 
    setSelectedBlock(null);
    animateToViewBox({ x: VIEWBOX_X, y: VIEWBOX_Y, w: VIEWBOX_W, h: VIEWBOX_H });
  };

  const handleBlockClick = (blockRow: number, blockColumn: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const blockX = 40 + blockColumn * 340;
    const blockY = 40 + blockRow * 120;
    
    // Generous target viewBox size for block focus
    const targetW = 480;
    const targetH = targetW * (VIEWBOX_H / VIEWBOX_W); // 373.33
    
    const blockCenterX = blockX + 150;
    const blockCenterY = blockY + 40;

    setSelectedBlock({ row: blockRow, col: blockColumn });
    animateToViewBox({
      x: blockCenterX - targetW / 2,
      y: blockCenterY - targetH / 2,
      w: targetW,
      h: targetH,
    });
  };

  const handleStandClick = (stand: Stand, e: React.MouseEvent) => {
    e.stopPropagation();
    // Always set selected stand so the Unit Blueprint Card & Drawer pop up!
    setSelected(stand);

    if (stand.status === 'available' || stand.status === 'premium' || stand.status === 'outdoor') {
      setSelectedStands((prev) => {
        const next = new Set(prev);
        if (next.has(stand.id)) {
          next.delete(stand.id);
        } else {
          next.add(stand.id);
        }
        return next;
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const getBlockStats = (row: number, col: number) => {
    const blockLetter = ['A', 'B', 'C', 'D'][col];
    const blockNum = row + 1;
    const blockId = `${blockLetter}${blockNum}`;
    const blockStands = stands.filter((s) => s.block === blockId);
    const avail = blockStands.filter((s) => s.status === 'available' || s.status === 'premium' || s.status === 'outdoor').length;
    const res = blockStands.filter((s) => s.status === 'reserved' || s.status === 'confirmed').length;
    return { total: blockStands.length, avail, res };
  };

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

          {/* Legend / Stand Count Summary Bar */}
          <div className="flex flex-col gap-3 mb-6 bg-slate-50 border border-slate-200/60 rounded px-4 py-3">
            {/* Booth Types */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pb-2.5 border-b border-slate-200/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Booth Types:</span>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <span className="w-4 h-4 rounded-sm border bg-white border-slate-700 shadow-sm flex items-center justify-center text-[10px] font-black text-slate-700">S</span>
                  <span>Standard Booth</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-blue-700">
                  <span className="w-4 h-4 rounded-sm border bg-blue-50 border-blue-500 shadow-sm flex items-center justify-center text-[10px] font-black text-blue-700">C</span>
                  <span>Corner Booth</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-red-700">
                  <span className="w-4 h-4 rounded-sm border bg-red-50 border-red-500 shadow-sm flex items-center justify-center text-[10px] font-black text-red-700">P</span>
                  <span>Premium Booth</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-blue-800">
                  <span className="w-4 h-4 rounded-sm border bg-blue-100 border-blue-600 shadow-sm flex items-center justify-center text-[10px] font-black text-blue-800">O</span>
                  <span>Outdoor Booth</span>
                </div>
              </div>
            </div>

            {/* Availability Statuses */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Availability:</span>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {(Object.keys(STATUS_LABELS) as StandStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(statusFilter === s ? null : s)}
                    className={`flex items-center gap-2 text-xs font-semibold transition-all ${
                      statusFilter === s ? 'text-slate-900 scale-105 font-bold' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-sm border ${STATUS_COLORS[s].bg} shadow-sm`} style={{ borderColor: STATUS_COLORS[s].stroke }} />
                    <span>{STATUS_LABELS[s]}</span>
                    <span className="bg-white border border-slate-200/80 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-slate-500 shadow-sm">{stats[s] ?? 0}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Single Floor Plan Canvas Container */}
          <div
            ref={containerRef}
            className="relative bg-ink-50 border border-slate-200 rounded-xl overflow-hidden select-none w-full shadow-sm"
            style={{ aspectRatio: `${VIEWBOX_W / VIEWBOX_H}` }}
            onMouseMove={handleMouseMove}
          >
            {/* Inner Zoomable SVG Canvas (Uses ViewBox Animation) */}
            <svg
              viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
              className="w-full h-full"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#eceef2" strokeWidth="0.5" />
                </pattern>
                <clipPath id="map-clip">
                  <rect x="-100" y="-125" width={1600} height={1280} />
                </clipPath>
              </defs>
              <rect x={VIEWBOX_X} y={VIEWBOX_Y} width={VIEWBOX_W} height={VIEWBOX_H} fill="url(#grid)" />

                {/* ZOOMABLE CONTENT */}
                <g clipPath="url(#map-clip)">
                  <g>
                    {/* Zone background overlays inside the hall (24 blocks) */}
                    {Array.from({ length: 6 }).map((_, blockRow) =>
                      Array.from({ length: 4 }).map((_, blockColumn) => {
                        if (selectedBlock && (selectedBlock.row !== blockRow || selectedBlock.col !== blockColumn)) {
                          return null;
                        }
                        const zoneName = ZONE_MAP[blockRow][blockColumn];
                        const tint = ZONE_TINTS[zoneName] || { fill: '#ffffff', stroke: '#eceef2', text: '#64748b' };
                        const blockX = 40 + blockColumn * 340;
                        const blockY = 40 + blockRow * 120;
                        const isClickable = zoom < 1.5;
                        
                        return (
                          <g 
                            key={`zone-bg-${blockRow}-${blockColumn}`}
                            onClick={isClickable ? (e) => handleBlockClick(blockRow, blockColumn, e) : undefined}
                            onMouseEnter={() => zoom < 1.5 && setHoveredBlock({ row: blockRow, col: blockColumn })}
                            onMouseLeave={() => setHoveredBlock(null)}
                            className={isClickable ? 'cursor-pointer group' : 'pointer-events-none select-none'}
                          >
                            <rect
                              x={blockX}
                              y={blockY}
                              width={300}
                              height={80}
                              fill={tint.fill}
                              stroke={isClickable ? '#fbbf24' : tint.stroke}
                              strokeWidth={isClickable ? 1.5 / zoom : 0.5 / zoom}
                              opacity={0.85}
                              rx={3}
                              className={`transition-all duration-300 ${isClickable ? 'group-hover:fill-amber-50/50 group-hover:stroke-amber-500 group-hover:opacity-100' : ''}`}
                            />
                          </g>
                        );
                      })
                    )}

                    {/* Aisle labels rendered horizontally left-to-right between the sides of blocks */}
                    {!selectedBlock && AISLE_LABELS.map((a, idx) => (
                      <g key={`aisle-lbl-${idx}-${a.x}-${a.y}`} transform={`translate(${a.x}, ${a.y})`} className="pointer-events-none select-none">
                        <text
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="6.5"
                          fill="#334155"
                          fontWeight="900"
                          className="tracking-wider uppercase font-sans"
                        >
                          {a.label}
                        </text>
                      </g>
                    ))}

                    {/* Stands */}
                    {loading ? (
                      <text x={VIEWBOX_W / 2} y={VIEWBOX_H / 2} textAnchor="middle" fill="#828d9f" fontSize="16" fontWeight="600">Loading Floor Plan...</text>
                    ) : (
                      stands.map((stand) => {
                        // Filter by selected block coordinate bounds
                        if (selectedBlock) {
                          const blockX = 40 + selectedBlock.col * 340;
                          const blockY = 40 + selectedBlock.row * 120;
                          const isInsideBlock = stand.x >= blockX && stand.x < blockX + 300 && stand.y >= blockY && stand.y < blockY + 80;
                          if (!isInsideBlock) return null;
                        }

                        const statusColors = STATUS_COLORS[stand.status];
                        const boothTypeConfig = BOOTH_TYPE_COLORS[stand.boothType || 'standard'];
                        
                        // Use booth type colors for available stands, and status colors for non-available (reserved/confirmed/etc.)
                        const baseFill = stand.status === 'available' ? boothTypeConfig.fill : statusColors.fill;
                        const baseStroke = '#0f172a'; // Uniform thin black/slate border
                        const baseText = boothTypeConfig.text;

                        const dimmed = isDimmed(stand);
                        const isDrawerSelected = selectedStand?.id === stand.id;
                        const isMultiSelected = selectedStands.has(stand.id);
                        const isHovered = hovered?.id === stand.id;
                        const isInteractive = zoom >= 1.25;

                        return (
                          <g
                            key={stand.id}
                            className={isInteractive ? 'cursor-pointer transition-all' : 'pointer-events-none select-none'}
                            opacity={dimmed ? 0.2 : 1}
                            onMouseEnter={isInteractive ? () => setHovered(stand) : undefined}
                            onMouseLeave={isInteractive ? () => setHovered(null) : undefined}
                            onClick={isInteractive ? (e) => handleStandClick(stand, e) : undefined}
                          >
                            {/* Stand base rect with uniform thin black border */}
                            <rect
                              x={stand.x}
                              y={stand.y}
                              width={stand.w}
                              height={stand.h}
                              fill={isDrawerSelected ? '#e9b43e' : isMultiSelected ? '#fef3c7' : baseFill}
                              stroke={isDrawerSelected ? '#bc7d23' : isMultiSelected ? '#f59e0b' : baseStroke}
                              strokeWidth={isDrawerSelected || isMultiSelected ? 1.8 / zoom : 0.6 / zoom}
                              rx={0}
                              className="transition-all"
                              style={isHovered && !isDrawerSelected ? { filter: 'brightness(0.92)' } : undefined}
                            />

                            {/* Multi-selection checkmark overlay */}
                            {isMultiSelected && (
                              <g transform={`translate(${stand.x + stand.w / 2}, ${stand.y + stand.h / 2}) scale(${1 / zoom})`} className="pointer-events-none">
                                <circle r="6" fill="#f59e0b" />
                                <path
                                  d="M -3 0 L -1 2 L 3 -2"
                                  stroke="#ffffff"
                                  strokeWidth="1.8"
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </g>
                            )}

                            {/* Stand label text */}
                            {!isMultiSelected && (
                              <>
                                {(selectedBlock || zoom >= 1.25 || isDrawerSelected || isHovered) ? (
                                  <g className="pointer-events-none select-none">
                                    {boothTypeConfig.label && (
                                      <text
                                        x={stand.x + stand.w / 2}
                                        y={stand.y + (stand.status === 'outdoor' ? 40 : 14)}
                                        textAnchor="middle"
                                        fontSize={stand.status === 'outdoor' ? 12.5 : (selectedBlock ? 9.5 : 8)}
                                        fontWeight="900"
                                        fill={boothTypeConfig.text}
                                        className="pointer-events-none tracking-tight font-mono select-none"
                                      >
                                        {boothTypeConfig.label}
                                      </text>
                                    )}
                                    <text
                                      x={stand.x + stand.w / 2}
                                      y={stand.y + (boothTypeConfig.label ? (selectedBlock ? 28 : 26) : stand.h / 2 + 3)}
                                      textAnchor="middle"
                                      fontSize={stand.status === 'outdoor' ? 12.5 : (selectedBlock ? 9 : 7)}
                                      fontWeight="900"
                                      fill={isDrawerSelected ? '#1a1d23' : baseText}
                                      className="pointer-events-none tracking-tight font-mono select-none"
                                    >
                                      {stand.label}
                                    </text>
                                  </g>
                                ) : (
                                  <text
                                    x={stand.x + stand.w / 2}
                                    y={stand.y + stand.h / 2 + 4}
                                    textAnchor="middle"
                                    fontSize={stand.status === 'outdoor' ? 15 : 12}
                                    fontWeight="900"
                                    fill={baseText}
                                    className="pointer-events-none tracking-tight font-mono select-none"
                                  >
                                    {stand.status === 'outdoor' ? stand.label : boothTypeConfig.label}
                                  </text>
                                )}
                              </>
                            )}
                          </g>
                        );
                      })
                    )}

                    {/* Block codes (A1, B2) & Industry Zone Titles centered in the aisle above each block */}
                    {!selectedBlock && (
                      Array.from({ length: 6 }).map((_, blockRow) =>
                        Array.from({ length: 4 }).map((_, blockColumn) => {
                          const zoneName = ZONE_MAP[blockRow][blockColumn];
                          const blockX = 40 + blockColumn * 340;
                          const blockY = 40 + blockRow * 120;
                          const zoneTitleY = 20 + blockRow * 120;
                          const blockLetter = ['A', 'B', 'C', 'D'][blockColumn];
                          const blockNum = blockRow + 1;
                          return (
                            <g key={`block-header-${blockRow}-${blockColumn}`} className="pointer-events-none select-none">
                              {/* Industry Zone title centered in the aisle space above each block */}
                              <text
                                x={blockX + 150}
                                y={zoneTitleY}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize={9.5 / zoom}
                                fontWeight="900"
                                fill="#0f172a"
                                className="uppercase tracking-wider pointer-events-none select-none font-sans"
                              >
                                {zoneName}
                              </text>

                              {/* Prominent, bold Block code watermark (A1, B2, etc.) */}
                              <text
                                x={blockX + 150}
                                y={blockY + 44}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize={36 / zoom}
                                fontWeight="900"
                                fill="#0f172a"
                                opacity={0.6}
                                className="font-display uppercase pointer-events-none select-none"
                              >
                                {blockLetter}{blockNum}
                              </text>
                            </g>
                          );
                        })
                      )
                    )}

                    {/* Facility cutouts */}
                    {FACILITY_ZONES.map((facility) => {
                      if (selectedBlock) {
                        const blockX = 40 + selectedBlock.col * 340;
                        const blockY = 40 + selectedBlock.row * 120;
                        const minX = blockX;
                        const maxX = blockX + 300;
                        const minY = blockY;
                        const maxY = blockY + 80;
                        if (facility.x < minX || facility.x >= maxX || facility.y < minY || facility.y >= maxY) {
                          return null;
                        }
                      }

                      const isRestroom = facility.label.toLowerCase().includes('restroom');
                      const isATM = facility.label.includes('ATM');
                      const isPolice = facility.label.toLowerCase().includes('police');
                      const isManagement = facility.label.toLowerCase().includes('management');

                      const cx = facility.x + facility.w / 2;
                      const cy = facility.y + 13;
                      const lines = facility.label.split(/\n|\\n/);

                      return (
                        <g key={`facility-${facility.x}-${facility.y}`} className="pointer-events-none select-none">
                          {/* Base booth rect perfectly aligned with stand grid */}
                          <rect
                            x={facility.x}
                            y={facility.y}
                            width={facility.w}
                            height={facility.h}
                            fill="#f8fafc"
                            stroke="#0f172a"
                            strokeWidth={0.6 / zoom}
                            rx={0}
                          />

                          {/* Restroom Icon */}
                          {isRestroom && (
                            <g transform={`translate(${cx}, ${cy})`}>
                              {/* Male Icon */}
                              <circle cx="-5" cy="-4" r="1.8" fill="#1e293b" />
                              <path d="M-7,-1 H-3 V4 H-4 V7 H-5 V4 H-6 V7 H-7 Z" fill="#1e293b" />
                              {/* Divider */}
                              <line x1="0" y1="-5" x2="0" y2="7" stroke="#cbd5e1" strokeWidth="0.8" />
                              {/* Female Icon */}
                              <circle cx="5" cy="-4" r="1.8" fill="#1e293b" />
                              <path d="M3,-1 H7 L8 4 H6 V7 H4 V4 H2 Z" fill="#1e293b" />
                            </g>
                          )}

                          {/* Office Management Icon */}
                          {isManagement && (
                            <g transform={`translate(${cx}, ${cy})`}>
                              <rect x="-7" y="-3" width="14" height="10" rx="1.5" stroke="#1e293b" strokeWidth="1.2" fill="#e2e8f0" />
                              <path d="M-3,-3 V-5 C-3,-5.5 -2.2,-6 -1.4,-6 H1.4 C2.2,-6 3,-5.5 3,-5 V-3" stroke="#1e293b" strokeWidth="1.2" fill="none" />
                              <line x1="-7" y1="1" x2="7" y2="1" stroke="#1e293b" strokeWidth="1" />
                              <rect x="-1.5" y="0" width="3" height="2" fill="#1e293b" />
                            </g>
                          )}

                          {/* ATM Icon */}
                          {isATM && (
                            <g transform={`translate(${cx}, ${cy})`}>
                              <rect x="-8" y="-6" width="16" height="12" rx="1.5" fill="#1e293b" />
                              <rect x="-6" y="-4" width="12" height="4" fill="#94a3b8" />
                              <text textAnchor="middle" dominantBaseline="middle" fontSize="6" fontWeight="900" fill="#ffffff" y="3.5" fontFamily="sans-serif">$</text>
                            </g>
                          )}

                          {/* Office Police Icon */}
                          {isPolice && (
                            <g transform={`translate(${cx}, ${cy})`}>
                              <path d="M 0,-7 L 6,-4 V 0 C 6,4 0,7 0,7 C 0,7 -6,4 -6,0 V -4 Z" fill="#2563eb" stroke="#1e293b" strokeWidth="1" />
                              <path d="M 0,-4 L 1.5,-1 H 4.5 L 2,1 L 3,4 L 0,2.2 L -3,4 L -2,1 L -4.5,-1 H -1.5 Z" fill="#ffffff" />
                            </g>
                          )}

                          {/* Prominent, non-overlapping label text */}
                          {lines.map((line, index) => {
                            const isMultiLine = lines.length > 1;
                            const textY = isMultiLine
                              ? (index === 0 ? facility.y + 25 : facility.y + 33.5)
                              : facility.y + 29;
                            const fontSize = isMultiLine
                              ? (facility.w <= 30 ? 5.2 : 6)
                              : 6.8;

                            return (
                              <text
                                key={`${line}-${index}`}
                                x={cx}
                                y={textY}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize={fontSize}
                                fill="#0f172a"
                                fontWeight="900"
                                className="uppercase tracking-tight font-sans"
                              >
                                {line}
                              </text>
                            );
                          })}
                        </g>
                      );
                    })}
                  </g>
                </g>
              </svg>

              {/* Fixed Outer Rulers SVG Overlay (Never scales or shifts) */}
              <svg
                viewBox={`${VIEWBOX_X} ${VIEWBOX_Y} ${VIEWBOX_W} ${VIEWBOX_H}`}
                className="absolute inset-0 w-full h-full pointer-events-none z-20"
                preserveAspectRatio="xMidYMid meet"
              >
                {/* Hall outline with 4 Entrance cutouts — 40px (4m) uniform clearance on all 4 sides & corners */}
                {!selectedBlock && (
                  <g fill="none">
                    {/* Outer Wall Boundary Lines (Solid Slate) */}
                    <g stroke="#aeb6c4" strokeWidth="3">
                      {/* Top wall: y=0, gap between x=630 and x=770 */}
                      <line x1="0" y1="0" x2="630" y2="0" />
                      <line x1="770" y1="0" x2="1400" y2="0" />
                      
                      {/* Bottom wall: y=760, gap between x=630 and x=770 */}
                      <line x1="0" y1="760" x2="630" y2="760" />
                      <line x1="770" y1="760" x2="1400" y2="760" />

                      {/* Left wall: x=0, gap between y=310 and y=450 */}
                      <line x1="0" y1="0" x2="0" y2="310" />
                      <line x1="0" y1="450" x2="0" y2="760" />

                      {/* Right wall: x=1400, gap between y=310 and y=450 */}
                      <line x1="1400" y1="0" x2="1400" y2="310" />
                      <line x1="1400" y1="450" x2="1400" y2="760" />
                    </g>

                    {/* Internal 4m Clearance Boundary (Dashed Guide) */}
                    <g stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="3 3">
                      <line x1="40" y1="40" x2="1360" y2="40" />
                      <line x1="40" y1="720" x2="1360" y2="720" />
                      <line x1="40" y1="40" x2="40" y2="720" />
                      <line x1="1360" y1="40" x2="1360" y2="720" />
                    </g>
                  </g>
                )}

                {/* Top dimensions — Generous vertical spacing above top hall wall */}
                {!selectedBlock && (
                  <>
                    <line x1="0" y1="-70" x2="1400" y2="-70" stroke="#000000ff" strokeWidth="1" />
                    <path d="M 0 0 L 6 -3 L 6 3 Z" fill="#000000ff" transform="translate(0, -70)" />
                    <path d="M 0 0 L -6 -3 L -6 3 Z" fill="#000000ff" transform="translate(1400, -70)" />
                    <text x={700} y="-76" textAnchor="middle" fontSize="15" fill="#0f0f0fff" fontWeight="900">Overall Hall Width (140m)</text>
                    
                    <line x1="40" y1="-40" x2="1360" y2="-40" stroke="#000000ff" strokeWidth="1" />
                    <path d="M 0 0 L 5 -2 L 5 2 Z" fill="#000000ff" transform="translate(40, -40)" />
                    <path d="M 0 0 L -5 -2 L -5 2 Z" fill="#000000ff" transform="translate(1360, -40)" />
                    <text x={700} y="-45" textAnchor="middle" fontSize="13" fill="#000000ff" fontWeight="600">Internal Boundary Width (130m)</text>
                  </>
                )}

                {/* Side dimensions */}
                {!selectedBlock && (
                  <>
                    <line x1="-40" y1="0" x2="-40" y2="760" stroke="#000000ff" strokeWidth="1" />
                    <path d="M 0 0 L -3 6 L 3 6 Z" fill="#000000ff" transform="translate(-40, 0)" />
                    <path d="M 0 0 L -3 -6 L 3 -6 Z" fill="#000000ff" transform="translate(-40, 760)" />
                    <text x="-48" y="380" textAnchor="middle" fontSize="15" fill="#000000ff" fontWeight="900" transform="rotate(-90 -48 380)">Overall Hall Length (76m)</text>
                    
                    <line x1="1440" y1="40" x2="1440" y2="720" stroke="#000000ff" strokeWidth="1" />
                    <path d="M 0 0 L -3 6 L 3 6 Z" fill="#000000ff" transform="translate(1440, 40)" />
                    <path d="M 0 0 L -3 -6 L 3 -6 Z" fill="#000000ff" transform="translate(1440, 720)" />
                    <text x="1448" y="380" textAnchor="middle" fontSize="15" fill="#000000ff" fontWeight="600" transform="rotate(90 1448 380)">Internal Boundary Length (68m)</text>
                  </>
                )}

                {/* Block dimension annotations — Generous spacing below bottom hall wall */}
                {!selectedBlock && [40, 380, 720, 1060].map((x) => (
                  <g key={`bw-annot-${x}`}>
                    <line x1={x} y1="795" x2={x + 300} y2="795" stroke="#000000ff" strokeWidth={1} />
                    <text x={x + 150} y={807} textAnchor="middle" fontSize="10" fill="#000000ff" fontWeight="600">30,000 mm (30m) Block Width</text>
                  </g>
                ))}

                {/* 4m Corner Clearance Labels */}
                {!selectedBlock && (
                  <g id="perimeter-clearance-labels">
                    {/* Corner 4m dimension tick guides */}
                    <g stroke="#94a3b8" strokeWidth="0.8" opacity="0.8">
                      {/* Top-Left corner guide */}
                      <line x1="0" y1="40" x2="40" y2="40" strokeDasharray="2 2" />
                      <line x1="40" y1="0" x2="40" y2="40" strokeDasharray="2 2" />

                      {/* Top-Right corner guide */}
                      <line x1="1360" y1="40" x2="1400" y2="40" strokeDasharray="2 2" />
                      <line x1="1360" y1="0" x2="1360" y2="40" strokeDasharray="2 2" />

                      {/* Bottom-Left corner guide */}
                      <line x1="0" y1="720" x2="40" y2="720" strokeDasharray="2 2" />
                      <line x1="40" y1="720" x2="40" y2="760" strokeDasharray="2 2" />

                      {/* Bottom-Right corner guide */}
                      <line x1="1360" y1="720" x2="1400" y2="720" strokeDasharray="2 2" />
                      <line x1="1360" y1="720" x2="1360" y2="760" strokeDasharray="2 2" />
                    </g>

                    {/* Bold, clean 4m labels centered in each corner matching aisle label styling */}
                    <text x="20" y="24" textAnchor="middle" fontSize="10.5" fill="#334155" fontWeight="800" className="font-sans uppercase">4m</text>
                    <text x="1380" y="24" textAnchor="middle" fontSize="10.5" fill="#334155" fontWeight="800" className="font-sans uppercase">4m</text>
                    <text x="20" y="744" textAnchor="middle" fontSize="10.5" fill="#334155" fontWeight="800" className="font-sans uppercase">4m</text>
                    <text x="1380" y="744" textAnchor="middle" fontSize="10.5" fill="#334155" fontWeight="800" className="font-sans uppercase">4m</text>
                  </g>
                )}

                {/* 4 Center Entrances (North, South, West, East) */}
                {!selectedBlock && (
                  <g id="entrances">
                    {/* Top Main Entrance (North) */}
                    <g transform="translate(700, 0)">
                      <rect x="-65" y="-11" width="130" height="22" fill="#ffffff" stroke="#ef4444" strokeWidth="1.5" rx="5" />
                      <text x="0" y="4" textAnchor="middle" fontSize="9" fill="#dc2626" fontWeight="900" className="tracking-wider font-sans">MAIN ENTRANCE</text>
                      <polygon points="0,17 -7,11 7,11" fill="#ef4444" />
                    </g>

                    {/* Bottom Entrance (South) */}
                    <g transform="translate(700, 760)">
                      <rect x="-65" y="-11" width="130" height="22" fill="#ffffff" stroke="#ef4444" strokeWidth="1.5" rx="5" />
                      <text x="0" y="4" textAnchor="middle" fontSize="9" fill="#dc2626" fontWeight="900" className="tracking-wider font-sans">SOUTH ENTRANCE</text>
                      <polygon points="0,-17 -7,-11 7,-11" fill="#ef4444" />
                    </g>

                    {/* Left Entrance (West) */}
                    <g transform="translate(0, 380)">
                      <rect x="-65" y="-11" width="130" height="22" fill="#ffffff" stroke="#ef4444" strokeWidth="1.5" rx="5" transform="rotate(-90)" />
                      <text x="0" y="4" textAnchor="middle" fontSize="9" fill="#dc2626" fontWeight="900" transform="rotate(-90)" className="tracking-wider font-sans">WEST ENTRANCE</text>
                      <polygon points="17,0 11,-7 11,7" fill="#ef4444" />
                    </g>

                    {/* Right Entrance (East) */}
                    <g transform="translate(1400, 380)">
                      <rect x="-65" y="-11" width="130" height="22" fill="#ffffff" stroke="#ef4444" strokeWidth="1.5" rx="5" transform="rotate(90)" />
                      <text x="0" y="4" textAnchor="middle" fontSize="9" fill="#dc2626" fontWeight="900" transform="rotate(90)" className="tracking-wider font-sans">EAST ENTRANCE</text>
                      <polygon points="-17,0 -11,-7 -11,7" fill="#ef4444" />
                    </g>
                  </g>
                )}

                {/* Outdoor Zone header — Clean spacing below 30m block width annotations */}
                {!selectedBlock && (
                  <>
                    <line x1="0" y1="840" x2="1400" y2="840" stroke="#94a3b8" strokeWidth="2" strokeDasharray="6 6" />
                    <rect x={700 - 180} y="826" width="360" height="28" fill="#f1f5f9" rx="14" stroke="#64748b" strokeWidth="1.5" />
                    <text x={700} y="844" textAnchor="middle" fontSize="12" fill="#0f172a" fontWeight="900" className="tracking-widest uppercase font-sans">
                      OUTDOOR HEAVY EQUIPMENT ZONE
                    </text>
                  </>
                )}
              </svg>

              {/* Top Header Bar Overlay for Block View */}
              {selectedBlock && (
                <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-auto">
                  {/* Left: Block ID & Zone Title Badge */}
                  <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl px-3.5 py-2 shadow-premium-lg flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400 font-mono font-black text-sm">
                      {['A', 'B', 'C', 'D'][selectedBlock.col]}{selectedBlock.row + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-white">
                          Block {['A', 'B', 'C', 'D'][selectedBlock.col]}{selectedBlock.row + 1}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          ({getBlockStats(selectedBlock.row, selectedBlock.col).avail} Available)
                        </span>
                      </div>
                      <div className="text-xs text-gold-400/90 font-medium">
                        {ZONE_MAP[selectedBlock.row][selectedBlock.col]}
                      </div>
                    </div>
                  </div>

                  {/* Center Top: Navigate Up Button */}
                  {selectedBlock.row > 0 && (
                    <button
                      onClick={(e) => handleBlockClick(selectedBlock.row - 1, selectedBlock.col, e)}
                      className="bg-slate-900/95 hover:bg-slate-900 text-white backdrop-blur-md px-4 py-2 rounded-full text-xs font-extrabold border border-slate-700/80 shadow-premium-lg flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
                      title={`Navigate Up to Block ${['A', 'B', 'C', 'D'][selectedBlock.col]}${selectedBlock.row}`}
                    >
                      <ChevronUp size={16} className="text-gold-400" />
                      <span>Block {['A', 'B', 'C', 'D'][selectedBlock.col]}{selectedBlock.row}</span>
                    </button>
                  )}

                  {/* Right: Back to Overview Action Button */}
                  <button
                    onClick={handleReset}
                    className="bg-white/95 hover:bg-slate-900 hover:text-white backdrop-blur-md px-4 py-2 rounded-xl text-xs font-extrabold text-slate-800 border border-slate-200 shadow-premium-lg transition-all cursor-pointer flex items-center gap-2"
                  >
                    <RotateCcw size={14} className="text-gold-500" />
                    <span>Back to Overview</span>
                  </button>
                </div>
              )}

              {/* Bottom Directional Navigation Button */}
              {selectedBlock && selectedBlock.row < 5 && (
                <button
                  onClick={(e) => handleBlockClick(selectedBlock.row + 1, selectedBlock.col, e)}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 bg-slate-900/95 hover:bg-slate-900 text-white backdrop-blur-md px-4 py-2 rounded-full text-xs font-extrabold border border-slate-700/80 shadow-premium-lg flex items-center gap-2 cursor-pointer transition-all hover:scale-105 pointer-events-auto"
                  title={`Navigate Down to Block ${['A', 'B', 'C', 'D'][selectedBlock.col]}${selectedBlock.row + 2}`}
                >
                  <span>Block {['A', 'B', 'C', 'D'][selectedBlock.col]}{selectedBlock.row + 2}</span>
                  <ChevronDown size={16} className="text-gold-400" />
                </button>
              )}

              {/* Left Directional Navigation Button */}
              {selectedBlock && selectedBlock.col > 0 && (
                <button
                  onClick={(e) => handleBlockClick(selectedBlock.row, selectedBlock.col - 1, e)}
                  className="absolute top-1/2 left-3 -translate-y-1/2 z-30 bg-slate-900/95 hover:bg-slate-900 text-white backdrop-blur-md px-3 py-4 rounded-2xl text-xs font-extrabold border border-slate-700/80 shadow-premium-lg flex flex-col items-center gap-1.5 cursor-pointer transition-all hover:scale-105 pointer-events-auto"
                  title={`Navigate Left to Block ${['A', 'B', 'C', 'D'][selectedBlock.col - 1]}${selectedBlock.row + 1}`}
                >
                  <ChevronLeft size={18} className="text-gold-400" />
                  <span className="text-[11px] font-black">{['A', 'B', 'C', 'D'][selectedBlock.col - 1]}{selectedBlock.row + 1}</span>
                </button>
              )}

              {/* Right Directional Navigation Button */}
              {selectedBlock && selectedBlock.col < 3 && (
                <button
                  onClick={(e) => handleBlockClick(selectedBlock.row, selectedBlock.col + 1, e)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 z-30 bg-slate-900/95 hover:bg-slate-900 text-white backdrop-blur-md px-3 py-4 rounded-2xl text-xs font-extrabold border border-slate-700/80 shadow-premium-lg flex flex-col items-center gap-1.5 cursor-pointer transition-all hover:scale-105 pointer-events-auto"
                  title={`Navigate Right to Block ${['A', 'B', 'C', 'D'][selectedBlock.col + 1]}${selectedBlock.row + 1}`}
                >
                  <ChevronRight size={18} className="text-gold-400" />
                  <span className="text-[11px] font-black">{['A', 'B', 'C', 'D'][selectedBlock.col + 1]}{selectedBlock.row + 1}</span>
                </button>
              )}

              {/* Block Hover Stats Card (Overview mode) */}
              {hoveredBlock && !selectedBlock && (
                <div
                  className="absolute pointer-events-none z-30 bg-slate-900/95 backdrop-blur-sm text-white px-3.5 py-2.5 rounded-xl shadow-premium-xl text-xs flex flex-col gap-1 border border-slate-700"
                  style={{
                    left: Math.min(mousePos.x + 16, (containerRef.current?.clientWidth ?? 800) - 180),
                    top: Math.max(16, mousePos.y - 30),
                  }}
                >
                  <div className="font-extrabold text-gold-400 flex items-center justify-between gap-4">
                    <span>Block {['A', 'B', 'C', 'D'][hoveredBlock.col]}{hoveredBlock.row + 1}</span>
                    <span className="text-[10px] font-semibold text-slate-300">Click to Zoom</span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-semibold truncate max-w-[160px]">
                    {ZONE_MAP[hoveredBlock.row][hoveredBlock.col]}
                  </div>
                  <div className="flex items-center gap-3 pt-1 border-t border-slate-800 text-[10px]">
                    <span className="text-emerald-400 font-bold">
                      {getBlockStats(hoveredBlock.row, hoveredBlock.col).avail} Available
                    </span>
                    <span className="text-amber-400 font-bold">
                      {getBlockStats(hoveredBlock.row, hoveredBlock.col).res} Reserved
                    </span>
                  </div>
                </div>
              )}

              {/* Rich Stand Hover Tooltip Card (Block view mode) */}
              {hovered && !selected && (
                <div
                  className="absolute pointer-events-none z-40 bg-white/95 backdrop-blur-md border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl shadow-premium-xl text-xs min-w-[180px]"
                  style={{
                    left: Math.min(mousePos.x + 16, (containerRef.current?.clientWidth ?? 800) - 200),
                    top: Math.max(16, mousePos.y - 40),
                  }}
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-1.5">
                    <span className="font-mono font-black text-sm text-slate-900">{hovered.label}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${STATUS_COLORS[hovered.status].bg} text-slate-800 border`} style={{ borderColor: STATUS_COLORS[hovered.status].stroke }}>
                      {STATUS_LABELS[hovered.status]}
                    </span>
                  </div>
                  <div className="space-y-0.5 text-[11px] font-semibold text-slate-600">
                    <div>Area: <span className="font-extrabold text-slate-900">{hovered.area} m²</span></div>
                    <div>Type: <span className="font-extrabold text-slate-900">{hovered.type}</span></div>
                    <div>Price: <span className="font-extrabold text-gold-600">{hovered.price}</span></div>
                    {hovered.company && <div className="text-emerald-600 italic">Exhibitor: {hovered.company}</div>}
                  </div>
                </div>
              )}

              {/* Selection Basket Floating Tray Component */}
              <FloorPlanBasket
                selectedStands={selectedStandsList}
                onRemoveStand={(id) => {
                  setSelectedStands((prev) => {
                    const next = new Set(prev);
                    next.delete(id);
                    return next;
                  });
                }}
                onClearAll={() => setSelectedStands(new Set())}
                onEnquire={() => {
                  const totalArea = selectedStandsList.reduce((acc, s) => acc + s.area, 0);
                  const pkgName = selectedStandsList.length === 1 ? selectedStandsList[0].type : `${selectedStandsList[0].type} (Multiple)`;
                  const initiateEvent = new CustomEvent('initiate-booking', {
                    detail: {
                      step: 0, // Always start at Step 1 (Company Information) step 0
                      package: pkgName,
                      stands: selectedStandsList.map(s => ({
                        id: s.id,
                        block: s.block,
                        price: s.price
                      })),
                      area: `${totalArea} m²`
                    }
                  });
                }}
              />
            </div>

          {/* Industry Zone Colors Grid Legend below the floor plan canvas */}
          <div className="mt-8 border-t border-slate-200 pt-6">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Industry Zones & Color Codes</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 bg-slate-50/50 p-4 border border-slate-150 rounded">
              {Object.entries(ZONE_TINTS).map(([name, tint]) => (
                <div key={name} className="flex items-center gap-2.5 text-xs text-slate-600 font-medium">
                  <span className="w-4 h-4 rounded-sm border border-slate-200 shadow-sm flex-shrink-0" style={{ backgroundColor: tint.fill, borderColor: tint.stroke }} />
                  <span className="truncate">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      {/* Enquiry Form Modal Component */}
      <FloorPlanEnquiry
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        selectedStands={selectedStandsList}
        onSuccess={() => {
          setIsEnquiryOpen(false);
          setSelectedStands(new Set());
        }}
      />

      {/* FIXED PORTAL OVERLAYS - Positioned relative to viewport */}
      <div 
        className={`fixed inset-0 bg-ink-950/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${selectedStand ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
        onClick={() => setSelected(null)}
      />
      
      {/* Read-Only Stand Details Drawer for Reserved / Confirmed stands */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-premium-2xl transform transition-transform duration-300 ease-in-out flex flex-col border-l border-slate-200 ${
          selectedStand ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 md:p-8 border-b border-slate-100 bg-white">
          <div>
            <span className="text-xs font-extrabold tracking-widest uppercase text-gold-600">Stand Detail</span>
            <h3 className="mt-1 font-display text-3xl font-black text-slate-900">{selectedStand?.label}</h3>
          </div>
          <button onClick={() => setSelected(null)} className="p-2 text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-full transition-all" aria-label="Close detail">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 [&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:none]">
          {selectedStand && (
            <div className="space-y-6">
              <div className="space-y-4">
                {selectedStand.company && (
                  <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                    <div className="w-11 h-11 bg-slate-50 rounded-md flex items-center justify-center border border-slate-200/60 shadow-sm flex-shrink-0">
                      <Building size={18} className="text-slate-600" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Exhibitor</div>
                      <div className="font-extrabold text-slate-900 text-base">{selectedStand.company}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                  <div className="w-11 h-11 bg-slate-50 rounded-md flex items-center justify-center border border-slate-200/60 shadow-sm flex-shrink-0">
                    <Maximize2 size={18} className="text-slate-600" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Area / Dimensions</div>
                    <div className="font-extrabold text-slate-900 text-base">{selectedStand.area} m² <span className="text-xs font-medium text-slate-400">(3m × 4m)</span></div>
                  </div>
                </div>

                <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                  <div className="w-11 h-11 bg-slate-50 rounded-md flex items-center justify-center border border-slate-200/60 shadow-sm flex-shrink-0">
                    <Tag size={18} className="text-slate-600" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Stand Type</div>
                    <div className="font-extrabold text-slate-900 text-base">{selectedStand.type}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                  <div className="w-11 h-11 bg-slate-50 rounded-md flex items-center justify-center border border-slate-200/60 shadow-sm flex-shrink-0">
                    <DollarSign size={18} className="text-slate-600" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Price (Excl. VAT)</div>
                    <div className="font-extrabold text-slate-900 text-base">{selectedStand.price}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                  <div className="w-11 h-11 bg-slate-50 rounded-md flex items-center justify-center border border-slate-200/60 shadow-sm flex-shrink-0">
                    <MapPin size={18} className="text-slate-600" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Status</div>
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${STATUS_COLORS[selectedStand.status].dot}`} />
                      <span className="font-extrabold text-slate-900 text-base">{STATUS_LABELS[selectedStand.status]}</span>
                    </div>
                  </div>
                </div>

                {selectedStand.industry && (
                  <div className="pb-2">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Industry Sector Zone</div>
                    <div className="font-extrabold text-slate-700 text-sm">{selectedStand.industry}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sticky Footer CTA */}
        {selectedStand && (
          <div className="p-6 md:p-8 border-t border-slate-100 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
            {(selectedStand.status === 'available' || selectedStand.status === 'premium' || selectedStand.status === 'outdoor') && (
              <button
                onClick={() => {
                  setSelectedStands((prev) => new Set(prev).add(selectedStand.id));
                  setSelected(null);
                }}
                className="btn-primary w-full py-4 text-sm font-extrabold tracking-wider uppercase flex items-center justify-center gap-2"
              >
                Add to Selection Basket
                <ArrowRight size={16} />
              </button>
            )}
            {(selectedStand.status === 'reserved' || selectedStand.status === 'confirmed') && (
              <button disabled className="w-full py-4 bg-slate-100 text-slate-400 font-bold text-xs tracking-wider uppercase rounded border border-slate-200 cursor-not-allowed flex items-center justify-center gap-2">
                Already Reserved
              </button>
            )}
            {selectedStand.status === 'sponsor' && (
              <button disabled className="w-full py-4 bg-purple-50 text-purple-400 font-bold text-xs tracking-wider uppercase rounded border border-purple-100 cursor-not-allowed flex items-center justify-center gap-2">
                Sponsor / Pavilion
              </button>
            )}
          </div>
        )}
      </div>

      {/* Centered Stand Unit Specs Card (Pops up when a stand is tapped) */}
      {selectedStand && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4"
        >
          <div 
            className="bg-white border border-slate-200/90 rounded-2xl shadow-premium-2xl p-6 w-[360px] md:w-[440px] animate-fade-in pointer-events-auto transform transition-all translate-y-0 md:-translate-x-16"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-[10px] font-extrabold tracking-widest uppercase text-gold-600">Unit Blueprint</span>
                <h4 className="font-display font-black text-slate-900 text-xl">{selectedStand.label} Architectural Specs</h4>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-900 transition-colors p-1.5 rounded-full hover:bg-slate-100" aria-label="Close layout">
                <X size={18} />
              </button>
            </div>
            
            <div className="bg-slate-50 border border-slate-150 rounded-xl p-6 flex justify-center items-center my-4 relative overflow-hidden">
              <svg width="220" height="270" viewBox="0 0 140 180" className="overflow-visible">
                {/* Unit outline - 100 width x 140 height (3m x 4m scale) */}
                <path d="M 20 150 L 20 20 L 120 20 L 120 150" fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="square" />
                
                {/* Entrance outline at bottom */}
                <line x1="20" y1="150" x2="120" y2="150" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="3 3" />
                
                {/* 4 Corner Pillars */}
                <rect x="17" y="17" width="6" height="6" fill="#1e293b" rx="0.5" />
                <rect x="117" y="17" width="6" height="6" fill="#1e293b" rx="0.5" />
                <rect x="17" y="147" width="6" height="6" fill="#1e293b" rx="0.5" />
                <rect x="117" y="147" width="6" height="6" fill="#1e293b" rx="0.5" />
                
                {/* Fascia Board / Signage Zone */}
                <rect x="23" y="23" width="94" height="12" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" rx="1" />
                <text x="70" y="31" fontSize="7.5" fontWeight="800" fill="#64748b" textAnchor="middle" className="tracking-widest">FASCIA BOARD</text>
                
                {/* Width dimension label (3m) */}
                <g transform="translate(0, 163)">
                  <line x1="20" y1="0" x2="120" y2="0" stroke="#64748b" strokeWidth="0.8" />
                  <path d="M 20 0 L 25 -2 L 25 2 Z M 120 0 L 115 -2 L 115 2 Z" fill="#64748b" />
                  <text x="70" y="-4" fontSize="9" fontWeight="800" fill="#475569" textAnchor="middle">3m Width</text>
                </g>
                
                {/* Depth dimension label (4m) */}
                <g transform="translate(132, 0)">
                  <line x1="0" y1="20" x2="0" y2="150" stroke="#64748b" strokeWidth="0.8" />
                  <path d="M 0 20 L -2 25 L 2 25 Z M 0 150 L -2 145 L 2 145 Z" fill="#64748b" />
                  <text x="4" y="85" fontSize="9" fontWeight="800" fill="#475569" textAnchor="middle" transform="rotate(90 4 85)">4m Depth</text>
                </g>
                
                {/* Central stand code label */}
                <text x="70" y="82" fontSize="18" fontWeight="900" fill="#0f172a" textAnchor="middle">{selectedStand.label}</text>
                <text x="70" y="97" fontSize="9" fontWeight="700" fill="#64748b" textAnchor="middle">{selectedStand.area} m² Area</text>
                
                {/* Entrance Label */}
                <text x="70" y="142" fontSize="8" fontWeight="800" fill="#94a3b8" textAnchor="middle" className="uppercase tracking-wider">ENTRANCE</text>
              </svg>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold pt-1 border-t border-slate-100">
              <span>Standard Shell Scheme Specs</span>
              <span className="text-gold-600 font-bold">{selectedStand.price}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
