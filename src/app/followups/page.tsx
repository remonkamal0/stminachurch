'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Shell } from '@/components/layout/Shell'
import { EmptyState } from '@/components/layout/EmptyState'
import { getStudents, StudentItem } from '@/lib/services/studentsService'
import {
  Phone,
  MessageSquare,
  Home,
  AlertTriangle,
  CheckCircle,
  Search,
  Plus,
  Calendar,
  X,
  Save,
  Check,
  MapPin,
  Compass,
  Printer,
  ChevronRight,
  User,
  Users,
  Navigation,
  CheckCircle2,
  Filter,
  MessageCircle
} from 'lucide-react'

interface FollowUpLog {
  id: string
  student: string
  student_id?: string
  date: string
  servant: string
  type: 'phone' | 'visit' | 'whatsapp'
  action: string
  notes: string
  nextDate: string
}

export default function FollowupsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-xs text-muted-foreground">جاري تحميل لوحة الافتقاد والمناطق...</div>}>
      <FollowupsContent />
    </Suspense>
  )
}

function FollowupsContent() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab') as 'logs' | 'smart-list' | 'zones' | null

  const [activeTab, setActiveTab] = useState<'logs' | 'smart-list' | 'zones'>(tabParam || 'logs')
  const [searchTerm, setSearchTerm] = useState('')
  const [students, setStudents] = useState<StudentItem[]>([])

  // Zones State
  const [selectedArea, setSelectedArea] = useState<string>('الكل')
  const [filterStage, setFilterStage] = useState<string>('الكل')
  const [filterClass, setFilterClass] = useState<string>('الكل')
  const [visitLoggedSuccess, setVisitLoggedSuccess] = useState<string | null>(null)

  // Followup logs list
  const [followUpLogs, setFollowUpLogs] = useState<FollowUpLog[]>([
    {
      id: 'f1',
      student: 'كيرلس جرجس حبيب',
      student_id: 's1',
      date: '2026-08-14',
      servant: 'مينا ككمال',
      type: 'phone',
      action: 'contacted',
      notes: 'تم الاطمئنان عليه من والدته، كان متعباً الأحد الماضي وسيحضر الأسبوع القادم.',
      nextDate: '2026-08-21'
    },
    {
      id: 'f2',
      student: 'مارينا رأفت عياد',
      student_id: 's2',
      date: '2026-08-12',
      servant: 'تامر شفيق',
      type: 'visit',
      action: 'visited',
      notes: 'زيارة منزلية مباركة مع أمين المرحلة، صلينا مع الأسرة ووزعنا هدايا العيد ميلاد.',
      nextDate: '2026-09-12'
    },
    {
      id: 'f3',
      student: 'يوحنا جرجس حبيب',
      student_id: 's3',
      date: '2026-08-10',
      servant: 'مينا كمال',
      type: 'whatsapp',
      action: 'contacted_mother',
      notes: 'إرسال آية التسميع الأسبوعية للوالدة وتأكيد الحفظ.',
      nextDate: ''
    }
  ])

  // Smart alerts list
  const [smartAlerts, setSmartAlerts] = useState([
    {
      id: 'a1',
      name: 'كيرلس جرجس حبيب',
      student_id: 's1',
      class: 'الأنبا بيشوي',
      stage: 'ابتدائي',
      area: 'محطة الرمل',
      address: '١٢ شارع كلية الطب، محطة الرمل',
      phone: '01234567890',
      reason: 'غياب متكرر (مرتان متتاليتان)',
      daysSinceLastVisit: 45,
      urgency: 'high'
    },
    {
      id: 'a2',
      name: 'مينا عماد نصيف',
      student_id: 's4',
      class: 'مارجرجس',
      stage: 'ابتدائي',
      area: 'الإبراهيمية',
      address: '٥ شارع تانيس، الإبراهيمية',
      phone: '01012345678',
      reason: 'لم تتم زيارته من أكثر من ٦٠ يوماً',
      daysSinceLastVisit: 68,
      urgency: 'medium'
    },
    {
      id: 'a3',
      name: 'مارينا رأفت عياد',
      student_id: 's2',
      class: 'القديسة دميانة',
      stage: 'ابتدائي',
      area: 'سيدي بشر',
      address: '١٨ شارع خالد بن الوليد، سيدي بشر',
      phone: '01234567892',
      reason: 'تحتاج افتقاد دوري منتظم',
      daysSinceLastVisit: 20,
      urgency: 'low'
    }
  ])

  // New Log Form Dialog State
  const [showLogModal, setShowLogModal] = useState(false)
  const [selectedStudentForLog, setSelectedStudentForLog] = useState<StudentItem | null>(null)
  const [logType, setLogType] = useState<'phone' | 'visit' | 'whatsapp'>('visit')
  const [logNotes, setLogNotes] = useState('')
  const [logNextDate, setLogNextDate] = useState('')

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  useEffect(() => {
    async function load() {
      const all = await getStudents()
      setStudents(all)
    }
    load()

    const savedLogs = localStorage.getItem('ssms-followup-logs')
    if (savedLogs) {
      setFollowUpLogs(JSON.parse(savedLogs))
    }
  }, [])

  const persistLogs = (updated: FollowUpLog[]) => {
    setFollowUpLogs(updated)
    localStorage.setItem('ssms-followup-logs', JSON.stringify(updated))
  }

  // Quick Direct Visit Logger
  const handleInstantVisitLog = (student: StudentItem, customNotes?: string) => {
    const newLog: FollowUpLog = {
      id: `f-${Date.now()}`,
      student: student.full_name,
      student_id: student.id,
      date: new Date().toLocaleDateString('ar-EG'),
      servant: 'خادم الافتقاد الميداني',
      type: 'visit',
      action: 'visited',
      notes: customNotes || `تمت الزيارة الميدانية بنجاح في عنوانه السكني (${student.area} - ${student.address}).`,
      nextDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)
    }

    const updatedLogs = [newLog, ...followUpLogs]
    persistLogs(updatedLogs)

    // Log to student's timeline
    const newEvent = {
      id: `t-visit-${Date.now()}`,
      type: 'followup' as const,
      title_ar: `زيارة افتقاد ميداني منزلي`,
      title_en: `Home Visitation Logged`,
      description_ar: newLog.notes,
      description_en: `Home visitation conducted in area: ${student.area}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      servant_name: 'خادم الافتقاد الميداني'
    }

    const existingTimeline = JSON.parse(localStorage.getItem(`ssms-student-timeline-${student.id}`) || '[]')
    localStorage.setItem(`ssms-student-timeline-${student.id}`, JSON.stringify([newEvent, ...existingTimeline]))

    setVisitLoggedSuccess(student.id)
    setTimeout(() => {
      setVisitLoggedSuccess(null)
    }, 2500)
  }

  const handleCreateCustomLog = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudentForLog) return

    const newLog: FollowUpLog = {
      id: `f-${Date.now()}`,
      student: selectedStudentForLog.full_name,
      student_id: selectedStudentForLog.id,
      date: new Date().toLocaleDateString('ar-EG'),
      servant: 'مينا كمال',
      type: logType,
      action: logType === 'visit' ? 'visited' : 'contacted',
      notes: logNotes || 'تم التواصل والمتابعة بنجاح.',
      nextDate: logNextDate
    }

    const updated = [newLog, ...followUpLogs]
    persistLogs(updated)
    setShowLogModal(false)
    setSelectedStudentForLog(null)
    setLogNotes('')
  }

  // Geographic Zones Grouping
  const distinctAreas = Array.from(new Set(students.map(s => s.area || 'غير محدد'))).filter(Boolean)
  const distinctStages = Array.from(new Set(students.map(s => s.stage_name))).filter(Boolean)
  const distinctClasses = Array.from(new Set(
    students
      .filter(s => filterStage === 'الكل' || s.stage_name === filterStage)
      .map(s => s.class_name)
  )).filter(Boolean)

  const filteredStudentsByZone = students.filter(s => {
    const matchArea = selectedArea === 'الكل' || s.area === selectedArea
    const matchStage = filterStage === 'الكل' || s.stage_name === filterStage
    const matchClass = filterClass === 'الكل' || s.class_name === filterClass
    const matchSearch = !searchTerm || s.full_name.includes(searchTerm) || s.address.includes(searchTerm) || (s.area && s.area.includes(searchTerm))
    return matchArea && matchStage && matchClass && matchSearch
  })

  // Area stats
  const areaStats = distinctAreas.map(area => {
    const areaStudents = students.filter(s => s.area === area)
    const alertCount = smartAlerts.filter(a => a.area === area).length
    return {
      area,
      totalStudents: areaStudents.length,
      alertCount
    }
  })

  return (
    <Shell>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">الافتقاد والمتابعة الميدانية</h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1 font-sans">
              سجل الافتقاد الشامل، خريطة التوزيع الجغرافي حسب المناطق والشوارع، وتنبيهات الغياب المتكرر.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="h-10 px-3.5 bg-muted hover:bg-muted/80 text-muted-foreground font-semibold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              طباعة الكشف
            </button>
            <button
              onClick={() => {
                setSelectedStudentForLog(students[0] || null)
                setShowLogModal(true)
              }}
              className="h-10 px-4 bg-primary text-primary-foreground font-semibold rounded-xl text-xs flex items-center gap-2 hover:bg-primary/95 shadow-sm transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              تسجيل افتقاد جديد
            </button>
          </div>
        </div>

        {/* Main Tabs Navigation */}
        <div className="flex border-b border-border font-sans print:hidden">
          {[
            { id: 'logs', label: 'سجل وبلاغات الافتقاد', icon: MessageSquare },
            { id: 'zones', label: 'خريطة ومناطق الافتقاد الميداني 🗺️', icon: MapPin },
            { id: 'smart-list', label: 'قوائم المتابعة الذكية والغياب ⚠️', icon: AlertTriangle }
          ].map(tab => {
            const Icon = tab.icon
            const isSelected = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-3 border-b-2 text-xs font-bold transition cursor-pointer ${
                  isSelected
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* TAB 1: LOGS */}
        {activeTab === 'logs' && (
          <div className="space-y-4 font-sans animate-in fade-in">
            <div className="flex justify-between items-center bg-card border border-border p-3 rounded-xl">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="بحث في سجلات الافتقاد..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-9 pl-3 py-1.5 bg-muted/40 border border-border rounded-lg text-xs outline-none focus:border-primary"
                />
              </div>
              <span className="text-xs text-muted-foreground">
                إجمالي السجلات: <strong>{followUpLogs.length} عملية افتقاد</strong>
              </span>
            </div>

            <div className="space-y-3">
              {followUpLogs
                .filter(l => !searchTerm || l.student.includes(searchTerm) || l.notes.includes(searchTerm))
                .map((log) => (
                  <div key={log.id} className="p-4 bg-card border border-border rounded-xl shadow-xs space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2.5">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                          log.type === 'visit' ? 'bg-indigo-500/10 text-indigo-700' : log.type === 'whatsapp' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
                        }`}>
                          {log.type === 'visit' ? <Home className="h-4 w-4" /> : log.type === 'whatsapp' ? <MessageSquare className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-foreground">{log.student}</h4>
                          <p className="text-[10px] text-muted-foreground">الخادم: {log.servant} • التاريخ: {log.date}</p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-muted px-2 py-0.5 rounded font-semibold text-muted-foreground">
                        {log.type === 'visit' ? 'زيارة منزلية' : log.type === 'whatsapp' ? 'رسالة واتساب' : 'مكالمة هاتفية'}
                      </span>
                    </div>

                    <p className="text-xs text-foreground/90 bg-muted/20 p-2.5 rounded-lg border border-border/40 leading-relaxed">
                      {log.notes}
                    </p>

                    {log.nextDate && (
                      <p className="text-[10px] text-primary font-semibold flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        موعد المتابعة القادمة الموصى به: {log.nextDate}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB 2: GEOGRAPHIC VISITATION ZONES */}
        {activeTab === 'zones' && (
          <div className="space-y-6 font-sans animate-in fade-in">
            {/* Area KPI cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 print:hidden">
              <button
                onClick={() => setSelectedArea('الكل')}
                className={`p-3.5 rounded-xl border text-right transition cursor-pointer ${
                  selectedArea === 'الكل'
                    ? 'bg-primary/10 border-primary text-primary shadow-xs'
                    : 'bg-card border-border hover:bg-muted/40'
                }`}
              >
                <span className="text-[10px] text-muted-foreground block font-bold">جميع المناطق</span>
                <span className="text-base font-extrabold text-foreground mt-0.5 block">{students.length} مخدوم</span>
              </button>

              {areaStats.map(stat => (
                <button
                  key={stat.area}
                  onClick={() => setSelectedArea(stat.area)}
                  className={`p-3.5 rounded-xl border text-right transition cursor-pointer ${
                    selectedArea === stat.area
                      ? 'bg-primary/10 border-primary text-primary shadow-xs'
                      : 'bg-card border-border hover:bg-muted/40'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-foreground truncate">{stat.area}</span>
                    {stat.alertCount > 0 && (
                      <span className="bg-destructive/15 text-destructive text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                        {stat.alertCount} غياب
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-extrabold text-muted-foreground mt-1 block">
                    {stat.totalStudents} مخدوم
                  </span>
                </button>
              ))}
            </div>

            {/* Filter toolbar */}
            <div className="bg-card border border-border p-4 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-bold text-muted-foreground">تصفية بالمرحلة:</span>
                  <select
                    value={filterStage}
                    onChange={(e) => { setFilterStage(e.target.value); setFilterClass('الكل'); }}
                    className="bg-muted/40 border border-border rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none"
                  >
                    <option value="الكل">كل المراحل</option>
                    {distinctStages.map(stg => (
                      <option key={stg} value={stg}>{stg}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground">الفصل:</span>
                  <select
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                    className="bg-muted/40 border border-border rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none"
                  >
                    <option value="الكل">كل الفصول</option>
                    {distinctClasses.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
              </div>

              <span className="text-xs text-muted-foreground">
                عدد الطلاب في جولة الافتقاد: <strong className="text-primary font-bold">{filteredStudentsByZone.length} مخدوم</strong>
              </span>
            </div>

            {/* Visitation Itinerary List */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                  <Compass className="h-4.5 w-4.5 text-primary" />
                  <span>خطة جولة الافتقاد الميداني: منطقة ({selectedArea})</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredStudentsByZone.map((student) => {
                  const mapsQuery = encodeURIComponent(`${student.address} ${student.area} الاسكندرية`)
                  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`
                  const whatsappUrl = `https://wa.me/2${student.father_phone || student.mother_phone}?text=${encodeURIComponent(`سلام ونعمة يا فندم.. خادم مدارس الأحد كنيسة مارمينا معكم للاطمئنان على حبيبنا ${student.first_name} والأسرة الكريمة 🌹`)}`

                  const isSaved = visitLoggedSuccess === student.id

                  return (
                    <div
                      key={student.id}
                      className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3.5 hover:border-primary/30 transition relative"
                    >
                      {/* Top Row: Name, Class, and Area Tag */}
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-0.5">
                          <h4 className="font-extrabold text-sm text-foreground">{student.full_name}</h4>
                          <p className="text-[10px] text-muted-foreground">
                            الفصل: <strong className="text-foreground">{student.class_name}</strong> • المرحلة: {student.stage_name}
                          </p>
                        </div>
                        <span className="bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {student.area || 'غير محدد'}
                        </span>
                      </div>

                      {/* Address Box */}
                      <div className="p-2.5 bg-muted/20 border border-border/50 rounded-xl space-y-1 text-xs text-right">
                        <div className="flex items-center gap-1.5 text-foreground font-semibold">
                          <Navigation className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span>العنوان: {student.address || 'العنوان غير مدون'}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground pr-5">
                          ولي الأمر: {student.father_name} (موبايل: {student.father_phone || student.mother_phone || 'لا يوجد'})
                        </p>
                      </div>

                      {/* Action buttons bar */}
                      <div className="grid grid-cols-3 gap-2 pt-1 font-sans print:hidden">
                        <a
                          href={`tel:${student.father_phone || student.mother_phone}`}
                          className="h-8 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-[10px] font-bold flex items-center justify-center gap-1 transition"
                        >
                          <Phone className="h-3 w-3 text-primary" />
                          اتصال
                        </a>

                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="h-8 rounded-lg bg-success/15 hover:bg-success/25 text-success text-[10px] font-bold flex items-center justify-center gap-1 transition"
                        >
                          <MessageCircle className="h-3 w-3" />
                          واتساب
                        </a>

                        <a
                          href={googleMapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="h-8 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 text-[10px] font-bold flex items-center justify-center gap-1 transition"
                        >
                          <MapPin className="h-3 w-3" />
                          الخريطة
                        </a>
                      </div>

                      {/* Instant Visit Logger Button */}
                      <div className="pt-2 border-t border-border/60 flex justify-between items-center print:hidden">
                        {isSaved ? (
                          <div className="text-[10px] text-success font-bold flex items-center gap-1 animate-bounce">
                            <CheckCircle2 className="h-4 w-4" />
                            تم تسجيل وتوثيق الزيارة بنجاح!
                          </div>
                        ) : (
                          <button
                            onClick={() => handleInstantVisitLog(student)}
                            className="w-full h-8 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                          >
                            <Check className="h-3.5 w-3.5" />
                            تسجيل إتمام الزيارة الميدانية فوراً
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {filteredStudentsByZone.length === 0 && (
                <div className="text-center py-12 bg-card border border-border rounded-2xl text-muted-foreground text-xs font-sans">
                  لا توجد سجلات مخدومين متطابقة مع المنطقة أو الفلاتر المختارة.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SMART ALERTS */}
        {activeTab === 'smart-list' && (
          <div className="space-y-4 font-sans animate-in fade-in">
            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <h4 className="font-bold text-amber-900">تنبيهات الافتقاد الذكية التلقائية</h4>
                <p className="text-amber-800 leading-relaxed">
                  يحلل النظام سجلات الحضور ويبرز تلقائياً الطلاب الذين غابوا لأسبوعين متتاليين أو لم تتم زيارتهم منزلياً منذ أكثر من ٦٠ يوماً.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {smartAlerts.map((alert) => (
                <div key={alert.id} className="p-4 bg-card border border-border rounded-xl shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="space-y-1 text-right">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-foreground">{alert.name}</h4>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        alert.urgency === 'high' ? 'bg-destructive/15 text-destructive' : alert.urgency === 'medium' ? 'bg-amber-500/15 text-amber-700' : 'bg-primary/10 text-primary'
                      }`}>
                        {alert.reason}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      الفصل: {alert.class} ({alert.stage}) • المنطقة: {alert.area} • هاتف: {alert.phone}
                    </p>
                  </div>

                  <div className="flex gap-2 shrink-0 self-end sm:self-center">
                    <a
                      href={`tel:${alert.phone}`}
                      className="h-8 px-3 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-lg text-xs flex items-center gap-1 transition"
                    >
                      <Phone className="h-3.5 w-3.5 text-primary" />
                      اتصال
                    </a>
                    <button
                      onClick={() => {
                        const st = students.find(s => s.id === alert.student_id)
                        if (st) {
                          handleInstantVisitLog(st, `افتقاد عاجل بسبب: ${alert.reason}`)
                        }
                      }}
                      className="h-8 px-3 bg-primary text-primary-foreground font-semibold rounded-lg text-xs flex items-center gap-1 hover:bg-primary/95 transition cursor-pointer"
                    >
                      <Check className="h-3.5 w-3.5" />
                      تم الافتقاد
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CREATE FOLLOWUP MODAL */}
      {showLogModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col font-sans">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/10">
              <h3 className="font-bold text-sm text-foreground">تسجيل عملية افتقاد جديدة</h3>
              <button onClick={() => setShowLogModal(false)} className="text-muted-foreground hover:text-foreground text-lg cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateCustomLog} className="p-6 space-y-4 text-xs text-right" dir="rtl">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">اختر الطالب:</label>
                <select
                  value={selectedStudentForLog?.id || ''}
                  onChange={(e) => {
                    const st = students.find(s => s.id === e.target.value)
                    setSelectedStudentForLog(st || null)
                  }}
                  className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none font-bold"
                  required
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.full_name} ({s.class_name})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">نوع الافتقاد:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'visit', label: 'زيارة منزلية', icon: Home },
                    { id: 'phone', label: 'مكالمة هاتفية', icon: Phone },
                    { id: 'whatsapp', label: 'واتساب', icon: MessageSquare }
                  ].map(t => {
                    const Icon = t.icon
                    const isSelected = logType === t.id
                    return (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => setLogType(t.id as any)}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                          isSelected ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:bg-muted'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span>{t.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">ملاحظات وتقرير الافتقاد:</label>
                <textarea
                  rows={3}
                  placeholder="اكتب تفاصيل الزيارة أو المكالمة وحالة المخدوم والأسرة..."
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-lg p-3 text-xs outline-none focus:border-primary leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">تاريخ المتابعة القادمة (اختياري):</label>
                <input
                  type="date"
                  value={logNextDate}
                  onChange={(e) => setLogNextDate(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-border pt-4 mt-4">
                <button
                  type="submit"
                  className="h-10 px-5 bg-primary text-primary-foreground font-semibold rounded-lg text-xs flex items-center gap-1.5 hover:bg-primary/95 shadow transition cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  حفظ وتوثيق الافتقاد
                </button>
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="h-10 px-4 border border-border hover:bg-muted text-xs font-semibold rounded-lg text-muted-foreground transition cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Shell>
  )
}