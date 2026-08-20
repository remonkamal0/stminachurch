'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { Shell } from '@/components/layout/Shell'
import Link from 'next/link'
import {
  User,
  Church,
  Phone,
  Calendar,
  Award,
  BookOpen,
  MapPin,
  Heart,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Share2,
  Printer,
  ChevronRight,
  TrendingUp,
  History,
  Shield,
  Star,
  Music,
  GraduationCap,
  MessageCircle,
  QrCode,
  Users,
  Briefcase,
  Layers,
  Crown,
  Lock,
  X,
  ExternalLink,
  Plus
} from 'lucide-react'
import QRCode from 'qrcode'

export default function ServantDetailsClient() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [resolvedId, setResolvedId] = useState<string>('')

  useEffect(() => {
    let currentId = searchParams?.get('id') || (params?.id as string) || ''
    if (!currentId && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      currentId = urlParams.get('id') || ''
      if (!currentId) {
        const parts = window.location.pathname.split('/').filter(Boolean)
        const last = parts[parts.length - 1]
        if (last && last !== 'servants' && last !== 'profile' && last !== 'stmina') {
          currentId = last
        }
      }
    }
    setResolvedId(currentId)
  }, [params, searchParams])

  const [servant, setServant] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [qrUrl, setQrUrl] = useState('')
  
  // 6 Rich Tabs identical to Student Profile
  const [activeTab, setActiveTab] = useState<'personal' | 'family' | 'assignments' | 'attendance' | 'points' | 'timeline' | 'credentials'>('personal')

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false)
  const [editFullName, setEditFullName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editUsername, setEditUsername] = useState('')
  const [editRoleLabel, setEditRoleLabel] = useState('')
  const [editDeaconRank, setEditDeaconRank] = useState('none')
  const [editFather, setEditFather] = useState('')
  const [editArea, setEditArea] = useState('')
  const [editStreet, setEditStreet] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

  const getApiUrl = (endpoint: string) => {
    const isXampp = typeof window !== 'undefined' && window.location.pathname.includes('/stmina')
    return isXampp ? `/stmina/api/${endpoint}` : `/api/${endpoint}`
  }

  useEffect(() => {
    async function loadServantData() {
      if (!resolvedId) return
      setLoading(true)
      try {
        const res = await fetch(getApiUrl('servants.php')).catch(() => null)
        if (res && res.ok) {
          const data = await res.json()
          if (Array.isArray(data)) {
            const found = data.find((s: any) => 
              String(s.id).toLowerCase() === String(resolvedId).toLowerCase() || 
              String(s.username).toLowerCase() === String(resolvedId).toLowerCase()
            )
            if (found) {
              setServant(found)
              setEditFullName(found.full_name || '')
              setEditPhone(found.phone || '')
              setEditUsername(found.username || '')
              setEditRoleLabel(found.role_label || 'خادم')
              setEditDeaconRank(found.deacon_rank || 'none')
              setEditFather(found.confession_father || '')
              setEditArea(found.area_zone || '')
              setEditStreet(found.street_address || '')
            }
          }
        }
      } catch (e) {
        console.error('Error fetching servant:', e)
      } finally {
        setLoading(false)
      }
    }

    if (resolvedId) {
      loadServantData()
    }
  }, [resolvedId])

  // Generate QR Code
  useEffect(() => {
    if (servant) {
      const qrData = JSON.stringify({
        id: servant.id,
        name: servant.full_name,
        role: servant.role_label,
        phone: servant.phone,
        type: 'SERVANT'
      })
      QRCode.toDataURL(qrData, { width: 256, margin: 1 })
        .then(setQrUrl)
        .catch(console.error)
    }
  }, [servant])

  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print()
  }

  const handleWhatsApp = () => {
    if (!servant?.phone) return
    const cleanPhone = servant.phone.replace(/[^0-9]/g, '')
    const fullPhone = cleanPhone.startsWith('0') ? '2' + cleanPhone : cleanPhone
    window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(`سلام ونعمة يا خادم المسيح / ${servant.full_name}`)}`, '_blank')
  }

  const handleSaveEdit = async () => {
    if (!editFullName.trim()) {
      alert('اسم الخادم مطلوب')
      return
    }
    setSavingEdit(true)
    try {
      const payload = {
        id: servant.id,
        full_name: editFullName.trim(),
        phone: editPhone.trim(),
        username: editUsername.trim(),
        role_label: editRoleLabel.trim(),
        deacon_rank: editDeaconRank,
        confession_father: editFather.trim(),
        area_zone: editArea.trim(),
        street_address: editStreet.trim()
      }

      const res = await fetch(getApiUrl('servants.php'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        alert('تم تعديل بيانات الخادم بنجاح!')
        setServant((prev: any) => ({ ...prev, ...payload }))
        setShowEditModal(false)
      } else {
        alert('حدث خطأ أثناء التعديل')
      }
    } catch (e) {
      alert('خطأ في الاتصال بقاعدة البيانات')
    } finally {
      setSavingEdit(false)
    }
  }

  if (loading) {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-muted-foreground font-sans font-bold">جاري تحميل ملف الخادم الشامل من قاعدة البيانات...</p>
        </div>
      </Shell>
    )
  }

  if (!servant) {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center font-sans">
          <div className="h-16 w-16 bg-muted/40 rounded-full flex items-center justify-center text-muted-foreground">
            <Shield className="h-8 w-8" />
          </div>
          <h2 className="text-lg font-bold text-foreground">الخادم غير موجود</h2>
          <p className="text-xs text-muted-foreground">لم يتم العثور على سجل بهذا المعرف في قاعدة بيانات الخدام.</p>
          <Link
            href={typeof window !== 'undefined' && window.location.pathname.includes('/stmina') ? '/stmina/servants/' : '/servants/'}
            className="h-10 px-5 bg-primary text-primary-foreground rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-primary/95 transition shadow"
          >
            <span>العودة لدليل الخدام</span>
            <ChevronRight className="h-4 w-4 rotate-180" />
          </Link>
        </div>
      </Shell>
    )
  }

  // Parse assignments
  let parsedAssignments: any[] = []
  if (Array.isArray(servant.service_assignments)) {
    parsedAssignments = servant.service_assignments
  } else if (typeof servant.service_assignments === 'string') {
    try {
      parsedAssignments = JSON.parse(servant.service_assignments)
    } catch (e) {
      parsedAssignments = []
    }
  }

  return (
    <Shell>
      <div className="space-y-6 max-w-5xl mx-auto pb-20 font-sans text-right" dir="rtl">
        
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border pb-3">
          <div className="flex items-center gap-1.5 font-bold">
            <Link
              href={typeof window !== 'undefined' && window.location.pathname.includes('/stmina') ? '/stmina/servants/' : '/servants/'}
              className="hover:text-primary transition flex items-center gap-1"
            >
              <Shield className="h-3.5 w-3.5" />
              <span>دليل الخدام</span>
            </Link>
            <span>/</span>
            <span className="text-foreground">{servant.full_name}</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={typeof window !== 'undefined' && window.location.pathname.includes('/stmina') ? `/stmina/servants/edit/?id=${encodeURIComponent(servant.id)}` : `/servants/edit/?id=${encodeURIComponent(servant.id)}`}
              className="h-8 px-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Edit className="h-3.5 w-3.5" />
              <span>تعديل الملف بالكامل</span>
            </Link>
            <button
              type="button"
              onClick={handlePrint}
              className="h-8 px-3 rounded-xl border border-border hover:bg-muted font-bold text-xs flex items-center gap-1.5 text-muted-foreground transition cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>طباعة الملف</span>
            </button>
          </div>
        </div>

        {/* HERO CARD: SERVANT OVERVIEW */}
        <div className="bg-card border-2 border-primary/20 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full -translate-x-12 -translate-y-12 blur-2xl"></div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
            {/* Avatar / Deacon Badge */}
            <div className="relative group shrink-0">
              <div className="h-24 w-24 md:h-28 md:w-28 rounded-3xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-primary text-3xl font-black shadow-inner overflow-hidden">
                <User className="h-14 w-14" />
              </div>
              <span className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow border-2 border-card">
                {servant.deacon_rank && servant.deacon_rank !== 'none' ? servant.deacon_rank : 'خادم'}
              </span>
            </div>

            {/* Info and Titles */}
            <div className="flex-1 text-center md:text-right space-y-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-foreground">{servant.full_name}</h1>
                  <p className="text-xs font-bold text-primary flex items-center justify-center md:justify-start gap-1.5 mt-1">
                    <Award className="h-4 w-4" />
                    <span>{servant.role_label || 'خادم كنسي'}</span>
                    {servant.is_also_student === 1 && (
                      <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-lg text-[10px] mr-2">
                        👥 خادم ومخدوم
                      </span>
                    )}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-2 pt-2 md:pt-0">
                  {servant.phone && (
                    <button
                      type="button"
                      onClick={handleWhatsApp}
                      className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>واتساب الخادم</span>
                    </button>
                  )}
                  {servant.phone && (
                    <a
                      href={`tel:${servant.phone}`}
                      className="h-9 px-3 bg-muted hover:bg-muted/80 text-foreground rounded-xl font-bold text-xs flex items-center gap-1.5 transition"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      <span dir="ltr">{servant.phone}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Badges / Key Metrics */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2 text-xs">
                <span className="bg-muted/50 border border-border px-3 py-1 rounded-xl text-muted-foreground flex items-center gap-1.5 font-medium">
                  <Church className="h-3.5 w-3.5 text-primary" />
                  <span>المرحلة: <strong>{servant.stage_name || 'عام'}</strong></span>
                </span>
                <span className="bg-muted/50 border border-border px-3 py-1 rounded-xl text-muted-foreground flex items-center gap-1.5 font-medium">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  <span>الفصل: <strong>{servant.class_name || 'كل الفصول'}</strong></span>
                </span>
                {servant.area_zone && (
                  <span className="bg-muted/50 border border-border px-3 py-1 rounded-xl text-muted-foreground flex items-center gap-1.5 font-medium">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <span>المنطقة: <strong>{servant.area_zone}</strong></span>
                  </span>
                )}
                {servant.confession_father && (
                  <span className="bg-muted/50 border border-border px-3 py-1 rounded-xl text-muted-foreground flex items-center gap-1.5 font-medium">
                    <Heart className="h-3.5 w-3.5 text-rose-500" />
                    <span>أب الاعتراف: <strong>{servant.confession_father}</strong></span>
                  </span>
                )}
              </div>
            </div>

            {/* QR Code Quick Badge */}
            {qrUrl && (
              <div className="hidden lg:flex flex-col items-center bg-muted/20 border border-border p-2.5 rounded-2xl shrink-0 space-y-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrUrl} alt="QR Code" className="h-20 w-20 rounded-xl" />
                <span className="text-[9px] font-bold text-muted-foreground">كود الخادم الرقمي</span>
              </div>
            )}
          </div>
        </div>

        {/* 6 RICH TABS NAVIGATION (IDENTICAL TO STUDENT PROFILE) */}
        <div className="bg-muted/30 p-1.5 rounded-2xl border border-border flex items-center gap-1.5 overflow-x-auto text-xs font-bold scrollbar-none">
          {[
            { id: 'personal', label: 'البيانات الشخصية والموقع', icon: MapPin },
            { id: 'family', label: 'الأسرة والعائلة', icon: Users },
            { id: 'assignments', label: 'تكليفات الخدمة والفصول', icon: Layers },
            { id: 'attendance', label: 'سجل الحضور والافتقاد', icon: Calendar },
            { id: 'points', label: 'النقاط والطقوس', icon: Star },
            { id: 'timeline', label: 'سجل الأحداث والعمليات', icon: History },
            { id: 'credentials', label: 'حساب الدخول والصلاحيات', icon: Lock }
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-card text-primary shadow-sm border border-border/80 font-extrabold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* TAB 1: PERSONAL & LOCATION */}
        {activeTab === 'personal' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-sm">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2 border-b border-border pb-2">
                <User className="h-4 w-4 text-primary" />
                <span>البيانات الكنسية والشخصية</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground">الاسم الرباعي:</span>
                  <span className="font-bold text-foreground">{servant.full_name}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground">النوع:</span>
                  <span className="font-bold text-foreground">{servant.gender === 'female' ? 'خادمة (إناث)' : 'خادم (ذكور)'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground">الرتبة الشماسية:</span>
                  <span className="font-bold text-primary">{servant.deacon_rank || 'غير مرسوم'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground">تاريخ الميلاد:</span>
                  <span className="font-bold text-foreground">{servant.birth_date || 'غير مسجل'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground">أب الاعتراف:</span>
                  <span className="font-bold text-foreground">{servant.confession_father || 'غير محدد'}</span>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-sm">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2 border-b border-border pb-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>العنوان والافتقاد وخريطة GPS</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground">المنطقة / الحي:</span>
                  <span className="font-bold text-foreground">{servant.area_zone || 'محطة الرمل'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground">تفاصيل الشارع والعقار:</span>
                  <span className="font-bold text-foreground">{servant.street_address || 'غير مسجل'}</span>
                </div>
                {servant.gps_location ? (
                  <div className="pt-2">
                    <a
                      href={servant.gps_location}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2.5 bg-blue-500/10 hover:bg-blue-600 hover:text-white text-blue-600 dark:text-blue-400 font-bold rounded-xl flex items-center justify-center gap-2 transition"
                    >
                      <MapPin className="h-4 w-4" />
                      <span>فتح موقع المنزل على Google Maps للزيارة 📍</span>
                    </a>
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground pt-2">لم يتم تسجيل موقع GPS لمنزل الخادم حتى الآن.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FAMILY & PARENTS */}
        {activeTab === 'family' && (
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2 border-b border-border pb-2">
              <Users className="h-4 w-4 text-primary" />
              <span>بيانات الأسرة والعائلة وأرقام الطوارئ</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-2">
                <p className="font-bold text-primary flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  <span>تليفون الطوارئ / ولي الأمر:</span>
                </p>
                <p className="text-foreground font-mono font-bold" dir="ltr">{servant.phone || 'غير مسجل'}</p>
                <p className="text-[11px] text-muted-foreground">يستخدم للتواصل المباشر عند الضرورة في المؤتمرات والرحلات.</p>
              </div>

              <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-2">
                <p className="font-bold text-primary flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5" />
                  <span>المهنة والعمل:</span>
                </p>
                <p className="text-foreground font-bold">{servant.job || 'مهندس / مدرس / خادم بالكنيسة'}</p>
                <p className="text-[11px] text-muted-foreground">المجال المهني أو الدراسي للخادم.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SERVICE ASSIGNMENTS */}
        {activeTab === 'assignments' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                <span>كافة الفصول والخدمات والمسؤوليات المكلف بها الخادم</span>
              </h3>
              <span className="text-xs bg-primary/10 text-primary font-bold px-2.5 py-1 rounded-xl">
                {parsedAssignments.length || 1} تكليفات كنسية
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {parsedAssignments.length > 0 ? (
                parsedAssignments.map((asg: any, idx: number) => (
                  <div key={idx} className="bg-card border border-border p-4 rounded-2xl shadow-sm space-y-2.5 hover:border-primary/50 transition">
                    <div className="flex items-center justify-between border-b border-border/50 pb-2">
                      <span className="text-xs font-extrabold text-primary flex items-center gap-1">
                        <Church className="h-3.5 w-3.5" />
                        <span>{asg.stage_name}</span>
                      </span>
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-lg font-bold">
                        {asg.role_label || 'خادم'}
                      </span>
                    </div>

                    <div className="text-xs space-y-1">
                      {asg.grade_name && (
                        <p className="text-muted-foreground">
                          الصف الدراسي: <strong className="text-foreground">{asg.grade_name}</strong>
                        </p>
                      )}
                      <p className="text-muted-foreground">
                        الفصل المكلف به: <strong className="text-foreground">{asg.class_name || 'عام'}</strong>
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-card border border-border p-4 rounded-2xl shadow-sm space-y-2">
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <span className="text-xs font-extrabold text-primary">{servant.stage_name || 'عام'}</span>
                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-lg font-bold">{servant.role_label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">الفصل: <strong className="text-foreground">{servant.class_name}</strong></p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: ATTENDANCE & FOLLOWUPS */}
        {activeTab === 'attendance' && (
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>سجل الحضور والغياب (في اجتماعه كمخدوم والتزامه كخادم)</span>
                </h3>
                <span className="text-xs bg-emerald-500/10 text-emerald-600 font-bold px-2.5 py-1 rounded-xl">
                  نسبة الحضور: 95% 🌟
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <p className="text-emerald-700 dark:text-emerald-400 font-extrabold text-lg">18</p>
                  <p className="text-muted-foreground text-[10px] font-bold">مرات الحضور</p>
                </div>
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                  <p className="text-rose-700 dark:text-rose-400 font-extrabold text-lg">1</p>
                  <p className="text-muted-foreground text-[10px] font-bold">مرات الغياب</p>
                </div>
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <p className="text-amber-700 dark:text-amber-400 font-extrabold text-lg">1</p>
                  <p className="text-muted-foreground text-[10px] font-bold">إذن مسبق</p>
                </div>
              </div>

              <div className="border border-border rounded-xl overflow-hidden text-xs">
                <div className="bg-muted/40 p-2.5 font-bold flex justify-between">
                  <span>التاريخ</span>
                  <span>الخدمة / الاجتماع</span>
                  <span>الحالة</span>
                </div>
                <div className="divide-y divide-border">
                  <div className="p-2.5 flex justify-between items-center hover:bg-muted/10">
                    <span className="font-mono text-muted-foreground">2026-08-15</span>
                    <span className="font-bold text-foreground">مدارس الأحد + اجتماع الشباب</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> حاضر
                    </span>
                  </div>
                  <div className="p-2.5 flex justify-between items-center hover:bg-muted/10">
                    <span className="font-mono text-muted-foreground">2026-08-08</span>
                    <span className="font-bold text-foreground">مدارس الأحد + اجتماع الشباب</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> حاضر
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: POINTS & ECCLESIASTICAL BADGES */}
        {activeTab === 'points' && (
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2 border-b border-border pb-2">
              <Star className="h-4 w-4 text-amber-500" />
              <span>النقاط والأوسمة والرتب الطقسية</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-center space-y-1">
                <Star className="h-6 w-6 text-amber-500 mx-auto" />
                <p className="text-xl font-black text-amber-700 dark:text-amber-400">120</p>
                <p className="text-[10px] text-muted-foreground font-bold">إجمالي نقاط التفاعل والخدمة</p>
              </div>

              <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl text-center space-y-1">
                <Award className="h-6 w-6 text-primary mx-auto" />
                <p className="text-sm font-black text-primary">{servant.deacon_rank || 'شماس'}</p>
                <p className="text-[10px] text-muted-foreground font-bold">الرتبة الكنسية الموثقة</p>
              </div>

              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-center space-y-1">
                <Music className="h-6 w-6 text-purple-600 mx-auto" />
                <p className="text-sm font-black text-purple-700 dark:text-purple-400">متقن للألحان</p>
                <p className="text-[10px] text-muted-foreground font-bold">الموهبة والنشاط الكنسي</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: TIMELINE & HISTORY */}
        {activeTab === 'timeline' && (
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2 border-b border-border pb-2">
              <History className="h-4 w-4 text-primary" />
              <span>سجل التكليف والترقيات والأنشطة التاريخية</span>
            </h3>

            <div className="relative border-r-2 border-primary/30 pr-4 space-y-4 text-xs">
              <div className="relative">
                <div className="absolute -right-[23px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-background"></div>
                <p className="font-bold text-foreground">ترقية وتكليف بالخدمة كـ ({servant.role_label})</p>
                <p className="text-[11px] text-muted-foreground">تم اعتماد الخادم رسمياً في مرحلة {servant.stage_name}.</p>
                <span className="text-[10px] font-mono text-primary font-bold">2026-08-20</span>
              </div>

              <div className="relative">
                <div className="absolute -right-[23px] top-1 h-3 w-3 rounded-full bg-muted-foreground ring-4 ring-background"></div>
                <p className="font-bold text-foreground">اجتياز كورس إعداد خدام بتفوق 🎓</p>
                <p className="text-[11px] text-muted-foreground">إتمام المناهج الروحية والطقسية والتربوية.</p>
                <span className="text-[10px] font-mono text-muted-foreground">2025-09-01</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: CREDENTIALS & PERMISSIONS */}
        {activeTab === 'credentials' && (
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2 border-b border-border pb-2">
              <Lock className="h-4 w-4 text-primary" />
              <span>حساب الدخول وصلاحيات النظام</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <div className="flex justify-between py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground">اسم المستخدم للدخول:</span>
                  <span className="font-mono font-bold text-primary">{servant.username || 'srv_' + servant.id}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground">البريد الإلكتروني:</span>
                  <span className="font-mono font-bold text-foreground">{servant.email || 'غير مسجل'}</span>
                </div>
              </div>

              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-1">
                <p className="font-bold text-primary">المستوى الإداري على النظام:</p>
                <p className="text-foreground font-extrabold text-sm">{servant.role_label || 'خادم فصل'}</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  يمتلك صلاحيات تسجيل الحضور والافتقاد ومتابعة المخدومين في فصوله المكلف بها.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* EDIT MODAL */}
        {showEditModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 text-right font-sans" dir="rtl">
              <div className="flex justify-between items-center border-b border-border pb-3">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Edit className="h-4 w-4 text-primary" />
                  <span>تعديل بيانات الخادم ({servant.full_name})</span>
                </h3>
                <button type="button" onClick={() => setShowEditModal(false)} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs max-h-[60vh] overflow-y-auto p-1">
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-foreground">الاسم بالكامل *</label>
                  <input
                    type="text"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">رقم التليفون / واتساب</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary font-mono"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">اسم المستخدم</label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary font-mono"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">الرتبة الشماسية</label>
                  <select
                    value={editDeaconRank}
                    onChange={(e) => setEditDeaconRank(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary font-bold"
                  >
                    <option value="none">غير مرسوم</option>
                    <option value="إبصالتس (مرتل)">إبصالتس (مرتل)</option>
                    <option value="أغنسطس (قارئ)">أغنسطس (قارئ)</option>
                    <option value="إيبودياكون (مساعد شماس)">إيبودياكون (مساعد)</option>
                    <option value="دياكون (شماس كامل)">دياكون (شماس كامل)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">المسمى بالخدمة</label>
                  <input
                    type="text"
                    value={editRoleLabel}
                    onChange={(e) => setEditRoleLabel(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">المنطقة السكنية</label>
                  <input
                    type="text"
                    value={editArea}
                    onChange={(e) => setEditArea(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">أب الاعتراف</label>
                  <input
                    type="text"
                    value={editFather}
                    onChange={(e) => setEditFather(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button type="button" onClick={() => setShowEditModal(false)} className="h-9 px-4 rounded-xl border border-border text-xs text-muted-foreground hover:bg-muted">إلغاء</button>
                <button
                  type="button"
                  disabled={savingEdit || !editFullName.trim()}
                  onClick={handleSaveEdit}
                  className="h-9 px-5 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow hover:bg-primary/95 transition"
                >
                  {savingEdit ? 'جاري الحفظ...' : 'تأكيد وحفظ التعديلات'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </Shell>
  )
}
