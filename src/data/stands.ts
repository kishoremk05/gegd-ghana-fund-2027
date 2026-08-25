export type StandStatus = 'available' | 'reserved' | 'confirmed' | 'premium' | 'outdoor' | 'sponsor';

export interface Stand {
  id: string;
  block: string;
  row: string;
  number: number;
  label: string;
  status: StandStatus;
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
  available: { fill: '#f8fafc', stroke: '#cbd5e1', text: '#475569', bg: 'bg-slate-50', dot: 'bg-slate-400' },
  reserved: { fill: '#fef3c7', stroke: '#f59e0b', text: '#92400e', bg: 'bg-amber-100', dot: 'bg-amber-500' },
  confirmed: { fill: '#dcfce7', stroke: '#22c55e', text: '#166534', bg: 'bg-green-100', dot: 'bg-green-500' },
  premium: { fill: '#fffbeb', stroke: '#fbbf24', text: '#b45309', bg: 'bg-yellow-50', dot: 'bg-yellow-500' },
  outdoor: { fill: '#eff6ff', stroke: '#3b82f6', text: '#1e40af', bg: 'bg-blue-50', dot: 'bg-blue-500' },
  sponsor: { fill: '#faf5ff', stroke: '#a855f7', text: '#6b21a8', bg: 'bg-purple-50', dot: 'bg-purple-500' },
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
  'confirmed', 'available', 'premium', 'available', 'reserved',
];

function makeStands(): Stand[] {
  const stands: Stand[] = [];
  const blockLetters = ['A', 'B', 'C', 'D'];
  const blockWidth = 300;
  const blockHeight = 80;
  const aisle = 40;
  const left = 60;
  const top = 82;
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
          const isRestroom1 = blockRow === 0 && blockColumn === 0 && standRow === 0 && standColumn === 0;
          const isRestroom2 = blockRow === 0 && blockColumn === 3 && standRow === 0 && standColumn === 9;
          const isRestroom3 = blockRow === 5 && blockColumn === 0 && standRow === 0 && standColumn === 0;
          const isRestroom4 = blockRow === 5 && blockColumn === 3 && standRow === 0 && standColumn === 9;
          const isManagement = blockRow === 0 && blockColumn === 1 && standColumn === 9;
          const isPolice = blockRow === 5 && blockColumn === 1 && standColumn === 9;
          const isATM = blockRow === 2 && blockColumn === 1 && standRow === 0 && standColumn === 9;

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

          stands.push({
            id,
            block,
            row: String.fromCharCode(65 + standRow),
            number,
            label: id,
            status,
            area: status === 'premium' ? 48 : 12, // Premium = 48m² (12m x 4m)
            type: status === 'premium' ? 'Premium Corner' : 'Standard Stand',
            price: status === 'premium' ? 'US$11,640' : 'US$3,360',
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
  const startX = 150;
  const startY = 860; // Placed below the main hall
  const standSize = 100; // 10m x 10m = 100px x 100px
  const spacing = 15;
  const zone = 'Outdoor Heavy Equipment';

  // 2 rows of 10 outdoor stands
  for (let row = 0; row < 2; row += 1) {
    for (let col = 0; col < 10; col += 1) {
      const idx = row * 10 + col + 1;
      const id = `OUT-${String(idx).padStart(3, '0')}`;
      const status: StandStatus = 'outdoor';

      stands.push({
        id,
        block: 'OUT',
        row: String.fromCharCode(65 + row),
        number: 480 + idx,
        label: id,
        status,
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
