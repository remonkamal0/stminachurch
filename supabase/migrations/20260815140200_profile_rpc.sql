-- RPC to fetch user profile, roles, assignments, and aggregated permission scopes
CREATE OR REPLACE FUNCTION get_my_profile()
RETURNS JSONB AS $$
DECLARE
    v_profile JSONB;
BEGIN
    SELECT jsonb_build_object(
        'servant', jsonb_build_object(
            'id', s.id,
            'name', s.name,
            'email', s.email,
            'phone', s.phone,
            'status', s.status,
            'church_id', s.church_id
        ),
        'assignments', COALESCE(
            (
                SELECT jsonb_agg(jsonb_build_object(
                    'role_id', sa.role_id,
                    'class_id', sa.class_id,
                    'class_name_ar', (SELECT c.name_ar FROM classes c WHERE c.id = sa.class_id),
                    'class_name_en', (SELECT c.name_en FROM classes c WHERE c.id = sa.class_id),
                    'stage_id', sa.stage_id,
                    'stage_name_ar', (SELECT st.name_ar FROM stages st WHERE st.id = sa.stage_id),
                    'stage_name_en', (SELECT st.name_en FROM stages st WHERE st.id = sa.stage_id),
                    'service_id', sa.service_id,
                    'service_name_ar', (SELECT sv.name_ar FROM services sv WHERE sv.id = sa.service_id),
                    'service_name_en', (SELECT sv.name_en FROM services sv WHERE sv.id = sa.service_id),
                    'academic_year_id', sa.academic_year_id
                )) 
                FROM servant_assignments sa 
                WHERE sa.servant_id = s.id
                  AND sa.academic_year_id IN (SELECT id FROM academic_years WHERE is_active = true)
            ),
            '[]'::jsonb
        ),
        'permissions', COALESCE(
            (
                SELECT jsonb_object_agg(rp.permission_id, rp.scope)
                FROM servant_assignments sa
                JOIN role_permissions rp ON sa.role_id = rp.role_id
                WHERE sa.servant_id = s.id
                  AND sa.academic_year_id IN (SELECT id FROM academic_years WHERE is_active = true)
            ),
            '{}'::jsonb
        )
    ) INTO v_profile
    FROM servants s
    WHERE s.user_id = auth.uid()
    LIMIT 1;

    RETURN v_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
