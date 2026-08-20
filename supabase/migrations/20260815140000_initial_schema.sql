-- Enable UUID extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ORGANIZATION STRUCTURE TABLES
CREATE TABLE churches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    church_id UUID REFERENCES churches(id) ON DELETE CASCADE NOT NULL,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    responsible_priest TEXT,
    responsible_servant TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES services(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE NOT NULL,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    sequence_order INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stage_id UUID REFERENCES stages(id) ON DELETE CASCADE NOT NULL,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    sequence_order INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grade_id UUID REFERENCES grades(id) ON DELETE CASCADE NOT NULL,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'mixed')) NOT NULL,
    saint_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    archived_at TIMESTAMP WITH TIME ZONE
);

-- 2. CONFESSION FATHERS
CREATE TABLE confession_fathers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    church_id UUID REFERENCES churches(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. STUDENTS & GUARDIANS TABLES
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    church_id UUID REFERENCES churches(id) NOT NULL,
    numeric_code SERIAL UNIQUE,
    qr_code VARCHAR(100) UNIQUE NOT NULL,
    photo_url TEXT,
    first_name TEXT NOT NULL,
    second_name TEXT NOT NULL,
    third_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female')) NOT NULL,
    birth_date DATE NOT NULL,
    email TEXT,
    school TEXT,
    area TEXT,
    address TEXT,
    location_coordinates TEXT,
    confession_father_id UUID REFERENCES confession_fathers(id) ON DELETE SET NULL,
    confession_last_date DATE,
    talents TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    notes TEXT,
    status VARCHAR(30) DEFAULT 'active' CHECK (status IN ('active', 'irregular', 'inactive', 'transferred', 'archived')) NOT NULL,
    custom_fields JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE guardians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    relationship VARCHAR(20) CHECK (relationship IN ('father', 'mother', 'other')) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email TEXT,
    job TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE student_guardians (
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    guardian_id UUID REFERENCES guardians(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false NOT NULL,
    PRIMARY KEY (student_id, guardian_id)
);

CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE NOT NULL,
    stage_id UUID REFERENCES stages(id) NOT NULL,
    grade_id UUID REFERENCES grades(id) NOT NULL,
    class_id UUID REFERENCES classes(id) NOT NULL,
    status VARCHAR(30) DEFAULT 'active' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(student_id, academic_year_id)
);

CREATE TABLE student_custom_field_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    church_id UUID REFERENCES churches(id) ON DELETE CASCADE NOT NULL,
    field_name TEXT NOT NULL,
    field_label_ar TEXT NOT NULL,
    field_label_en TEXT NOT NULL,
    field_type VARCHAR(20) CHECK (field_type IN ('text', 'number', 'boolean', 'date', 'select')) NOT NULL,
    options JSONB DEFAULT '[]'::jsonb,
    is_required BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. SERVANTS SYSTEM
CREATE TABLE servants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE, -- Nullable initially (for pending invitations)
    church_id UUID REFERENCES churches(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    birth_date DATE,
    phone VARCHAR(20) NOT NULL,
    email TEXT NOT NULL,
    address TEXT,
    confession_father_id UUID REFERENCES confession_fathers(id) ON DELETE SET NULL,
    service_start_date DATE,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. ROLES & PERMISSIONS (RBAC)
CREATE TABLE roles (
    id VARCHAR(50) PRIMARY KEY,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description TEXT
);

CREATE TABLE permissions (
    id VARCHAR(100) PRIMARY KEY,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    category VARCHAR(50) NOT NULL
);

CREATE TABLE role_permissions (
    role_id VARCHAR(50) REFERENCES roles(id) ON DELETE CASCADE,
    permission_id VARCHAR(100) REFERENCES permissions(id) ON DELETE CASCADE,
    scope VARCHAR(30) DEFAULT 'own' CHECK (scope IN ('all_churches', 'entire_church', 'entire_service', 'own_stage', 'own_grade', 'own_class', 'assigned_students', 'own', 'none')) NOT NULL,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE servant_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    servant_id UUID REFERENCES servants(id) ON DELETE CASCADE NOT NULL,
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE NOT NULL,
    role_id VARCHAR(50) REFERENCES roles(id) NOT NULL,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    stage_id UUID REFERENCES stages(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. ATTENDANCE & MEETINGS
CREATE TABLE meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE NOT NULL,
    stage_id UUID REFERENCES stages(id) ON DELETE CASCADE NOT NULL,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE, -- Null means full stage meeting
    date DATE NOT NULL,
    time TIME NOT NULL,
    type VARCHAR(30) DEFAULT 'weekly' CHECK (type IN ('weekly', 'spiritual', 'activity', 'other')) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
    status VARCHAR(20) DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'excused')) NOT NULL,
    points_earned INT DEFAULT 0 NOT NULL,
    recorded_by UUID REFERENCES servants(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(meeting_id, student_id)
);

-- 7. DYNAMIC FOLLOW-UPS SYSTEM
CREATE TABLE followup_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES services(id) ON DELETE CASCADE NOT NULL,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    icon TEXT DEFAULT 'phone',
    color TEXT DEFAULT 'blue',
    frequency VARCHAR(20) DEFAULT 'weekly' CHECK (frequency IN ('daily', 'weekly', 'monthly', 'any')) NOT NULL,
    include_in_report BOOLEAN DEFAULT true NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE followup_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
    type_id UUID REFERENCES followup_types(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    servant_id UUID REFERENCES servants(id) ON DELETE CASCADE NOT NULL,
    action VARCHAR(50) CHECK (action IN ('contacted', 'no_answer', 'contacted_father', 'contacted_mother', 'visited', 'returned', 'needs_followup', 'other')) NOT NULL,
    notes TEXT,
    next_followup_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. TALENTS
CREATE TABLE talents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES services(id) ON DELETE CASCADE NOT NULL,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE student_talents (
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    talent_id UUID REFERENCES talents(id) ON DELETE CASCADE,
    PRIMARY KEY (student_id, talent_id)
);

-- 9. DYNAMIC FORMS BUILDER
CREATE TABLE forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES services(id) ON DELETE CASCADE NOT NULL,
    title_ar TEXT NOT NULL,
    title_en TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE form_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID REFERENCES forms(id) ON DELETE CASCADE NOT NULL,
    field_name TEXT NOT NULL,
    label_ar TEXT NOT NULL,
    label_en TEXT NOT NULL,
    type VARCHAR(30) CHECK (type IN ('text', 'number', 'select', 'checkbox', 'date', 'textarea')) NOT NULL,
    options JSONB DEFAULT '[]'::jsonb,
    is_required BOOLEAN DEFAULT false NOT NULL,
    sequence_order INT NOT NULL
);

CREATE TABLE form_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID REFERENCES forms(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
    servant_id UUID REFERENCES servants(id) ON DELETE CASCADE NOT NULL,
    answers JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. POINTS & REWARDS SYSTEM
CREATE TABLE points_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES services(id) ON DELETE CASCADE NOT NULL,
    rule_name_ar TEXT NOT NULL,
    rule_name_en TEXT NOT NULL,
    points INT NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE points_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
    points INT NOT NULL, -- Negative for redemption
    type VARCHAR(20) CHECK (type IN ('earned', 'redeemed')) NOT NULL,
    description_ar TEXT NOT NULL,
    description_en TEXT NOT NULL,
    related_entity_type VARCHAR(50), -- 'attendance', 'followup', 'reward'
    related_entity_id UUID,
    created_by UUID REFERENCES servants(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES services(id) ON DELETE CASCADE NOT NULL,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    image_url TEXT,
    points_cost INT NOT NULL,
    stock INT DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE reward_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
    reward_id UUID REFERENCES rewards(id) ON DELETE CASCADE NOT NULL,
    points_deducted INT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'delivered')) NOT NULL,
    servant_id UUID REFERENCES servants(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. FINANCE MODULE
CREATE TABLE finance_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES services(id) ON DELETE CASCADE NOT NULL,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    type VARCHAR(10) CHECK (type IN ('income', 'expense')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE finance_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES services(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES finance_categories(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    description TEXT NOT NULL,
    attachment_url TEXT,
    recorded_by UUID REFERENCES servants(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. CURRICULUM & FILE LIBRARY
CREATE TABLE curriculum_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES services(id) ON DELETE CASCADE NOT NULL,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE curriculum_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES curriculum_categories(id) ON DELETE CASCADE NOT NULL,
    stage_id UUID REFERENCES stages(id) ON DELETE CASCADE,
    grade_id UUID REFERENCES grades(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT,
    file_format VARCHAR(20), -- pdf, pptx, docx, image, audio, video_link
    external_link TEXT,
    uploaded_by UUID REFERENCES servants(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. AUDIT LOGS
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID, -- auth.uid()
    action VARCHAR(100) NOT NULL, -- e.g. "student:create", "attendance:delete"
    table_name VARCHAR(100) NOT NULL,
    record_id UUID,
    before_state JSONB,
    after_state JSONB,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 14. SEED ROLES
INSERT INTO roles (id, name_ar, name_en, description) VALUES
('super_admin', 'مدير عام النظام', 'Super Admin', 'Full control over the entire application settings and databases'),
('church_admin', 'مدير الكنيسة', 'Church Admin', 'Manages a specific church, services, and core settings'),
('service_admin', 'أمين عام الخدمة', 'Service Admin', 'Manages service configurations, servants assignments, and finance'),
('stage_leader', 'أمين المرحلة', 'Stage Leader', 'Overlooks classes, servants, and attendance in a specific stage'),
('class_leader', 'أمين الفصل', 'Class Leader', 'Responsible for class records, attendance logs, and notifications'),
('servant', 'خادم', 'Servant', 'Views profiles, logs attendance, and records visitations for their classes'),
('attendance_servant', 'خادم تسجيل حضور', 'Attendance Servant', 'Only permitted to register student attendance in meetings'),
('followup_servant', 'خادم افتقاد', 'Follow-up Servant', 'Only permitted to log calls and home visitations'),
('viewer', 'مشاهد', 'Viewer', 'Read-only access to specific stage or class reports');
