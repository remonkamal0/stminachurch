'use client'

import React, { useEffect, useState } from 'react'
import { Shell } from '@/components/layout/Shell'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { getMeetings, MeetingItem } from '@/lib/services/attendanceService'
import { getClasses, ClassItem } from '@/lib/services/classesService'
import Link from 'next/link'
import { Calendar, Plus, CheckSquare, Sparkles, AlertCircle, Trash, Check } from 'lucide-react'

export default function AttendancePage() {
  const { locale } = useLanguage()
  const [meetings, setMeetings] = useState<MeetingItem[]>([])
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [loading, setLoading] = useState(true)

  // Tabs: 'list' | 'scheduler'
  const [activeTab, setActiveTab] = useState<'list' | 'scheduler'>('list')

  // Filters State
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedStage, setSelectedStage] = useState('')
  const [selectedClass, setSelectedClass] = useState('')

  // Scheduler States
  const [stages, setStages] = useState<{ id: string; nameAr: string; nameEn: string; defaultDay: string; defaultDayLabel: string }[]>([])
  const [schedClasses, setSchedClasses] = useState<string[]>([])
  const [recurrenceDay, setRecurrenceDay] = useState<string>('5') // default Friday
  const [startDate, setStartDate] = useState('2026-09-01')
  const [endDate, setEndDate] = useState('2027-08-31')
  const [schedYear, setSchedYear] = useState('2026')
  const [schedStage, setSchedStage] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('academicStages')
    if (saved) {
      setStages(JSON.parse(saved))
    } else {
      const initial = [
        { id: 'primary', nameAr: 'ابتدائي', nameEn: 'Primary', defaultDay: '5', defaultDayLabel: 'الجمعة' },
        { id: 'prep', nameAr: 'إعدادي', nameEn: 'Prep', defaultDay: '6', defaultDayLabel: 'السبت' },
        { id: 'secondary', nameAr: 'ثانوي', nameEn: 'Secondary', defaultDay: '0', defaultDayLabel: 'الأحد' }
      ]
      setStages(initial)
      localStorage.setItem('academicStages', JSON.stringify(initial))
    }
  }, [])

  const handleStageChange = (stageName: string, currentClasses: ClassItem[]) => {
    setSchedStage(stageName)
    
    // Set day automatically from stages configuration
    const foundStage = stages.find(s => s.nameAr === stageName)
    if (foundStage) {
      setRecurrenceDay(foundStage.defaultDay)
    }

    // Filter and select all classes of this stage by default
    const filtered = currentClasses.filter((c: any) => 
      !stageName || c.stage_name === stageName || c.stage_name_ar === stageName || (c.stage_name && stageName.includes(c.stage_name))
    )
    setSchedClasses(filtered.map(c => c.id))
  }

  const handleYearChangeForSched = (year: string) => {
    setSchedYear(year)
    if (year === '2026') {
      setStartDate('2026-09-01')
      setEndDate('2027-08-31')
    } else if (year === '2025') {
      setStartDate('2025-09-01')
      setEndDate('2026-08-31')
    } else if (year === '2027') {
      setStartDate('2027-09-01')
      setEndDate('2028-08-31')
    }
  }
  
  const [generatedEvents, setGeneratedEvents] = useState<{ date: string; label: string; active: boolean }[]>([])
  const [showSaveAlert, setShowSaveAlert] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const isXampp = typeof window !== 'undefined' && window.location.pathname.includes('/stmina')
        const meetUrl = isXampp ? '/stmina/api/meetings.php' : '/api/meetings.php'
        const clsUrl = isXampp ? '/stmina/api/classes.php' : '/api/classes.php'
        const stgUrl = isXampp ? '/stmina/api/stages.php' : '/api/stages.php'

        const [mRes, cRes, sRes] = await Promise.all([
          fetch(meetUrl).catch(() => null),
          fetch(clsUrl).catch(() => null),
          fetch(stgUrl).catch(() => null)
        ])

        if (mRes && mRes.ok) {
          const mData = await mRes.json()
          if (Array.isArray(mData)) setMeetings(mData)
        }

        let loadedClasses: any[] = []
        let loadedStages: any[] = []

        if (cRes && cRes.ok) {
          const cData = await cRes.json()
          if (Array.isArray(cData)) {
            loadedClasses = cData
            setClasses(cData)
          }
        }

        if (sRes && sRes.ok) {
          const sData = await sRes.json()
          if (Array.isArray(sData) && sData.length > 0) {
            loadedStages = sData.map((s: any) => ({
              id: s.id,
              nameAr: s.name_ar,
              nameEn: s.name_ar,
              defaultDay: '5',
              defaultDayLabel: 'الجمعة'
            }))
            setStages(loadedStages)
          }
        }

        // Auto-select initial stage and its classes from MySQL
        const initialStgName = loadedStages[0]?.nameAr || 'ابتدائي'
        setSchedStage(initialStgName)
        const initialMatchingClasses = loadedClasses.filter(c => 
          c.stage_name === initialStgName || c.stage_name_ar === initialStgName || (c.stage_name && initialStgName.includes(c.stage_name))
        )
        setSchedClasses(initialMatchingClasses.map(c => c.id))
      } catch (e) {
        console.error('Error loading attendance data:', e)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Auto-generate weekly dates function
  const handlePreviewWeeklyMeetings = () => {
    if (!startDate || !endDate) return

    const start = new Date(startDate)
    const end = new Date(endDate)
    const eventsList: { date: string; label: string; active: boolean }[] = []
    
    const targetDay = parseInt(recurrenceDay, 10)
    const current = new Date(start)

    // Helper translation labels for events
    const stageLabel = schedStage || 'مدارس الأحد'
    const dayNames: Record<string, string> = {
      '0': `اجتماع ${stageLabel} الأسبوعي (الأحد)`,
      '1': `اجتماع ${stageLabel} الأسبوعي (الاثنين)`,
      '2': `اجتماع ${stageLabel} الأسبوعي (الثلاثاء)`,
      '3': `اجتماع ${stageLabel} الأسبوعي (الأربعاء)`,
      '4': `اجتماع ${stageLabel} الأسبوعي (الخميس)`,
      '5': `اجتماع ${stageLabel} الأسبوعي (الجمعة)`,
      '6': `اجتماع ${stageLabel} الأسبوعي (السبت)`
    }

    while (current <= end) {
      if (current.getDay() === targetDay) {
        const dateStr = current.toISOString().split('T')[0]
        
        // Mark specific dates as holidays by default (example: Easter week/Holy week early May)
        let isHoliday = false
        if (dateStr.startsWith('2027-04') || dateStr === '2027-01-07' || dateStr === '2027-04-16') {
          isHoliday = true
        }

        eventsList.push({
          date: dateStr,
          label: dayNames[recurrenceDay] || `اجتماع ${stageLabel} الأسبوعي`,
          active: !isHoliday // automatically suggest active except holidays
        })
      }
      current.setDate(current.getDate() + 1)
    }

    setGeneratedEvents(eventsList)
  }

  // Toggle active status for exceptions (holidays, Easter, exam weeks, etc.)
  const toggleEventActive = (index: number) => {
    setGeneratedEvents((prev) => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        active: !updated[index].active
      }
      return updated
    })
  }

  // Save generated events into MySQL database for ALL selected classes
  const handleSaveMeetings = async () => {
    if (schedClasses.length === 0) return

    const newMeetings: MeetingItem[] = []

    schedClasses.forEach((classId, classIdx) => {
      const classObj = classes.find(c => c.id === classId)
      const className = classObj ? classObj.name_ar : 'عام'
      const stageName = classObj ? classObj.stage_name_ar : 'ابتدائي'

      generatedEvents
        .filter((ev) => ev.active)
        .forEach((ev, evIdx) => {
          newMeetings.push({
            id: `gen_${Date.now()}_${classIdx}_${evIdx}`,
            class_id: classId,
            class_name: className,
            stage_name: stageName,
            date: ev.date,
            time: '04:00 م',
            type: 'weekly',
            present_count: 0,
            absent_count: 0,
            notes: ev.label
          })
        })
    })

    // Save directly to MySQL via REST API
    try {
      const isXampp = typeof window !== 'undefined' && window.location.pathname.includes('/stmina')
      const meetUrl = isXampp ? '/stmina/api/meetings.php' : '/api/meetings.php'
      await fetch(meetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetings: newMeetings.map(m => ({
            id: m.id,
            title: m.notes || `اجتماع ${m.class_name} الأسبوعي`,
            meeting_date: m.date,
            stage_name: m.stage_name,
            class_id: m.class_id,
            notes: m.notes
          }))
        })
      })
    } catch (e) {
      console.error('Error persisting generated meetings to MySQL:', e)
    }

    setMeetings((prev) => [...newMeetings, ...prev])
    setShowSaveAlert(true)
    setTimeout(() => {
      setShowSaveAlert(false)
      setActiveTab('list')
      setGeneratedEvents([])
      setSchedClasses([])
    }, 1500)
  }

  // Filter meetings accurately matching live MySQL IDs and class names
  const filteredMeetings = meetings.filter((m: any) => {
    const matchesYear = selectedYear ? Boolean(m.date && m.date.startsWith(selectedYear)) : true
    const matchesStage = selectedStage ? (m.stage_name === selectedStage || m.stage_name_ar === selectedStage) : true
    
    let matchesClass = true
    if (selectedClass) {
      const classObj = classes.find(c => c.id === selectedClass)
      matchesClass = Boolean(
        m.class_id === selectedClass ||
        (classObj && m.class_name === classObj.name_ar) ||
        (m.class_name && m.class_name.includes(selectedClass))
      )
    }
    return Boolean(matchesYear && matchesStage && matchesClass)
  })

  return (
    <Shell>
      <div className="space-y-6 font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {locale === 'ar' ? 'دفتر الحضور والغياب' : 'Attendance Logbook'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {locale === 'ar'
                ? 'إدارة الاجتماعات، جدولة اللقاءات الدورية وتوليدها تلقائياً، ورصد الحضور.'
                : 'Manage classroom meetings, schedule recurring weekly events, and check in students.'}
            </p>
          </div>
          <Link
            href="/attendance/record"
            className="h-10 px-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm flex items-center gap-2 shadow-md hover:bg-primary/95 transition self-start"
          >
            <Plus className="h-4 w-4" />
            <span>تسجيل حضور يدوي سريع</span>
          </Link>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-border gap-4">
          <button
            onClick={() => setActiveTab('list')}
            className={`py-2 px-3 text-sm font-semibold border-b-2 transition ${
              activeTab === 'list' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            الاجتماعات المسجلة
          </button>
          <button
            onClick={() => setActiveTab('scheduler')}
            className={`py-2 px-3 text-sm font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'scheduler' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            جدولة وتوليد الاجتماعات أسبوعياً
          </button>
        </div>

        {/* Tab 1: Meetings List */}
        {activeTab === 'list' && (
          <div className="space-y-6">
            {/* Filter controls */}
            <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Academic Year Filter */}
                <div>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition"
                  >
                    <option value="">كل السنوات</option>
                    <option value="2026">2026/2027</option>
                    <option value="2025">2025/2026</option>
                  </select>
                </div>

                {/* Stage Filter */}
                <div>
                  <select
                    value={selectedStage}
                    onChange={(e) => setSelectedStage(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition"
                  >
                    <option value="">كل المراحل</option>
                    <option value="ابتدائي">ابتدائي</option>
                    <option value="إعدادي">إعدادي</option>
                    <option value="ثانوي">ثانوي</option>
                  </select>
                </div>

                {/* Class Filter */}
                <div>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition"
                  >
                    <option value="">كل الفصول</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name_ar}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* List */}
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-border">
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  اللقاءات المسجلة بالفصل
                </h3>
              </div>

              <div className="divide-y divide-border">
                {loading ? (
                  [1, 2].map((i) => (
                    <div key={i} className="p-5 animate-pulse flex justify-between">
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-48" />
                        <div className="h-3 bg-muted rounded w-32" />
                      </div>
                      <div className="h-8 bg-muted rounded w-24" />
                    </div>
                  ))
                ) : filteredMeetings.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    لا يوجد اجتماعات مسجلة تطابق الفرز الحالي.
                  </div>
                ) : (
                  filteredMeetings.map((m) => {
                    const total = m.present_count + m.absent_count
                    const rate = total > 0 ? Math.round((m.present_count / total) * 100) : 0
                    return (
                      <div
                        key={m.id}
                        className="p-5 hover:bg-muted/10 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded">
                              {m.type === 'weekly' ? 'أسبوعي كنسي' : m.type === 'spiritual' ? 'روحي' : 'نشاط'}
                            </span>
                            <h4 className="font-bold text-sm text-foreground">
                              فصل {m.class_name} • {m.stage_name}
                            </h4>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            التاريخ: <strong className="text-foreground">{m.date}</strong> • الساعة:{' '}
                            <strong className="text-foreground">{m.time}</strong>
                          </p>
                          {m.notes && <p className="text-xs text-muted-foreground italic truncate">{m.notes}</p>}
                        </div>

                        <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                          <div className="text-right text-xs">
                            <p className="text-muted-foreground">نسبة حضور الطلاب</p>
                            <p className="font-bold text-foreground mt-0.5">
                              {m.present_count} حاضر / {m.absent_count} غائب ({rate}%)
                            </p>
                          </div>
                          <Link
                            href={`/attendance/record?meetingId=${m.id}&classId=${m.class_id}`}
                            className="h-9 px-4 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary text-xs font-semibold flex items-center gap-1.5 transition"
                          >
                            <CheckSquare className="h-4 w-4" />
                            تسجيل الحضور
                          </Link>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Scheduler Wizard */}
        {activeTab === 'scheduler' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
            {/* Scheduler Wizard Controls Form */}
            <div className="bg-card border border-border rounded-xl p-5 md:p-6 shadow-sm space-y-4 h-fit">
              <h3 className="font-bold text-sm text-primary border-b border-border pb-1.5 flex items-center gap-1.5">
                <Sparkles className="h-4.5 w-4.5 text-primary" />
                توليد لقاءات العام الدراسي
              </h3>

              <div className="space-y-4">
                {/* Select Year */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">العام الدراسي</label>
                  <select
                    value={schedYear}
                    onChange={(e) => handleYearChangeForSched(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition font-bold"
                  >
                    <option value="2026">2026/2027</option>
                    <option value="2025">2025/2026</option>
                    <option value="2027">2027/2028</option>
                  </select>
                </div>

                {/* Select Stage */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">اختر الخدمة / المرحلة</label>
                  <select
                    value={schedStage}
                    onChange={(e) => handleStageChange(e.target.value, classes)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition font-bold"
                  >
                    <option value="">كل المراحل (العامة)</option>
                    {stages.map((stg) => (
                      <option key={stg.id} value={stg.nameAr}>
                        مرحلة {stg.nameAr} ({stg.defaultDayLabel})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Select Class (Checklist for multiple selections) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-foreground">اختر الفصول الدراسية</label>
                    <button
                      type="button"
                      onClick={() => {
                        const visibleIds = classes.filter((c: any) => !schedStage || c.stage_name === schedStage || c.stage_name_ar === schedStage || (c.stage_name && schedStage.includes(c.stage_name))).map(c => c.id)
                        if (schedClasses.length === visibleIds.length) {
                          setSchedClasses([])
                        } else {
                          setSchedClasses(visibleIds)
                        }
                      }}
                      className="text-[10px] text-primary hover:underline font-bold"
                    >
                      {schedClasses.length === classes.filter((c: any) => !schedStage || c.stage_name === schedStage || c.stage_name_ar === schedStage || (c.stage_name && schedStage.includes(c.stage_name))).length ? 'إلغاء تحديد الكل' : 'تحديد جميع فصول المرحلة'}
                    </button>
                  </div>
                  <div className="border border-border rounded-lg p-2.5 bg-muted/20 max-h-36 overflow-y-auto space-y-2 font-sans">
                    {classes
                      .filter((c: any) => !schedStage || c.stage_name === schedStage || c.stage_name_ar === schedStage || (c.stage_name && schedStage.includes(c.stage_name)))
                      .map((c) => {
                        const isSelected = schedClasses.includes(c.id)
                        return (
                          <label key={c.id} className="flex items-center gap-2 cursor-pointer text-xs select-none">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                setSchedClasses(prev => 
                                   prev.includes(c.id) ? prev.filter(id => id !== c.id) : [...prev, c.id]
                                )
                              }}
                              className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                            />
                            <span className={`font-semibold ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                              {c.name_ar} ({c.grade_name_ar})
                            </span>
                          </label>
                        )
                      })}
                    {classes.filter((c: any) => !schedStage || c.stage_name === schedStage || c.stage_name_ar === schedStage || (c.stage_name && schedStage.includes(c.stage_name))).length === 0 && (
                      <p className="text-[10px] text-muted-foreground text-center py-2">لا توجد فصول لهذه المرحلة.</p>
                    )}
                  </div>
                </div>

                 {/* Select Day */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">يوم الاجتماع الأسبوعي</label>
                  <select
                    value={recurrenceDay}
                    onChange={(e) => setRecurrenceDay(e.target.value as any)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition font-bold"
                  >
                    <option value="0">كل أحد (Every Sunday)</option>
                    <option value="1">كل اثنين (Every Monday)</option>
                    <option value="2">كل ثلاثاء (Every Tuesday)</option>
                    <option value="3">كل أربعاء (Every Wednesday)</option>
                    <option value="4">كل خميس (Every Thursday)</option>
                    <option value="5">كل جمعة (Every Friday)</option>
                    <option value="6">كل سبت (Every Saturday)</option>
                  </select>
                </div>

                {/* Select Date boundaries */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">تاريخ البداية</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-muted/40 border border-border rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-primary/50 transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">تاريخ النهاية</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-muted/40 border border-border rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-primary/50 transition"
                    />
                  </div>
                </div>

                <button
                  onClick={handlePreviewWeeklyMeetings}
                  className="w-full h-9 bg-primary text-primary-foreground font-semibold rounded-lg text-xs hover:bg-primary/95 shadow transition"
                >
                  معاينة جدول التواريخ المقترحة
                </button>
              </div>
            </div>

            {/* Generated Dates Exceptions checklist */}
            <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 md:p-6 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="border-b border-border pb-2 flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-foreground">قائمة اللقاءات المولدة أسبوعياً</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">قم بإلغاء تحديد الأيام التي توافق عطلات أو أعياد لاستثنائها.</p>
                  </div>
                  {generatedEvents.length > 0 && (
                    <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                      {generatedEvents.filter(ev => ev.active).length} اجتماع نشط
                    </span>
                  )}
                </div>

                {generatedEvents.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-center text-xs text-muted-foreground border border-dashed border-border rounded-lg p-5">
                    <AlertCircle className="h-7 w-7 text-muted-foreground/60 mb-2" />
                    <span>قم بتحديد المعايير باليمين واضغط على "معاينة" لتوليد جدول الاجتماعات.</span>
                  </div>
                ) : (
                  <div className="h-96 overflow-y-auto divide-y divide-border/60 border border-border rounded-lg px-3">
                    {generatedEvents.map((ev, idx) => (
                      <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                        <div>
                          <p className={`font-bold ${ev.active ? 'text-foreground' : 'text-muted-foreground line-through'}`}>{ev.date}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{ev.label}</p>
                        </div>

                        <button
                          onClick={() => toggleEventActive(idx)}
                          className={`h-7 px-3 rounded-lg text-[10px] font-semibold transition ${
                            ev.active
                              ? 'bg-success/10 text-success border border-success'
                              : 'bg-destructive/10 text-destructive border border-destructive'
                          }`}
                        >
                          {ev.active ? 'نشط (مدرج)' : 'عطلة (مستثنى)'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {generatedEvents.length > 0 && (
                <div className="pt-4 border-t border-border flex justify-end items-center gap-4">
                  {showSaveAlert && (
                    <div className="text-xs text-success font-bold flex items-center gap-1.5">
                      <Check className="h-4 w-4" />
                      <span>تمت إضافة الاجتماعات للدفتر بنجاح!</span>
                    </div>
                  )}
                  <button
                    onClick={handleSaveMeetings}
                    disabled={schedClasses.length === 0}
                    className={`h-10 px-5 font-semibold rounded-lg text-xs shadow transition ${
                      schedClasses.length === 0
                        ? 'bg-muted text-muted-foreground cursor-not-allowed border border-border'
                        : 'bg-success text-success-foreground hover:bg-success/95'
                    }`}
                  >
                    حفظ وتوليد الاجتماعات بالدفتر ({schedClasses.length} فصل)
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Shell>
  )
}
