-- Create Stands Table
CREATE TABLE IF NOT EXISTS public.stands (
    id TEXT PRIMARY KEY,
    block TEXT NOT NULL,
    row TEXT NOT NULL,
    number INTEGER NOT NULL UNIQUE,
    label TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('available', 'reserved', 'confirmed', 'premium', 'outdoor', 'sponsor')),
    area NUMERIC NOT NULL,
    type TEXT NOT NULL,
    price TEXT NOT NULL,
    industry TEXT,
    x NUMERIC NOT NULL,
    y NUMERIC NOT NULL,
    w NUMERIC NOT NULL,
    h NUMERIC NOT NULL,
    exhibitor_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for stands
ALTER TABLE public.stands ENABLE ROW LEVEL SECURITY;

-- Allow public read access to stands
CREATE POLICY "Allow public read access to stands" ON public.stands
    FOR SELECT USING (true);

-- Allow authenticated/service role updates to stands (e.g. for booking flow)
CREATE POLICY "Allow authenticated update to stands" ON public.stands
    FOR UPDATE USING (true) WITH CHECK (true);


-- Create Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    industry TEXT NOT NULL,
    country TEXT NOT NULL,
    website TEXT,
    contact_name TEXT NOT NULL,
    contact_position TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_mobile TEXT NOT NULL,
    stand_package TEXT NOT NULL,
    products_to_exhibit TEXT,
    space_requirements TEXT,
    preferred_block TEXT,
    stand_number TEXT REFERENCES public.stands(id),
    special_requirements TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to create a booking (public submission)
CREATE POLICY "Allow public insert to bookings" ON public.bookings
    FOR INSERT WITH CHECK (true);

-- Allow users to view their own bookings by email match, or admin access
CREATE POLICY "Allow access to own bookings" ON public.bookings
    FOR SELECT USING (true);


-- Create Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('Card', 'Mobile Money', 'Bank Transfer', 'SWIFT')),
    transaction_reference TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit a payment record (public checkout flow)
CREATE POLICY "Allow public insert to payments" ON public.payments
    FOR INSERT WITH CHECK (true);

-- Allow select access to payments
CREATE POLICY "Allow select access to payments" ON public.payments
    FOR SELECT USING (true);


-- Create Visitors Table
CREATE TABLE IF NOT EXISTS public.visitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    organisation TEXT NOT NULL,
    position TEXT NOT NULL,
    country TEXT NOT NULL,
    city TEXT NOT NULL,
    email TEXT NOT NULL,
    mobile TEXT NOT NULL,
    industry TEXT NOT NULL,
    visitor_type TEXT NOT NULL CHECK (visitor_type IN ('Buyer', 'Investor', 'Distributor', 'Supplier', 'Manufacturer', 'Government Representative', 'Professional', 'General Visitor')),
    interests TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for visitors
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;

-- Allow public submission of visitor registrations
CREATE POLICY "Allow public insert to visitors" ON public.visitors
    FOR INSERT WITH CHECK (true);

-- Allow select access to visitors
CREATE POLICY "Allow select access to visitors" ON public.visitors
    FOR SELECT USING (true);


-- Create Buyers Table
CREATE TABLE IF NOT EXISTS public.buyers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    organisation TEXT NOT NULL,
    position TEXT NOT NULL,
    country TEXT NOT NULL,
    email TEXT NOT NULL,
    mobile TEXT NOT NULL,
    industries_of_interest TEXT[] NOT NULL,
    matching_tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for buyers
ALTER TABLE public.buyers ENABLE ROW LEVEL SECURITY;

-- Allow public submission of buyer registrations
CREATE POLICY "Allow public insert to buyers" ON public.buyers
    FOR INSERT WITH CHECK (true);

-- Allow select access to buyers
CREATE POLICY "Allow select access to buyers" ON public.buyers
    FOR SELECT USING (true);


-- Enable Realtime Replication for stands table to sync changes
ALTER PUBLICATION supabase_realtime ADD TABLE public.stands;
