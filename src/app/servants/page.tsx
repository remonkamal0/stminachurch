'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { Shell } from '@/components/layout/Shell'
import { EmptyState } from '@/components/layout/EmptyState'
import {
  Users,
  Search,
  Phone,
  Shield,
  Trash2,
  Key,
  Award,
  Plus,
  Filter,
  CheckCircle2,
  Crown,
  Church,
  ExternalLink,
  MessageCircle,
  Sparkles,
  UserCheck,
  Edit2,
  X,
  Save,
  CheckSquare,
  Lock
} from 'lucide-react'

import { useSearchParams } from 'next/navigation'

export default function ServantsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-xs text-muted-foreground font-sans">جاري تحميل دليل الخدام...</div>}>
      <ServantsPageContent />
    </Suspense>
  )
}

function ServantsPageContent() {
  const [servants, setServants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStageFilter, setSelectedStageFilter] = useState('all')
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all')
  const searchParams = useSearchParams()
  const queryClass = searchParams.get('className') || searchParams.get('classId') || ''
  const [selectedClassFilter, setSelectedClassFilter] = useState(queryClass)

  // Edit Servant Modal States
  const [editingServant, setEditingServant] = useState<any | null>(null)
  const [editFullName, setEditFullName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editUsername, setEditUsername] = useState('')
  const [editPassword, setEditPassword] = useState('')
  const [editRole, setEditRole] = useState('servant')
  const [editRoleLabel, setEditRoleLabel] = useState('خادم فصل')
  const [editDeaconRank, setEditDeaconRank] = useState('none')
  const [editConfessionFather, setEditConfessionFather] = useState('')
  const [editIsAlsoStudent, setEditIsAlsoStudent] = useState(false)
  const [editStudentStage, setEditStudentStage] = useState('جامعيين وخريجين')
  const [editStudentClass, setEditStudentClass] = useState('')
  const [isUpdatingServant, setIsUpdatingServant] = useState(false)

  // Live Stages and Priests for Edit modal
  const [stagesList, setStagesList] = useState<string[]>([])
  const [priestsList, setPriestsList] = useState<any[]>([])

  const getApiUrl = (endpoint: string) => {
    const isXampp = typeof window !== 'undefined' && window.location.pathname.includes('/stmina')
    return isXampp ? `/stmina/api/${endpoint}` : `/api/${endpoint}`
  }

  const loadLiveServants = async () => {
    try {
      setLoading(true)
      const [srvRes, stgRes, prRes] = await Promise.all([
        fetch(getApiUrl('servants.php')).catch(() => null),
        fetch(getApiUrl('stages.php')).catch(() => null),
        fetch(getApiUrl('priests.php')).catch(() => null)
      ])

      if (srvRes && srvRes.ok) {
        const data = await srvRes.json()
        if (Array.isArray(data)) setServants(data)
      }

      if (stgRes && stgRes.ok) {
        const stgData = await stgRes.json()
        if (Array.isArray(stgData)) setStagesList(stgData.map((s: any) => s.name_ar).filter(Boolean))
      }

      if (prRes && prRes.ok) {
        const prData = await prRes.json()
        if (Array.isArray(prData)) setPriestsList(prData)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLiveServants()
  }, [])

  // Open Edit Modal
  const handleOpenEdit = (srv: any) => {
    setEditingServant(srv)
    setEditFullName(srv.full_name || '')
    setEditPhone(srv.phone || '')
    setEditUsername(srv.username || '')
    setEditPassword('')
    setEditRole(srv.role || 'servant')
    setEditRoleLabel(srv.role_label || 'خادم فصل')
    setEditDeaconRank(srv.deacon_rank || 'none')
    setEditConfessionFather(srv.confession_father || '')
    setEditIsAlsoStudent(srv.is_also_student == 1)
    setEditStudentStage(srv.student_stage_name || 'جامعيين وخريجين')
    setEditStudentClass(srv.student_class_name || 'اجتماع الشباب')
  }

  // Save Edit
  const handleSaveEdit = async () => {
    if (!editingServant || !editFullName.trim()) return
    setIsUpdatingServant(true)
    try {
      const payload: any = {
        id: editingServant.id,
        full_name: editFullName.trim(),
        phone: editPhone.trim(),
        username: editUsername.trim(),
        role: editRole,
        role_label: editRoleLabel,
        deacon_rank: editDeaconRank,
        confession_father: editConfessionFather,
        is_also_student: editIsAlsoStudent ? 1 : 0,
        student_stage_name: editIsAlsoStudent ? editStudentStage : null,
        student_class_name: editIsAlsoStudent ? editStudentClass : null,
        service_assignments: editingServant.service_assignments || []
      }

      if (editPassword.trim()) {
        payload.password = editPassword.trim()
      }

      const res = await fetch(getApiUrl('servants.php'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        alert('تم تعديل وتحديث بيانات الخادم وصلاحياته بنجاح! ✏️✨')
        setEditingServant(null)
        await loadLiveServants()
      } else {
        alert('حدث خطأ أثناء تعديل بيانات الخادم')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsUpdatingServant(false)
    }
  }

  const handleDeleteServant = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف الخادم "${name}"؟`)) return
    try {
      const res = await fetch(`${getApiUrl('servants.php')}?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        alert('تم حذف الخادم بنجاح')
        await loadLiveServants()
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Stats
  const totalCount = servants.length
  const leadersCount = servants.filter(s => s.role === 'service_admin' || s.role === 'stage_leader' || s.role === 'class_leader').length
  const dualRoleCount = servants.filter(s => s.is_also_student == 1).length
  const activeCount = servants.filter(s => s.is_active != 0).length

  // Filtered List
  const filteredServants = servants.filter(s => {
    const term = searchTerm.toLowerCase()
    const name = (s.full_name || '').toLowerCase()
    const user = (s.username || '').toLowerCase()
    const ph = (s.phone || '').toLowerCase()
    const cls = (s.class_name || '').toLowerCase()
    const stg = (s.stage_name || '').toLowerCase()
    const matchSearch = name.includes(term) || user.includes(term) || ph.includes(term) || cls.includes(term) || stg.includes(term)

    const matchStage = selectedStageFilter === 'all' || s.stage_name === selectedStageFilter
    const matchRole = selectedRoleFilter === 'all' || s.role === selectedRoleFilter

    const matchClass = selectedClassFilter
      ? (
          (s.class_name && s.class_name.toLowerCase().includes(selectedClassFilter.toLowerCase())) ||
          (typeof s.service_assignments === 'string' && s.service_assignments.toLowerCase().includes(selectedClassFilter.toLowerCase())) ||
          (Array.isArray(s.service_assignments) && s.service_assignments.some((asg: any) => asg.class_name && asg.class_name.toLowerCase().includes(selectedClassFilter.toLowerCase())))
        )
      : true

    return matchSearch && matchStage && matchRole && matchClass
  })

  // Unique stages from servants
  const availableStages = Array.from(new Set(servants.map(s => s.stage_name).filter(Boolean)))

  return (
    <Shell>
      <div className="space-y-6 pb-20 font-sans text-right" dir="rtl">
        
        {/* Top Header */}
        <div className="flex justify-between items-center border-b border-border pb-4 flex-wrap gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground flex items-center gap-2.5">
              <Shield className="h-7 w-7 text-primary" />
              <span>دليل وشؤون الخدام والصلاحيات</span>
            </h1>
            <p className="text-xs text-muted-foreground">
              إدارة وتعديل بيانات الخدام وتكليفات الفصول وحسابات الدخول ومتابعة الخدام المخدومين
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href={typeof window !== 'undefined' && window.location.pathname.includes('/stmina') ? '/stmina/servants/new/' : '/servants/new/'}
              className="h-11 px-6 rounded-2xl bg-primary text-primary-foreground font-extrabold text-xs flex items-center gap-2 shadow-lg hover:bg-primary/95 transition-all duration-200 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>+ إضافة خادم جديد</span>
            </Link>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-muted-foreground">إجمالي الخدام</p>
              <p className="text-2xl font-extrabold text-foreground">{totalCount}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-muted-foreground">الأمناء والمسؤولين</p>
              <p className="text-2xl font-extrabold text-blue-600">{leadersCount}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Crown className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-muted-foreground">خدام مخدومين باجتماعات</p>
              <p className="text-2xl font-extrabold text-emerald-600">{dualRoleCount}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-muted-foreground">الخدام النشطين</p>
              <p className="text-2xl font-extrabold text-purple-600">{activeCount}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-card border border-border p-4 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            
            {/* Search */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground right-3" />
              <input
                type="text"
                placeholder="ابحث باسم الخادم، رقم الموبايل، اسم المستخدم، أو الفصل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-muted/40 border border-border rounded-xl pr-9 pl-4 py-2 text-xs outline-none focus:border-primary font-bold"
              />
            </div>

            {/* Stage Filter */}
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <span className="text-muted-foreground">المرحلة:</span>
              <select
                value={selectedStageFilter}
                onChange={(e) => setSelectedStageFilter(e.target.value)}
                className="bg-muted/40 border border-border rounded-xl px-3 py-2 text-xs outline-none focus:border-primary cursor-pointer font-bold"
              >
                <option value="all">كل المراحل</option>
                {availableStages.map((stg, idx) => (
                  <option key={idx} value={stg}>{stg}</option>
                ))}
              </select>
            </div>

            {/* Role Filter */}
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <span className="text-muted-foreground">الصلاحية:</span>
              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                className="bg-muted/40 border border-border rounded-xl px-3 py-2 text-xs outline-none focus:border-primary cursor-pointer font-bold"
              >
                <option value="all">كل الصلاحيات</option>
                <option value="priest">✝️ كاهن / أب اعتراف</option>
                <option value="service_admin">👑 أمين عام الخدمة</option>
                <option value="sector_leader">🏛️ أمين قطاع</option>
                <option value="stage_leader">🎖️ أمين مرحلة</option>
                <option value="class_leader">⭐ أمين فصل</option>
                <option value="servant">🛡️ خادم فصل</option>
                <option value="treasurer">💰 أمين صندوق ومسؤول مالي</option>
              </select>
            </div>

          </div>
        </div>

        {/* Directory Content */}
        {loading ? (
          <div className="p-12 text-center text-xs text-muted-foreground animate-pulse bg-card border border-border rounded-3xl">
            <Shield className="h-8 w-8 text-primary mx-auto mb-2 animate-bounce" />
            <p className="font-bold text-foreground">جاري تحميل بيانات الخدام والصلاحيات...</p>
          </div>
        ) : filteredServants.length === 0 ? (
          <EmptyState
            icon={Shield}
            title="لا يوجد خدام مسجلين حالياً 🛡️"
            description="ابدأ الآن بإضافة وتعيين الخدام وتحديد أماكن خدمتهم وصلاحياتهم وإمكانية إدراجهم كمخدومين في اجتماعات أخرى."
            actionLabel="+ إضافة أول خادم جديد الآن"
            actionHref={typeof window !== 'undefined' && window.location.pathname.includes('/stmina') ? '/stmina/servants/new/' : '/servants/new/'}
          />
        ) : (
          <div className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden animate-in fade-in">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs border-collapse">
                <thead className="bg-muted/50 text-muted-foreground font-bold border-b border-border">
                  <tr>
                    <th className="px-4 py-3.5">الخادم</th>
                    <th className="px-4 py-3.5">الهاتف والتواصل</th>
                    <th className="px-4 py-3.5">مكان التكليف الكنسي</th>
                    <th className="px-4 py-3.5 text-center">المسؤولية والصلاحية</th>
                    <th className="px-4 py-3.5 text-center">ازدواجية الدور (خادم ومخدوم)</th>
                    <th className="px-4 py-3.5 text-center">حساب الدخول</th>
                    <th className="px-4 py-3.5 text-center w-28 print:hidden">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-foreground">
                  {filteredServants.map((srv) => (
                    <tr key={srv.id} className="hover:bg-muted/20 transition">
                      <td className="px-4 py-3.5 font-bold text-sm">
                        <div className="flex items-center gap-2.5">
                          <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-extrabold text-xs shrink-0 shadow-inner">
                            {srv.full_name.charAt(0)}
                          </div>
                          <div>
                            <Link
                              href={typeof window !== 'undefined' && window.location.pathname.includes('/stmina') ? `/stmina/servants/profile/?id=${encodeURIComponent(srv.id)}` : `/servants/profile/?id=${encodeURIComponent(srv.id)}`}
                              className="font-extrabold text-foreground hover:text-primary transition underline-offset-2 hover:underline"
                            >
                              {srv.full_name}
                            </Link>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {srv.deacon_rank && srv.deacon_rank !== 'none' && (
                                <span className="text-[10px] text-primary font-bold bg-primary/5 px-2 py-0.5 rounded-md">
                                  {srv.deacon_rank}
                                </span>
                              )}
                              {srv.confession_father && (
                                <span className="text-[10px] text-muted-foreground">
                                  اعتراف: {srv.confession_father}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-xs">
                        <div className="space-y-1">
                          <p className="font-mono text-muted-foreground font-bold" dir="ltr">
                            {srv.phone || '—'}
                          </p>
                          {srv.phone && (
                            <a
                              href={`https://wa.me/2${srv.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded-md transition"
                            >
                              <MessageCircle className="h-3 w-3" />
                              <span>واتساب الخادم</span>
                            </a>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-xs">
                        {Array.isArray(srv.service_assignments) && srv.service_assignments.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 max-w-xs">
                            {srv.service_assignments.map((asg: any, aIdx: number) => (
                              <div key={aIdx} className="bg-primary/5 border border-primary/20 px-2.5 py-1 rounded-xl flex items-center gap-1.5 shadow-sm">
                                <Church className="h-3 w-3 text-primary shrink-0" />
                                <div>
                                  <span className="font-extrabold text-foreground block text-[11px]">{asg.class_name}</span>
                                  <span className="text-[9px] text-primary block">{asg.stage_name} • {asg.role_label}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div>
                            <span className="font-bold text-foreground block flex items-center gap-1">
                              <Church className="h-3.5 w-3.5 text-primary" />
                              <span>{srv.class_name || 'عام'}</span>
                            </span>
                            <span className="text-[11px] text-muted-foreground pr-4.5">{srv.stage_name || 'مرحلة عامة'}</span>
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full inline-block shadow-sm ${
                          srv.role === 'service_admin'
                            ? 'bg-amber-500/15 text-amber-600 border border-amber-500/30'
                            : srv.role === 'stage_leader'
                            ? 'bg-blue-500/15 text-blue-600 border border-blue-500/30'
                            : 'bg-primary/10 text-primary border border-primary/20'
                        }`}>
                          {srv.role_label || srv.role || 'خادم فصل'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        {srv.is_also_student ? (
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1 border border-emerald-500/20">
                            <Users className="h-3 w-3" />
                            <span>مخدوم في: {srv.student_class_name || srv.student_stage_name || 'اجتماع الشباب'}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">خادم فقط</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <div className="inline-flex items-center gap-1 font-mono text-[11px] bg-muted/50 px-2.5 py-1 rounded-xl border border-border">
                          <Key className="h-3 w-3 text-primary" />
                          <span className="font-bold">{srv.username || srv.email?.split('@')[0] || '—'}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-center print:hidden">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* EDIT BUTTON */}
                          <button
                            onClick={() => handleOpenEdit(srv)}
                            className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-600 hover:text-white text-blue-600 transition cursor-pointer"
                            title="تعديل بيانات الخادم والصلاحيات"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          {/* DELETE BUTTON */}
                          {srv.id !== 'srv_admin' && (
                            <button
                              onClick={() => handleDeleteServant(srv.id, srv.full_name)}
                              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-600 hover:text-white text-rose-600 transition cursor-pointer"
                              title="حذف هذا الخادم"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL: EDIT SERVANT */}
        {editingServant && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 text-right font-sans max-h-[90vh] overflow-y-auto" dir="rtl">
              
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Edit2 className="h-4 w-4 text-blue-600" />
                  <span>تعديل بيانات الخادم وصلاحياته: <strong className="text-primary">{editingServant.full_name}</strong></span>
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingServant(null)}
                  className="text-muted-foreground hover:text-foreground text-sm cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                
                {/* Full Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">الاسم بالكامل *</label>
                    <input
                      type="text"
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                      className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground">رقم الهاتف / واتساب</label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary font-mono text-left font-bold"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Deacon Rank & Confession Father */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">الرتبة الشماسية:</label>
                    <select
                      value={editDeaconRank}
                      onChange={(e) => setEditDeaconRank(e.target.value)}
                      className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary cursor-pointer font-semibold"
                    >
                      <option value="none">غير مرسوم شماس</option>
                      <option value="إبصالتس (مرتل)">إبصالتس (مرتل)</option>
                      <option value="أغنسطس (قارئ)">أغنسطس (قارئ)</option>
                      <option value="إيبودياكون (مساعد شماس)">إيبودياكون (مساعد)</option>
                      <option value="دياكون (شماس كامل)">دياكون (شماس كامل)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground">أب الاعتراف:</label>
                    <select
                      value={editConfessionFather}
                      onChange={(e) => setEditConfessionFather(e.target.value)}
                      className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary cursor-pointer font-bold text-primary"
                    >
                      {priestsList.map((pr) => (
                        <option key={pr.id} value={pr.name_ar}>{pr.name_ar}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Dual Role */}
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-2xl space-y-2">
                  <label className="font-bold text-xs text-primary flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editIsAlsoStudent}
                      onChange={(e) => setEditIsAlsoStudent(e.target.checked)}
                      className="h-4 w-4 rounded text-primary"
                    />
                    <span>👥 هذا الخادم مخدوم أيضاً في اجتماع آخر (ازدواجية الدور)</span>
                  </label>

                  {editIsAlsoStudent && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <select
                        value={editStudentStage}
                        onChange={(e) => setEditStudentStage(e.target.value)}
                        className="bg-card border border-border rounded-xl px-2.5 py-1.5 text-xs font-bold"
                      >
                        {stagesList.map((stg, i) => (
                          <option key={i} value={stg}>{stg}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="اسم الاجتماع/الفصل"
                        value={editStudentClass}
                        onChange={(e) => setEditStudentClass(e.target.value)}
                        className="bg-card border border-border rounded-xl px-2.5 py-1.5 text-xs font-bold"
                      />
                    </div>
                  )}
                </div>

                {/* Username & Change Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-border">
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">اسم المستخدم للدخول</label>
                    <input
                      type="text"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary font-mono text-left font-bold"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground">تغيير كلمة المرور (اختياري)</label>
                    <input
                      type="text"
                      placeholder="اتركه فارغاً لعدم التغيير"
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary font-mono text-left"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Role / Permission */}
                <div className="space-y-1 pt-1">
                  <label className="font-bold text-foreground block">مستوى الصلاحية على النظام:</label>
                  <select
                    value={editRole}
                    onChange={(e) => {
                      const r = e.target.value
                      setEditRole(r)
                      const labels: any = {
                        priest: 'كاهن / أب اعتراف',
                        service_admin: 'أمين عام الخدمة',
                        sector_leader: 'أمين قطاع',
                        stage_leader: 'أمين مرحلة',
                        class_leader: 'أمين فصل',
                        servant: 'خادم فصل',
                        treasurer: 'أمين صندوق ومسؤول مالي'
                      }
                      setEditRoleLabel(labels[r] || 'خادم فصل')
                    }}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary cursor-pointer font-bold text-foreground"
                  >
                    <option value="priest">✝️ كاهن / أب اعتراف (Priest)</option>
                    <option value="service_admin">👑 أمين عام الخدمة (General Leader)</option>
                    <option value="sector_leader">🏛️ أمين قطاع (Sector Leader)</option>
                    <option value="stage_leader">🎖️ أمين مرحلة (Stage Leader)</option>
                    <option value="class_leader">⭐ أمين فصل (Class Leader)</option>
                    <option value="servant">🛡️ خادم فصل (Class Servant)</option>
                    <option value="treasurer">💰 أمين صندوق ومسؤول مالي (Treasurer)</option>
                  </select>
                </div>

              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingServant(null)}
                  className="h-10 px-4 rounded-xl border border-border text-xs text-muted-foreground hover:bg-muted cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  disabled={isUpdatingServant || !editFullName.trim()}
                  onClick={handleSaveEdit}
                  className="h-10 px-5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow hover:bg-blue-700 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="h-4 w-4" />
                  <span>{isUpdatingServant ? 'جاري الحفظ...' : 'حفظ التعديلات 💾'}</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </Shell>
  )
}
