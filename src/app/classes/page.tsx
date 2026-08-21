'use client'

import React, { useEffect, useState } from 'react'
import { Shell } from '@/components/layout/Shell'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { getClasses, ClassItem } from '@/lib/services/classesService'
import Link from 'next/link'
import { Plus, Users, Shield, ArrowUpRight, CheckSquare, Search, Edit2, Trash2, List, Grid, AlertTriangle, Church } from 'lucide-react'

export default function ClassesPage() {
  const { locale } = useLanguage()
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [loading, setLoading] = useState(true)

  // View modes, edit/delete modals state (Item 57)
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card')
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null)
  const [deletingClass, setDeletingClass] = useState<ClassItem | null>(null)

  // Edit fields
  const [editNameAr, setEditNameAr] = useState('')
  const [editNameEn, setEditNameEn] = useState('')
  const [editSaint, setEditSaint] = useState('')
  const [editGender, setEditGender] = useState<'male' | 'female' | 'mixed'>('mixed')

  const handleOpenEdit = (cls: ClassItem) => {
    setEditingClass(cls)
    setEditNameAr(cls.name_ar)
    setEditNameEn(cls.name_en)
    setEditSaint(cls.saint_name || '')
    setEditGender(cls.gender as any)
  }

    const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingClass) return
    try {
      const isXampp = typeof window !== 'undefined' && window.location.pathname.includes('/stmina')
      const apiUrl = isXampp ? '/stmina/api/classes.php' : '/api/classes.php'
      await fetch(apiUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingClass.id,
          name_ar: editNameAr,
          stage_name: editingClass.stage_name_ar || 'ابتدائي',
          grade_name: editingClass.grade_name_ar || 'الصف الأول',
          gender: editGender === 'male' ? 'بنين' : (editGender === 'female' ? 'بنات' : 'مشترك'),
          patron_saint: editSaint || editNameAr
        })
      })
      alert('تم تحديث بيانات الفصل  بنجاح!')
      const data = await getClasses()
      setClasses(data)
      setEditingClass(null)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteConfirm = (cls: ClassItem) => {
    setDeletingClass(cls)
  }

    const handleExecuteDelete = async () => {
    if (!deletingClass) return
    try {
      const isXampp = typeof window !== 'undefined' && window.location.pathname.includes('/stmina')
      const apiUrl = isXampp ? `/stmina/api/classes.php?id=${deletingClass.id}` : `/api/classes.php?id=${deletingClass.id}`
      const res = await fetch(apiUrl, { method: 'DELETE' })
      if (res.ok) {
        alert('تم حذف الفصل نهائياً ! 🗑️')
        setClasses(prev => prev.filter(c => c.id !== deletingClass.id))
        setDeletingClass(null)
      } else {
        alert('حدث خطأ أثناء الحذف ')
      }
    } catch (err) {
      console.error(err)
      alert('حدث خطأ في الاتصال بالسيرفر')
    }
  }

  // Filters State (Stage, Year, and Search)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedStage, setSelectedStage] = useState('')

  const getApiUrl = (endpoint: string) => {
    const isXampp = typeof window !== 'undefined' && window.location.pathname.includes('/stmina')
    return isXampp ? `/stmina/api/${endpoint}` : `/api/${endpoint}`
  }

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [clsRes, stdRes, srvRes] = await Promise.all([
          fetch(getApiUrl('classes.php')).catch(() => null),
          fetch(getApiUrl('students.php')).catch(() => null),
          fetch(getApiUrl('servants.php')).catch(() => null)
        ])

        let classesData: any[] = []
        let studentsData: any[] = []
        let servantsData: any[] = []

        if (clsRes && clsRes.ok) {
          classesData = await clsRes.json()
        } else {
          classesData = await getClasses()
        }

        if (stdRes && stdRes.ok) {
          studentsData = await stdRes.json()
        }

        if (srvRes && srvRes.ok) {
          servantsData = await srvRes.json()
        }

        // Accurately compute students and servants count for each class
        if (Array.isArray(classesData)) {
          const enriched = classesData.map((cls: any) => {
            const stdCount = Array.isArray(studentsData)
              ? studentsData.filter((s: any) => s.class_id === cls.id || s.class_name === cls.name_ar).length
              : (cls.students_count || 0)

            const srvCount = Array.isArray(servantsData)
              ? servantsData.filter((srv: any) => {
                  if (srv.class_name === cls.name_ar || srv.class_name === cls.id) return true
                  const asgStr = typeof srv.service_assignments === 'string' ? srv.service_assignments : JSON.stringify(srv.service_assignments || '')
                  return asgStr.includes(cls.name_ar) || asgStr.includes(cls.id)
                }).length
              : (cls.servants_count || 0)

            return {
              ...cls,
              students_count: stdCount,
              servants_count: srvCount
            }
          })
          setClasses(enriched)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Filter computation
  const filteredClasses = classes.filter((cls) => {
    const matchesSearch =
      cls.name_ar.includes(searchTerm) ||
      (cls.saint_name && cls.saint_name.includes(searchTerm))
      
    const matchesStage = selectedStage ? cls.stage_name_ar === selectedStage : true
    
    return matchesSearch && matchesStage
  })

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {locale === 'ar' ? 'فصول الخدمة' : 'Service Classes'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {locale === 'ar'
                ? 'عرض وإدارة فصول مدارس الأحد وتوزيع الخدام عليها.'
                : 'View and manage Sunday School classes and their servant assignments.'}
            </p>
          </div>
          <div className="flex items-center gap-3 self-start">
            {/* View Mode Toggle Switcher (Item 57) */}
            <div className="flex bg-muted rounded-lg p-0.5 border border-border">
              <button
                onClick={() => setViewMode('card')}
                className={`p-1.5 rounded-md transition ${
                  viewMode === 'card' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
                title="عرض بطاقات"
              >
                <Grid className="h-4.5 w-4.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition ${
                  viewMode === 'list' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
                title="عرض جدول بالعرض"
              >
                <List className="h-4.5 w-4.5" />
              </button>
            </div>

            <Link
              href="/classes/new"
              className="h-10 px-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm flex items-center gap-2 shadow-md hover:bg-primary/95 transition-all duration-200"
            >
              <Plus className="h-4 w-4" />
              <span>{locale === 'ar' ? 'إضافة فصل جديد' : 'Create New Class'}</span>
            </Link>
          </div>
        </div>

        {/* 1. FILTER CONTROLS BAR (Responsive Grid Layout) */}
        <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground left-3" />
              <input
                type="text"
                placeholder="ابحث باسم الفصل أو الشفيع..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-muted/40 border border-border rounded-lg pl-9 pr-4 py-2 text-xs outline-none focus:border-primary/50 transition-all duration-200"
              />
            </div>

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
          </div>
        </div>

        {/* 2. CLASSES GRID (Responsive layout) */}
        {loading ? (
          <div className="p-12 text-center text-xs text-muted-foreground font-sans animate-pulse bg-card border border-border rounded-3xl">
            <Church className="h-8 w-8 text-primary mx-auto mb-2 animate-bounce" />
            <p className="font-bold text-foreground">جاري تحميل فصول الخدمة ...</p>
          </div>
        ) : filteredClasses.length === 0 ? (
          /* MAGNIFICENT EMPTY STATE */
          <div className="bg-card border border-border rounded-3xl p-12 text-center shadow-sm space-y-5 max-w-2xl mx-auto my-6 font-sans text-right" dir="rtl">
            <div className="h-20 w-20 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner border border-primary/20">
              <Church className="h-10 w-10 text-primary" />
            </div>
            
            <div className="space-y-1.5 text-center">
              <h3 className="text-xl font-extrabold text-foreground">لا توجد فصول مسجلة  حالياً 🏫</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                ابدأ الآن بتأسيس فصول مدارس الأحد وتوزيع المراحل والسنوات الكنسية.
              </p>
            </div>

            <div className="flex justify-center pt-2">
              <Link
                href="/classes/new"
                className="h-12 px-8 rounded-2xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-2 shadow-lg hover:bg-primary/95 transition-all duration-200 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>+ إنشاء أول فصل خدمة جديد الآن</span>
              </Link>
            </div>
          </div>
        ) : viewMode === 'card' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map((cls) => (
              <div
                key={cls.id}
                className="bg-card border border-border rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group relative overflow-hidden text-right font-sans"
                dir="rtl"
              >
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 ${
                    ((cls.gender === 'male' || (cls.gender as any) === 'بنين'))
                      ? 'bg-blue-600'
                      : ((cls.gender === 'female' || (cls.gender as any) === 'بنات'))
                      ? 'bg-pink-600'
                      : 'bg-purple-600'
                  }`}
                />

                <div className="space-y-4">
                  <div className="flex justify-between items-start pt-2">
                    <div className="min-w-0">
                      <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors duration-200">
                        {cls.name_ar}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5 font-sans">
                        {cls.stage_name_ar} • {cls.grade_name_ar}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          ((cls.gender === 'male' || (cls.gender as any) === 'بنين'))
                            ? 'bg-blue-500/10 text-blue-600'
                            : ((cls.gender === 'female' || (cls.gender as any) === 'بنات'))
                            ? 'bg-pink-500/10 text-pink-600'
                            : 'bg-purple-500/10 text-purple-600'
                        }`}
                      >
                        {((cls.gender === 'male' || (cls.gender as any) === 'بنين'))
                          ? 'أولاد'
                          : ((cls.gender === 'female' || (cls.gender as any) === 'بنات'))
                          ? 'بنات'
                          : 'مشترك'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/80">
                    <Link
                      href={typeof window !== 'undefined' && window.location.pathname.includes('/stmina') ? `/stmina/students/?classId=${encodeURIComponent(cls.id)}&className=${encodeURIComponent(cls.name_ar)}` : `/students/?classId=${encodeURIComponent(cls.id)}&className=${encodeURIComponent(cls.name_ar)}`}
                      className="flex items-center gap-2 hover:bg-muted/40 p-2 rounded-xl transition group/stat bg-muted/20"
                    >
                      <Users className="h-4 w-4 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground">المخدومين</p>
                        <p className="font-extrabold text-sm text-foreground group-hover/stat:text-primary">{cls.students_count || 0}</p>
                      </div>
                    </Link>

                    <Link
                      href={typeof window !== 'undefined' && window.location.pathname.includes('/stmina') ? `/stmina/servants/?classId=${encodeURIComponent(cls.id)}&className=${encodeURIComponent(cls.name_ar)}` : `/servants/?classId=${encodeURIComponent(cls.id)}&className=${encodeURIComponent(cls.name_ar)}`}
                      className="flex items-center gap-2 hover:bg-muted/40 p-2 rounded-xl transition group/stat bg-muted/20"
                    >
                      <Shield className="h-4 w-4 text-muted-foreground group-hover/stat:text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground">الخدام</p>
                        <p className="font-extrabold text-sm text-foreground group-hover/stat:text-primary">{cls.servants_count || 0}</p>
                      </div>
                    </Link>
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t border-border mt-4 pt-3">
                  <Link
                    href={typeof window !== 'undefined' && window.location.pathname.includes('/stmina') ? `/stmina/attendance/record/?classId=${encodeURIComponent(cls.id)}&className=${encodeURIComponent(cls.name_ar)}` : `/attendance/record/?classId=${encodeURIComponent(cls.id)}&className=${encodeURIComponent(cls.name_ar)}`}
                    className="flex-1 h-9 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 shadow-sm"
                  >
                    <CheckSquare className="h-3.5 w-3.5" />
                    <span>تسجيل الحضور</span>
                  </Link>
                  <button
                    onClick={() => handleDeleteConfirm(cls)}
                    className="h-9 w-9 bg-rose-500/10 hover:bg-rose-600 hover:text-white text-rose-600 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm"
                    title="حذف هذا الفصل"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* LIST VIEW: TABLE GRID */
          <div className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden animate-in fade-in text-right font-sans" dir="rtl">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs border-collapse">
                <thead className="bg-muted/50 text-muted-foreground font-bold border-b border-border">
                  <tr>
                    <th className="px-4 py-3.5">اسم الفصل</th>
                    <th className="px-4 py-3.5">شفيع الفصل</th>
                    <th className="px-4 py-3.5">المرحلة / الصف</th>
                    <th className="px-4 py-3.5 text-center">النوع</th>
                    <th className="px-4 py-3.5 text-center">المخدومين</th>
                    <th className="px-4 py-3.5 text-center">الخدام</th>
                    <th className="px-4 py-3.5 text-center w-48 print:hidden">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs text-foreground">
                  {filteredClasses.map((cls) => (
                    <tr key={cls.id} className="hover:bg-muted/20 transition">
                      <td className="px-4 py-3.5 font-bold text-foreground text-sm">
                        <Link href={`/students?classId=${cls.id}`} className="hover:text-primary hover:underline">
                          {cls.name_ar}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 text-primary font-semibold">{cls.saint_name || (cls as any).patron_saint || '—'}</td>
                      <td className="px-4 py-3.5 text-muted-foreground">{cls.stage_name_ar} • {cls.grade_name_ar}</td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          ((cls.gender === 'male' || (cls.gender as any) === 'بنين'))
                            ? 'bg-blue-500/10 text-blue-600'
                            : ((cls.gender === 'female' || (cls.gender as any) === 'بنات'))
                            ? 'bg-pink-500/10 text-pink-600'
                            : 'bg-purple-500/10 text-purple-600'
                        }`}>
                          {((cls.gender === 'male' || (cls.gender as any) === 'بنين')) ? 'أولاد' : ((cls.gender === 'female' || (cls.gender as any) === 'بنات')) ? 'بنات' : 'مشترك'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center font-bold">
                        <Link href={typeof window !== 'undefined' && window.location.pathname.includes('/stmina') ? `/stmina/students/?classId=${encodeURIComponent(cls.id)}&className=${encodeURIComponent(cls.name_ar)}` : `/students/?classId=${encodeURIComponent(cls.id)}&className=${encodeURIComponent(cls.name_ar)}`} className="text-primary hover:underline font-bold bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/20 inline-block">
                          {cls.students_count || 0}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 text-center font-bold">
                        <Link href={typeof window !== 'undefined' && window.location.pathname.includes('/stmina') ? `/stmina/servants/?className=${encodeURIComponent(cls.name_ar)}&classId=${encodeURIComponent(cls.id)}` : `/servants/?className=${encodeURIComponent(cls.name_ar)}&classId=${encodeURIComponent(cls.id)}`} className="text-primary hover:underline font-bold bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/20 inline-block">
                          {cls.servants_count || 0}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 text-center print:hidden">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            href={`/attendance/record?classId=${cls.id}`}
                            className="h-8 px-3 bg-primary text-primary-foreground text-xs font-bold rounded-xl flex items-center gap-1 hover:bg-primary/95 transition shadow-sm"
                          >
                            <CheckSquare className="h-3.5 w-3.5" />
                            <span>حضور</span>
                          </Link>
                          <button
                            onClick={() => handleOpenEdit(cls)}
                            className="p-2 rounded-xl bg-muted hover:bg-blue-600 hover:text-white text-muted-foreground transition cursor-pointer"
                            title="تعديل بيانات الفصل"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteConfirm(cls)}
                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-600 hover:text-white text-rose-600 transition cursor-pointer"
                            title="حذف الفصل "
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* EDIT CLASS INTERACTIVE MODAL DIALOG (Item 57) */}
        {editingClass && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border w-full max-w-md rounded-xl p-5 md:p-6 shadow-2xl space-y-4 animate-in zoom-in-95 text-right font-sans">
              <div className="flex justify-between items-center border-b border-border pb-3">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  <Edit2 className="h-4.5 w-4.5 text-primary" />
                  تعديل بيانات فصل: {editingClass.name_ar}
                </h3>
                <button onClick={() => setEditingClass(null)} className="p-1 rounded hover:bg-muted text-muted-foreground text-sm">✕</button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">اسم الفصل (بالعربية)</label>
                  <input
                    type="text" required
                    value={editNameAr} onChange={(e) => setEditNameAr(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">اسم الفصل (بالإنجليزية)</label>
                  <input
                    type="text" required
                    value={editNameEn} onChange={(e) => setEditNameEn(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">شفيع الفصل (القديس/ة)</label>
                  <input
                    type="text"
                    value={editSaint} onChange={(e) => setEditSaint(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground block">النوع وتصنيف المخدومين</label>
                  <select
                    value={editGender} onChange={(e) => setEditGender(e.target.value as any)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition font-bold"
                  >
                    <option value="male">أولاد فقط</option>
                    <option value="female">بنات فقط</option>
                    <option value="mixed">مشترك (أولاد وبنات)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 border-t border-border pt-4">
                  <button
                    type="submit"
                    className="h-9 px-4 bg-primary text-primary-foreground font-semibold rounded-lg text-xs hover:bg-primary/95 shadow transition"
                  >
                    حفظ التغييرات
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingClass(null)}
                    className="h-9 px-3 border border-border hover:bg-muted text-xs font-semibold rounded-lg text-muted-foreground transition"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* DELETE CLASS VALIDATION & WARNING DIALOG (Item 57) */}
        {deletingClass && (() => {
          const hasAssociations = deletingClass.students_count > 0 || deletingClass.servants_count > 0
          return (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-card border border-border w-full max-w-md rounded-xl p-5 md:p-6 shadow-2xl space-y-4 animate-in zoom-in-95 text-right font-sans">
                <div className="flex justify-between items-center border-b border-border pb-3">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    <AlertTriangle className="h-4.5 w-4.5 text-destructive" />
                    تنبيه أمان وحذف الفصل
                  </h3>
                  <button onClick={() => setDeletingClass(null)} className="p-1 rounded hover:bg-muted text-muted-foreground text-sm">✕</button>
                </div>

                {hasAssociations ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-destructive/15 text-destructive border border-destructive/20 rounded-lg text-xs font-bold leading-relaxed">
                      لا يمكن حذف فصل "{deletingClass.name_ar}" حالياً لوجود ارتباطات نشطة !
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      يحتوي هذا الفصل حالياً على:
                      <br />• <strong className="text-foreground">{deletingClass.students_count} مخدومين</strong> مسجلين في الفصل.
                      <br />• <strong className="text-foreground">{deletingClass.servants_count} خدام</strong> مسؤولين عن التدريس فيه.
                      <br /><br />
                      لتتمكن من حذف هذا الفصل، يرجى أولاً الذهاب لسجل المخدومين والخدام وتغيير فصولهم أو إعادة تعيينهم لضمان عدم فقدان بياناتهم التاريخية.
                    </p>
                    <div className="flex justify-end pt-3 border-t border-border">
                      <button
                        type="button"
                        onClick={() => setDeletingClass(null)}
                        className="h-9 px-4 bg-muted hover:bg-muted/80 text-xs font-semibold rounded-lg text-muted-foreground transition"
                      >
                        إغلاق وتراجع
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs text-foreground leading-relaxed">
                      هل أنت متأكد من رغبتك في حذف فصل <strong>"{deletingClass.name_ar}"</strong> نهائياً؟
                      <br />
                      هذا الإجراء لا يمكن التراجع عنه وسيمحو سجل الفصل من النظام بالكامل.
                    </p>
                    <div className="flex justify-end gap-2 pt-3 border-t border-border">
                      <button
                        onClick={handleExecuteDelete}
                        className="h-9 px-4 bg-destructive text-destructive-foreground font-semibold rounded-lg text-xs hover:bg-destructive/95 shadow transition"
                      >
                        نعم، احذف نهائياً
                      </button>
                      <button
                        onClick={() => setDeletingClass(null)}
                        className="h-9 px-3 border border-border hover:bg-muted text-xs font-semibold rounded-lg text-muted-foreground transition"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })()}
      </div>
    </Shell>
  )
}
