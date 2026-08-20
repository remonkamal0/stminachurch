'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Shell } from '@/components/layout/Shell'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import {
  BarChart,
  FileSpreadsheet,
  FileText,
  Printer,
  CheckSquare,
  Award,
  DollarSign,
  Users,
  Cake,
  TrendingUp,
  MessageCircle,
  Phone,
  Calendar,
  AlertTriangle,
  FileDown,
  ArrowUpRight
} from 'lucide-react'

type TabKey = 'dashboard' | 'classes-matrix' | 'rosters' | 'absentees' | 'finance' | 'birthdays'

export default function ReportsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-xs text-muted-foreground font-sans">جاري تحميل التقارير والإحصائيات...</div>}>
      <ReportsPageContent />
    </Suspense>
  )
}

function ReportsPageContent() {
  const { locale } = useLanguage()
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard')
  
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam as TabKey)
    } else {
      setActiveTab('dashboard')
    }
  }, [tabParam])

  const [selectedMonth, setSelectedMonth] = useState<number>(8) // Defaults to August
  
  // Selected class for roster logs
  const [selectedRosterClass, setSelectedRosterClass] = useState('c1')

  // Date range & PDF export states (Item 57)
  const [reportStartDate, setReportStartDate] = useState('2026-08-01')
  const [reportEndDate, setReportEndDate] = useState('2026-08-31')
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const handleExportExcel = (reportType: string) => {
    let headers: string[] = []
    let rows: string[][] = []
    
    if (reportType === 'classes-matrix') {
      headers = ['الفصل', 'المرحلة الدراسية', 'عدد الطلاب', 'نسبة حضور الاجتماع', 'نسبة حضور القداسات', 'الاعتراف والارشاد', 'الافتقاد']
      rows = classMatrixData.map(rep => [
        rep.name,
        rep.grade,
        rep.students.toString(),
        rep.attendance,
        rep.mass,
        rep.confession,
        rep.followUp
      ])
    } else if (reportType === 'absentees') {
      headers = ['اسم الخادم', 'الفصل التابع له', 'عدد أسابيع الغياب', 'آخر تاريخ حضور', 'الخادم المسؤول عن الافتقاد', 'حالة الافتقاد الحالية']
      rows = chronicAbsentees.map(rep => [
        rep.name,
        rep.class,
        rep.absentWeeks.toString(),
        rep.lastSeen,
        rep.servant,
        rep.status
      ])
    } else if (reportType === 'finance') {
      headers = ['بند الميزانية', 'نوع المعاملة', 'المبلغ']
      rows = financialSummary.categories.map(rep => [
        rep.name,
        rep.type === 'income' ? 'إيرادات' : 'مصروفات',
        `${rep.amount} ج.م`
      ])
    } else {
      headers = ['اسم المخدوم/الخادم', 'تاريخ الميلاد', 'السن', 'الفصل/الدور الصلاحي', 'رقم الهاتف']
      rows = [
        ...studentsBirthdays.map(b => [b.name, b.date, b.age.toString(), b.class, b.phone]),
        ...servantsBirthdays.map(b => [b.name, b.date, '—', b.role, b.phone])
      ]
    }
    
    // Add UTF-8 BOM to ensure Arabic language letters render correctly in MS Excel
    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(r => r.map(c => `"${c.toString().replace(/"/g, '""')}"`).join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `تقرير_${reportType}_${reportStartDate}_إلى_${reportEndDate}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportPDF = () => {
    setIsGeneratingPDF(true)
    setTimeout(() => {
      setIsGeneratingPDF(false)
      window.print()
    }, 1000)
  }

  const handleExportRosterCSV = () => {
    const classObj = classesList.find(c => c.id === selectedRosterClass)
    const className = classObj ? classObj.name : 'فصل'
    
    const headers = ['الكود', 'الاسم بالكامل', 'تاريخ الميلاد', 'هاتف ولي الأمر', 'أب الاعتراف', 'العنوان بالتفصيل', 'المواهب والمهارات', 'الحالة']
    const rows = activeRoster.map(s => [
      s.code,
      s.name,
      s.birthDate,
      s.phone,
      s.father,
      s.address,
      s.talents,
      s.status === 'active' ? 'منتظم' : 'غير منتظم'
    ])
    
    // Add UTF-8 BOM to ensure Arabic language letters render correctly in MS Excel
    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(r => r.map(c => `"${c.toString().replace(/"/g, '""')}"`).join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `كشف_أسماء_${className}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Mock classes list
  const classesList = [
    { id: 'c1', name: 'فصل الأنبا بيشوي', stage: 'ابتدائي' },
    { id: 'c2', name: 'فصل القديسة دميانة', stage: 'ابتدائي' },
    { id: 'c3', name: 'فصل مارجرجس', stage: 'إعدادي' },
    { id: 'c4', name: 'فصل العذراء مريم', stage: 'إعدادي' }
  ]

  // Mock Students Database with FULL PROFILE DATA (Address, Birth Date, Talents, Father, Phone, Code)
  const studentsRosterDatabase: Record<string, { code: string; name: string; phone: string; father: string; address: string; birthDate: string; talents: string; status: string }[]> = {
    c1: [
      { code: '301', name: 'كيرلس جرجس حبيب', phone: '01234567891', father: 'أبونا مرقس كمال', address: 'شارع شبرا الرئيسي، القاهرة (شقة ٤أ)', birthDate: '2016-08-18', talents: 'رسم، ترانيم، تمثيل', status: 'منتظم' },
      { code: '303', name: 'يوحنا سامح توفيق', phone: '01234567894', father: 'أبونا أنطونيوس صبحي', address: 'شارع مسرة، القاهرة (الدور الثاني)', birthDate: '2017-08-10', talents: 'ألحان، قراءة وإلقاء شعر', status: 'منتظم' }
    ],
    c2: [
      { code: '302', name: 'مارينا رأفت عياد', phone: '01234567892', father: 'أبونا بطرس صليب', address: 'شارع الترعة البولاقية، القاهرة (برج الفرسان)', birthDate: '2016-08-25', talents: 'ترانيم، أشغال يدوية، كروشيه', status: 'منتظم' }
    ],
    c3: [
      { code: '304', name: 'مينا عماد نصيف', phone: '01234567896', father: 'أبونا مرقس كمال', address: 'شارع خلوصي، القاهرة (بجوار محطة المترو)', birthDate: '2015-05-12', talents: 'تصوير، عزف جيتار، كمبيوتر', status: 'غير منتظم' }
    ],
    c4: [
      { code: '305', name: 'مريم شريف فوزي', phone: '01234567889', father: 'أبونا بطرس صليب', address: 'شارع العطار، القاهرة (عمارة القديسين)', birthDate: '2014-12-05', talents: 'شعر، تمثيل، قيادة ألعاب تفاعلية', status: 'منتظم' }
    ]
  }

  // Mock Classroom Scorecard Matrix (Item 57)
  const classMatrixData = [
    { name: 'فصل الأنبا بيشوي', grade: 'ثالثة ابتدائي', students: 18, attendance: '165/180 (92%)', mass: '158/180 (88%)', confession: '15/18 (85%)', followUp: '17/18 (95%)' },
    { name: 'فصل القديسة دميانة', grade: 'رابعة ابتدائي', students: 15, attendance: '129/150 (86%)', mass: '120/150 (80%)', confession: '11/15 (73%)', followUp: '13/15 (86%)' },
    { name: 'فصل مارجرجس', grade: 'أولى إعدادي', students: 22, attendance: '176/220 (80%)', mass: '154/220 (70%)', confession: '13/22 (59%)', followUp: '17/22 (77%)' },
    { name: 'فصل العذراء مريم', grade: 'ثانية إعدادي', students: 20, attendance: '176/200 (88%)', mass: '164/200 (82%)', confession: '15/20 (75%)', followUp: '17/20 (85%)' }
  ]

  // Mock Irregular/Absentee list
  const chronicAbsentees = [
    { name: 'مينا عماد نصيف', class: 'مارجرجس', absentWeeks: 3, lastSeen: '2026-07-25', servant: 'تامر شفيق', status: 'جاري التنسيق لزيارة' },
    { name: 'يوحنا سامح توفيق', class: 'الأنبا بيشوي', absentWeeks: 4, lastSeen: '2026-07-18', servant: 'مينا كمال', status: 'لم يتم الرد على المكالمات' }
  ]

  // Mock Financial Ledger breakdown
  const financialSummary = {
    totalIncome: 1200.0,
    totalExpense: 600.0,
    balance: 600.0,
    categories: [
      { name: 'أنشطة ومهرجانات الكنيسة', type: 'expense', amount: 450.0 },
      { name: 'أغذية ووجبات خفيفة', type: 'expense', amount: 150.0 },
      { name: 'تبرعات نقدية وعينية للخدمة', type: 'income', amount: 1200.0 }
    ]
  }

  const activeRoster = studentsRosterDatabase[selectedRosterClass] || []

  // Mock birthdays data
  const studentsBirthdays = [
    { id: 'sb1', name: 'كيرلس جرجس حبيب', date: '2016-08-18', month: 8, age: 10, class: 'الأنبا بيشوي', phone: '01234567891' },
    { id: 'sb2', name: 'مارينا رأفت عياد', date: '2016-08-25', month: 8, age: 10, class: 'القديسة دميانة', phone: '01234567892' },
    { id: 'sb3', name: 'يوحنا سامح توفيق', date: '2017-08-10', month: 8, age: 9, class: 'الأنبا بيشوي', phone: '01234567894' }
  ]

  const servantsBirthdays = [
    { id: 'srvb1', name: 'مينا كمال غبريال', date: '1995-08-21', month: 8, role: 'أمين فصل', phone: '01234567890' },
    { id: 'srvb2', name: 'يوستينا عادل فوزي', date: '1998-08-05', month: 8, role: 'خادم', phone: '01234567891' }
  ]

  const months = [
    { value: 1, name: 'يناير' }, { value: 2, name: 'فبراير' }, { value: 3, name: 'مارس' }, { value: 4, name: 'أبريل' },
    { value: 5, name: 'مايو' }, { value: 6, name: 'يونيو' }, { value: 7, name: 'يوليو' }, { value: 8, name: 'أغسطس' },
    { value: 9, name: 'سبتمبر' }, { value: 10, name: 'أكتوبر' }, { value: 11, name: 'نوفمبر' }, { value: 12, name: 'ديسمبر' }
  ]

  const handlePrintRoster = () => {
    window.print()
  }

  return (
    <Shell>
      <div className="space-y-6 font-sans">
        {/* Header */}
        <div className="border-b border-border pb-4 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">مركز التقارير والإحصائيات</h1>
            <p className="text-sm text-muted-foreground mt-1">
              تحليل شامل لكافة قطاعات الخدمة: كشوف أسماء الفصول، الحضور، القداسات، والمالية.
            </p>
          </div>
        </div>

        {/* Dynamic Navigation Tabs */}
        <div className="flex border-b border-border gap-4 overflow-x-auto scrollbar-none print:hidden">
          {[
            { id: 'dashboard', label: 'العرض الإحصائي الشامل', icon: TrendingUp },
            { id: 'rosters', label: 'كشوفات أسماء الفصول التفصيلية', icon: Users },
            { id: 'classes-matrix', label: 'مصفوفة أداء الفصول', icon: BarChart },
            { id: 'absentees', label: 'كشف الغياب والمنقطعين', icon: AlertTriangle },
            { id: 'finance', label: 'ميزانية الخدمة والمالية', icon: DollarSign },
            { id: 'birthdays', label: 'أعياد ميلاد المخدومين والخدام', icon: Cake }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabKey)}
                className={`py-2.5 px-3 text-xs md:text-sm font-semibold border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* TAB 1: DASHBOARD VIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-1">
                <p className="text-[10px] text-muted-foreground font-semibold">إجمالي المخدومين المقيدين</p>
                <h3 className="text-2xl font-bold text-foreground">75 مخدوم</h3>
                <span className="text-[10px] text-success font-semibold flex items-center gap-0.5">
                  <ArrowUpRight className="h-3.5 w-3.5" /> +12% العام الحالي
                </span>
              </div>
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-1">
                <p className="text-[10px] text-muted-foreground font-semibold">الخدام النشطين</p>
                <h3 className="text-2xl font-bold text-foreground">18 خادم</h3>
                <span className="text-[10px] text-primary font-semibold">تغطية كافية لجميع الفصول</span>
              </div>
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-1">
                <p className="text-[10px] text-muted-foreground font-semibold font-sans">متوسط حضور القداسات</p>
                <h3 className="text-2xl font-bold text-success">82%</h3>
                <span className="text-[10px] text-muted-foreground">هدف الخدمة: الوصول إلى 90%</span>
              </div>
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-1">
                <p className="text-[10px] text-muted-foreground font-semibold">رصيد ميزانية الخدمة</p>
                <h3 className="text-2xl font-bold text-primary">600.00 ج.م</h3>
                <span className="text-[10px] text-muted-foreground">تغطية كاملة للمستلزمات</span>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 md:p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <TrendingUp className="h-4.5 w-4.5 text-primary" />
                تحليل منحنى الحضور الأسبوعي لمدارس الأحد
              </h3>

              <div className="h-64 flex items-end justify-between gap-3 pt-6 border-b border-border/60">
                {[
                  { label: 'الجمعة 07-17', rate: 75 },
                  { label: 'الجمعة 07-24', rate: 82 },
                  { label: 'الجمعة 07-31', rate: 88 },
                  { label: 'الجمعة 08-07', rate: 80 },
                  { label: 'الجمعة 08-14', rate: 92 }
                ].map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                    <div className="w-full bg-primary/10 rounded-t-lg relative flex items-end justify-center overflow-hidden transition-all duration-300 group-hover:bg-primary/20 h-48">
                      <div
                        className="w-full bg-primary rounded-t-lg transition-all duration-500 flex items-center justify-center text-[10px] text-primary-foreground font-bold"
                        style={{ height: `${item.rate}%` }}
                      >
                        {item.rate}%
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CLASS ROSTER LIST (UPDATED TO DISPLAY ALL PROFILE FIELDS) */}
        {activeTab === 'rosters' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Controls Bar: select class */}
            <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-foreground font-sans">اختر الفصل:</span>
                <select
                  value={selectedRosterClass}
                  onChange={(e) => setSelectedRosterClass(e.target.value)}
                  className="bg-muted/40 border border-border rounded-lg px-3 py-1.5 text-xs font-semibold text-primary outline-none focus:border-primary/50"
                >
                  {classesList.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.stage})
                    </option>
                  ))}
                </select>
              </div>

              {/* Action triggers */}
              <div className="flex gap-2">
                <button
                  onClick={handlePrintRoster}
                  className="h-8 px-3 bg-primary text-primary-foreground hover:bg-primary/95 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow transition"
                >
                  <Printer className="h-3.5 w-3.5" />
                  طباعة دفتر ورقي للحضور
                </button>
                <button
                  onClick={handleExportRosterCSV}
                  className="h-8 px-3 bg-muted hover:bg-success/15 hover:text-success rounded-lg text-xs font-semibold flex items-center gap-1.5 text-muted-foreground transition"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  تحميل كشف الأسماء (Excel)
                </button>
              </div>
            </div>

            {/* Student list container */}
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden print:border-none print:shadow-none">
              <div className="p-4 border-b border-border bg-muted/10 print:hidden flex justify-between items-center">
                <h3 className="font-bold text-sm text-foreground">كشوف أسماء الفصول وتفاصيل ملف الرعاية والموهبة</h3>
                <span className="text-[10px] text-muted-foreground font-semibold">تضم الكشوفات: العنوان بالتفصيل، تاريخ الميلاد، والمواهب المسجلة.</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs border-collapse">
                  <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border">
                    <tr className="print:bg-muted/20">
                      <th className="px-4 py-3 w-16">الكود</th>
                      <th className="px-4 py-3 w-40">الاسم بالكامل</th>
                      <th className="px-4 py-3 w-28 text-center">تاريخ الميلاد</th>
                      <th className="px-4 py-3 w-32">هاتف ولي الأمر</th>
                      <th className="px-4 py-3 w-32">أب الاعتراف</th>
                      <th className="px-4 py-3">العنوان بالتفصيل</th>
                      <th className="px-4 py-3 w-36">المواهب والمهارات</th>
                      <th className="px-4 py-3 w-20 text-center">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs text-foreground font-semibold">
                    {activeRoster.map((st, idx) => (
                      <tr key={idx} className="hover:bg-muted/5 transition">
                        <td className="px-4 py-3.5 font-bold text-primary">{st.code}</td>
                        <td className="px-4 py-3.5 font-bold text-sm">{st.name}</td>
                        <td className="px-4 py-3.5 text-center text-muted-foreground font-normal">{st.birthDate}</td>
                        <td className="px-4 py-3.5 text-muted-foreground font-normal">{st.phone}</td>
                        <td className="px-4 py-3.5 font-normal">{st.father}</td>
                        <td className="px-4 py-3.5 text-muted-foreground font-normal leading-relaxed">{st.address}</td>
                        <td className="px-4 py-3.5 text-primary font-normal">{st.talents}</td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            st.status === 'منتظم' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning-foreground'
                          }`}>
                            {st.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CLASS MATRIX */}
        {activeTab === 'classes-matrix' && (
          <div className="space-y-4">
            {/* DATE RANGE FILTERS & EXPORT ACTIONS (Item 57) */}
            <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans print:hidden">
              <div className="flex flex-wrap items-center gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground block">من تاريخ</span>
                  <input
                    type="date"
                    value={reportStartDate}
                    onChange={(e) => setReportStartDate(e.target.value)}
                    className="bg-muted/40 border border-border rounded px-2.5 py-1 text-xs outline-none focus:border-primary/50 font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground block">إلى تاريخ</span>
                  <input
                    type="date"
                    value={reportEndDate}
                    onChange={(e) => setReportEndDate(e.target.value)}
                    className="bg-muted/40 border border-border rounded px-2.5 py-1 text-xs outline-none focus:border-primary/50 font-bold"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportExcel('classes-matrix')}
                  className="h-9 px-4 bg-success text-success-foreground font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-sm hover:bg-success/95 transition"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  تصدير Excel (.csv)
                </button>
                <button
                  onClick={handleExportPDF}
                  className="h-9 px-4 bg-primary text-primary-foreground font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-sm hover:bg-primary/95 transition"
                >
                  <FileText className="h-4 w-4" />
                  تصدير PDF / طباعة
                </button>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-border flex justify-between items-center bg-muted/10">
                <div>
                  <h3 className="font-bold text-sm">مصفوفة تقييم ومقارنة أداء الفصول</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">مقارنة شاملة لنسب تفاعل وحضور المخدومين في الفصول.</p>
                </div>
                <span className="text-[10px] text-muted-foreground hidden print:inline">
                  الفترة من: {reportStartDate} إلى: {reportEndDate}
                </span>
              </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs border-collapse">
                <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border">
                  <tr>
                    <th className="px-4 py-3">اسم الفصل</th>
                    <th className="px-4 py-3">السنة الدراسية</th>
                    <th className="px-4 py-3">عدد الطلاب</th>
                    <th className="px-4 py-3 text-center">حضور الاجتماع (عدد ونسبة)</th>
                    <th className="px-4 py-3 text-center">حضور القداس (عدد ونسبة)</th>
                    <th className="px-4 py-3 text-center">الاعترافات (عدد ونسبة)</th>
                    <th className="px-4 py-3 text-center">معدل الافتقاد (عدد ونسبة)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm text-foreground font-semibold">
                  {classMatrixData.map((cls, idx) => (
                    <tr key={idx} className="hover:bg-muted/10 transition">
                      <td className="px-4 py-3.5 font-bold text-foreground">{cls.name}</td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground font-normal">{cls.grade}</td>
                      <td className="px-4 py-3.5 text-xs font-normal">{cls.students} مخدوم</td>
                      <td className="px-4 py-3.5 text-center text-primary">{cls.attendance}</td>
                      <td className="px-4 py-3.5 text-center text-success">{cls.mass}</td>
                      <td className="px-4 py-3.5 text-center text-success">{cls.confession}</td>
                      <td className="px-4 py-3.5 text-center text-success">{cls.followUp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

        {/* TAB 4: CHRONIC ABSENTEES */}
        {activeTab === 'absentees' && (
          <div className="space-y-4 animate-in fade-in">
            {/* DATE RANGE FILTERS & EXPORT ACTIONS (Item 57) */}
            <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans print:hidden">
              <div className="flex flex-wrap items-center gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground block">من تاريخ</span>
                  <input
                    type="date"
                    value={reportStartDate}
                    onChange={(e) => setReportStartDate(e.target.value)}
                    className="bg-muted/40 border border-border rounded px-2.5 py-1 text-xs outline-none focus:border-primary/50 font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground block">إلى تاريخ</span>
                  <input
                    type="date"
                    value={reportEndDate}
                    onChange={(e) => setReportEndDate(e.target.value)}
                    className="bg-muted/40 border border-border rounded px-2.5 py-1 text-xs outline-none focus:border-primary/50 font-bold"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportExcel('absentees')}
                  className="h-9 px-4 bg-success text-success-foreground font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-sm hover:bg-success/95 transition"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  تصدير Excel (.csv)
                </button>
                <button
                  onClick={handleExportPDF}
                  className="h-9 px-4 bg-primary text-primary-foreground font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-sm hover:bg-primary/95 transition"
                >
                  <FileText className="h-4 w-4" />
                  تصدير PDF / طباعة
                </button>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-border flex justify-between items-center bg-muted/10">
                <div>
                  <h3 className="font-bold text-sm text-destructive flex items-center gap-1.5">
                    <AlertTriangle className="h-4.5 w-4.5" />
                    رصد المخدومين الغائبين والمنقطعين عاجل
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">الطلاب الغائبون لأكثر من ٣ أسابيع متتالية ويتطلبون افتقاداً فورياً.</p>
                </div>
                <span className="text-[10px] text-muted-foreground hidden print:inline">
                  الفترة من: {reportStartDate} إلى: {reportEndDate}
                </span>
              </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs border-collapse">
                <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border">
                  <tr>
                    <th className="px-4 py-3">اسم المخدوم</th>
                    <th className="px-4 py-3">الفصل</th>
                    <th className="px-4 py-3 text-center">أسابيع الغياب المتتالية</th>
                    <th className="px-4 py-3">تاريخ آخر حضور بالدفتر</th>
                    <th className="px-4 py-3">الخادم المسؤول</th>
                    <th className="px-4 py-3">حالة الافتقاد الحالية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm text-foreground">
                  {chronicAbsentees.map((st, idx) => (
                    <tr key={idx} className="hover:bg-muted/10 transition">
                      <td className="px-4 py-3.5 font-bold">{st.name}</td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">{st.class}</td>
                      <td className="px-4 py-3.5 text-center text-destructive font-extrabold">{st.absentWeeks} أسابيع</td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">{st.lastSeen}</td>
                      <td className="px-4 py-3.5 text-xs font-semibold">{st.servant}</td>
                      <td className="px-4 py-3.5">
                        <span className="text-[10px] font-semibold bg-warning/15 text-warning-foreground px-2.5 py-0.5 rounded-full">
                          {st.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

        {/* TAB 5: FINANCIAL STATEMENT SUMMARY */}
        {activeTab === 'finance' && (
          <div className="space-y-4">
            {/* DATE RANGE FILTERS & EXPORT ACTIONS (Item 57) */}
            <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans print:hidden">
              <div className="flex flex-wrap items-center gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground block">من تاريخ</span>
                  <input
                    type="date"
                    value={reportStartDate}
                    onChange={(e) => setReportStartDate(e.target.value)}
                    className="bg-muted/40 border border-border rounded px-2.5 py-1 text-xs outline-none focus:border-primary/50 font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground block">إلى تاريخ</span>
                  <input
                    type="date"
                    value={reportEndDate}
                    onChange={(e) => setReportEndDate(e.target.value)}
                    className="bg-muted/40 border border-border rounded px-2.5 py-1 text-xs outline-none focus:border-primary/50 font-bold"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportExcel('finance')}
                  className="h-9 px-4 bg-success text-success-foreground font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-sm hover:bg-success/95 transition"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  تصدير Excel (.csv)
                </button>
                <button
                  onClick={handleExportPDF}
                  className="h-9 px-4 bg-primary text-primary-foreground font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-sm hover:bg-primary/95 transition"
                >
                  <FileText className="h-4 w-4" />
                  تصدير PDF / طباعة
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="p-4 border-b border-border flex justify-between items-center bg-muted/10">
                    <h3 className="font-bold text-sm text-foreground">الميزانية والتدفقات المالية للخدمة</h3>
                    <span className="text-[10px] text-muted-foreground hidden print:inline">
                      الفترة من: {reportStartDate} إلى: {reportEndDate}
                    </span>
                  </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs border-collapse">
                    <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border">
                      <tr>
                        <th className="px-4 py-3">التصنيف أو الفئة المالية</th>
                        <th className="px-4 py-3">نوع العملية</th>
                        <th className="px-4 py-3 w-36 text-left">القيمة الكلية</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-sm">
                      {financialSummary.categories.map((c, idx) => (
                        <tr key={idx} className="hover:bg-muted/10 transition">
                          <td className="px-4 py-3.5 font-bold text-foreground">{c.name}</td>
                          <td className="px-4 py-3.5">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              c.type === 'income' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                            }`}>
                              {c.type === 'income' ? 'إيرادات (داخل)' : 'مصروفات (خارج)'}
                            </span>
                          </td>
                          <td className={`px-4 py-3.5 text-left font-bold ${c.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                            {c.type === 'income' ? '+' : '-'}{c.amount.toFixed(2)} ج.م
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-wider border-b border-border pb-2">التوازن والملخص المالي</h3>
                <div className="space-y-3 text-xs text-muted-foreground">
                  <p className="flex justify-between"><span>إجمالي الإيرادات:</span> <strong className="text-success font-bold">+{financialSummary.totalIncome.toFixed(2)} ج.م</strong></p>
                  <p className="flex justify-between"><span>إجمالي المصروفات:</span> <strong className="text-destructive font-bold">-{financialSummary.totalExpense.toFixed(2)} ج.م</strong></p>
                  <div className="border-t border-border pt-3 flex justify-between text-sm">
                    <span className="font-bold text-foreground">الرصيد المالي المتبقي:</span>
                    <strong className="text-primary font-extrabold">{financialSummary.balance.toFixed(2)} ج.م</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

        {/* TAB 6: MONTHLY BIRTHDAYS */}
        {activeTab === 'birthdays' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Control Bar: select month & Date filters (Item 57) */}
            <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
              <div className="flex flex-wrap items-center gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground block">تحديد الشهر المستهدف</span>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                    className="bg-muted/40 border border-border rounded-lg px-3 py-1.5 text-xs font-semibold text-primary outline-none focus:border-primary/50"
                  >
                    {months.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground block">من تاريخ</span>
                  <input
                    type="date"
                    value={reportStartDate}
                    onChange={(e) => setReportStartDate(e.target.value)}
                    className="bg-muted/40 border border-border rounded px-2.5 py-1 text-xs outline-none focus:border-primary/50 font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground block">إلى تاريخ</span>
                  <input
                    type="date"
                    value={reportEndDate}
                    onChange={(e) => setReportEndDate(e.target.value)}
                    className="bg-muted/40 border border-border rounded px-2.5 py-1 text-xs outline-none focus:border-primary/50 font-bold"
                  />
                </div>
              </div>

              {/* Action buttons linked dynamically */}
              <div className="flex gap-2 self-end">
                <button
                  onClick={() => handleExportExcel('birthdays')}
                  className="h-8 px-3 bg-success/15 hover:bg-success/20 text-success rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  تصدير Excel (.csv)
                </button>
                <button
                  onClick={handleExportPDF}
                  className="h-8 px-3 bg-primary/15 hover:bg-primary/20 text-primary rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Printer className="h-3.5 w-3.5" />
                  تصدير PDF / طباعة
                </button>
              </div>
            </div>

            {/* Split layout: Students Birthdays vs Servants Birthdays */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Box A: Students celebrating */}
              <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
                    <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                      <Cake className="h-4.5 w-4.5 text-success" />
                      أعياد ميلاد المخدومين ({studentsBirthdays.length})
                    </h3>
                  </div>

                  <div className="divide-y divide-border">
                    {studentsBirthdays.map((s) => {
                      const greetingMessage = `كل سنة وأنت طيب يا ${s.name}! 🎉 أسرة مدارس الأحد تهنئك بعيد ميلادك وتتمنى لك عاماً مباركاً سعيداً 🎈❤️`
                      return (
                        <div key={s.id} className="p-4 flex justify-between items-center hover:bg-muted/10 transition">
                          <div className="space-y-1">
                            <p className="font-bold text-sm text-foreground">{s.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              تاريخ الميلاد: <strong className="text-foreground">{s.date}</strong> • الفصل: <strong className="text-primary">{s.class}</strong> • العمر: <strong className="text-foreground">{s.age} سنوات</strong>
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <a
                              href={`https://wa.me/${s.phone}?text=${encodeURIComponent(greetingMessage)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="h-8 px-2.5 bg-success text-white hover:bg-success/90 rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                              تهنئة
                            </a>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Box B: Servants celebrating */}
              <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
                    <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                      <Cake className="h-4.5 w-4.5 text-primary" />
                      أعياد ميلاد الخدام ({servantsBirthdays.length})
                    </h3>
                  </div>

                  <div className="divide-y divide-border">
                    {servantsBirthdays.map((srv) => {
                      const greetingMessage = `كل سنة وأنت طيب يا خادم المسيح ${srv.name}! 🎉 أسرة مدارس الأحد تشكر تعبك ومحبتك في الخدمة وتتمنى لك عاماً مباركاً سعيداً 🌟⛪`
                      return (
                        <div key={srv.id} className="p-4 flex justify-between items-center hover:bg-muted/10 transition">
                          <div className="space-y-1">
                            <p className="font-bold text-sm text-foreground">{srv.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              تاريخ الميلاد: <strong className="text-foreground">{srv.date}</strong> • الدور: <strong className="text-primary">{srv.role}</strong>
                            </p>
                          </div>

                          <div className="flex gap-1.5">
                            <a
                              href={`https://wa.me/${srv.phone}?text=${encodeURIComponent(greetingMessage)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="h-8 w-8 bg-muted hover:bg-success/15 hover:text-success text-muted-foreground rounded-lg flex items-center justify-center transition"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </a>
                            <a
                              href={`tel:${srv.phone}`}
                              className="h-8 w-8 bg-muted hover:bg-primary/10 hover:text-primary text-muted-foreground rounded-lg flex items-center justify-center transition"
                            >
                              <Phone className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. PRINT PREPARE LOADER OVERLAY (Item 57) */}
      {isGeneratingPDF && (
        <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-[999] flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
          <div className="h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
          <h3 className="text-lg font-bold text-foreground font-sans">جاري تحضير التقرير للطباعة وتصدير PDF</h3>
          <p className="text-xs text-muted-foreground mt-2 max-w-xs font-sans">
            يرجى الانتظار لحين تهيئة ملف التقارير وتجهيز خيارات حفظ الملف في المتصفح...
          </p>
        </div>
      )}
    </Shell>
  )
}
