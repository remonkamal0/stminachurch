import { createClient } from '../supabase/client'

export interface MeetingItem {
  id: string
  date: string
  time: string
  class_id: string | null
  class_name: string
  stage_name: string
  type: 'weekly' | 'spiritual' | 'activity' | 'other'
  notes: string | null
  present_count: number
  absent_count: number
}

const mockMeetings: MeetingItem[] = [
  {
    id: 'm1',
    date: '2026-08-16',
    time: '09:00',
    class_id: 'c1',
    class_name: 'الأنبا بيشوي',
    stage_name: 'ابتدائي',
    type: 'weekly',
    notes: 'اجتماع الأحد العادي - دراسة قصة داود وجليات',
    present_count: 21,
    absent_count: 3
  },
  {
    id: 'm2',
    date: '2026-08-16',
    time: '09:00',
    class_id: 'c2',
    class_name: 'القديسة دميانة',
    stage_name: 'ابتدائي',
    type: 'weekly',
    notes: 'الاجتماع الأسبوعي - ورشة عمل صلصال',
    present_count: 26,
    absent_count: 2
  },
  {
    id: 'm3',
    date: '2026-08-14',
    time: '18:00',
    class_id: null,
    class_name: 'كل الفصول (مرحلي)',
    stage_name: 'إعدادي',
    type: 'spiritual',
    notes: 'اجتماع روحي مسائي للمرحلة بالكامل',
    present_count: 55,
    absent_count: 12
  }
]

export async function getMeetings(): Promise<MeetingItem[]> {
  try {
    const supabase = createClient()
    const query = supabase
      .from('meetings')
      .select('*, class:classes(name_ar), stage:stages(name_ar)')
      
    // 500ms timeout race to prevent hanging when offline/unreachable
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Supabase timeout')), 500)
    )

    const { data, error } = await Promise.race([
      Promise.resolve(query),
      timeoutPromise
    ])
      
    if (error || !data || data.length === 0) throw error || new Error('No meetings')

    return data.map((item: any) => ({
      id: item.id,
      date: item.date,
      time: item.time,
      class_id: item.class_id,
      class_name: item.class?.name_ar || 'اجتماع عام',
      stage_name: item.stage?.name_ar || '',
      type: item.type,
      notes: item.notes,
      present_count: 0,
      absent_count: 0
    }))
  } catch (e) {
    console.warn('Supabase fetch failed, falling back to mock meetings:', e)
    return mockMeetings
  }
}
