-- SMS SERVICES DATABASE MIGRATION

-- 1. Create tables

-- Properties Table
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'USA',
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    avatar_url TEXT,
    preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'ar')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Units Table
CREATE TABLE IF NOT EXISTS units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    unit_number TEXT NOT NULL,
    floor INTEGER,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'reserved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Leases Table
CREATE TABLE IF NOT EXISTS leases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    resident_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    monthly_rent NUMERIC(10, 2) NOT NULL,
    security_deposit NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'terminated', 'pending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Maintenance Requests Table
CREATE TABLE IF NOT EXISTS maintenance_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resident_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    request_number TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL CHECK (category IN ('plumbing', 'electrical', 'appliance', 'other')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    preferred_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'scheduled', 'closed', 'cancelled')),
    assigned_to TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Maintenance Attachments Table
CREATE TABLE IF NOT EXISTS maintenance_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    maintenance_request_id UUID NOT NULL REFERENCES maintenance_requests(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Charges Table (e.g. Rent, late fee)
CREATE TABLE IF NOT EXISTS charges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resident_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    lease_id UUID NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
    charge_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    amount NUMERIC(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'due' CHECK (status IN ('paid', 'upcoming', 'due', 'past_due')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resident_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    payment_method TEXT NOT NULL,
    transaction_reference TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'failed', 'refunded')),
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insurance Policies Table
CREATE TABLE IF NOT EXISTS insurance_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resident_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    policy_number TEXT NOT NULL,
    coverage_amount NUMERIC(10, 2) NOT NULL,
    deductible NUMERIC(10, 2) NOT NULL,
    effective_date DATE NOT NULL,
    expiration_date DATE NOT NULL,
    document_url TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'expiring_soon', 'pending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resident_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('maintenance', 'payment', 'insurance', 'general')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    related_entity_type TEXT,
    related_entity_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. ENABLE ROW LEVEL SECURITY

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 3. RLS POLICIES

-- profiles: Users can read and write only their own profile
CREATE POLICY "Users can view own profile" 
    ON profiles FOR SELECT 
    USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own profile" 
    ON profiles FOR UPDATE 
    USING (auth.uid() = auth_user_id);

-- leases: Residents can view their own leases
CREATE POLICY "Residents can view own leases" 
    ON leases FOR SELECT 
    USING (resident_id IN (
        SELECT id FROM profiles WHERE auth_user_id = auth.uid()
    ));

-- maintenance_requests: Residents can read and write their own requests
CREATE POLICY "Residents can view own maintenance requests" 
    ON maintenance_requests FOR SELECT 
    USING (resident_id IN (
        SELECT id FROM profiles WHERE auth_user_id = auth.uid()
    ));

CREATE POLICY "Residents can insert own maintenance requests" 
    ON maintenance_requests FOR INSERT 
    WITH CHECK (resident_id IN (
        SELECT id FROM profiles WHERE auth_user_id = auth.uid()
    ));

CREATE POLICY "Residents can update own maintenance requests" 
    ON maintenance_requests FOR UPDATE 
    USING (resident_id IN (
        SELECT id FROM profiles WHERE auth_user_id = auth.uid()
    ));

-- maintenance_attachments: Residents can view and add attachments for their own requests
CREATE POLICY "Residents can view attachments of own requests" 
    ON maintenance_attachments FOR SELECT 
    USING (maintenance_request_id IN (
        SELECT id FROM maintenance_requests WHERE resident_id IN (
            SELECT id FROM profiles WHERE auth_user_id = auth.uid()
        )
    ));

CREATE POLICY "Residents can insert attachments for own requests" 
    ON maintenance_attachments FOR INSERT 
    WITH CHECK (maintenance_request_id IN (
        SELECT id FROM maintenance_requests WHERE resident_id IN (
            SELECT id FROM profiles WHERE auth_user_id = auth.uid()
        )
    ));

-- charges: Residents can view their own charges
CREATE POLICY "Residents can view own charges" 
    ON charges FOR SELECT 
    USING (resident_id IN (
        SELECT id FROM profiles WHERE auth_user_id = auth.uid()
    ));

-- payments: Residents can view and record their own payments
CREATE POLICY "Residents can view own payments" 
    ON payments FOR SELECT 
    USING (resident_id IN (
        SELECT id FROM profiles WHERE auth_user_id = auth.uid()
    ));

CREATE POLICY "Residents can insert own payments" 
    ON payments FOR INSERT 
    WITH CHECK (resident_id IN (
        SELECT id FROM profiles WHERE auth_user_id = auth.uid()
    ));

-- insurance_policies: Residents can view and update their own insurance
CREATE POLICY "Residents can view own insurance policies" 
    ON insurance_policies FOR SELECT 
    USING (resident_id IN (
        SELECT id FROM profiles WHERE auth_user_id = auth.uid()
    ));

CREATE POLICY "Residents can insert own insurance policies" 
    ON insurance_policies FOR INSERT 
    WITH CHECK (resident_id IN (
        SELECT id FROM profiles WHERE auth_user_id = auth.uid()
    ));

CREATE POLICY "Residents can update own insurance policies" 
    ON insurance_policies FOR UPDATE 
    USING (resident_id IN (
        SELECT id FROM profiles WHERE auth_user_id = auth.uid()
    ));

-- notifications: Residents can view and update their own notifications
CREATE POLICY "Residents can view own notifications" 
    ON notifications FOR SELECT 
    USING (resident_id IN (
        SELECT id FROM profiles WHERE auth_user_id = auth.uid()
    ));

CREATE POLICY "Residents can update own notifications" 
    ON notifications FOR UPDATE 
    USING (resident_id IN (
        SELECT id FROM profiles WHERE auth_user_id = auth.uid()
    ));

-- 4. STORAGE BUCKETS SETUP

-- Note: In Supabase, buckets are created in storage.buckets
-- Setup inserts for buckets if they don't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES 
    ('avatars', 'avatars', true),
    ('property-images', 'property-images', true),
    ('maintenance-attachments', 'maintenance-attachments', false),
    ('insurance-documents', 'insurance-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for buckets
-- avatars: Anyone can view public avatars, authenticated users can upload their own
CREATE POLICY "Anyone can view avatars" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars" 
    ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- property-images: Anyone can view, only authenticated users/admins can upload (usually admins, but we'll allow authenticated select for read)
CREATE POLICY "Anyone can view property-images" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'property-images');

-- maintenance-attachments: Users can only read/write their own files. For simplicity, we filter by authenticated users (since the path will be sub-organized or validated via API, but we restrict to authenticated users)
CREATE POLICY "Authenticated users can view maintenance attachments" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'maintenance-attachments' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload maintenance attachments" 
    ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'maintenance-attachments' AND auth.role() = 'authenticated');

-- insurance-documents: Users can read/write their own insurance docs
CREATE POLICY "Authenticated users can view insurance documents" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'insurance-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload insurance documents" 
    ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'insurance-documents' AND auth.role() = 'authenticated');
