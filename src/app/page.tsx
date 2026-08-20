'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shell } from '@/components/layout/Shell'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { useAuth } from '@/lib/auth/AuthContext'
import {
  Users,
  Shield,
  CheckSquare,
  AlertTriangle,
  Gift,
  Cake,
  TrendingUp,
  Phone,
  MessageCircle,
  Award,
  DollarSign,
  Briefcase,
  UserCheck,
  CheckCircle2,
  Plus,
  Send,
  Zap,
  Target,
  Calendar
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts'

export default function DashboardPage() {
  const router = useRouter()
  const { t, locale } = useLanguage()
  const { profile } = useAuth()

  const [activeAcademicYear, setActiveAcademicYear] = useState('2026/2027')
  const [selectedStage, setSelectedStage] = useState('all') // all | ابتدائي | إعدادي | ثانوي
  const [selectedGender, setSelectedGender] = useState('all') // all | male | female
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year' | 'custom'>('week')
  const [startDate, setStartDate] = useState('2026-09-01')
  const [endDate, setEndDate] = useState('2027-08-31')

  useEffect(() => {
    // Load initial year
    const savedYear = localStorage.getItem('activeAcademicYear')
    if (savedYear) setActiveAcademicYear(savedYear)

    // Listen to real-time changes
    const handleStorage = () => {
      const saved = localStorage.getItem('activeAcademicYear')
      if (saved) setActiveAcademicYear(saved)
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  // Dynamic statistics calculator based on selected stage and gender
  const getStats = () => {
    let factor = 1
    if (selectedPeriod === 'week') factor = 0.25
    if (selectedPeriod === 'month') factor = 0.6

    // General Stats
    if (selectedStage === 'all') {
      if (selectedGender === 'male') {
        return { totalStudents: '648', totalServants: '70', attendance: '84%', followups: '10', treasury: `${Math.round(4500 * factor)} ج.م`, servantsAttendance: '92%' }
      } else if (selectedGender === 'female') {
        return { totalStudents: '600', totalServants: '75', attendance: '88%', followups: '8', treasury: `${Math.round(3800 * factor)} ج.م`, servantsAttendance: '95%' }
      }
      return { totalStudents: '1,248', totalServants: '145', attendance: '86%', followups: '18', treasury: `${Math.round(8300 * factor)} ج.م`, servantsAttendance: '94%' }
    }

    // Elementary stage
    if (selectedStage === 'ابتدائي') {
      if (selectedGender === 'male') {
        return { totalStudents: '300', totalServants: '32', attendance: '88%', followups: '3', treasury: `${Math.round(2100 * factor)} ج.م`, servantsAttendance: '95%' }
      } else if (selectedGender === 'female') {
        return { totalStudents: '280', totalServants: '33', attendance: '90%', followups: '3', treasury: `${Math.round(1900 * factor)} ج.م`, servantsAttendance: '96%' }
      }
      return { totalStudents: '580', totalServants: '65', attendance: '89%', followups: '6', treasury: `${Math.round(4000 * factor)} ج.م`, servantsAttendance: '95%' }
    }

    // Middle school stage
    if (selectedStage === 'إعدادي') {
      if (selectedGender === 'male') {
        return { totalStudents: '218', totalServants: '24', attendance: '82%', followups: '4', treasury: `${Math.round(1500 * factor)} ج.م`, servantsAttendance: '90%' }
      } else if (selectedGender === 'female') {
        return { totalStudents: '200', totalServants: '26', attendance: '84%', followups: '3', treasury: `${Math.round(1300 * factor)} ج.م`, servantsAttendance: '93%' }
      }
      return { totalStudents: '418', totalServants: '50', attendance: '83%', followups: '7', treasury: `${Math.round(2800 * factor)} ج.م`, servantsAttendance: '91%' }
    }

    // High school stage
    if (selectedStage === 'ثانوي') {
      if (selectedGender === 'male') {
        return { totalStudents: '130', totalServants: '14', attendance: '79%', followups: '3', treasury: `${Math.round(900 * factor)} ج.م`, servantsAttendance: '88%' }
      } else if (selectedGender === 'female') {
        return { totalStudents: '120', totalServants: '16', attendance: '83%', followups: '2', treasury: `${Math.round(600 * factor)} ج.م`, servantsAttendance: '91%' }
      }
      return { totalStudents: '250', totalServants: '30', attendance: '81%', followups: '5', treasury: `${Math.round(1500 * factor)} ج.م`, servantsAttendance: '90%' }
    }

    return { totalStudents: '1,248', totalServants: '145', attendance: '86%', followups: '18', treasury: '8,300 ج.م', servantsAttendance: '94%' }
  }

  const stats = getStats()

  // Dynamic charts data filtered by selectedPeriod
  const getAttendanceTrend = () => {
    let multiplier = 1
    if (selectedGender === 'male') multiplier = 0.97
    if (selectedGender === 'female') multiplier = 1.03

    if (selectedPeriod === 'week') {
      // Weekly day-by-day attendance rate
      return [
        { name: 'السبت', rate: Math.min(100, Math.round(82 * multiplier)) },
        { name: 'الأحد', rate: Math.min(100, Math.round(84 * multiplier)) },
        { name: 'الاثنين', rate: Math.min(100, Math.round(80 * multiplier)) },
        { name: 'الثلاثاء', rate: Math.min(100, Math.round(83 * multiplier)) },
        { name: 'الأربعاء', rate: Math.min(100, Math.round(81 * multiplier)) },
        { name: 'الخميس', rate: Math.min(100, Math.round(85 * multiplier)) },
        { name: 'الجمعة', rate: Math.min(100, Math.round(89 * multiplier)) },
      ]
    }

    if (selectedPeriod === 'month') {
      // Monthly 4 weeks attendance rate
      return [
        { name: 'الأسبوع ١', rate: Math.min(100, Math.round(79 * multiplier)) },
        { name: 'الأسبوع ٢', rate: Math.min(100, Math.round(82 * multiplier)) },
        { name: 'الأسبوع ٣', rate: Math.min(100, Math.round(85 * multiplier)) },
        { name: 'الأسبوع ٤', rate: Math.min(100, Math.round(88 * multiplier)) },
      ]
    }

    // Default: Academic year (monthly averages)
    return [
      { name: 'سبتمبر', rate: Math.min(100, Math.round(75 * multiplier)) },
      { name: 'أكتوبر', rate: Math.min(100, Math.round(78 * multiplier)) },
      { name: 'نوفمبر', rate: Math.min(100, Math.round(82 * multiplier)) },
      { name: 'ديسمبر', rate: Math.min(100, Math.round(80 * multiplier)) },
      { name: 'يناير', rate: Math.min(100, Math.round(83 * multiplier)) },
      { name: 'فبراير', rate: Math.min(100, Math.round(85 * multiplier)) },
      { name: 'مارس', rate: Math.min(100, Math.round(86 * multiplier)) },
      { name: 'أبريل', rate: Math.min(100, Math.round(88 * multiplier)) },
      { name: 'مايو', rate: Math.min(100, Math.round(90 * multiplier)) },
    ]
  }

  const attendanceTrendData = getAttendanceTrend()

  const getClassComparison = () => {
    const list = [
      { name: 'أنبا بيشوي', boys: 92, girls: 0, stage: 'ابتدائي' },
      { name: 'دميانة', boys: 0, girls: 95, stage: 'ابتدائي' },
      { name: 'مارمينا ب', boys: 88, girls: 0, stage: 'ابتدائي' },
      { name: 'مارجرجس', boys: 85, girls: 0, stage: 'إعدادي' },
      { name: 'العذراء مريم', boys: 0, girls: 90, stage: 'إعدادي' },
      { name: 'مارمينا ث', boys: 78, girls: 0, stage: 'ثانوي' },
      { name: 'العذراء الملاك', boys: 0, girls: 84, stage: 'ثانوي' }
    ]

    const stageFiltered = selectedStage === 'all' ? list : list.filter(item => item.stage === selectedStage)
    
    return stageFiltered.map(c => ({
      name: c.name,
      boys: selectedGender === 'female' ? 0 : c.boys,
      girls: selectedGender === 'male' ? 0 : c.girls
    }))
  }

  const classComparisonData = getClassComparison()

  // Pie Chart Dynamic Data (Gender Breakdown)
  const getGenderRatio = () => {
    const s = getStats()
    const total = parseInt(s.totalStudents.replace(/,/g, ''), 10)
    
    if (selectedGender === 'male') {
      return [{ name: 'أولاد', value: total, color: 'hsl(var(--primary))' }]
    }
    if (selectedGender === 'female') {
      return [{ name: 'بنات', value: total, color: 'hsl(var(--secondary))' }]
    }

    const boysCount = Math.round(total * 0.52)
    const girlsCount = total - boysCount

    return [
      { name: 'أولاد (بنين)', value: boysCount, color: 'hsl(var(--primary))' },
      { name: 'بنات (فتيات)', value: girlsCount, color: 'hsl(var(--secondary))' }
    ]
  }

  const genderRatioData = getGenderRatio()

  // Birthdays of both Students AND Servants (Item 58)
  const getBirthdays = () => {
    const list = [
      // Students
      { id: 's1', name: 'كيرلس جرجس حبيب', age: 10, class: 'الأنبا بيشوي', phone: '+201234567890', stage: 'ابتدائي', gender: 'male', type: 'student', month: '08', day: '18' },
      { id: 's2', name: 'مارينا رأفت عياد', age: 11, class: 'القديسة دميانة', phone: '+201234567891', stage: 'ابتدائي', gender: 'female', type: 'student', month: '08', day: '25' },
      { id: 's3', name: 'يوحنا سامح توفيق', age: 9, class: 'مارجرجس', phone: '+201234567892', stage: 'إعدادي', gender: 'male', type: 'student', month: '08', day: '10' },
      { id: 's4', name: 'جورج فايز منير', age: 16, class: 'مارمينا ث', phone: '+201234567895', stage: 'ثانوي', gender: 'male', type: 'student', month: '09', day: '05' },
      { id: 's5', name: 'دميانة سمير شفيق', age: 15, class: 'العذراء الملاك', phone: '+201234567899', stage: 'ثانوي', gender: 'female', type: 'student', month: '09', day: '12' },
      
      // Servants (Item 58)
      { id: 'v1', name: 'الخادم مينا كمال غبريال', age: 31, class: 'خدمة ابتدائي', phone: '+201234567896', stage: 'ابتدائي', gender: 'male', type: 'servant', month: '08', day: '20' },
      { id: 'v2', name: 'الخادمة يوستينا عادل فوزي', age: 28, class: 'خدمة إعدادي', phone: '+201234567897', stage: 'إعدادي', gender: 'female', type: 'servant', month: '08', day: '12' },
      { id: 'v3', name: 'الخادم أمجد ناصف صليب', age: 35, class: 'خدمة ثانوي', phone: '+201234567888', stage: 'ثانوي', gender: 'male', type: 'servant', month: '09', day: '18' }
    ]

    return list.filter(item => {
      const matchStage = selectedStage === 'all' || item.stage === selectedStage
      const matchGender = selectedGender === 'all' || (selectedGender === 'male' && item.gender === 'male') || (selectedGender === 'female' && item.gender === 'female')
      
      // Period filter for birthdays
      let matchPeriod = true
      if (selectedPeriod === 'week') {
        // filter specific dates in august
        matchPeriod = item.month === '08' && parseInt(item.day, 10) >= 10 && parseInt(item.day, 10) <= 25
      } else if (selectedPeriod === 'month') {
        // filter current month (August)
        matchPeriod = item.month === '08'
      } else if (selectedPeriod === 'custom') {
        // filter custom range months (September)
        matchPeriod = item.month === '09'
      }

      return matchStage && matchGender && matchPeriod
    })
  }

  const birthdays = getBirthdays()

  // Dynamic followups lists
  const getFollowups = () => {
    const list = [
      { id: 1, name: 'مينا عماد نصيف', class: 'مارجرجس', status: 'غائب مرتين متتاليتين', lastSeen: 'منذ ١٤ يوماً', phone: '+201234567893', stage: 'إعدادي', gender: 'male' },
      { id: 2, name: 'مريم شريف فوزي', class: 'العذراء مريم', status: 'غائب ٣ مرات في ٥ أسابيع', lastSeen: 'منذ ٢١ يوماً', phone: '+201234567894', stage: 'إعدادي', gender: 'female' },
      { id: 3, name: 'ابانوب عادل فريد', class: 'الأنبا بيشوي', status: 'غائب منذ شهر', lastSeen: 'منذ ٣٠ يوماً', phone: '+201234567897', stage: 'ابتدائي', gender: 'male' },
      { id: 4, name: 'سارة يوسف جرجس', class: 'العذراء الملاك', status: 'غائب مرتين متتاليتين', lastSeen: 'منذ ١٢ يوماً', phone: '+201234567898', stage: 'ثانوي', gender: 'female' },
    ]
    return list.filter(item => {
      const matchStage = selectedStage === 'all' || item.stage === selectedStage
      const matchGender = selectedGender === 'all' || (selectedGender === 'male' && item.gender === 'male') || (selectedGender === 'female' && item.gender === 'female')
      return matchStage && matchGender
    })
  }

  const followUpNeeded = getFollowups()

  // Student Leaderboard (Top students by points/attendance)
  const getLeaderboard = () => {
    const list = [
      { rank: 1, name: 'كيرلس جرجس حبيب', points: 340, class: 'الأنبا بيشوي', stage: 'ابتدائي', gender: 'male' },
      { rank: 2, name: 'مارينا رأفت عياد', points: 325, class: 'القديسة دميانة', stage: 'ابتدائي', gender: 'female' },
      { rank: 3, name: 'ستيفن عماد مرقس', points: 310, class: 'مارجرجس', stage: 'إعدادي', gender: 'male' },
      { rank: 4, name: 'ناردين رمزي صبحي', points: 295, class: 'العذراء الملاك', stage: 'ثانوي', gender: 'female' },
      { rank: 5, name: 'يوسف هاني كمال', points: 280, class: 'مارجرجس', stage: 'إعدادي', gender: 'male' }
    ]
    return list.filter(item => {
      const matchStage = selectedStage === 'all' || item.stage === selectedStage
      const matchGender = selectedGender === 'all' || (selectedGender === 'male' && item.gender === 'male') || (selectedGender === 'female' && item.gender === 'female')
      return matchStage && matchGender
    })
  }

  const studentLeaderboard = getLeaderboard()

  return (
    <Shell>
      <div className="space-y-6 font-sans text-right">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {locale === 'ar' ? 'أهلاً بك، ' : 'Welcome, '}
              <span className="text-primary">{profile?.name || (locale === 'ar' ? 'الخادم المسؤول' : 'Servant')}</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              لوحة تحليل شاملة لنشاط مدارس الأحد، نسب الغياب، الخدام، الخزائن المالية، والمكافآت.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground bg-card border border-border px-3 py-1.5 rounded-lg shadow-sm w-fit">
            <span>العام الدراسي الحالي: </span>
            <span className="font-semibold text-primary">{activeAcademicYear}</span>
          </div>
        </div>

        {/* 🎛️ TRIPLE DUAL DYNAMIC FILTERS: STAGE, GENDER & PERIOD */}
        <div className="bg-card border border-border p-4 rounded-xl shadow-sm space-y-4 print:hidden">
          <div className="flex flex-col lg:flex-row justify-between gap-4 items-center">
            {/* Stage Filter */}
            <div className="flex items-center gap-2 w-full lg:w-auto">
              <span className="text-xs font-bold text-muted-foreground shrink-0">مرحلة الخدمة:</span>
              <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
                {[
                  { id: 'all', label: 'كل المراحل' },
                  { id: 'ابتدائي', label: 'ابتدائي' },
                  { id: 'إعدادي', label: 'إعدادي' },
                  { id: 'ثانوي', label: 'ثانوي' }
                ].map((stg) => (
                  <button
                    key={stg.id}
                    onClick={() => setSelectedStage(stg.id)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition ${
                      selectedStage === stg.id 
                        ? 'bg-primary text-primary-foreground shadow-sm' 
                        : 'bg-muted/40 border border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {stg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Gender Selector */}
            <div className="flex items-center gap-2 w-full lg:w-auto border-t lg:border-t-0 pt-3 lg:pt-0 border-border">
              <span className="text-xs font-bold text-muted-foreground shrink-0">النوع والقطاع:</span>
              <div className="flex gap-1.5">
                {[
                  { id: 'all', label: 'الكل' },
                  { id: 'male', label: 'بنين (أولاد)' },
                  { id: 'female', label: 'بنات (فتيات)' }
                ].map((gend) => (
                  <button
                    key={gend.id}
                    onClick={() => setSelectedGender(gend.id)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition ${
                      selectedGender === gend.id 
                        ? 'bg-secondary text-secondary-foreground shadow-sm' 
                        : 'bg-muted/40 border border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {gend.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Period Selector (Item 58) */}
            <div className="flex items-center gap-2 w-full lg:w-auto border-t lg:border-t-0 pt-3 lg:pt-0 border-border">
              <span className="text-xs font-bold text-muted-foreground shrink-0 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                فترة التقارير:
              </span>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="bg-muted/40 border border-border rounded-lg px-2.5 py-1.5 text-xs font-bold text-primary outline-none focus:border-primary/50"
              >
                <option value="week">هذا الأسبوع (This Week)</option>
                <option value="month">هذا الشهر (This Month)</option>
                <option value="year">هذا العام الدراسي (Year)</option>
                <option value="custom">فترة مخصصة (Custom Range)</option>
              </select>
            </div>
          </div>

          {/* Custom Date Range Inputs */}
          {selectedPeriod === 'custom' && (
            <div className="flex items-center gap-2 pt-3 border-t border-border/60 animate-in slide-in-from-top-1">
              <span className="text-xs font-semibold text-muted-foreground">تحديد الفترة بالتواريخ:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-muted/40 border border-border rounded-lg px-2.5 py-1 text-xs font-semibold text-primary outline-none focus:border-primary/50"
              />
              <span className="text-xs text-muted-foreground">إلى</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-muted/40 border border-border rounded-lg px-2.5 py-1 text-xs font-semibold text-primary outline-none focus:border-primary/50"
              />
            </div>
          )}
        </div>

        {/* Overview Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Students */}
          <div 
            onClick={() => router.push(`/students`)}
            className="bg-card border border-border p-4 rounded-xl shadow-sm flex items-center justify-between transition-all duration-300 hover:shadow-md hover:border-primary/40 cursor-pointer active:scale-98 select-none"
            title="انتقل لدليل المخدومين"
          >
            <div className="space-y-1 text-right">
              <p className="text-[10px] font-bold text-muted-foreground">إجمالي المخدومين بالخدمة</p>
              <h3 className="text-xl md:text-2xl font-black text-foreground">{stats.totalStudents}</h3>
              <p className="text-[9px] text-primary hover:underline flex items-center gap-0.5 justify-end">عرض الطلاب ⟵</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Users className="h-5 w-5" />
            </div>
          </div>

          {/* Card 2: Total Servants */}
          <div 
            onClick={() => router.push('/servants')}
            className="bg-card border border-border p-4 rounded-xl shadow-sm flex items-center justify-between transition-all duration-300 hover:shadow-md hover:border-secondary/40 cursor-pointer active:scale-98 select-none"
            title="انتقل لشؤون الخدام"
          >
            <div className="space-y-1 text-right">
              <p className="text-[10px] font-bold text-muted-foreground">إجمالي الخدام المكلفين</p>
              <h3 className="text-xl md:text-2xl font-black text-foreground">{stats.totalServants}</h3>
              <p className="text-[9px] text-secondary-foreground hover:underline flex items-center gap-0.5 justify-end">عرض الخدام ⟵</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary-foreground shrink-0">
              <Shield className="h-5 w-5" />
            </div>
          </div>

          {/* Card 3: Today's Attendance */}
          <div 
            onClick={() => router.push('/attendance')}
            className="bg-card border border-border p-4 rounded-xl shadow-sm flex items-center justify-between transition-all duration-300 hover:shadow-md hover:border-success/40 cursor-pointer active:scale-98 select-none"
            title="سجل الحضور والغياب"
          >
            <div className="space-y-1 text-right">
              <p className="text-[10px] font-bold text-muted-foreground">نسبة حضور اجتماع اليوم</p>
              <h3 className="text-xl md:text-2xl font-black text-success">{stats.attendance}</h3>
              <p className="text-[9px] text-success hover:underline flex items-center gap-0.5 justify-end">تسجيل حضور ⟵</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center text-success shrink-0">
              <CheckSquare className="h-5 w-5" />
            </div>
          </div>

          {/* Card 4: Followup Needed */}
          <div 
            onClick={() => router.push('/followups')}
            className="bg-card border border-border p-4 rounded-xl shadow-sm flex items-center justify-between transition-all duration-300 hover:shadow-md hover:border-destructive/40 cursor-pointer active:scale-98 select-none"
            title="افتقاد الغائبين"
          >
            <div className="space-y-1 text-right">
              <p className="text-[10px] font-bold text-muted-foreground">حالات الغياب المكرر (الافتقاد)</p>
              <h3 className="text-xl md:text-2xl font-black text-destructive">{stats.followups}</h3>
              <p className="text-[9px] text-destructive hover:underline flex items-center gap-0.5 justify-end">رصد الزيارات ⟵</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>

          {/* Card 5: Stage Treasury Balance */}
          <div 
            onClick={() => router.push('/finance')}
            className="bg-card border border-border p-4 rounded-xl shadow-sm flex items-center justify-between transition-all duration-300 hover:shadow-md hover:border-amber-500/40 cursor-pointer active:scale-98 select-none"
            title="الخزينة والحسابات"
          >
            <div className="space-y-1 text-right">
              <p className="text-[10px] font-bold text-muted-foreground">رصيد الخزينة المتاح للمرحلة</p>
              <h3 className="text-xl md:text-2xl font-black text-amber-500">{stats.treasury}</h3>
              <p className="text-[9px] text-amber-600 hover:underline flex items-center gap-0.5 justify-end">دفتر الحسابات ⟵</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>

          {/* Card 6: Servants Attendance */}
          <div 
            onClick={() => router.push('/servants')}
            className="bg-card border border-border p-4 rounded-xl shadow-sm flex items-center justify-between transition-all duration-300 hover:shadow-md hover:border-indigo-500/40 cursor-pointer active:scale-98 select-none"
            title="حضور الخدام"
          >
            <div className="space-y-1 text-right">
              <p className="text-[10px] font-bold text-muted-foreground">نسبة التزام وحضور الخدام</p>
              <h3 className="text-xl md:text-2xl font-black text-indigo-500">{stats.servantsAttendance}</h3>
              <p className="text-[9px] text-indigo-600 hover:underline flex items-center gap-0.5 justify-end">تفاصيل الخدمة ⟵</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 shrink-0">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>

          {/* Card 7: Followups Done Rate */}
          <div 
            onClick={() => router.push('/followups')}
            className="bg-card border border-border p-4 rounded-xl shadow-sm flex items-center justify-between transition-all duration-300 hover:shadow-md hover:border-teal-500/40 cursor-pointer active:scale-98 select-none"
            title="إنجاز الافتقاد"
          >
            <div className="space-y-1 text-right">
              <p className="text-[10px] font-bold text-muted-foreground">نسبة إنجاز تكليفات الافتقاد</p>
              <h3 className="text-xl md:text-2xl font-black text-teal-500">72%</h3>
              <p className="text-[9px] text-teal-600 hover:underline flex items-center gap-0.5 justify-end">سجل الافتقاد ⟵</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-600 shrink-0">
              <Target className="h-5 w-5" />
            </div>
          </div>

          {/* Card 8: Points Target */}
          <div 
            onClick={() => router.push('/points')}
            className="bg-card border border-border p-4 rounded-xl shadow-sm flex items-center justify-between transition-all duration-300 hover:shadow-md hover:border-pink-500/40 cursor-pointer active:scale-98 select-none"
            title="بنك النقاط"
          >
            <div className="space-y-1 text-right">
              <p className="text-[10px] font-bold text-muted-foreground">معدل تحصيل النقاط والآيات</p>
              <h3 className="text-xl md:text-2xl font-black text-pink-500">+1,420 pt</h3>
              <p className="text-[9px] text-pink-600 hover:underline flex items-center gap-0.5 justify-end">الترتيب والجوائز ⟵</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-600 shrink-0">
              <Zap className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* 📊 THREE POWERFUL CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart 1: Attendance Area Trend */}
          <div className="bg-card border border-border p-5 rounded-xl shadow-sm space-y-4 lg:col-span-2">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-primary" />
              معدل ونسب حضور الاجتماع ({selectedPeriod === 'week' ? 'خلال أيام الأسبوع' : selectedPeriod === 'month' ? 'خلال أسابيع الشهر' : 'خلال العام الدراسي'})
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attendanceTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                      color: 'hsl(var(--foreground))'
                    }}
                  />
                  <Area type="monotone" dataKey="rate" name="نسبة الحضور" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#primaryGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Gender Breakdown Pie Chart */}
          <div className="bg-card border border-border p-5 rounded-xl shadow-sm space-y-4">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Users className="h-4.5 w-4.5 text-secondary-foreground" />
              نسبة توزيع المخدومين بالقطاع
            </h3>
            <div className="h-64 w-full flex flex-col justify-center items-center">
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderRatioData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {genderRatioData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Legend */}
              <div className="flex gap-4 text-xs font-semibold">
                {genderRatioData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}: {item.value} طالب</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chart 3: Class Comparison Bar Chart */}
          <div className="bg-card border border-border p-5 rounded-xl shadow-sm space-y-4 lg:col-span-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Briefcase className="h-4.5 w-4.5 text-amber-500" />
              توزيع نسب وأعداد البنين والبنات بالفصول النشطة
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                      color: 'hsl(var(--foreground))'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="boys" name="بنين" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={14} />
                  <Bar dataKey="girls" name="بنات" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ⚡ Quick Tools shortcuts card panel */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3.5 print:hidden text-right">
          <h3 className="font-bold text-xs text-primary flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-primary" />
            شريط الأدوات والاختصارات البرمجية السريعة
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => router.push('/attendance/record')}
              className="py-2.5 px-3 bg-muted/40 hover:bg-primary hover:text-primary-foreground border border-border hover:border-primary rounded-lg text-xs font-bold transition flex items-center gap-2 justify-center"
            >
              <span>تسجيل غياب اليوم</span>
              <CheckSquare className="h-4 w-4 shrink-0" />
            </button>
            <button
              onClick={() => router.push('/students/new')}
              className="py-2.5 px-3 bg-muted/40 hover:bg-primary hover:text-primary-foreground border border-border hover:border-primary rounded-lg text-xs font-bold transition flex items-center gap-2 justify-center"
            >
              <span>تسجيل مخدوم جديد</span>
              <Plus className="h-4 w-4 shrink-0" />
            </button>
            <button
              onClick={() => router.push('/settings')}
              className="py-2.5 px-3 bg-muted/40 hover:bg-secondary hover:text-secondary-foreground border border-border hover:border-secondary rounded-lg text-xs font-bold transition flex items-center gap-2 justify-center"
            >
              <span>إدارة الحقول ورابط البعد</span>
              <Send className="h-4 w-4 shrink-0" />
            </button>
            <button
              onClick={() => router.push('/reports')}
              className="py-2.5 px-3 bg-muted/40 hover:bg-secondary hover:text-secondary-foreground border border-border hover:border-secondary rounded-lg text-xs font-bold transition flex items-center gap-2 justify-center"
            >
              <span>تصدير كشوفات الإكسل</span>
              <Award className="h-4 w-4 shrink-0" />
            </button>
          </div>
        </div>

        {/* 🏆 BOTTOM LISTS WIDGETS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leaderboard widget */}
          <div className="bg-card border border-border p-5 rounded-xl shadow-sm space-y-4 flex flex-col">
            <div className="flex items-center justify-between border-b border-border pb-3 shrink-0">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                المتصدرين في النقاط وحفظ الآيات
              </h3>
              <span className="text-[10px] bg-amber-500/10 text-amber-600 font-bold px-2 py-0.5 rounded-full">
                لوحة الشرف
              </span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 max-h-80 scrollbar-thin">
              {studentLeaderboard.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/40 transition">
                  <div className="flex items-center gap-2.5">
                    <div className="h-6 w-6 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-xs shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-foreground">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground">{item.class}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-success">+{item.points} نقطة</span>
                </div>
              ))}
              {studentLeaderboard.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-8">لا يوجد متصدرين في هذه المرحلة حالياً.</p>
              )}
            </div>
          </div>

          {/* Birthdays widget (Items 58) */}
          <div className="bg-card border border-border p-5 rounded-xl shadow-sm space-y-4 flex flex-col">
            <div className="flex items-center justify-between border-b border-border pb-3 shrink-0">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Cake className="h-5 w-5 text-secondary-foreground" />
                أعياد ميلاد المخدومين والخدام
              </h3>
              <span className="text-[10px] bg-secondary/15 text-secondary-foreground font-bold px-2 py-0.5 rounded-full">
                {birthdays.length} تهنئة
              </span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 max-h-80 scrollbar-thin">
              {birthdays.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/40 transition">
                  <div className="flex items-center gap-2.5">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      item.type === 'servant' 
                        ? 'bg-primary/20 text-primary border border-primary/30' 
                        : 'bg-secondary/10 text-secondary-foreground'
                    }`}>
                      {item.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-xs truncate">{item.name}</p>
                        <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full ${
                          item.type === 'servant' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                        }`}>
                          {item.type === 'servant' ? 'خادم' : 'مخدوم'}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {item.class} • {item.age} {locale === 'ar' ? 'سنة' : 'years'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={`tel:${item.phone}`}
                      className="p-1 rounded hover:bg-muted text-muted-foreground transition"
                      title="اتصال هاتفي"
                    >
                      <Phone className="h-3.5 w-3.5" />
                    </a>
                    <a
                      href={`https://wa.me/${item.phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded hover:bg-success/10 text-success transition"
                      title="مراسلة واتساب"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              ))}
              {birthdays.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-8">لا توجد أعياد ميلاد بالفترة والمرحلة المحددة.</p>
              )}
            </div>
          </div>

          {/* Followups widget */}
          <div className="bg-card border border-border p-5 rounded-xl shadow-sm space-y-4 flex flex-col">
            <div className="flex items-center justify-between border-b border-border pb-3 shrink-0">
              <h3 className="font-semibold text-sm flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                حالات غياب متكرر (افتقاد عاجل)
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 max-h-80 scrollbar-thin">
              {followUpNeeded.map((item) => (
                <div key={item.id} className="flex items-start justify-between p-2 rounded-lg hover:bg-muted/40 transition">
                  <div className="min-w-0 space-y-0.5">
                    <p className="font-semibold text-xs truncate">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground">{item.class} • غائب {item.lastSeen}</p>
                    <span className="inline-block text-[9px] font-bold bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">
                      {item.status}
                    </span>
                  </div>
                  <a
                    href={`tel:${item.phone}`}
                    className="h-7 px-2.5 rounded-lg border border-border hover:bg-muted text-[10px] font-bold flex items-center gap-1 shrink-0 transition"
                  >
                    <Phone className="h-3 w-3" />
                    اتصال
                  </a>
                </div>
              ))}
              {followUpNeeded.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-8">لا توجد حالات غياب متكررة تستدعي الافتقاد العاجل.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  )
}
