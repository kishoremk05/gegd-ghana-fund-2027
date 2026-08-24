export interface StatItem {
  value: string;
  label: string;
}

export const STATS: StatItem[] = [
  { value: '500', label: 'Exhibition Opportunities' },
  { value: '480', label: 'Indoor Stands' },
  { value: '20', label: 'Outdoor Opportunities' },
  { value: '40,000+', label: 'Target Visitors' },
  { value: 'US$10–15M', label: 'Target Exhibition Sales & Bookings' },
  { value: 'US$100M+', label: 'Target Investment Commitments' },
  { value: '20+', label: 'Target MOUs / Strategic Agreements' },
];

export const OVERVIEW_POINTS: string[] = [
  'Present products and technologies',
  'Demonstrate equipment and solutions',
  'Meet qualified buyers',
  'Receive purchase enquiries',
  'Negotiate supply contracts',
  'Secure orders',
  'Appoint distributors and agents',
  'Identify export markets',
  'Meet investors and financiers',
  'Establish strategic partnerships',
  'Enter new African markets',
  'Access procurement opportunities',
  'Develop joint ventures',
  'Promote investment projects',
];

export interface WhyExhibitCard {
  icon: string;
  title: string;
  description: string;
}

export const WHY_EXHIBIT: WhyExhibitCard[] = [
  { icon: 'Handshake', title: 'Meet Buyers', description: 'Connect directly with prospective buyers, distributors and procurement organisations.' },
  { icon: 'ShoppingCart', title: 'Secure Orders', description: 'Use your stand as a commercial sales and negotiation point.' },
  { icon: 'Globe', title: 'Enter African Markets', description: 'Reach Ghana and wider African markets from Accra.' },
  { icon: 'Users', title: 'Find Partners', description: 'Meet manufacturers, investors, financiers, distributors and strategic partners.' },
  { icon: 'Cpu', title: 'Demonstrate Your Technology', description: 'Show what your product can actually do.' },
  { icon: 'Network', title: 'Build Distribution', description: 'Identify agents, distributors and commercial representatives.' },
  { icon: 'TrendingUp', title: 'Access Investment', description: 'Present businesses, technologies and projects to investors and financiers.' },
  { icon: 'Award', title: 'Build Your Brand', description: 'Position your company before government, industry leaders, investors and buyers.' },
];

export const WHO_SHOULD_EXHIBIT: string[] = [
  'Manufacturers', 'Producers', 'Exporters', 'Technology Companies',
  'Mining Companies', 'Automotive Companies', 'Construction Companies',
  'Agriculture / Agro-Processing', 'Financial Institutions', 'Professional Services',
  'Governments', 'Chambers of Commerce', 'Distributors', 'Investors',
  'International Companies',
];

export interface IndustryCategory {
  name: string;
  icon: string;
  description: string;
}

export const INDUSTRIES: IndustryCategory[] = [
  { name: 'Agriculture & Food', icon: 'Wheat', description: 'Agro-processing, food production, farming technology and agricultural exports.' },
  { name: 'Mining & Minerals', icon: 'Mountain', description: 'Mining operations, mineral processing, metals refining and extraction technology.' },
  { name: 'Manufacturing', icon: 'Factory', description: 'Industrial manufacturing, production lines, heavy industry and fabrication.' },
  { name: 'Automotive', icon: 'Car', description: 'Vehicles, automotive parts, mobility solutions and transport technology.' },
  { name: 'Aerospace & Aviation', icon: 'Plane', description: 'Aviation technology, aircraft components, aerospace manufacturing and services.' },
  { name: 'Rail & Transport', icon: 'TrainFront', description: 'Rail infrastructure, rolling stock, transport logistics and freight systems.' },
  { name: 'Marine', icon: 'Ship', description: 'Maritime industry, shipbuilding, port technology and marine engineering.' },
  { name: 'Construction & Infrastructure', icon: 'HardHat', description: 'Construction materials, infrastructure development, civil engineering and building systems.' },
  { name: 'Energy', icon: 'Zap', description: 'Power generation, renewable energy, oil & gas, energy storage and grid technology.' },
  { name: 'Electronics & ICT', icon: 'CircuitBoard', description: 'Electronics, ICT systems, semiconductor technology and digital infrastructure.' },
  { name: 'Medical & Healthcare', icon: 'Stethoscope', description: 'Medical devices, healthcare technology, pharmaceuticals and medical services.' },
  { name: 'Financial & Professional Services', icon: 'Landmark', description: 'Banking, finance, insurance, legal, consulting and professional services.' },
  { name: 'Export & International Pavilions', icon: 'Globe', description: 'National trade representations, export promotion agencies and international pavilions.' },
  { name: 'Technology & Innovation', icon: 'Lightbulb', description: 'Emerging tech, innovation hubs, startups, R&D and digital transformation.' },
  { name: 'Outdoor Heavy Equipment', icon: 'Truck', description: 'Heavy machinery, large earthmoving equipment, agricultural tractors and mining vehicles.' },
];

export interface StandPackage {
  name: string;
  size: string;
  dimensions: string;
  price: string;
  features: string[];
  highlighted?: boolean;
  buttonText: string;
}

export const STAND_PACKAGES: StandPackage[] = [
  {
    name: 'Standard Stand',
    size: '12 m²',
    dimensions: '3m × 4m',
    price: 'US$3,360',
    buttonText: 'Reserve Standard Stand',
    features: [
      'Enclosed exhibition unit', 'Installation', 'Roll-away door',
      'LED signage', 'Electrical socket', 'Exhibition lighting',
      'Climate control', 'Table', 'Three chairs', 'Hospitality package',
    ],
    highlighted: true,
  },
  {
    name: 'Corner Stand',
    size: '24 m²',
    dimensions: '6m × 4m',
    price: 'US$6,120',
    buttonText: 'Reserve Corner Stand',
    features: [
      'Enclosed exhibition unit', 'Installation', 'Roll-away door',
      'LED signage', 'Electrical socket', 'Exhibition lighting',
      'Climate control', 'Table', 'Three chairs', 'Hospitality package',
    ],
  },
  {
    name: 'Premium Corner',
    size: '48 m²',
    dimensions: '12m × 4m',
    price: 'US$11,640',
    buttonText: 'Reserve Premium Corner',
    features: [
      'Enclosed exhibition unit', 'Installation', 'Roll-away door',
      'LED signage', 'Electrical socket', 'Exhibition lighting',
      'Climate control', 'Table', 'Three chairs', 'Hospitality package',
    ],
  },
  {
    name: 'Outdoor Exhibition',
    size: '100 m²',
    dimensions: '10m × 10m',
    price: 'US$6,120',
    buttonText: 'Enquire About Outdoor Space',
    features: [
      'Outdoor exhibition space', 'Installation', 'Custom setup',
      'LED signage', 'Electrical socket', 'Exhibition lighting',
      'Climate control', 'Table', 'Three chairs', 'Hospitality package',
    ],
  },
];

export const BUYER_TARGETS: string[] = [
  'Government procurement organisations', 'Major corporations', 'Manufacturers',
  'Mining companies', 'Construction companies', 'Distributors', 'Importers',
  'Exporters', 'Retail chains', 'Financial institutions',
  'Infrastructure developers', 'International trade delegations',
  'Chambers of commerce', 'Investment funds', 'Institutional buyers',
];

export const BUYER_FEATURES: string[] = [
  'Pre-event buyer registration', 'Exhibitor/product matching', 'B2B meetings',
  'Buyer-seller appointments', 'Product demonstrations', 'Order negotiation',
  'Distributor matching', 'Investment meetings', 'Export introductions',
];

export const EXHIBITOR_BENEFITS: string[] = [
  'Exhibition space', 'Installation', 'Exhibition infrastructure',
  'Company signage', 'Electricity', 'Lighting', 'Climate control',
  'Furniture', 'Exhibitor registration', 'Website listing',
  'Industry-category listing', 'Buyer programme access', 'Networking',
  'Business delegations', 'Product demonstrations', 'Commercial enquiries',
  'Export opportunities', 'Distributor opportunities', 'Investor opportunities',
  'Hospitality',
];

export const SPONSORSHIP_TYPES: string[] = [
  'Exhibition Main Sponsor', 'Exhibition Hall Sponsor', 'Buyer Programme Sponsor',
  'International Pavilion Sponsor', 'Industry Zone Sponsor', 'Innovation Zone Sponsor',
  'Outdoor Exhibition Sponsor', 'Registration Sponsor', 'Networking Lounge Sponsor',
  'Business Matching Sponsor', 'Digital Marketplace Sponsor', 'Visitor Badge Sponsor',
  'Hospitality Sponsor', 'Transport Sponsor', 'Media Sponsor',
];

export const PAYMENT_METHODS: string[] = ['Card', 'Mobile Money', 'Bank Transfer', 'SWIFT'];

export const VISITOR_TYPES: string[] = [
  'Buyer', 'Investor', 'Distributor', 'Supplier', 'Manufacturer',
  'Government Representative', 'Professional', 'General Visitor',
];

export interface FAQItem {
  question: string;
  answer: string;
}

export const FAQS: FAQItem[] = [
  { question: 'What is GEGD 2027?', answer: 'GEGD 2027 — the Ghana Economic Growth & Development Week — is a premier exhibition marketplace taking place from 16 to 23 January 2027 in Accra, Ghana. It brings manufacturers, producers, technology companies, exporters, investors, financial institutions, governments, distributors, buyers and professional service providers together in one of Africa\'s most commercially focused economic development programmes.' },
  { question: 'Is GEGD 2027 an exhibition or a trade fair?', answer: 'GEGD 2027 is more than an exhibition — it is a marketplace for business. It is designed to turn exhibition participation into commercial opportunity: display products, demonstrate technology, meet buyers, negotiate supply contracts, secure orders, appoint distributors, identify export markets, meet investors and establish strategic partnerships.' },
  { question: 'What is the standard stand size?', answer: 'The standard stand is 12 m² (3m × 4m), priced at US$3,360. It includes an enclosed exhibition unit with installation, LED signage, electrical socket, exhibition lighting, climate control, furniture and a hospitality package.' },
  { question: 'What is the corner stand size?', answer: 'The corner stand is 24 m², priced at US$6,120. It offers enhanced visibility at aisle intersections and includes all standard stand features.' },
  { question: 'What is the Premium Corner size?', answer: 'The Premium Corner stand is 48 m², priced at US$11,640. It provides maximum exhibition space and visibility for larger displays and demonstrations.' },
  { question: 'What is the outdoor stand size?', answer: 'The outdoor exhibition space is 100 m², priced at US$6,120. It is designed for large machinery, equipment demonstrations and outdoor displays.' },
  { question: 'How much is the reservation fee?', answer: 'A US$1,000 non-refundable reservation fee is required to reserve your stand. Payment of this fee does not constitute final stand allocation — stand allocation is confirmed only after the full invoice has been paid and the payment verified by the GEGD Secretariat.' },
  { question: 'When must the balance be paid?', answer: 'All outstanding exhibition invoices must be paid before 1 November 2026.' },
  { question: 'When is my stand confirmed?', answer: 'Your stand is confirmed only after the full invoice has been paid and the payment has been verified by the GEGD Secretariat. The US$1,000 reservation fee alone does not constitute final stand allocation.' },
  { question: 'Can I select my stand?', answer: 'Yes. You can explore the interactive floor plan on this website to view available stands, filter by industry and status, and select your preferred location before submitting your reservation.' },
  { question: 'Can I exhibit machinery?', answer: 'Yes. GEGD 2027 includes dedicated outdoor exhibition space (100 m²) specifically designed for large machinery, equipment demonstrations and outdoor displays that require additional space or loading access.' },
  { question: 'Can I register as a buyer without exhibiting?', answer: 'Yes. The GEGD Buyer Programme is designed for organisations and individuals who want to buy, source, distribute, invest or establish commercial relationships. You can register as a buyer without exhibiting at the event.' },
];
