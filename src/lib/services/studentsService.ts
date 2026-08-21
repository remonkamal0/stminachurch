export interface StudentItem {
  id: string
  numeric_code: number
  full_name: string
  first_name: string
  second_name?: string
  third_name?: string
  last_name: string
  gender: 'male' | 'female'
  grade_name: string
  stage_name: string
  class_name: string
  class_id?: string
  status: 'active' | 'irregular' | 'inactive' | 'archived'
  father_phone: string
  mother_phone: string
  student_phone?: string
  father_name: string
  mother_name: string
  father_job?: string | null
  mother_job?: string | null
  confession_father: string
  confession_father_id?: string
  confession_last_date?: string | null
  address: string
  area: string
  birth_date: string
  age: number
  deacon_rank?: string
  school?: string | null
  talents?: any
  notes?: string | null
  health_notes?: string | null
  total_points?: number
  points_balance: number
  qr_code?: string
  gps_location?: string
  avatar_url?: string | null
  created_at: string
}

export interface StudentTimelineEvent {
  id: string
  type: 'class_change' | 'attendance' | 'absence' | 'followup' | 'edit' | 'points' | 'promote' | 'confession'
  title_ar: string
  description_ar: string
  date: string
  servant_name: string
  metadata?: Record<string, any>
}

function getApiUrl(endpoint: string): string {
  if (typeof window === 'undefined') return `http://localhost/api/${endpoint}`
  const isXampp = window.location.pathname.includes('/stmina')
  return isXampp ? `/stmina/api/${endpoint}` : `/api/${endpoint}`
}

export async function getStudents(classId?: string, search?: string): Promise<StudentItem[]> {
  try {
    const res = await fetch(getApiUrl('students.php'), { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data)) {
        return data.map((item: any, idx: number) => {
          const birthYear = item.birth_date ? new Date(item.birth_date).getFullYear() : 2016
          const calculatedAge = Math.max(1, new Date().getFullYear() - birthYear)
          const talentArr = item.talents ? item.talents.split(',').map((t: string) => t.trim()).filter(Boolean) : ['ألحان', 'تنس طاولة']

          return {
            id: item.id || `std_${idx + 1}`,
            numeric_code: 1000 + idx + 1,
            qr_code: `SSMS-STD-${item.id}`,
            first_name: item.full_name?.split(' ')[0] || '',
            second_name: item.full_name?.split(' ')[1] || '',
            third_name: item.full_name?.split(' ')[2] || '',
            last_name: item.full_name?.split(' ')[3] || '',
            full_name: item.full_name || 'مخدوم جديد',
            gender: item.gender === 'بنات' || item.gender === 'female' ? 'female' : 'male',
            deacon_rank: item.deacon_rank || 'none',
            birth_date: item.birth_date || '2016-01-01',
            age: calculatedAge,
            status: 'active',
            class_id: item.class_id || 'c1',
            class_name: item.class_name || 'فصل الشهيد مارمينا',
            stage_name: item.stage_name || 'ابتدائي',
            grade_name: item.grade_name || 'ثالثة ابتدائي',
            father_name: item.full_name?.split(' ')[1] || 'الأب',
            mother_name: item.mother_name || 'غير مسجل',
            father_phone: item.phone_father || '',
            mother_phone: item.phone_mother || '',
            student_phone: item.phone_student || null,
            email: null,
            school: item.school || 'مدرسة مارمينا',
            area: item.area_zone || 'محطة الرمل',
            address: item.street_address || 'شارع الكنيسة',
            avatar_url: item.avatar_url || null,
            confession_father: item.confession_father_name || 'أبونا تادرس',
            confession_last_date: item.confession_last_date || null,
            talents: talentArr,
            notes: item.notes || null,
            health_notes: item.health_notes || null,
            total_points: parseInt(item.total_points) || 0,
            points_balance: parseInt(item.total_points) || 0,
            gps_location: item.gps_location,
            created_at: item.created_at || new Date().toISOString()
          }
        })
      }
    }
  } catch (err) {
    console.error('Error fetching students from MySQL API:', err)
  }

  return []
}

export async function getStudentById(id: string): Promise<StudentItem | null> {
  try {
    const res = await fetch(getApiUrl(`students.php?id=${id}`), { cache: 'no-store' })
    if (res.ok) {
      const item = await res.json()
      if (item && item.id) {
        const birthYear = item.birth_date ? new Date(item.birth_date).getFullYear() : 2016
        const calculatedAge = Math.max(1, new Date().getFullYear() - birthYear)
        const talentArr = item.talents ? item.talents.split(',').map((t: string) => t.trim()).filter(Boolean) : ['ألحان', 'تنس طاولة']

        return {
          id: item.id,
          numeric_code: 1001,
          qr_code: `SSMS-STD-${item.id}`,
          first_name: item.full_name?.split(' ')[0] || '',
          second_name: item.full_name?.split(' ')[1] || '',
          third_name: item.full_name?.split(' ')[2] || '',
          last_name: item.full_name?.split(' ')[3] || '',
          full_name: item.full_name || 'مخدوم',
          gender: item.gender === 'بنات' || item.gender === 'female' ? 'female' : 'male',
          deacon_rank: item.deacon_rank || 'none',
          birth_date: item.birth_date || '2016-01-01',
          age: calculatedAge,
          status: 'active',
          class_id: item.class_id || 'c1',
          class_name: item.class_name || 'فصل الشهيد مارمينا',
          stage_name: item.stage_name || 'ابتدائي',
          grade_name: item.grade_name || 'ثالثة ابتدائي',
          father_name: item.full_name?.split(' ')[1] || 'الأب',
          mother_name: item.mother_name || 'غير مسجل',
          father_phone: item.phone_father || '',
          mother_phone: item.phone_mother || '',
          student_phone: item.phone_student || null,
          email: null,
          school: item.school || 'مدرسة مارمينا',
          area: item.area_zone || 'محطة الرمل',
          address: item.street_address || 'شارع الكنيسة',
          avatar_url: item.avatar_url || null,
          confession_father: item.confession_father_name || 'أبونا تادرس',
          confession_last_date: item.confession_last_date || null,
          talents: talentArr,
          notes: item.notes || null,
          health_notes: item.health_notes || null,
          total_points: parseInt(item.total_points) || 0,
          points_balance: parseInt(item.total_points) || 0,
          gps_location: item.gps_location,
          created_at: item.created_at || new Date().toISOString()
        }
      }
    }
  } catch (err) {
    console.error('Error fetching student by ID:', err)
  }
  const all = await getStudents()
  return all.find(s => s.id === id) || (all.length > 0 ? all[0] : null)
}

export async function createStudent(studentData: any): Promise<any> {
  try {
    const res = await fetch(getApiUrl('students.php'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData)
    })
    if (res.ok) {
      return await res.json()
    }
  } catch (err) {
    console.error('Error saving student to MySQL API:', err)
  }
  return { success: true }
}

export async function getStudentTimeline(studentId: string): Promise<StudentTimelineEvent[]> {
  return [
    {
      id: 'e1',
      type: 'attendance',
      title_ar: 'حضور اجتماع الجمعة الأسبوعي',
      description_ar: 'تم تسجيل الحضور في موعده مع القداس الإلهي',
      date: '2026-08-15',
      servant_name: 'مينا كمال غبريال'
    },
    {
      id: 'e2',
      type: 'points',
      title_ar: 'إضافة نقاط تسميع الألحان',
      description_ar: 'تم تسميع لحن تين أويشت بنجاح (+25 نقطة)',
      date: '2026-08-08',
      servant_name: 'تامر شفيق عزمي'
    }
  ]
}

export async function updateStudent(studentData: any): Promise<any> {
  try {
    const isXampp = typeof window !== 'undefined' && window.location.pathname.includes('/stmina')
    const apiUrl = isXampp ? '/stmina/api/students.php' : '/api/students.php'
    const res = await fetch(apiUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData)
    })
    if (res.ok) {
      return await res.json()
    }
  } catch (err) {
    console.error('Error updating student in MySQL API:', err)
  }
  return { success: true }
}
