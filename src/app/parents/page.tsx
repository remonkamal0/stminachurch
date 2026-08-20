'use client'

import React, { useState, useEffect } from 'react'
import { getStudents, StudentItem } from '@/lib/services/studentsService'
import {
  HeartHandshake,
  Phone,
  Search,
  CheckCircle,
  XCircle,
  Award,
  BookOpen,
  Calendar,
  Bus,
  MessageCircle,
  Star,
  Users,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  ShieldCheck,
  Music,
  ArrowRight,
  Clock,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'

interface HymnItem {
  id: string
  name_ar: string
  name_en: string
  category: 'ألحان' | 'طقوس' | 'قبطي'
  reward_points: number
  status: 'pending' | 'learning' | 'completed'
  completed_date?: string
}

interface TripParticipant {
  id: string
  student_id: string
  student_name: string
  class_name: string
  paid_amount: number
  bus_number: number
}

interface TripItem {
  id: string
  title: string
  date: string
  cost: number
  stage: string
  total_buses: number
  participants: TripParticipant[]
}

export default function ParentPortalPage() {
  const [students, setStudents] = useState<StudentItem[]>([])
  const [searchPhone, setSearchPhone] = useState('')
  const [matchedChildren, setMatchedChildren] = useState<StudentItem[]>([])
  const [selectedChild, setSelectedChild] = useState<StudentItem | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  // Child dynamic details
  const [childHymns, setChildHymns] = useState<HymnItem[]>([])
  const [childTrips, setChildTrips] = useState<{ trip: TripItem; participant: TripParticipant }[]>([])
  const [childPoints, setChildPoints] = useState(100)

  useEffect(() => {
    async function loadData() {
      const all = await getStudents()
      setStudents(all)
    }
    loadData()
  }, [])

  // Sync child dynamic points, hymns and trips when selectedChild changes
  useEffect(() => {
    if (selectedChild) {
      // 1. Points
      const pts = parseInt(localStorage.getItem(`ssms-student-points-${selectedChild.id}`) || selectedChild.points_balance.toString())
      setChildPoints(pts)

      // 2. Hymns
      const savedHymns = localStorage.getItem(`ssms-student-hymns-${selectedChild.id}`)
      if (savedHymns) {
        setChildHymns(JSON.parse(savedHymns))
      } else {
        setChildHymns([
          { id: 'h1', name_ar: 'لحن تين أويشت (قداس)', name_en: 'Ten Ousht', category: 'ألحان', reward_points: 25, status: 'completed', completed_date: '2026-08-10' },
          { id: 'h2', name_ar: 'لحن أجيوس (الثلاثة تقديسات)', name_en: 'Agios', category: 'ألحان', reward_points: 30, status: 'learning' },
          { id: 'h3', name_ar: 'أرباع الناقوس (أيام السنوية)', name_en: 'Naqous Verses', category: 'ألحان', reward_points: 40, status: 'pending' },
          { id: 'h4', name_ar: 'الطقس الكنسي: رفع بخور عشية وباكر', name_en: 'Vespers Rite', category: 'طقوس', reward_points: 35, status: 'pending' },
          { id: 'h5', name_ar: 'اللغة القبطية: الحروف الأبجدية ونطقها', name_en: 'Coptic Alphabet', category: 'قبطي', reward_points: 20, status: 'completed', completed_date: '2026-07-28' },
          { id: 'h6', name_ar: 'قانون الإيمان الأرثوذكسي قبطياً', name_en: 'Creed in Coptic', category: 'طقوس', reward_points: 50, status: 'pending' }
        ])
      }

      // 3. Trips
      const savedTripsStr = localStorage.getItem('ssms-church-trips')
      const allTrips: TripItem[] = savedTripsStr ? JSON.parse(savedTripsStr) : [
        {
          id: 'tr1',
          title: 'مؤتمر الصيف لمرحلة ابتدائي - بيت سان مارك (أبو تلات)',
          date: '2026-08-28',
          cost: 350,
          stage: 'ابتدائي',
          total_buses: 2,
          participants: [
            { id: 'p_tr1_1', student_id: 's1', student_name: 'كيرلس جرجس حبيب عزيز', class_name: 'الأنبا بيشوي', paid_amount: 350, bus_number: 1 },
            { id: 'p_tr1_3', student_id: 's3', student_name: 'يوحنا جرجس حبيب عزيز', class_name: 'الأنبا بيشوي', paid_amount: 150, bus_number: 2 }
          ]
        }
      ]

      const enrolled: { trip: TripItem; participant: TripParticipant }[] = []
      allTrips.forEach(tr => {
        const p = tr.participants?.find(part => part.student_id === selectedChild.id)
        if (p) {
          enrolled.push({ trip: tr, participant: p })
        }
      })
      setChildTrips(enrolled)
    }
  }, [selectedChild])

  const handleSearch = (phoneToSearch?: string) => {
    const term = (phoneToSearch || searchPhone).trim()
    if (!term) return

    setHasSearched(true)
    const normalized = term.replace(/\s+/g, '')

    const matches = students.filter(s => {
      const f = (s.father_phone || '').replace(/\s+/g, '')
      const m = (s.mother_phone || '').replace(/\s+/g, '')
      const st = (s.student_phone || '').replace(/\s+/g, '')
      return f === normalized || m === normalized || st === normalized || (f && f.includes(normalized)) || (m && m.includes(normalized))
    })

    setMatchedChildren(matches)
    if (matches.length > 0) {
      setSelectedChild(matches[0])
    } else {
      setSelectedChild(null)
    }
  }

  const completedHymnsCount = childHymns.filter(h => h.status === 'completed').length
  const totalHymnsCount = childHymns.length || 6
  const hymnsPercent = Math.round((completedHymnsCount / totalHymnsCount) * 100)

  return (
    <div className="min-h-screen bg-muted/20 font-sans flex flex-col" dir="rtl">
      {/* Top Coptic Header */}
      <header className="bg-primary text-primary-foreground py-4 px-6 shadow-md flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary-foreground/15 flex items-center justify-center font-bold text-base">
            ☦
          </div>
          <div>
            <h1 className="font-extrabold text-sm md:text-base">بوابة ولي الأمر التفاعلية لمتابعة الأبناء</h1>
            <p className="text-[10px] text-primary-foreground/80">كنيسة مارمينا • مدارس الأحد الأرثوذكسية</p>
          </div>
        </div>
        <Link
          href="/"
          className="text-xs bg-primary-foreground/15 hover:bg-primary-foreground/25 px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1"
        >
          <ArrowRight className="h-3.5 w-3.5" />
          لوحة الإدارة
        </Link>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Phone Lookup Box */}
        <div className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                البحث برقم هاتف ولي الأمر
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                أدخل رقم هاتف الأب أو الأم المسجل بالخدمة لعرض ملفات جميع أبنائكم في شاشة موحدة.
              </p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSearch()
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Phone className="absolute right-3.5 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="tel"
                placeholder="أدخل رقم الموبايل (مثال: 01234567890)..."
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 bg-muted/40 border border-border rounded-xl text-xs outline-none focus:border-primary font-bold transition"
              />
            </div>
            <button
              type="submit"
              className="h-10 px-5 bg-primary text-primary-foreground font-semibold rounded-xl text-xs hover:bg-primary/95 shadow-sm transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Search className="h-3.5 w-3.5" />
              عرض ملف الأبناء
            </button>
          </form>

          {/* Quick Demo Test Numbers */}
          <div className="pt-2 border-t border-border/60 flex items-center gap-2 flex-wrap text-[10px]">
            <span className="font-bold text-muted-foreground">أرقام للتجربة السريعة:</span>
            <button
              type="button"
              onClick={() => {
                setSearchPhone('01234567890')
                handleSearch('01234567890')
              }}
              className="bg-primary/10 hover:bg-primary/20 text-primary px-2.5 py-1 rounded-md font-semibold transition cursor-pointer"
            >
              أسرة جرجس حبيب (كيرلس ويوحنا): 01234567890
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchPhone('01234567892')
                handleSearch('01234567892')
              }}
              className="bg-muted hover:bg-muted/80 text-foreground px-2.5 py-1 rounded-md font-semibold transition cursor-pointer"
            >
              أسرة رأفت عياد (مارينا): 01234567892
            </button>
          </div>
        </div>

        {/* Search Results / Family Hub */}
        {hasSearched && matchedChildren.length === 0 && (
          <div className="text-center py-12 bg-card border border-border rounded-2xl p-6 text-muted-foreground text-xs space-y-2">
            <AlertCircle className="h-8 w-8 text-amber-500 mx-auto" />
            <p className="font-bold text-foreground text-sm">لم يتم العثور على أبناء مسجلين بهذا الرقم ({searchPhone})</p>
            <p>يرجى التأكد من كتابة رقم هاتف الأب أو الأم المسجل في بطاقة بيانات المخدوم، أو مراجعة أمين الفصل.</p>
          </div>
        )}

        {matchedChildren.length > 0 && selectedChild && (
          <div className="space-y-6 animate-in fade-in">
            {/* Family Greeting & Multi-child switcher */}
            <div className="bg-gradient-to-l from-primary/15 via-primary/5 to-card border border-primary/20 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] bg-primary text-primary-foreground font-bold px-2 py-0.5 rounded-full">
                    بيانات الأسرة الكريمة
                  </span>
                  <h2 className="text-lg font-extrabold text-foreground">
                    أهلاً بحضرتك يا أستاذ / {selectedChild.father_name} 🌸
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    عدد الأبناء المقيدين في خدمة مدارس الأحد: <strong className="text-primary">{matchedChildren.length} أبناء</strong>
                  </p>
                </div>

                <div className="bg-card border border-border px-4 py-2 rounded-xl text-center shadow-xs">
                  <span className="text-[10px] text-muted-foreground block">كاهن اعتراف الأسرة</span>
                  <strong className="text-xs text-foreground mt-0.5 block">{selectedChild.confession_father}</strong>
                </div>
              </div>

              {/* Children Tabs / Switcher */}
              {matchedChildren.length > 1 && (
                <div className="pt-3 border-t border-border/60 space-y-1.5">
                  <span className="text-[11px] font-bold text-muted-foreground block">اختر الابن لمتابعة تقريره المفصل:</span>
                  <div className="flex gap-2 flex-wrap">
                    {matchedChildren.map((child) => {
                      const isSelected = selectedChild.id === child.id
                      return (
                        <button
                          key={child.id}
                          onClick={() => setSelectedChild(child)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                            isSelected
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'bg-card border border-border hover:bg-muted text-foreground'
                          }`}
                        >
                          <Users className="h-3.5 w-3.5" />
                          <span>{child.first_name} {child.last_name}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded ${isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                            {child.class_name}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Child Profile Overview Header */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-lg shrink-0">
                  {selectedChild.first_name.charAt(0)}
                </div>
                <div className="space-y-1">
                  <h3 className="font-extrabold text-base text-foreground">
                    {selectedChild.full_name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    الفصل: <strong className="text-foreground">{selectedChild.class_name}</strong> • المرحلة: <strong className="text-foreground">{selectedChild.stage_name}</strong> • الصف: {selectedChild.grade_name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <div className="bg-success/10 border border-success/20 px-3.5 py-1.5 rounded-xl text-center">
                  <span className="text-[9px] text-muted-foreground block">رصيد النقاط والتميز</span>
                  <span className="text-sm font-extrabold text-success mt-0.5 block font-mono">
                    ★ {childPoints} نقطة
                  </span>
                </div>
              </div>
            </div>

            {/* 4 Feature Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Box 1: Attendance History */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex justify-between items-center border-b border-border pb-2">
                  <h4 className="font-bold text-xs text-primary flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    سجل الحضور والغياب الأخير
                  </h4>
                  <span className="bg-success/15 text-success text-[10px] font-bold px-2 py-0.5 rounded-full">
                    نسبة الحضور: 85%
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {[
                    { date: 'الأحد ١٦ أغسطس ٢٠٢٦', status: 'present', title: 'اجتماع مدارس الأحد الأسبوعي' },
                    { date: 'الأحد ٩ أغسطس ٢٠٢٦', status: 'present', title: 'اجتماع مدارس الأحد الأسبوعي' },
                    { date: 'الأحد ٢ أغسطس ٢٠٢٦', status: 'absent', title: 'اجتماع مدارس الأحد الأسبوعي' },
                    { date: 'الأحد ٢٦ يوليو ٢٠٢٦', status: 'present', title: 'قداس واجتماع ترفيهي' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2.5 rounded-xl bg-muted/20 border border-border/40">
                      <div>
                        <p className="font-semibold text-foreground text-xs">{item.date}</p>
                        <p className="text-[10px] text-muted-foreground">{item.title}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        item.status === 'present' ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'
                      }`}>
                        {item.status === 'present' ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {item.status === 'present' ? 'حاضر' : 'غائب'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Box 2: Coptic Hymns & Memorization Academy */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex justify-between items-center border-b border-border pb-2">
                  <h4 className="font-bold text-xs text-primary flex items-center gap-1.5">
                    <Music className="h-4 w-4" />
                    منهج الألحان والطقوس القبطية
                  </h4>
                  <span className="text-[10px] font-bold text-muted-foreground">
                    تم تسميع {completedHymnsCount} من {totalHymnsCount} ({hymnsPercent}%)
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-success h-full transition-all duration-300"
                    style={{ width: `${hymnsPercent}%` }}
                  />
                </div>

                <div className="space-y-2 text-xs max-h-48 overflow-y-auto pr-1">
                  {childHymns.map((hymn) => (
                    <div key={hymn.id} className="flex justify-between items-center p-2 rounded-lg bg-muted/10 border border-border/40 text-[11px]">
                      <div>
                        <p className="font-bold text-foreground">{hymn.name_ar}</p>
                        <p className="text-[9px] text-muted-foreground">{hymn.category} • {hymn.reward_points} نقطة</p>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                        hymn.status === 'completed'
                          ? 'bg-success/15 text-success'
                          : hymn.status === 'learning'
                          ? 'bg-primary/15 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {hymn.status === 'completed' ? 'تم التسميع بنجاح ✓' : hymn.status === 'learning' ? 'جارٍ الحفظ 📖' : 'لم يبدأ'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Box 3: Church Trips & Bus Allocation */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex justify-between items-center border-b border-border pb-2">
                  <h4 className="font-bold text-xs text-primary flex items-center gap-1.5">
                    <Bus className="h-4 w-4" />
                    الرحلات والمعسكرات الكنسية
                  </h4>
                  <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                    {childTrips.length} رحلة مسجلة
                  </span>
                </div>

                {childTrips.length > 0 ? (
                  <div className="space-y-3 text-xs">
                    {childTrips.map((ct) => {
                      const isFullyPaid = ct.participant.paid_amount >= ct.trip.cost
                      const remaining = ct.trip.cost - ct.participant.paid_amount
                      return (
                        <div key={ct.trip.id} className="p-3 bg-muted/20 border border-border rounded-xl space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-foreground text-xs">{ct.trip.title}</p>
                              <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Clock className="h-3 w-3" />
                                التاريخ: {ct.trip.date}
                              </p>
                            </div>
                            <span className="bg-primary/10 text-primary font-extrabold text-xs px-2 py-0.5 rounded-md">
                              باص رقم {ct.participant.bus_number} 🚌
                            </span>
                          </div>

                          <div className="flex justify-between items-center pt-2 border-t border-border/50 text-[10px]">
                            <span>
                              المسدد: <strong className="text-success">{ct.participant.paid_amount} ج.م</strong> من أصل {ct.trip.cost} ج.م
                            </span>
                            <span className={`font-bold px-2 py-0.5 rounded ${
                              isFullyPaid ? 'bg-success/15 text-success' : 'bg-amber-500/15 text-amber-700'
                            }`}>
                              {isFullyPaid ? 'مسدد بالكامل ✓' : `متبقي ${remaining} ج.م`}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground text-xs">
                    الابن غير مسجل في أي رحلات كنسية قادمة حالياً.
                  </div>
                )}
              </div>

              {/* Box 4: Weekly Lesson & Teacher Contacts */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex justify-between items-center border-b border-border pb-2">
                  <h4 className="font-bold text-xs text-primary flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4" />
                    درس الأسبوع والآية الذهبية
                  </h4>
                  <span className="text-[10px] text-muted-foreground font-semibold">
                    الفصل: {selectedChild.class_name}
                  </span>
                </div>

                <div className="bg-primary/5 border border-primary/10 p-3.5 rounded-xl space-y-1.5">
                  <span className="text-[10px] text-primary font-bold">الآية الذهبية للحفظ بالمنزل:</span>
                  <p className="text-xs font-extrabold text-foreground leading-relaxed">
                    «كُونُوا رَاسِخِينَ، غَيْرَ مُتَزَعْزِعِينَ، مُكْثِرِينَ فِي عَمَلِ الرَّبِّ كُلَّ حِينٍ»
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono font-bold">(١ كورنثوس ١٥: ٥٨)</p>
                </div>

                {/* Direct Contact Button */}
                <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                  <div className="text-[10px] text-muted-foreground">
                    <span>خادم الفصل المسؤول: </span>
                    <strong className="text-foreground">مينا كمال</strong>
                  </div>

                  <a
                    href="https://wa.me/201234567890?text=%D8%B3%D9%84%D8%A7%D9%85%20%D9%88%D9%86%D8%B9%D9%85%D8%A9%20%D8%AE%D8%A7%D8%AF%D9%85%D9%86%D8%A7%20%D8%A7%D9%84%D8%AD%D8%A8%D9%8A%D8%A8"
                    target="_blank"
                    rel="noreferrer"
                    className="h-8 px-3 bg-success hover:bg-success/90 text-success-foreground font-bold rounded-lg text-[10px] flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    مراسلة خادم الفصل (واتساب)
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="py-4 text-center text-[10px] text-muted-foreground border-t border-border mt-auto">
        كنيسة الشهيد العظيم مارمينا العجائبي • بوابة ولي الأمر التفاعلية لمتابعة الأبناء
      </footer>
    </div>
  )
}