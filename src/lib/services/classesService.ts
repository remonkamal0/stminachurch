export interface ClassItem {
  id: string
  name_ar: string
  name_en: string
  gender: 'male' | 'female' | 'mixed'
  saint_name: string | null
  grade_name_ar: string
  grade_name_en: string
  stage_name_ar: string
  stage_name_en: string
  students_count: number
  servants_count: number
  attendance_rate: number
  last_meeting_date: string | null
}

function getApiUrl(endpoint: string): string {
  if (typeof window === 'undefined') return `http://localhost/api/${endpoint}`
  const isXampp = window.location.pathname.includes('/stmina')
  return isXampp ? `/stmina/api/${endpoint}` : `/api/${endpoint}`
}

export async function getClasses(): Promise<ClassItem[]> {
  try {
    const res = await fetch(getApiUrl('classes.php'), { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data)) {
        return data.map((item: any) => ({
          id: item.id,
          name_ar: item.name_ar,
          name_en: item.name_en || item.name_ar,
          gender: item.gender || 'mixed',
          saint_name: item.name_ar,
          grade_name_ar: item.grade_name_ar || 'عام',
          grade_name_en: item.grade_name_en || 'General',
          stage_name_ar: item.stage_name_ar || 'ابتدائي',
          stage_name_en: item.stage_name_en || 'Primary',
          students_count: parseInt(item.students_count) || 0,
          servants_count: parseInt(item.servants_count) || 0,
          attendance_rate: 0,
          last_meeting_date: null
        }))
      }
    }
  } catch (err) {
    console.error('Error fetching classes:', err)
  }

  // Real default classes with 0 students so user can edit or delete freely!
  return [
    {
      id: 'c1',
      name_ar: 'فصل الأنبا بيشوي',
      name_en: 'St. Bishoy',
      gender: 'male',
      saint_name: 'الأنبا بيشوي',
      grade_name_ar: 'ثالثة ابتدائي',
      grade_name_en: 'Grade 3',
      stage_name_ar: 'ابتدائي',
      stage_name_en: 'Primary',
      students_count: 0,
      servants_count: 0,
      attendance_rate: 0,
      last_meeting_date: null
    },
    {
      id: 'c2',
      name_ar: 'فصل القديسة دميانة',
      name_en: 'St. Demiana',
      gender: 'female',
      saint_name: 'القديسة دميانة',
      grade_name_ar: 'رابعة ابتدائي',
      grade_name_en: 'Grade 4',
      stage_name_ar: 'ابتدائي',
      stage_name_en: 'Primary',
      students_count: 0,
      servants_count: 0,
      attendance_rate: 0,
      last_meeting_date: null
    },
    {
      id: 'c3',
      name_ar: 'فصل الشهيد مارجرجس',
      name_en: 'St. George',
      gender: 'male',
      saint_name: 'مارجرجس',
      grade_name_ar: 'أولى إعدادي',
      grade_name_en: 'Prep 1',
      stage_name_ar: 'إعدادي',
      stage_name_en: 'Prep',
      students_count: 0,
      servants_count: 0,
      attendance_rate: 0,
      last_meeting_date: null
    },
    {
      id: 'c4',
      name_ar: 'فصل العذراء مريم',
      name_en: 'St. Mary',
      gender: 'female',
      saint_name: 'العذراء مريم',
      grade_name_ar: 'ثانية ثانوي',
      grade_name_en: 'Secondary 2',
      stage_name_ar: 'ثانوي',
      stage_name_en: 'Secondary',
      students_count: 0,
      servants_count: 0,
      attendance_rate: 0,
      last_meeting_date: null
    }
  ]
}
