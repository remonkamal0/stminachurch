'use client'

import React, { useEffect, useState, useTransition, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Shell } from '@/components/layout/Shell'
import { EmptyState } from '@/components/layout/EmptyState'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { getStudents, StudentItem } from '@/lib/services/studentsService'
import { getClasses, ClassItem } from '@/lib/services/classesService'
import Link from 'next/link'
import { Search, Plus, Eye, Edit, MessageCircle, FileSpreadsheet, FileText, Printer, Trash2, AlertTriangle, Crown, Shield, Check } from 'lucide-react'

export default function StudentsDirectoryPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-xs text-muted-foreground font-sans">جاري تحميل دليل المخدومين...</div>}>
      <StudentsDirectoryPageContent />
    </Suspense>
  )
}

function StudentsDirectoryPageContent() {
  const { locale } = useLanguage()
  const searchParams = useSearchParams()
  const queryClassId = searchParams.get('classId') || searchParams.get('className')
  const [isPending, startTransition] = useTransition()
  
  const [students, setStudents] = useState<StudentItem[]>([])
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const [studentToDelete, setStudentToDelete] = useState<StudentItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Quick Promotion to Servant Modal State
  const [studentToPromote, setStudentToPromote] = useState<StudentItem | null>(null)
  const [showPromoteModal, setShowPromoteModal] = useState(false)
  const [promoteStage, setPromoteStage] = useState('ابتدائي')
  const [promoteGrade, setPromoteGrade] = useState('الصف الأول الابتدائي')
  const [promoteClass, setPromoteClass] = useState('')
  const [promoteRole, setPromoteRole] = useState('خادم فصل')
  const [promoteSystemRole, setPromoteSystemRole] = useState('servant')
  const [promoteUsername, setPromoteUsername] = useState('')
  const [promotePassword, setPromotePassword] = useState('123456')
  const [promoteKeepStudentRole, setPromoteKeepStudentRole] = useState(true)
  const [isPromoting, setIsPromoting] = useState(false)
  
  // Live stages and grades for cascaded promotion
  const [stagesList, setStagesList] = useState<string[]>([])
  const [gradesList, setGradesList] = useState<any[]>([])

  // Filters State
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedStage, setSelectedStage] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedGender, setSelectedGender] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')

    const getEditLink = (id: string) => {
    const isXampp = typeof window !== 'undefined' && window.location.pathname.includes('/stmina')
    const base = isXampp ? '/stmina' : ''
    return `${base}/students/edit/?id=${id}`
  }
  const getProfileLink = (id: string) => {
    const isXampp = typeof window !== 'undefined' && window.location.pathname.includes('/stmina')
    const base = isXampp ? '/stmina' : ''
    return `${base}/students/profile/?id=${id}`
  }

  const loadData = async () => {
    try {
      const sData = await getStudents()
      const cData = await getClasses()
      setStudents(sData)
      setClasses(cData)

      const isXampp = typeof window !== 'undefined' && window.location.pathname.includes('/stmina')
      const stgUrl = isXampp ? '/stmina/api/stages.php' : '/api/stages.php'
      const grdUrl = isXampp ? '/stmina/api/grades.php' : '/api/grades.php'
      const [stgRes, grdRes] = await Promise.all([
        fetch(stgUrl).catch(() => null),
        fetch(grdUrl).catch(() => null)
      ])
      if (stgRes && stgRes.ok) {
        const stgData = await stgRes.json()
        if (Array.isArray(stgData)) setStagesList(stgData.map((s: any) => s.name_ar).filter(Boolean))
      }
      if (grdRes && grdRes.ok) {
        const grdData = await grdRes.json()
        if (Array.isArray(grdData)) setGradesList(grdData)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (queryClassId) {
      setSelectedClass(queryClassId)
    }
  }, [queryClassId])

  useEffect(() => {
    loadData()
  }, [])

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return
    setIsDeleting(true)
    try {
      const isXampp = typeof window !== 'undefined' && window.location.pathname.includes('/stmina')
      const apiUrl = isXampp ? `/stmina/api/students.php?id=${studentToDelete.id}` : `/api/students.php?id=${studentToDelete.id}`
      
      await fetch(apiUrl, { method: 'DELETE' })
      
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('ssms_custom_students')
        if (saved) {
          const list = JSON.parse(saved).filter((x: any) => x.id !== studentToDelete.id)
          localStorage.setItem('ssms_custom_students', JSON.stringify(list))
        }
      }

      await loadData()
      setStudentToDelete(null)
    } catch (err) {
      console.error(err)
      alert('حدث خطأ أثناء الحذف ')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleConfirmPromote = async () => {
    if (!studentToPromote) return
    setIsPromoting(true)
    try {
      const isXampp = typeof window !== 'undefined' && window.location.pathname.includes('/stmina')
      const servantsApiUrl = isXampp ? '/stmina/api/servants.php' : '/api/servants.php'

      const usernameVal = promoteUsername.trim() || ('srv.' + studentToPromote.full_name.split(' ')[0].toLowerCase() + '.' + Math.floor(100 + Math.random() * 900))
      
      const payload = {
        full_name: studentToPromote.full_name,
        username: usernameVal,
        email: `${usernameVal}@church.org`,
        password: promotePassword.trim() || '123456',
        phone: (studentToPromote as any).phone_student || studentToPromote.father_phone || '',
        gender: studentToPromote.gender === 'female' || (studentToPromote as any).gender === 'بنات' ? 'female' : 'male',
        deacon_rank: (studentToPromote as any).deacon_rank || 'none',
        birth_date: (studentToPromote as any).birth_date || null,
        confession_father: studentToPromote.confession_father || null,
        role: 'servant',
        role_label: promoteRole,
        stage_name: promoteStage,
        class_name: promoteClass || 'عام',
        service_assignments: [
          {
            id: 'asg_' + Date.now(),
            stage_name: promoteStage,
            class_name: promoteClass || 'عام',
            role_label: promoteRole
          }
        ],
        is_also_student: promoteKeepStudentRole ? 1 : 0,
        student_stage_name: promoteKeepStudentRole ? studentToPromote.stage_name : null,
        student_class_name: promoteKeepStudentRole ? studentToPromote.class_name : null,
        student_id: studentToPromote.id,
        street_address: (studentToPromote as any).street_address || null,
        area_zone: (studentToPromote as any).area_zone || null,
        gps_location: (studentToPromote as any).gps_location || null,
        notes: `تمت الترقية من مخدوم إلى خادم بتاريخ ${new Date().toISOString().split('T')[0]}`
      }

      const res = await fetch(servantsApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        alert(`تهانينا! تمت ترقية (${studentToPromote.full_name}) ليصبح خادماً رسمياً بالخدمة! 👑🛡️`)
        const targetUrl = isXampp ? '/stmina/servants/' : '/servants/'
        window.location.href = targetUrl
      } else {
        alert('حدث خطأ أثناء حفظ الترقية')
      }
    } catch (e) {
      console.error(e)
      alert('خطأ في الاتصال بقاعدة البيانات')
    } finally {
      setIsPromoting(false)
      setShowPromoteModal(false)
    }
  }

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.full_name.includes(searchTerm) ||
      s.numeric_code.toString().includes(searchTerm) ||
      (s.father_phone && s.father_phone.includes(searchTerm)) ||
      (s.mother_phone && s.mother_phone.includes(searchTerm))
    const matchesClass = selectedClass ? (s.class_id === selectedClass || s.class_name === selectedClass || (classes.find(c => c.id === selectedClass)?.name_ar === s.class_name)) : true
    const matchesStage = selectedStage ? s.stage_name === selectedStage : true
    const matchesGender = selectedGender ? s.gender === selectedGender : true
    const matchesStatus = selectedStatus ? s.status === selectedStatus : true
    return matchesSearch && matchesClass && matchesStage && matchesGender && matchesStatus
  })

  return (
    <Shell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans" dir="rtl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              سجل المخدومين الشامل
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              إدارة كافة المخدومين والبيانات الرعوية والعناوين والافتقاد الميداني
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/students/new"
              className="h-10 px-5 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-2 shadow hover:bg-primary/95 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>تسجيل مخدوم جديد</span>
            </Link>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="بحث بالاسم، الكود، الهاتف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-muted/40 border border-border rounded-xl pr-9 pl-4 py-2 text-xs outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto text-xs">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-muted/40 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary cursor-pointer"
            >
              <option value="">كل الفصول</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name_ar}</option>
              ))}
            </select>

            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="bg-muted/40 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary cursor-pointer"
            >
              <option value="">النوع (الكل)</option>
              <option value="male">بنين</option>
              <option value="female">بنات</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-muted/40 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary cursor-pointer"
            >
              <option value="">الحالة (الكل)</option>
              <option value="active">نشط / منتظم</option>
              <option value="irregular">غير منتظم</option>
              <option value="inactive">غير نشط</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-muted/50 border-b border-border font-bold text-muted-foreground">
                <tr>
                  <th className="px-4 py-3.5">كود</th>
                  <th className="px-4 py-3.5">الاسم بالكامل</th>
                  <th className="px-4 py-3.5">السن</th>
                  <th className="px-4 py-3.5">الفصل</th>
                  <th className="px-4 py-3.5">الحالة</th>
                  <th className="px-4 py-3.5">أب الاعتراف</th>
                  <th className="px-4 py-3.5 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground animate-pulse">
                      جاري تحميل بيانات المخدومين ...
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                      لا يوجد مخدومين مسجلين حالياً. اضغط على زر "تسجيل مخدوم جديد" للبدء.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-muted/20 transition">
                      <td className="px-4 py-3.5 font-bold text-primary">#{s.numeric_code}</td>
                      <td className="px-4 py-3.5 font-bold text-foreground">
                        <div className="flex items-center gap-1.5">
                          <Link href={getProfileLink(s.id)} className="hover:text-primary hover:underline">
                            {s.full_name}
                          </Link>
                          {((s as any).is_servant === 1 || (s as any).is_servant === '1') && (
                            <span className="bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-500/30">
                              👑 خادم
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">{s.age} سنة</td>
                      <td className="px-4 py-3.5 text-muted-foreground">{s.class_name}</td>
                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-success/15 text-success">
                          نشط / منتظم
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">{s.confession_father}</td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Quick Crown Promote to Servant Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setStudentToPromote(s)
                              setPromoteUsername('srv.' + s.full_name.split(' ')[0].toLowerCase() + '.' + Math.floor(100 + Math.random() * 900))
                              setShowPromoteModal(true)
                            }}
                            className="p-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500 hover:text-white text-amber-700 dark:text-amber-400 transition shadow-sm cursor-pointer"
                            title="👑 ترقية وتكليف هذا المخدوم ليصبح خادماً بالخدمة"
                          >
                            <Crown className="h-4 w-4" />
                          </button>

                          {/* 1. View Profile Button */}
                          <Link
                            href={getProfileLink(s.id)}
                            className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary transition shadow-sm"
                            title="عرض الملف الشامل (👁️)"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>

                          {/* 2. Edit Student Button */}
                          <Link
                            href={getEditLink(s.id)}
                            className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-600 hover:text-white text-blue-600 dark:text-blue-400 transition shadow-sm"
                            title="تعديل بيانات المخدوم  (✏️)"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>

                          {/* 3. WhatsApp Contact */}
                          {s.father_phone && (
                            <a
                              href={`https://wa.me/2${s.father_phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-600 hover:text-white text-emerald-600 dark:text-emerald-400 transition shadow-sm"
                              title="تواصل واتساب (💬)"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </a>
                          )}

                          {/* 4. Delete Student Button */}
                          <button
                            type="button"
                            onClick={() => setStudentToDelete(s)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-600 hover:text-white text-rose-600 dark:text-rose-400 transition shadow-sm cursor-pointer"
                            title="حذف المخدوم  (🗑️)"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 bg-muted/20 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
            <span>إجمالي النتائج: {filteredStudents.length} مخدوم</span>
            <span>مدارس الأحد الكنيسة القبطية</span>
          </div>
        </div>

        {/* DELETE CONFIRMATION MODAL */}
        {studentToDelete && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 text-right font-sans" dir="rtl">
              <div className="flex items-center gap-3 text-destructive border-b border-border pb-3">
                <div className="p-2 rounded-xl bg-destructive/10">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">تأكيد حذف المخدوم</h3>
                  <p className="text-xs text-muted-foreground">حذف السجل نهائياً </p>
                </div>
              </div>

              <div className="p-3 bg-muted/40 rounded-xl space-y-1.5 text-xs text-foreground">
                <p>هل أنت متأكد من رغبتك في حذف المخدوم:</p>
                <p className="font-black text-sm text-primary">{studentToDelete.full_name}</p>
                <p className="text-[11px] text-muted-foreground">كود: #{studentToDelete.numeric_code} | {studentToDelete.class_name}</p>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setStudentToDelete(null)}
                  className="h-10 px-4 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-muted transition cursor-pointer"
                >
                  إلغاء وتراجع
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="h-10 px-5 rounded-xl bg-destructive text-destructive-foreground text-xs font-bold hover:bg-destructive/90 transition shadow cursor-pointer flex items-center gap-2"
                >
                  {isDeleting ? 'جاري الحذف...' : 'نعم، حذف نهائي'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* QUICK PROMOTION TO SERVANT MODAL */}
      {showPromoteModal && studentToPromote && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border-2 border-amber-500/40 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 text-right font-sans" dir="rtl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-2xl bg-amber-500/20 text-amber-600 flex items-center justify-center text-xl font-bold">
                  👑
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-foreground">ترقية وتكليف ({studentToPromote.full_name}) كخادم</h3>
                  <p className="text-[11px] text-muted-foreground">نقل كامل بياناته الشخصية والعنوان وتعيين خدمته وحسابه في النظام</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPromoteModal(false)}
                className="text-muted-foreground hover:text-foreground text-xs p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs max-h-[70vh] overflow-y-auto p-1 font-sans">
              
              {/* 4 Cascaded Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* 1. Stage */}
                <div className="space-y-1">
                  <label className="font-bold text-foreground flex items-center gap-1">
                    <span>١. المرحلة المكلف بها *</span>
                  </label>
                  <select
                    value={promoteStage}
                    onChange={(e) => {
                      const newStg = e.target.value
                      setPromoteStage(newStg)
                      const stageGrades = gradesList.filter(g => g.stage_name === newStg)
                      if (stageGrades.length > 0) setPromoteGrade(stageGrades[0].name_ar)
                      const matchingClasses = classes.filter((c: any) => c.stage_name === newStg || c.stage_name_ar === newStg)
                      if (matchingClasses.length > 0) setPromoteClass(matchingClasses[0].name_ar)
                    }}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 outline-none focus:border-amber-500 font-bold cursor-pointer"
                  >
                    {stagesList.length > 0 ? (
                      stagesList.map((stg, idx) => (
                        <option key={idx} value={stg}>{stg}</option>
                      ))
                    ) : (
                      <>
                        <option value="ابتدائي">ابتدائي</option>
                        <option value="إعدادي">إعدادي</option>
                        <option value="ثانوي">ثانوي</option>
                        <option value="حضانة">حضانة</option>
                        <option value="جامعيين وخريجين">جامعيين وخريجين</option>
                      </>
                    )}
                    <option value="أنشطة ولجان عامة">أنشطة ولجان عامة</option>
                  </select>
                </div>

                {/* 2. Grade */}
                <div className="space-y-1">
                  <label className="font-bold text-foreground">٢. الصف / السنة الدراسية:</label>
                  {(() => {
                    const stageGrades = gradesList.filter(g => g.stage_name === promoteStage)
                    return stageGrades.length > 0 ? (
                      <select
                        value={promoteGrade}
                        onChange={(e) => setPromoteGrade(e.target.value)}
                        className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 outline-none focus:border-amber-500 font-bold cursor-pointer"
                      >
                        {stageGrades.map((grd) => (
                          <option key={grd.id} value={grd.name_ar}>{grd.name_ar}</option>
                        ))}
                        <option value="عام لكل الصفوف">عام لكل الصفوف</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={promoteGrade}
                        onChange={(e) => setPromoteGrade(e.target.value)}
                        className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 outline-none focus:border-amber-500 font-bold"
                      />
                    )
                  })()}
                </div>

                {/* 3. Class */}
                <div className="space-y-1">
                  <label className="font-bold text-foreground">٣. الفصل المكلف به *</label>
                  {(() => {
                    const stageClasses = classes.filter((c: any) => c.stage_name === promoteStage || c.stage_name_ar === promoteStage)
                    return stageClasses.length > 0 ? (
                      <select
                        value={promoteClass}
                        onChange={(e) => setPromoteClass(e.target.value)}
                        className="w-full bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 rounded-xl px-3 py-2.5 outline-none focus:border-amber-500 font-bold cursor-pointer"
                      >
                        {stageClasses.map((cls) => (
                          <option key={cls.id} value={cls.name_ar}>
                            {cls.name_ar} {cls.gender ? `(${cls.gender})` : ''}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={promoteClass}
                        onChange={(e) => setPromoteClass(e.target.value)}
                        className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 outline-none focus:border-amber-500 font-bold"
                      />
                    )
                  })()}
                </div>

                {/* 4. Role Title */}
                <div className="space-y-1">
                  <label className="font-bold text-foreground">٤. المسمى والمسؤولية:</label>
                  <select
                    value={promoteRole}
                    onChange={(e) => {
                      const val = e.target.value
                      setPromoteRole(val)
                      if (val === 'أمين مرحلة') setPromoteSystemRole('stage_leader')
                      else if (val === 'أمين فصل') setPromoteSystemRole('class_leader')
                      else setPromoteSystemRole('servant')
                    }}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 outline-none focus:border-amber-500 font-bold cursor-pointer"
                  >
                    <option value="خادم فصل">🛡️ خادم فصل</option>
                    <option value="أمين فصل">⭐ أمين فصل</option>
                    <option value="أمين مرحلة">🎖️ أمين مرحلة</option>
                    <option value="مساعد خادم">مساعد خادم</option>
                    <option value="معلم ألحان وطقس">معلم ألحان وطقس</option>
                    <option value="خادم كورال وترانيم">خادم كورال وترانيم</option>
                    <option value="قائد كشفي">قائد كشفي</option>
                  </select>
                </div>

              </div>

              {/* 5. System Permissions Selector */}
              <div className="space-y-1.5 pt-1">
                <label className="font-bold text-foreground block">٥. مستوى الصلاحية في النظام:</label>
                <select
                  value={promoteSystemRole}
                  onChange={(e) => setPromoteSystemRole(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl px-3 py-2.5 outline-none focus:border-amber-500 font-bold text-foreground cursor-pointer shadow-sm"
                >
                  <option value="servant">🛡️ خادم فصل (تسجيل حضور وافتقاد ونقاط فصوله)</option>
                  <option value="class_leader">⭐ أمين فصل (إدارة الفصل والطلاب بالكامل)</option>
                  <option value="stage_leader">🎖️ أمين مرحلة (إدارة المرحلة وفصولها ومناهجها)</option>
                  <option value="sector_leader">🏛️ أمين قطاع (إشراف ومتابعة فصول ومراحل متعددة)</option>
                  <option value="service_admin">👑 أمين عام الخدمة (صلاحيات إدارية كاملة)</option>
                </select>
              </div>

              <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-2">
                <label className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={promoteKeepStudentRole}
                    onChange={(e) => setPromoteKeepStudentRole(e.target.checked)}
                    className="h-4 w-4 rounded border-amber-500 text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <span>👥 إبقاء المخدوم في فصله الحالي ({studentToPromote.class_name || studentToPromote.stage_name}) كمخدوم أيضاً (ازدواجية الدور)</span>
                </label>
                <p className="text-[10px] text-muted-foreground pr-6">
                  يسمح له بالخدمة كخادم في مرحلة، مع استمرار حضوره ومتابعته كمخدوم في اجتماعه الأصلي.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">اسم المستخدم للدخول:</label>
                  <input
                    type="text"
                    value={promoteUsername}
                    onChange={(e) => setPromoteUsername(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 outline-none focus:border-amber-500 font-mono text-left font-bold"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">كلمة المرور:</label>
                  <input
                    type="text"
                    value={promotePassword}
                    onChange={(e) => setPromotePassword(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 outline-none focus:border-amber-500 font-mono text-left font-bold"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setShowPromoteModal(false)}
                className="h-10 px-4 rounded-xl border border-border text-xs text-muted-foreground hover:bg-muted font-bold"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={isPromoting}
                onClick={handleConfirmPromote}
                className="h-10 px-6 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
              >
                <span>{isPromoting ? 'جاري الترقية...' : 'تأكيد الترقية والتحويل لخادم 🚀'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </Shell>
  )
}
