import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search, ZoomIn, ZoomOut, RotateCcw, Download, X, MapPin, Maximize2, DollarSign, Tag, ArrowRight, Building, Map, Check, ChevronUp, ChevronDown, ChevronLeft, ChevronRight
} from 'lucide-react';
import { STATUS_LABELS, STATUS_COLORS, type Stand, type StandStatus, STANDS, ZONE_MAP, ZONE_TINTS } from '@/data/stands';
import { INDUSTRIES } from '@/data/content';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { supabase } from '@/lib/supabase';
import { FloorPlanBasket } from './FloorPlanBasket';
import { FloorPlanEnquiry } from './FloorPlanEnquiry';

const VIEWBOX_W = 1440;
const VIEWBOX_H = 1120; // Expanded to accommodate the Outdoor strip

const FACILITY_ZONES = [
  { x: 60, y: 82, w: 30, h: 40, label: 'restroom' },
  { x: 670, y: 82, w: 30, h: 80, label: 'office\nmanagement' },
  { x: 1350, y: 82, w: 30, h: 40, label: 'restroom' },
  { x: 670, y: 322, w: 30, h: 40, label: 'ATM' },
  { x: 60, y: 682, w: 30, h: 40, label: 'restroom' },
  { x: 670, y: 682, w: 30, h: 80, label: 'office\npolice' },
  { x: 1350, y: 682, w: 30, h: 40, label: 'restroom' },
];

const AISLE_LABELS = [
  { x: 380, y: 122, label: '4m' },
  { x: 720, y: 122, label: '4m' },
  { x: 1060, y: 122, label: '4m' },
  { x: 380, y: 242, label: '4m' },
  { x: 720, y: 242, label: '4m' },
  { x: 1060, y: 242, label: '4m' },
  { x: 380, y: 362, label: '4m' },
  { x: 720, y: 362, label: '4m' },
  { x: 1060, y: 362, label: '4m' },
  { x: 380, y: 482, label: '4m' },
  { x: 720, y: 482, label: '4m' },
  { x: 1060, y: 482, label: '4m' },
  { x: 380, y: 602, label: '4m' },
  { x: 720, y: 602, label: '4m' },
  { x: 1060, y: 602, label: '4m' },
  { x: 380, y: 722, label: '4m' },
  { x: 720, y: 722, label: '4m' },
  { x: 1060, y: 722, label: '4m' },
];

export function FloorPlan() {
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: VIEWBOX_W, h: VIEWBOX_H });
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

  const targetViewBox = useRef({ x: 0, y: 0, w: VIEWBOX_W, h: VIEWBOX_H });
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
    animateToViewBox({ x: 0, y: 0, w: VIEWBOX_W, h: VIEWBOX_H });
  };

  const handleBlockClick = (blockRow: number, blockColumn: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const blockX = 60 + blockColumn * 340;
    const blockY = 82 + blockRow * 120;
    
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
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-6 bg-slate-50 border border-slate-200/60 rounded px-4 py-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Availability Status:</span>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {(Object.keys(STATUS_LABELS) as StandStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(statusFilter === s ? null : s)}
                  className={`flex items-center gap-2.5 text-xs font-semibold transition-all ${
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

          {/* Floor plan canvas wrapper */}
          <div className="relative">
            {/* SVG canvas */}
            <div
              ref={containerRef}
              className="relative bg-ink-50 border border-ink-200 rounded-sm overflow-hidden select-none w-full"
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
                    <rect x="40" y="50" width={VIEWBOX_W - 80} height={740} />
                    <rect x="140" y="830" width={1160} height={250} />
                  </clipPath>
                </defs>
                <rect width={VIEWBOX_W} height={VIEWBOX_H} fill="url(#grid)" />

                {/* ZOOMABLE CONTENT */}
                <g clipPath="url(#map-clip)">
                  <g>
                    {/* Outdoor Zone background */}
                    {!selectedBlock && (
                      <rect x={140} y={830} width={1160} height={250} fill="#fafbfc" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2" rx="4" />
                    )}

                    {/* Zone background overlays inside the hall (24 blocks) */}
                    {Array.from({ length: 6 }).map((_, blockRow) =>
                      Array.from({ length: 4 }).map((_, blockColumn) => {
                        if (selectedBlock && (selectedBlock.row !== blockRow || selectedBlock.col !== blockColumn)) {
                          return null;
                        }
                        const zoneName = ZONE_MAP[blockRow][blockColumn];
                        const tint = ZONE_TINTS[zoneName] || { fill: '#ffffff', stroke: '#eceef2', text: '#64748b' };
                        const blockX = 60 + blockColumn * 340;
                        const blockY = 82 + blockRow * 120;
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

                    {/* Aisle labels */}
                    {!selectedBlock && AISLE_LABELS.map((a) => (
                      <text key={`${a.x}-${a.y}`} x={a.x} y={a.y} textAnchor="middle" fontSize={7.5 / zoom} fill="#94a3b8" fontWeight="600" className="opacity-90">{a.label} Aisle</text>
                    ))}

                    {/* Stands */}
                    {loading ? (
                      <text x={VIEWBOX_W / 2} y={VIEWBOX_H / 2} textAnchor="middle" fill="#828d9f" fontSize="16" fontWeight="600">Loading Floor Plan...</text>
                    ) : (
                      stands.map((stand) => {
                        // Filter by selected block coordinate bounds
                        if (selectedBlock) {
                          const blockX = 60 + selectedBlock.col * 340;
                          const blockY = 82 + selectedBlock.row * 120;
                          const isInsideBlock = stand.x >= blockX && stand.x < blockX + 300 && stand.y >= blockY && stand.y < blockY + 80;
                          if (!isInsideBlock) return null;
                        }

                        const colors = STATUS_COLORS[stand.status];
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
                            {/* Stand base rect */}
                            <rect
                              x={stand.x}
                              y={stand.y}
                              width={stand.w}
                              height={stand.h}
                              fill={isDrawerSelected ? '#e9b43e' : isMultiSelected ? '#fef3c7' : colors.fill}
                              stroke={isDrawerSelected ? '#bc7d23' : isMultiSelected ? '#f59e0b' : colors.stroke}
                              strokeWidth={isDrawerSelected || isMultiSelected ? 1.8 / zoom : 0.8 / zoom}
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
                            {!isMultiSelected && (selectedBlock || zoom >= 1.2 || stand.status === 'outdoor' || isDrawerSelected || isHovered) && (
                              <text
                                x={stand.x + stand.w / 2}
                                y={stand.y + stand.h / 2 + 2}
                                textAnchor="middle"
                                fontSize={stand.status === 'outdoor' ? 9 : selectedBlock ? 7.5 : 5}
                                fontWeight="800"
                                fill={isDrawerSelected ? '#1a1d23' : colors.text}
                                className="pointer-events-none tracking-tight font-mono"
                              >
                                {stand.label}
                              </text>
                            )}
                          </g>
                        );
                      })
                    )}

                    {/* Block watermarks rendered ON TOP of stands but click-through, visible only at low zoom (overview) */}
                    {zoom < 1.5 && !selectedBlock && (
                      Array.from({ length: 6 }).map((_, blockRow) =>
                        Array.from({ length: 4 }).map((_, blockColumn) => {
                          const zoneName = ZONE_MAP[blockRow][blockColumn];
                          const tint = ZONE_TINTS[zoneName] || { fill: '#ffffff', stroke: '#eceef2', text: '#64748b' };
                          const blockX = 60 + blockColumn * 340;
                          const blockY = 82 + blockRow * 120;
                          const blockLetter = ['A', 'B', 'C', 'D'][blockColumn];
                          const blockNum = blockRow + 1;
                          return (
                            <g key={`block-watermark-${blockRow}-${blockColumn}`} className="pointer-events-none select-none">
                              <text
                                x={blockX + 150}
                                y={blockY + 48}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize={40 / zoom}
                                fontWeight="900"
                                fill={tint.text}
                                opacity={0.12}
                                className="font-display uppercase pointer-events-none select-none"
                              >
                                {blockLetter}{blockNum}
                              </text>
                              <text
                                x={blockX + 150}
                                y={blockY + 22}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize={7 / zoom}
                                fontWeight="800"
                                fill={tint.text}
                                opacity={0.35}
                                className="uppercase tracking-wider pointer-events-none select-none font-semibold"
                              >
                                {zoneName}
                              </text>
                            </g>
                          );
                        })
                      )
                    )}

                    {/* Facility cutouts */}
                    {FACILITY_ZONES.map((facility) => {
                      if (selectedBlock) {
                        const blockX = 60 + selectedBlock.col * 340;
                        const blockY = 82 + selectedBlock.row * 120;
                        const minX = blockX;
                        const maxX = blockX + 300;
                        const minY = blockY;
                        const maxY = blockY + 80;
                        if (facility.x < minX || facility.x >= maxX || facility.y < minY || facility.y >= maxY) {
                          return null;
                        }
                      }

                      const isRestroom = facility.label.includes('restroom');
                      const isATM = facility.label.includes('ATM');
                      const isPolice = facility.label.includes('police');
                      const isManagement = facility.label.includes('management');
                      return (
                        <g key={`${facility.x}-${facility.y}`}>
                          <rect
                            x={facility.x}
                            y={facility.y}
                            width={facility.w}
                            height={facility.h}
                            fill="#f1f5f9"
                            stroke="#cbd5e1"
                            strokeWidth={1.2 / zoom}
                            rx="2"
                          />
                          {isRestroom && (
                            <g transform={`translate(${facility.x + facility.w / 2}, ${facility.y + (facility.h > 40 ? 25 : 14)}) scale(${1 / zoom})`} className="opacity-70">
                              <circle r="3" fill="none" stroke="#475569" strokeWidth="0.8" cy="-2" />
                              <path d="M-3,2 L3,2 M-1.5,2 L-1.5,6 M1.5,2 L1.5,6" stroke="#475569" strokeWidth="0.8" />
                            </g>
                          )}
                          {isATM && (
                            <g transform={`translate(${facility.x + facility.w / 2}, ${facility.y + 14}) scale(${1 / zoom})`} className="opacity-70">
                              <circle r="4.5" fill="none" stroke="#475569" strokeWidth="0.8" />
                              <text textAnchor="middle" dominantBaseline="middle" fontSize="6.5" fontWeight="bold" fill="#475569" y="1">$</text>
                            </g>
                          )}
                          {isPolice && (
                            <g transform={`translate(${facility.x + facility.w / 2}, ${facility.y + 25}) scale(${1 / zoom})`} className="opacity-70">
                              <path d="M-3.5,-3.5 L3.5,-3.5 L3.5,-1 C3.5,1.5 0,4 0,4 C0,4 -3.5,1.5 -3.5,-1 Z" fill="none" stroke="#475569" strokeWidth="0.8" />
                            </g>
                          )}
                          {isManagement && (
                            <g transform={`translate(${facility.x + facility.w / 2}, ${facility.y + 25}) scale(${1 / zoom})`} className="opacity-70">
                              <rect x="-3.5" y="-3.5" width="7" height="7" fill="none" stroke="#475569" strokeWidth="0.8" />
                              <line x1="0" y1="-3.5" x2="0" y2="3.5" stroke="#475569" strokeWidth="0.8" />
                              <line x1="-3.5" y1="0" x2="3.5" y2="0" stroke="#475569" strokeWidth="0.8" />
                            </g>
                          )}
                          {facility.label.split(/\n|\\n/).map((line, index) => (
                            <text
                              key={line}
                              x={facility.x + facility.w / 2}
                              y={facility.y + (facility.h > 40 ? 45 : 28) + index * (6 / zoom)}
                              textAnchor="middle"
                              fontSize={4.5 / zoom}
                              fill="#475569"
                              fontWeight="800"
                              className="uppercase tracking-wide font-sans"
                            >
                              {line}
                            </text>
                          ))}
                        </g>
                      );
                    })}
                  </g>
                </g>
              </svg>

              {/* Fixed Outer Rulers SVG Overlay (Never scales or shifts) */}
              <svg
                viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
                className="absolute inset-0 w-full h-full pointer-events-none z-20"
                preserveAspectRatio="xMidYMid meet"
              >
                {/* Hall outline — 140m × 76m */}
                {!selectedBlock && <rect x="40" y="50" width={VIEWBOX_W - 80} height={740} fill="none" stroke="#aeb6c4" strokeWidth="2" rx="4" />}

                {/* Top dimensions */}
                {!selectedBlock && (
                  <>
                    <line x1="40" y1="28" x2={VIEWBOX_W - 40} y2="28" stroke="#828d9f" strokeWidth={0.5} />
                    <path d="M 0 0 L 6 -3 L 6 3 Z" fill="#828d9f" transform="translate(40, 28)" />
                    <path d="M 0 0 L -6 -3 L -6 3 Z" fill="#828d9f" transform={`translate(${VIEWBOX_W - 40}, 28)`} />
                    <text x={VIEWBOX_W / 2} y="23" textAnchor="middle" fontSize="9" fill="#828d9f" fontWeight="600">140,000 mm (140m) — Overall Hall Width</text>
                    
                    <line x1="60" y1="38" x2={VIEWBOX_W - 60} y2="38" stroke="#aeb6c4" strokeWidth={0.5} />
                    <path d="M 0 0 L 5 -2 L 5 2 Z" fill="#aeb6c4" transform="translate(60, 38)" />
                    <path d="M 0 0 L -5 -2 L -5 2 Z" fill="#aeb6c4" transform={`translate(${VIEWBOX_W - 60}, 38)`} />
                    <text x={VIEWBOX_W / 2} y="36" textAnchor="middle" fontSize="7" fill="#aeb6c4" fontWeight="500">132,000 mm (132m) — Internal Boundary Width</text>
                  </>
                )}

                {/* Side dimensions */}
                {!selectedBlock && (
                  <>
                    <line x1="28" y1="50" x2="28" y2={790} stroke="#828d9f" strokeWidth={0.5} />
                    <path d="M 0 0 L -3 6 L 3 6 Z" fill="#828d9f" transform="translate(28, 50)" />
                    <path d="M 0 0 L -3 -6 L 3 -6 Z" fill="#828d9f" transform="translate(28, 790)" />
                    <text x="22" y={420} textAnchor="middle" fontSize="8" fill="#828d9f" fontWeight="600" transform="rotate(-90 22 420)">76,000 mm (76m) — Overall Hall Depth</text>
                    
                    <line x1={VIEWBOX_W - 28} y1="82" x2={VIEWBOX_W - 28} y2={762} stroke="#aeb6c4" strokeWidth={0.5} />
                    <path d="M 0 0 L -3 6 L 3 6 Z" fill="#aeb6c4" transform={`translate(${VIEWBOX_W - 28}, 82)`} />
                    <path d="M 0 0 L -3 -6 L 3 -6 Z" fill="#aeb6c4" transform={`translate(${VIEWBOX_W - 28}, 762)`} />
                    <text x={VIEWBOX_W - 22} y={420} textAnchor="middle" fontSize="7" fill="#aeb6c4" fontWeight="500" transform={`rotate(90 ${VIEWBOX_W - 22} 420)`}>68,000 mm (68m) — Internal Boundary Depth</text>
                  </>
                )}

                {/* Block dimension annotations */}
                {!selectedBlock && [60, 400, 740, 1080].map((x) => (
                  <g key={`bw-annot-${x}`}>
                    <line x1={x} y1="786" x2={x + 300} y2="786" stroke="#94a3b8" strokeWidth={0.5} strokeDasharray="2 2" />
                    <text x={x + 150} y={794} textAnchor="middle" fontSize="7" fill="#64748b" fontWeight="600">30,000 mm (30m) Block Width</text>
                  </g>
                ))}

                {/* Perimeter clearance */}
                {!selectedBlock && (
                  <>
                    <text x="48" y="776" fontSize="7" fill="#94a3b8" fontWeight="600">4,000 mm (4m) perimeter clearance</text>
                    <text x={VIEWBOX_W - 48} y="776" textAnchor="end" fontSize="7" fill="#94a3b8" fontWeight="600">4,000 mm (4m) perimeter clearance</text>
                  </>
                )}

                {/* Entrance */}
                {!selectedBlock && (
                  <>
                    <rect x={VIEWBOX_W / 2 - 70} y="42" width="140" height="8" fill="#e9b43e" opacity="0.3" />
                    <text x={VIEWBOX_W / 2} y="46" textAnchor="middle" fontSize="8" fill="#975c20" fontWeight="700">MAIN ENTRANCE</text>
                  </>
                )}

                {/* Outdoor Zone header */}
                {!selectedBlock && (
                  <>
                    <line x1="40" y1="815" x2={VIEWBOX_W - 40} y2="815" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" />
                    <rect x={VIEWBOX_W / 2 - 120} y="805" width="240" height="20" fill="#f8fafc" rx="10" stroke="#cbd5e1" strokeWidth="1" />
                    <text x={VIEWBOX_W / 2} y="818" textAnchor="middle" fontSize="8" fill="#475569" fontWeight="700" className="tracking-widest uppercase">
                      Outdoor Heavy Equipment Zone
                    </text>
                  </>
                )}

                {/* Scale Bar */}
                <g transform="translate(60, 1075)">
                  <rect x="-10" y="-15" width="215" height="32" fill="#ffffff" rx="2" stroke="#e2e8f0" strokeWidth="0.5" />
                  <line x1="0" y1="0" x2="194.3" y2="0" stroke="#475569" strokeWidth="1.5" />
                  <line x1="0" y1="-3.5" x2="0" y2="3.5" stroke="#475569" strokeWidth="1.5" />
                  <line x1="97.1" y1="-2.5" x2="97.1" y2="2.5" stroke="#475569" strokeWidth="1" />
                  <line x1="194.3" y1="-3.5" x2="194.3" y2="3.5" stroke="#475569" strokeWidth="1.5" />
                  <text x="0" y="10" fontSize="7.5" fill="#475569" fontWeight="700" textAnchor="middle">0m</text>
                  <text x="97.1" y="10" fontSize="7.5" fill="#475569" fontWeight="700" textAnchor="middle">10m</text>
                  <text x="194.3" y="10" fontSize="7.5" fill="#475569" fontWeight="700" textAnchor="middle">20m</text>
                  <text x="97.1" y="-6" fontSize="6.5" fill="#64748b" fontWeight="800" textAnchor="middle" className="uppercase tracking-wider">GRAPHIC SCALE</text>
                </g>
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
                onEnquire={() => setIsEnquiryOpen(true)}
              />

              {/* 100% Reset / View Button (Serves as Back to Overview) */}
              <button 
                onClick={handleReset}
                className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-lg text-xs font-bold text-slate-700 border border-slate-200 hover:bg-slate-900 hover:text-white transition-all shadow-md cursor-pointer pointer-events-auto flex items-center gap-2 z-30"
                title="Reset to 100% Full Overview"
              >
                <RotateCcw size={13} className="text-gold-500" />
                <span>{selectedBlock ? '← Back to Overview (100%)' : `${Math.round(zoom * 100)}%`}</span>
              </button>
            </div>
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
