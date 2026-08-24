import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env.local
const envPath = path.join(__dirname, '../.env.local');
if (!fs.existsSync(envPath)) {
  console.error('.env.local file not found. Please create it first.');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');

const getEnvVar = (name) => {
  const match = envContent.match(new RegExp(`^${name}=(.*)$`, 'm'));
  return match ? match[1].trim() : null;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY') || getEnvVar('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or appropriate key in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const INDUSTRIES = [
  'Mining, Minerals & Metals',
  'Manufacturing & Industrial Production',
  'Agriculture & Agro-Processing',
  'Energy',
  'Construction & Infrastructure',
  'Automotive & Mobility',
  'Technology & Innovation',
  'Financial & Professional Services',
  'Electronics, ICT & Semiconductor',
  'Medical & Healthcare',
  'Textiles, Apparel & Consumer Products',
  'Environmental Technology & Recycling',
  'Aerospace & Aviation',
  'Railway & Transport',
  'Marine & Shipbuilding',
];

const STATUS_SEQUENCE = [
  'available', 'available', 'available', 'reserved', 'available',
  'confirmed', 'available', 'premium', 'available', 'reserved',
];

function makeStands() {
  const stands = [];
  const blockLetters = ['A', 'B', 'C', 'D'];
  const blockWidth = 300;
  const blockHeight = 80;
  const aisle = 40;
  const left = 60;
  const top = 82;
  const standWidth = 30;
  const standHeight = 34;

  for (let blockRow = 0; blockRow < 6; blockRow += 1) {
    for (let blockColumn = 0; blockColumn < 4; blockColumn += 1) {
      const block = blockLetters[blockColumn];
      const blockX = left + blockColumn * (blockWidth + aisle);
      const blockY = top + blockRow * (blockHeight + aisle);

      for (let standRow = 0; standRow < 2; standRow += 1) {
        for (let standColumn = 0; standColumn < 10; standColumn += 1) {
          const blockStandNumber = standRow * 10 + standColumn + 1;
          const number = (blockRow * 4 + blockColumn) * 20 + blockStandNumber;
          const status = STATUS_SEQUENCE[(number - 1) % STATUS_SEQUENCE.length];
          const id = `${block}-${String(number).padStart(3, '0')}`;

          stands.push({
            id,
            block,
            row: String.fromCharCode(65 + standRow),
            number,
            label: id,
            status,
            area: status === 'premium' ? 48 : 12,
            type: status === 'premium' ? 'Premium Corner' : 'Standard Stand',
            price: status === 'premium' ? 'US$11,640' : 'US$3,360',
            industry: INDUSTRIES[(number - 1) % INDUSTRIES.length],
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

async function seed() {
  const stands = makeStands();
  console.log(`Generating ${stands.length} stands...`);

  // Delete existing stands
  const { error: deleteError } = await supabase.from('stands').delete().neq('id', '');
  if (deleteError) {
    console.error('Error clearing old stands:', deleteError);
    process.exit(1);
  }
  console.log('Cleared existing stands.');

  // Insert in chunks of 100 to avoid request size limits
  const chunkSize = 100;
  for (let i = 0; i < stands.length; i += chunkSize) {
    const chunk = stands.slice(i, i + chunkSize);
    const { error } = await supabase.from('stands').insert(chunk);
    if (error) {
      console.error(`Error inserting chunk ${i}-${i + chunkSize}:`, error);
      process.exit(1);
    }
    console.log(`Inserted stands ${i + 1} to ${Math.min(i + chunkSize, stands.length)}`);
  }

  console.log('Seeding completed successfully!');
}

seed();
