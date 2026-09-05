export type StandStatus = 'available' | 'reserved' | 'confirmed' | 'premium' | 'outdoor' | 'sponsor';
export type BoothType = 'standard' | 'corner' | 'premium' | 'outdoor';

export interface Stand {
  id: string;
  block: string;
  row: string;
  number: number;
  label: string;
  status: StandStatus;
  boothType: BoothType;
  area: number;
  type: string;
  price: string;
  industry: string;
  zone: string;
  company?: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export const STATUS_LABELS: Record<StandStatus, string> = {
  available: 'Available',
  reserved: 'Reserved',
  confirmed: 'Confirmed',
  premium: 'Premium',
  outdoor: 'Outdoor',
  sponsor: 'Sponsor / Pavilion',
};

export const STATUS_COLORS: Record<StandStatus, { fill: string; stroke: string; text: string; bg: string; dot: string }> = {
  available: { fill: '#ffffff', stroke: '#cbd5e1', text: '#475569', bg: 'bg-slate-50', dot: 'bg-slate-400' },
  reserved: { fill: '#fef3c7', stroke: '#f59e0b', text: '#92400e', bg: 'bg-amber-100', dot: 'bg-amber-500' },
  confirmed: { fill: '#dcfce7', stroke: '#22c55e', text: '#166534', bg: 'bg-green-100', dot: 'bg-green-500' },
  premium: { fill: '#fffbeb', stroke: '#fbbf24', text: '#b45309', bg: 'bg-yellow-50', dot: 'bg-yellow-500' },
  outdoor: { fill: '#eff6ff', stroke: '#3b82f6', text: '#1e40af', bg: 'bg-blue-50', dot: 'bg-blue-500' },
  sponsor: { fill: '#faf5ff', stroke: '#a855f7', text: '#6b21a8', bg: 'bg-purple-50', dot: 'bg-purple-500' },
};

export const BOOTH_TYPE_COLORS: Record<BoothType, { fill: string; stroke: string; text: string; label: string; bg: string }> = {
  standard: { fill: '#ffffff', stroke: '#0f172a', text: '#334155', label: 'S', bg: 'bg-slate-50' },
  corner: { fill: '#ffffff', stroke: '#0f172a', text: '#2563eb', label: 'C', bg: 'bg-blue-50' },
  premium: { fill: '#ffffff', stroke: '#0f172a', text: '#dc2626', label: 'P', bg: 'bg-red-50' },
  outdoor: { fill: '#eff6ff', stroke: '#0f172a', text: '#1e40af', label: 'O', bg: 'bg-blue-50' },
};

// 15 Zones Mapping onto 24 Blocks (6 rows x 4 columns)
// Columns A, B, C, D (left to right)
// Rows 0 to 5 (top/back to bottom/entrance)
export const ZONE_MAP: string[][] = [
  ['Agriculture & Food',         'Agriculture & Food',         'Mining & Minerals',            'Mining & Minerals'],
  ['Manufacturing',              'Construction & Infrastructure','Construction & Infrastructure','Manufacturing'],
  ['Automotive',                 'Automotive',                  'Aerospace & Aviation',          'Rail & Transport'],
  ['Marine',                     'Energy',                      'Energy',                        'Electronics & ICT'],
  ['Medical & Healthcare',       'Medical & Healthcare',        'Financial & Professional Services','Electronics & ICT'],
  ['Technology & Innovation',    'Technology & Innovation',     'Export & International Pavilions','Export & International Pavilions'],
];

// Soft, professional, subtle background tints for each zone
export const ZONE_TINTS: Record<string, { fill: string; stroke: string; text: string }> = {
  'Agriculture & Food':                 { fill: '#f4fbf7', stroke: '#dcf6e8', text: '#166534' },
  'Mining & Minerals':                  { fill: '#fafaf9', stroke: '#f5f5f4', text: '#44403c' },
  'Manufacturing':                      { fill: '#fffbf7', stroke: '#ffebd5', text: '#9a3412' },
  'Automotive':                         { fill: '#f8faff', stroke: '#eef4ff', text: '#1e40af' },
  'Aerospace & Aviation':                { fill: '#f4faff', stroke: '#e8f4fd', text: '#0369a1' },
  'Rail & Transport':                    { fill: '#fafbfc', stroke: '#f8fafc', text: '#475569' },
  'Marine':                             { fill: '#f4fefd', stroke: '#dcfefb', text: '#0e7490' },
  'Construction & Infrastructure':      { fill: '#fafaf9', stroke: '#f8fafc', text: '#57534e' },
  'Energy':                             { fill: '#fffdf5', stroke: '#fff9e5', text: '#b45309' },
  'Electronics & ICT':                  { fill: '#f5f7ff', stroke: '#ebefff', text: '#3730a3' },
  'Medical & Healthcare':               { fill: '#fff8fa', stroke: '#ffeef4', text: '#9d174d' },
  'Financial & Professional Services':  { fill: '#fbfaff', stroke: '#f3efff', text: '#5b21b6' },
  'Export & International Pavilions':   { fill: '#fff5f6', stroke: '#ffe4e6', text: '#9f1239' },
  'Technology & Innovation':            { fill: '#f4fbf7', stroke: '#e2f7ea', text: '#15803d' },
  'Outdoor Heavy Equipment':            { fill: '#fafbfc', stroke: '#f1f5f9', text: '#334155' },
};

// Seed companies for some reserved/confirmed stands to demonstrate search by company
const SEED_COMPANIES: Record<number, string> = {
  4: 'AgroGold Ghana Ltd',
  10: 'Volta Mining Group',
  24: 'Accra Motors Inc',
  35: 'Apex Aviation West Africa',
  52: 'West Africa Rail Corp',
  67: 'EcoPower Solutions',
  80: 'MediClinic Group Accra',
  95: 'Standard Chartered Ghana',
  108: 'Pavilion of Germany',
  112: 'Silicon Valley Innovation Hub',
};

const STATUS_SEQUENCE: StandStatus[] = [
  'available', 'available', 'available', 'reserved', 'available',
  'confirmed', 'available', 'available', 'available', 'reserved',
];

function isPremiumStand(blockRow: number, blockColumn: number, standRow: number, standColumn: number): boolean {
  // Block A3 (blockRow 2, blockColumn 0): standCol 0 (both rows)
  if (blockRow === 2 && blockColumn === 0 && standColumn === 0) return true;

  // Block A4 (blockRow 3, blockColumn 0): standCol 0 (both rows)
  if (blockRow === 3 && blockColumn === 0 && standColumn === 0) return true;

  // Block B2 (blockRow 1, blockColumn 1):
  // standRow 0, standCol 9 (shifted right to col 9)
  if (blockRow === 1 && blockColumn === 1 && standRow === 0 && standColumn === 9) return true;
  // standRow 1, standCols 6, 7, 8, 9 (shifted right to col 9)
  if (blockRow === 1 && blockColumn === 1 && standRow === 1 && [6, 7, 8, 9].includes(standColumn)) return true;

  // Block C2 (blockRow 1, blockColumn 2): standCol 0 (both rows)
  if (blockRow === 1 && blockColumn === 2 && standColumn === 0) return true;

  // Block B3 (blockRow 2, blockColumn 1):
  // standRow 0, standCol 6, 7 (shifted right to left of ATM)
  if (blockRow === 2 && blockColumn === 1 && standRow === 0 && (standColumn === 6 || standColumn === 7)) return true;
  // standRow 1, standCol 9 (right corner P only)
  if (blockRow === 2 && blockColumn === 1 && standRow === 1 && standColumn === 9) return true;

  // Block C3 (blockRow 2, blockColumn 2): standCol 0 (both rows)
  if (blockRow === 2 && blockColumn === 2 && standColumn === 0) return true;

  return false;
}

function makeStands(): Stand[] {
  const stands: Stand[] = [];
  const blockLetters = ['A', 'B', 'C', 'D'];
  const blockWidth = 300;
  const blockHeight = 80;
  const aisle = 40;
  const left = 40;
  const top = 40;
  const standWidth = 30;
  const standHeight = 40; // 4m depth = 40px

  for (let blockRow = 0; blockRow < 6; blockRow += 1) {
    for (let blockColumn = 0; blockColumn < 4; blockColumn += 1) {
      const block = blockLetters[blockColumn];
      const blockX = left + blockColumn * (blockWidth + aisle);
      const blockY = top + blockRow * (blockHeight + aisle);
      const zone = ZONE_MAP[blockRow][blockColumn];

      for (let standRow = 0; standRow < 2; standRow += 1) {
        for (let standColumn = 0; standColumn < 10; standColumn += 1) {
          // Facilities check
          const isRestroom1 = blockRow === 0 && blockColumn === 0 && standRow === 0 && (standColumn === 0 || standColumn === 1);
          const isRestroom2 = blockRow === 0 && blockColumn === 3 && standRow === 0 && (standColumn === 8 || standColumn === 9);
          // Restroom 3 shifted to A-411, A-412 (standRow 1, standCols 0, 1)
          const isRestroom3 = blockRow === 5 && blockColumn === 0 && standRow === 1 && (standColumn === 0 || standColumn === 1);
          // Restroom 4 shifted to D-479, D-480 (standRow 1, standCols 8, 9)
          const isRestroom4 = blockRow === 5 && blockColumn === 3 && standRow === 1 && (standColumn === 8 || standColumn === 9);
          const isManagement = blockRow === 0 && blockColumn === 1 && standRow === 0 && (standColumn === 8 || standColumn === 9);
          const isPolice = blockRow === 5 && blockColumn === 1 && standRow === 1 && standColumn === 9;
          const isATM = blockRow === 2 && blockColumn === 1 && standRow === 0 && (standColumn === 8 || standColumn === 9);

          if (isRestroom1 || isRestroom2 || isRestroom3 || isRestroom4 || isManagement || isPolice || isATM) {
            continue;
          }

          const blockStandNumber = standRow * 10 + standColumn + 1;
          const number = (blockRow * 4 + blockColumn) * 20 + blockStandNumber;
          const status = STATUS_SEQUENCE[(number - 1) % STATUS_SEQUENCE.length];
          const id = `${block}-${String(number).padStart(3, '0')}`;

          const companyName = (status === 'reserved' || status === 'confirmed')
            ? (SEED_COMPANIES[number] || 'Exhibitor Company Ltd')
            : undefined;

          // Determine booth type: Premium > Corner > Standard
          const isPrem = isPremiumStand(blockRow, blockColumn, standRow, standColumn);
          let isCorn = (standColumn === 0 || standColumn === 9);

          // Custom corner rules for specific blocks:
          if (blockRow === 5 && blockColumn === 0) {
            // Block A6: A-401 (col 0) and A-402 (col 1) are Corner (C), remaining are Standard (S)
            isCorn = (standRow === 0 && (standColumn === 0 || standColumn === 1));
          } else if (blockRow === 5 && blockColumn === 3) {
            // Block D6: D-461 (col 0) and D-470 (col 9) are Corner (C), remaining are Standard (S)
            isCorn = (standRow === 0 && (standColumn === 0 || standColumn === 9));
          } else if (blockRow === 2 && blockColumn === 1 && standColumn === 9) {
            // Block B3: right corner is not Corner (C)
            isCorn = false;
          }

          let boothType: BoothType = 'standard';
          let typeLabel = 'Standard Stand';
          let priceLabel = 'US$3,360';

          if (isPrem) {
            boothType = 'premium';
            typeLabel = 'Premium Booth';
            priceLabel = 'US$5,000';
          } else if (isCorn) {
            boothType = 'corner';
            typeLabel = 'Corner Stand';
            priceLabel = 'US$4,200';
          }

          stands.push({
            id,
            block,
            row: String.fromCharCode(65 + standRow),
            number,
            label: id,
            status,
            boothType,
            area: 12,
            type: typeLabel,
            price: priceLabel,
            industry: zone,
            zone: zone,
            company: companyName,
            x: blockX + standColumn * standWidth,
            y: blockY + standRow * standHeight,
            w: standWidth,
            h: standHeight,
          });
        }
      }
    }
  }

  return stands;
}

function makeOutdoorStands(): Stand[] {
  const stands: Stand[] = [];
  const startX = 132.5;
  const startY = 890; // Centered below the main hall with generous spacing
  const standSize = 100; // 10m x 10m = 100px x 100px
  const spacing = 15;
  const zone = 'Outdoor Heavy Equipment';

  // 2 rows of 10 outdoor stands
  for (let row = 0; row < 2; row += 1) {
    for (let col = 0; col < 10; col += 1) {
      const idx = row * 10 + col + 1;
      const id = `O-${String(idx).padStart(3, '0')}`;
      const status: StandStatus = 'outdoor';

      stands.push({
        id,
        block: 'OUT',
        row: String.fromCharCode(65 + row),
        number: 480 + idx,
        label: id,
        status,
        boothType: 'outdoor',
        area: 100,
        type: 'Outdoor Exhibition',
        price: 'US$6,120',
        industry: zone,
        zone: zone,
        company: undefined, // All outdoor default to available
        x: startX + col * (standSize + spacing),
        y: startY + row * (standSize + spacing),
        w: standSize,
        h: standSize,
      });
    }
  }

  return stands;
}

export const STANDS: Stand[] = [...makeStands(), ...makeOutdoorStands()];

export function calculateTotalStandsPrice(selectedStands: Stand[]): number {
  if (selectedStands.length === 0) return 0;

  const prices = selectedStands.map((stand) => {
    const base = parseFloat(stand.price.replace(/[^\d.]/g, ''));
    return isNaN(base) ? 0 : base;
  });

  // Sort prices descending (highest first)
  prices.sort((a, b) => b - a);

  // First (most expensive) stand is full price, subsequent stands get 10% discount
  return prices.reduce((total, price, index) => {
    if (index === 0) {
      return total + price;
    } else {
      return total + price * 0.90;
    }
  }, 0);
}

export function formatCurrency(val: number): string {
  return 'US$' + Math.round(val).toLocaleString('en-US');
}

