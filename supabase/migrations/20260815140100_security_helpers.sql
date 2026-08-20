-- SECURITY HELPER FUNCTIONS FOR SCOPE-BASED RBAC

-- Helper: Get servant ID for the current authenticated user
CREATE OR REPLACE FUNCTION get_my_servant_id()
RETURNS UUID AS $$
    SELECT id FROM servants WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper: Get active academic years
CREATE OR REPLACE FUNCTION get_active_academic_years()
RETURNS TABLE (id UUID) AS $$
    SELECT id FROM academic_years WHERE is_active = true;
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper: Get assigned class IDs for active academic year
CREATE OR REPLACE FUNCTION get_my_assigned_classes()
RETURNS TABLE (class_id UUID) AS $$
    SELECT sa.class_id FROM servant_assignments sa
    WHERE sa.servant_id = get_my_servant_id()
      AND sa.academic_year_id IN (SELECT ay.id FROM academic_years ay WHERE ay.is_active = true)
      AND sa.class_id IS NOT NULL;
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper: Get assigned stage IDs for active academic year
CREATE OR REPLACE FUNCTION get_my_assigned_stages()
RETURNS TABLE (stage_id UUID) AS $$
    SELECT sa.stage_id FROM servant_assignments sa
    WHERE sa.servant_id = get_my_servant_id()
      AND sa.academic_year_id IN (SELECT ay.id FROM academic_years ay WHERE ay.is_active = true)
      AND sa.stage_id IS NOT NULL
    UNION
    SELECT g.stage_id FROM classes c
    JOIN grades g ON c.grade_id = g.id
    WHERE c.id IN (SELECT class_id FROM get_my_assigned_classes());
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper: Get assigned service IDs for active academic year
CREATE OR REPLACE FUNCTION get_my_assigned_services()
RETURNS TABLE (service_id UUID) AS $$
    SELECT sa.service_id FROM servant_assignments sa
    WHERE sa.servant_id = get_my_servant_id()
      AND sa.academic_year_id IN (SELECT ay.id FROM academic_years ay WHERE ay.is_active = true)
      AND sa.service_id IS NOT NULL
    UNION
    SELECT s.id FROM stages st
    JOIN academic_years ay ON st.academic_year_id = ay.id
    JOIN services s ON ay.service_id = s.id
    WHERE st.id IN (SELECT stage_id FROM get_my_assigned_stages());
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper: Check user permission and scope
CREATE OR REPLACE FUNCTION get_my_permission_scope(perm_name TEXT)
RETURNS VARCHAR(30) AS $$
DECLARE
    v_scope VARCHAR(30);
BEGIN
    -- Superadmins automatically get all_churches
    IF EXISTS (
        SELECT 1 FROM servant_assignments
        WHERE servant_id = get_my_servant_id() AND role_id = 'super_admin'
    ) THEN
        RETURN 'all_churches';
    END IF;

    SELECT scope INTO v_scope
    FROM servant_assignments sa
    JOIN role_permissions rp ON sa.role_id = rp.role_id
    WHERE sa.servant_id = get_my_servant_id() 
      AND sa.academic_year_id IN (SELECT ay.id FROM academic_years ay WHERE ay.is_active = true)
      AND rp.permission_id = perm_name
    ORDER BY 
      CASE scope
        WHEN 'all_churches' THEN 1
        WHEN 'entire_church' THEN 2
        WHEN 'entire_service' THEN 3
        WHEN 'own_stage' THEN 4
        WHEN 'own_grade' THEN 5
        WHEN 'own_class' THEN 6
        WHEN 'assigned_students' THEN 7
        WHEN 'own' THEN 8
        ELSE 9
      END ASC
    LIMIT 1;
    
    RETURN COALESCE(v_scope, 'none');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ENABLE RLS ON ALL SCHEMAS
ALTER TABLE churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE servants ENABLE ROW LEVEL SECURITY;
ALTER TABLE servant_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE followup_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE followup_records ENABLE ROW LEVEL SECURITY;

-- 1. CHURCHES RLS POLICIES
CREATE POLICY select_churches ON churches FOR SELECT USING (
    get_my_permission_scope('churches:view') IN ('all_churches', 'entire_church')
);
CREATE POLICY modify_churches ON churches FOR ALL USING (
    get_my_permission_scope('churches:manage') = 'all_churches'
);

-- 2. SERVICES RLS POLICIES
CREATE POLICY select_services ON services FOR SELECT USING (
    get_my_permission_scope('services:view') = 'all_churches' OR
    (get_my_permission_scope('services:view') IN ('entire_church', 'entire_service') AND church_id = (SELECT church_id FROM servants WHERE id = get_my_servant_id()))
);

-- 3. CLASSES RLS POLICIES
CREATE POLICY select_classes ON classes FOR SELECT USING (
    get_my_permission_scope('classes:view') IN ('all_churches', 'entire_church', 'entire_service') OR
    (get_my_permission_scope('classes:view') = 'own_stage' AND grade_id IN (SELECT g.id FROM grades g WHERE g.stage_id IN (SELECT stage_id FROM get_my_assigned_stages()))) OR
    (get_my_permission_scope('classes:view') = 'own_class' AND id IN (SELECT class_id FROM get_my_assigned_classes()))
);

-- 4. STUDENTS RLS POLICIES
CREATE POLICY select_students ON students FOR SELECT USING (
    get_my_permission_scope('students:view') IN ('all_churches', 'entire_church', 'entire_service') OR
    (get_my_permission_scope('students:view') = 'own_stage' AND id IN (
        SELECT student_id FROM enrollments WHERE stage_id IN (SELECT stage_id FROM get_my_assigned_stages())
    )) OR
    (get_my_permission_scope('students:view') = 'own_class' AND id IN (
        SELECT student_id FROM enrollments WHERE class_id IN (SELECT class_id FROM get_my_assigned_classes())
    ))
);

CREATE POLICY modify_students ON students FOR ALL USING (
    get_my_permission_scope('students:edit') IN ('all_churches', 'entire_church', 'entire_service') OR
    (get_my_permission_scope('students:edit') = 'own_stage' AND id IN (
        SELECT student_id FROM enrollments WHERE stage_id IN (SELECT stage_id FROM get_my_assigned_stages())
    )) OR
    (get_my_permission_scope('students:edit') = 'own_class' AND id IN (
        SELECT student_id FROM enrollments WHERE class_id IN (SELECT class_id FROM get_my_assigned_classes())
    ))
);

-- 5. ATTENDANCE RLS POLICIES
CREATE POLICY select_attendance ON attendance FOR SELECT USING (
    get_my_permission_scope('attendance:view') IN ('all_churches', 'entire_church', 'entire_service') OR
    (get_my_permission_scope('attendance:view') = 'own_stage' AND student_id IN (
        SELECT student_id FROM enrollments WHERE stage_id IN (SELECT stage_id FROM get_my_assigned_stages())
    )) OR
    (get_my_permission_scope('attendance:view') = 'own_class' AND student_id IN (
        SELECT student_id FROM enrollments WHERE class_id IN (SELECT class_id FROM get_my_assigned_classes())
    ))
);

CREATE POLICY insert_attendance ON attendance FOR INSERT WITH CHECK (
    get_my_permission_scope('attendance:record') IN ('all_churches', 'entire_church', 'entire_service') OR
    (get_my_permission_scope('attendance:record') = 'own_stage' AND student_id IN (
        SELECT student_id FROM enrollments WHERE stage_id IN (SELECT stage_id FROM get_my_assigned_stages())
    )) OR
    (get_my_permission_scope('attendance:record') = 'own_class' AND student_id IN (
        SELECT student_id FROM enrollments WHERE class_id IN (SELECT class_id FROM get_my_assigned_classes())
    ))
);
