'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Shell } from '@/components/layout/Shell'
import { getStudentById, updateStudent } from '@/lib/services/studentsService'
import { 
  Plus, Trash2, Camera, MapPin, LocateFixed, Check, ArrowRight, 
  Sparkles, User, Church, Phone, Home, Heart, Shield, Award, Users, Briefcase, Save
} from 'lucide-react'
import Link from 'next/link'

export default function EditStudentPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground font-sans">جاري تحميل بيانات المخدوم للتعديل...</div>}>
      <EditStudentPageContent />
    </Suspense>
  )
}

function EditStudentPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Resolve ID
  let id = searchParams?.get('id') || ''
  if (!id && typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search)
    id = urlParams.get('id') || ''
  }

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Live Stages and Classes from MySQL
  const [stagesList, setStagesList] = useState<string[]>([])
  const [classesList, setClassesList] = useState<any[]>([])

  useEffect(() => {
    async function loadDynamicStagesAndClasses() {
      try {
        const isXampp = typeof window !== 'undefined' && window.location.pathname.includes('/stmina')
        
        // Load Stages
        const stgUrl = isXampp ? '/stmina/api/stages.php' : '/api/stages.php'
        const stgRes = await fetch(stgUrl)
        if (stgRes.ok) {
          const stgData = await stgRes.json()
          if (Array.isArray(stgData) && stgData.length > 0) {
            setStagesList(stgData.map((s: any) => s.name_ar).filter(Boolean))
          }
        }

        // Load Classes
        const clsUrl = isXampp ? '/stmina/api/classes.php' : '/api/classes.php'
        const clsRes = await fetch(clsUrl)
        if (clsRes.ok) {
          const clsData = await clsRes.json()
          if (Array.isArray(clsData)) setClassesList(clsData)
        }
      } catch (e) {}
    }
    loadDynamicStagesAndClasses()
  }, [])


  // 1. Personal Info
  const [fullName, setFullName] = useState('')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [deaconRank, setDeaconRank] = useState('none')
  const [birthDate, setBirthDate] = useState('')
  const [school, setSchool] = useState('')
  const [studentPhone, setStudentPhone] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  
  // 2. Class & Stage
  const [className, setClassName] = useState('فصل الأنبا بيشوي')
  const [stageName, setStageName] = useState('ابتدائي')

  // 3. Parents & Family Info
  const [fatherPhone, setFatherPhone] = useState('')
  const [fatherJob, setFatherJob] = useState('')
  const [motherName, setMotherName] = useState('')
  const [motherPhone, setMotherPhone] = useState('')
  const [motherJob, setMotherJob] = useState('')

  // 4. Address & Residential Zones
  const [zones, setZones] = useState<string[]>([
    'محطة الرمل', 'الشاطبي', 'كامب شيزار', 'الإبراهيمية', 
    'سبورتنج', 'كليوباترا', 'سيدي جابر', 'مصطفى كامل', 
    'رشدي', 'ستانلي', 'جليم', 'زيزينيا', 'جناكليس', 
    'سان ستيفانو', 'ثروت', 'لوران', 'السرايا', 'سيدي بشر', 
    'ميامي', 'العصافرة', 'المندرة', 'المعمورة', 'أبو قير', 
    'سموحة', 'فيكتوريا', 'العطارين', 'المنشية', 'كرموز', 'شبرا'
  ])
  const [area, setArea] = useState('محطة الرمل')
  const [streetAddress, setStreetAddress] = useState('')
  const [showAddZoneModal, setShowAddZoneModal] = useState(false)
  const [newZoneInput, setNewZoneInput] = useState('')
  const [isAddingZone, setIsAddingZone] = useState(false)

  // 5. GPS Map
  const [googleMapsUrl, setGoogleMapsUrl] = useState('')
  const [isLocating, setIsLocating] = useState(false)
  const [gpsCaptured, setGpsCaptured] = useState(false)

  // 6. Church & Sacraments
  const [confessionFather, setConfessionFather] = useState('أبونا تادرس')
  const [confessionLastDate, setConfessionLastDate] = useState('')
  const [talents, setTalents] = useState('')
  const [notes, setNotes] = useState('')
  const [healthNotes, setHealthNotes] = useState('')

  // Load existing student data
  useEffect(() => {
    async function loadStudent() {
      if (!id) {
        setLoading(false)
        return
      }
      try {
        const isXampp = typeof window !== 'undefined' && window.location.pathname.includes('/stmina')
        const apiUrl = isXampp ? `/stmina/api/students.php?id=${id}` : `/api/students.php?id=${id}`
        const res = await fetch(apiUrl)
        if (res.ok) {
          const s = await res.json()
          if (s) {
            setFullName(s.full_name || '')
            setGender(s.gender === 'بنات' || s.gender === 'female' ? 'female' : 'male')
            setDeaconRank(s.deacon_rank || 'none')
            setBirthDate(s.birth_date || '')
            setSchool(s.school || '')
            setStudentPhone(s.phone_student || '')
            setAvatarPreview(s.avatar_url || null)
            setClassName(s.class_name || 'فصل الأنبا بيشوي')
            setStageName(s.stage_name || 'ابتدائي')
            setFatherPhone(s.phone_father || '')
            setFatherJob(s.father_job || '')
            setMotherName(s.mother_name || '')
            setMotherPhone(s.phone_mother || '')
            setMotherJob(s.mother_job || '')
            setArea(s.area_zone || 'محطة الرمل')
            setStreetAddress(s.street_address || '')
            setGoogleMapsUrl(s.gps_location || '')
            setConfessionFather(s.confession_father_name || 'أبونا تادرس')
            setConfessionLastDate(s.confession_last_date || '')
            setTalents(s.talents || '')
            setNotes(s.notes || '')
            setHealthNotes(s.health_notes || '')
          }
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    loadStudent()
  }, [id])

  // Load zones
  useEffect(() => {
    async function loadZones() {
      try {
        const isXampp = typeof window !== 'undefined' && window.location.pathname.includes('/stmina')
        const apiUrl = isXampp ? '/stmina/api/zones.php' : '/api/zones.php'
        const res = await fetch(apiUrl)
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) {
            setZones(data.map((z: any) => z.name).filter(Boolean))
          }
        }
      } catch (e) {}
    }
    loadZones()
  }, [])

  // Handle Photo Selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Save new zone
  const handleSaveNewZone = async () => {
    if (!newZoneInput.trim()) return
    setIsAddingZone(true)
    try {
      const isXampp = typeof window !== 'undefined' && window.location.pathname.includes('/stmina')
      const apiUrl = isXampp ? '/stmina/api/zones.php' : '/api/zones.php'
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newZoneInput.trim() })
      })
      if (res.ok) {
        const added = newZoneInput.trim()
        if (!zones.includes(added)) setZones(prev => [added, ...prev])
        setArea(added)
        setNewZoneInput('')
        setShowAddZoneModal(false)
      }
    } catch (e) {}
    finally { setIsAddingZone(false) }
  }

  // GPS
  const handleCaptureGPS = () => {
    if (!navigator.geolocation) {
      alert('خاصية تحديد الموقع GPS غير مدعومة في متصفحك.')
      return
    }
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
        setGoogleMapsUrl(url)
        setIsLocating(false)
        setGpsCaptured(true)
        setTimeout(() => setGpsCaptured(false), 3500)
      },
      (err) => {
        setIsLocating(false)
        alert('تعذر جلب موقع GPS.')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) {
      alert('يرجى إدخال اسم المخدوم')
      return
    }

    setSubmitting(true)
    try {
      const isXampp = typeof window !== 'undefined' && window.location.pathname.includes('/stmina')
      const apiUrl = isXampp ? '/stmina/api/students.php' : '/api/students.php'
      
      const payload = {
        id: id,
        full_name: fullName.trim(),
        gender: gender === 'female' ? 'بنات' : 'بنين',
        deacon_rank: deaconRank,
        birth_date: birthDate,
        school: school,
        class_name: className,
        stage_name: stageName,
        phone_student: studentPhone,
        avatar_url: avatarPreview,
        phone_father: fatherPhone,
        father_job: fatherJob,
        mother_name: motherName,
        phone_mother: motherPhone,
        mother_job: motherJob,
        area_zone: area,
        street_address: streetAddress,
        gps_location: googleMapsUrl,
        confession_father_name: confessionFather,
        confession_last_date: confessionLastDate,
        talents: talents,
        notes: notes,
        health_notes: healthNotes,
        total_points: 0
      }

      const res = await fetch(apiUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        alert('تم تحديث وحفظ بيانات المخدوم  بنجاح! 💾')
        const profileUrl = isXampp ? `/stmina/students/profile/?id=${id}` : `/students/profile/?id=${id}`
        window.location.href = profileUrl
      } else {
        alert('حدث خطأ أثناء الحفظ ')
      }
    } catch (err) {
      console.error(err)
      alert('حدث خطأ في الاتصال بالسيرفر')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Shell>
        <div className="p-12 text-center text-xs text-muted-foreground font-sans">
          جاري تحميل بيانات المخدوم ...
        </div>
      </Shell>
    )
  }

  const isXampp = typeof window !== 'undefined' && window.location.pathname.includes('/stmina')
  const backProfileUrl = isXampp ? `/stmina/students/profile/?id=${id}` : `/students/profile/?id=${id}`

  return (
    <Shell>
      <div className="max-w-4xl mx-auto space-y-6 pb-20 font-sans text-right" dir="rtl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <User className="h-6 w-6 text-primary" />
              <span>تعديل بيانات المخدوم </span>
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              تعديل وحفظ بيانات: <strong className="text-primary font-bold">{fullName}</strong> 
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Link
              href={backProfileUrl}
              className="h-10 px-4 rounded-xl border border-border hover:bg-muted font-bold text-xs flex items-center gap-1.5 text-muted-foreground transition"
            >
              <ArrowRight className="h-4 w-4" />
              <span>العودة لملف المخدوم</span>
            </Link>
            <button
              type="button"
              onClick={handleUpdate}
              disabled={submitting}
              className="h-10 px-5 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-md hover:bg-primary/95 transition cursor-pointer flex items-center gap-1.5"
            >
              <Save className="h-4 w-4" />
              <span>{submitting ? 'جاري الحفظ...' : 'حفظ التعديلات 💾'}</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleUpdate} className="space-y-6">
          
          {/* 1. Personal Info + Avatar */}
          <div className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-sm space-y-5">
            <h2 className="text-sm font-bold text-foreground border-b border-border pb-2 flex items-center gap-2">
              <Church className="h-4 w-4 text-primary" />
              <span>١. البيانات الشخصية والكنسية للمخدوم</span>
            </h2>

            {/* Profile Photo Upload */}
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-primary/5 border border-primary/20 rounded-2xl">
              <div className="relative">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="معاينة الصورة"
                    className="h-20 w-20 rounded-2xl object-cover border-2 border-primary shadow"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-2xl bg-muted border-2 border-dashed border-primary/40 flex flex-col items-center justify-center text-primary">
                    <Camera className="h-8 w-8 text-primary" />
                  </div>
                )}
                <label className="absolute -bottom-2 -left-2 bg-primary text-primary-foreground p-1.5 rounded-full shadow-md hover:bg-primary/90 cursor-pointer transition">
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="text-right space-y-1">
                <p className="font-bold text-xs text-foreground">الصورة الشخصية للمخدوم</p>
                <p className="text-[11px] text-muted-foreground">اضغط على أيقونة الكاميرا لتغيير الصورة أو رفع صورة جديدة.</p>
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={() => setAvatarPreview(null)}
                    className="text-[11px] text-destructive hover:underline font-semibold cursor-pointer"
                  >
                    إزالة الصورة
                  </button>
                )}
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-1 text-xs">
              <label className="font-semibold text-foreground">الاسم بالكامل *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary font-bold text-sm"
              />
            </div>

            {/* Gender, Deacon, BirthDate, Personal Mobile, School */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs pt-1">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">النوع *</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary cursor-pointer font-medium"
                >
                  <option value="male">بنين (ذكر)</option>
                  <option value="female">بنات (أنثى)</option>
                </select>
              </div>

              {gender === 'male' ? (
                <div className="space-y-1">
                  <label className="font-semibold text-foreground flex items-center gap-1 text-primary">
                    <Award className="h-3.5 w-3.5" />
                    <span>الرتبة الشماسية:</span>
                  </label>
                  <select
                    value={deaconRank}
                    onChange={(e) => setDeaconRank(e.target.value)}
                    className="w-full bg-primary/5 border border-primary/30 text-primary font-bold rounded-xl px-3 py-2.5 outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="none">غير مرسوم شماس</option>
                    <option value="إبصالتس (مرتل)">إبصالتس (مرتل)</option>
                    <option value="أغنسطس (قارئ)">أغنسطس (قارئ)</option>
                    <option value="إيبودياكون (مساعد شماس)">إيبودياكون (مساعد)</option>
                    <option value="دياكون (شماس كامل)">دياكون (شماس كامل)</option>
                  </select>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">خدمة الفتيات</label>
                  <input
                    type="text"
                    disabled
                    value="فصل بنات"
                    className="w-full bg-muted/20 border border-border/50 text-muted-foreground rounded-xl px-3 py-2.5 text-xs"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="font-semibold text-foreground">تاريخ الميلاد *</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary font-medium"
                />
              </div>

              {/* Student Personal Phone */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground flex items-center gap-1 text-primary">
                  <Phone className="h-3.5 w-3.5" />
                  <span>تليفون المخدوم الشخصي (مباشر)</span>
                </label>
                <input
                  type="tel"
                  placeholder="01122334455"
                  value={studentPhone}
                  onChange={(e) => setStudentPhone(e.target.value)}
                  className="w-full bg-primary/5 border border-primary/20 rounded-xl px-3 py-2.5 outline-none focus:border-primary font-mono text-left font-bold"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-foreground">المدرسة / الكلية</label>
                <input
                  type="text"
                  placeholder="مثال: مدرسة مارمينا، كلية الهندسة..."
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary font-medium"
                />
              </div>
            </div>

            {/* Stage & Class */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">المرحلة الدراسية</label>
                <select
                  value={stageName}
                  onChange={(e) => {
                    const newStg = e.target.value
                    setStageName(newStg)
                    const matching = classesList.filter(c => (c.stage_name === newStg || c.stage_name_ar === newStg))
                    if (matching.length > 0) setClassName(matching[0].name_ar)
                  }}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary cursor-pointer font-medium"
                >
                  {stagesList.length > 0 ? (
                    stagesList.map((stg, idx) => (
                      <option key={idx} value={stg}>{stg}</option>
                    ))
                  ) : (
                    <>
                      <option value="حضانة">حضانة</option>
                      <option value="ابتدائي">ابتدائي</option>
                      <option value="إعدادي">إعدادي</option>
                      <option value="ثانوي">ثانوي</option>
                      <option value="جامعيين وخريجين">جامعيين وخريجين</option>
                      <option value="إعداد خدام">إعداد خدام</option>
                    </>
                  )}
                </select>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-foreground">الفصل المسكن عليه *</label>
                  <Link
                    href={typeof window !== 'undefined' && window.location.pathname.includes('/stmina') ? '/stmina/classes/new/' : '/classes/new/'}
                    className="text-[10px] text-primary hover:underline font-bold"
                  >
                    + إنشاء فصل جديد
                  </Link>
                </div>
                <select
                  value={className}
                  onChange={(e) => {
                    const selected = e.target.value
                    setClassName(selected)
                    const found = classesList.find(c => c.name_ar === selected)
                    if (found && found.stage_name) setStageName(found.stage_name)
                  }}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary cursor-pointer font-bold text-primary"
                >
                  {classesList.length === 0 ? (
                    <option value="">لا توجد فصول مسجلة  - أنشئ فصلاً جديداً</option>
                  ) : (
                    classesList.map((cls) => (
                      <option key={cls.id} value={cls.name_ar}>
                        {cls.name_ar} ({cls.stage_name || cls.stage_name_ar || 'عام'} - {cls.grade_name || cls.grade_name_ar || ''})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* 2. Parents & Family Details */}
          <div className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-foreground border-b border-border pb-2 flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>٢. بيانات الأسرة والوالدين (الأب والأم)</span>
            </h2>

            {/* Father */}
            <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-3">
              <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                <span>بيانات الوالد (الأب)</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">هاتف الأب (واتساب)</label>
                  <input
                    type="tel"
                    value={fatherPhone}
                    onChange={(e) => setFatherPhone(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary font-mono text-left font-bold"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">وظيفة / مهنة الأب</label>
                  <input
                    type="text"
                    value={fatherJob}
                    onChange={(e) => setFatherJob(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Mother */}
            <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-3">
              <span className="text-xs font-bold text-pink-600 dark:text-pink-400 flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5" />
                <span>بيانات الوالدة (الأم)</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">اسم الأم بالكامل</label>
                  <input
                    type="text"
                    value={motherName}
                    onChange={(e) => setMotherName(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">هاتف الأم</label>
                  <input
                    type="tel"
                    value={motherPhone}
                    onChange={(e) => setMotherPhone(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary font-mono text-left font-bold"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">وظيفة / مهنة الأم</label>
                  <input
                    type="text"
                    value={motherJob}
                    onChange={(e) => setMotherJob(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Address & Zones Management */}
          <div className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-foreground border-b border-border pb-2 flex items-center gap-2">
              <Home className="h-4 w-4 text-primary" />
              <span>٣. العنوان بالتفصيل والمنطقة السكنية</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground block">المنطقة السكنية *</label>
                <div className="flex items-center gap-1.5">
                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="flex-1 bg-muted/40 border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary cursor-pointer text-xs font-medium"
                  >
                    {zones.map((z, idx) => (
                      <option key={idx} value={z}>{z}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowAddZoneModal(true)}
                    className="h-10 px-3 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground font-bold rounded-xl transition cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                    <span>إضافة</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="font-semibold text-foreground block">اسم الشارع والعنوان بالتفصيل *</label>
                <input
                  type="text"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3.5 py-2.5 outline-none focus:border-primary text-xs font-medium"
                />
              </div>
            </div>

            {/* GPS */}
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl space-y-3 mt-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>تثبيت موقع المنزل على خرائط جوجل (GPS)</span>
                </div>
                <button
                  type="button"
                  onClick={handleCaptureGPS}
                  disabled={isLocating}
                  className="px-3.5 py-2 bg-primary text-primary-foreground font-bold rounded-xl text-xs flex items-center gap-1.5 hover:bg-primary/95 shadow-sm transition cursor-pointer"
                >
                  <LocateFixed className="h-3.5 w-3.5" />
                  <span>{isLocating ? 'جاري تحديد الإحداثيات...' : 'التقاط موقعي الحالي بالـ GPS'}</span>
                </button>
              </div>

              {gpsCaptured && (
                <div className="text-xs text-success font-bold flex items-center gap-1">
                  <Check className="h-4 w-4" />
                  <span>تم التقاط إحداثيات الموقع بنجاح!</span>
                </div>
              )}

              <input
                type="text"
                value={googleMapsUrl}
                onChange={(e) => setGoogleMapsUrl(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono text-left outline-none focus:border-primary"
                dir="ltr"
              />
            </div>
          </div>

          {/* 4. Confession & Pastoral Notes */}
          <div className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-foreground border-b border-border pb-2 flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              <span>٤. الرعوية وأب الاعتراف والمواهب</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">أب الاعتراف</label>
                <input
                  type="text"
                  value={confessionFather}
                  onChange={(e) => setConfessionFather(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">تاريخ آخر اعتراف</label>
                <input
                  type="date"
                  value={confessionLastDate}
                  onChange={(e) => setConfessionLastDate(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">المواهب والمهارات</label>
                <input
                  type="text"
                  value={talents}
                  onChange={(e) => setTalents(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">ملاحظات الخادم الرعوية</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-xl p-3 outline-none focus:border-primary text-xs font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">تنبيهات صحية / طبية</label>
                <textarea
                  rows={2}
                  value={healthNotes}
                  onChange={(e) => setHealthNotes(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-xl p-3 outline-none focus:border-primary text-xs font-medium"
                />
              </div>
            </div>
          </div>

          {/* Sticky Bottom Save Action Bar */}
          <div className="sticky bottom-4 z-40 bg-card/95 backdrop-blur-md border-2 border-primary/30 p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-3">
            <div className="text-xs font-bold text-muted-foreground hidden sm:block">
              تعديل بيانات: <strong className="text-foreground">{fullName}</strong>
            </div>
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <Link
                href={backProfileUrl}
                className="h-11 px-5 border border-border hover:bg-muted font-bold text-xs rounded-xl flex items-center justify-center text-muted-foreground transition"
              >
                إلغاء وتراجع
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="h-11 px-8 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-lg hover:bg-primary/95 transition cursor-pointer flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                <span>{submitting ? 'جاري الحفظ ...' : 'حفظ التعديلات 💾'}</span>
              </button>
            </div>
          </div>

        </form>

        {/* ADD NEW ZONE MODAL */}
        {showAddZoneModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 text-right font-sans" dir="rtl">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>إضافة منطقة سكنية جديدة</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddZoneModal(false)}
                  className="text-muted-foreground hover:text-foreground text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <label className="font-semibold text-foreground">اسم الحي أو المنطقة:</label>
                <input
                  type="text"
                  placeholder="مثال: العصافرة، المعمورة، الدقي..."
                  value={newZoneInput}
                  onChange={(e) => setNewZoneInput(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3.5 py-2.5 outline-none focus:border-primary text-xs"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddZoneModal(false)}
                  className="h-9 px-4 rounded-xl border border-border text-xs text-muted-foreground hover:bg-muted transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  disabled={isAddingZone || !newZoneInput.trim()}
                  onClick={handleSaveNewZone}
                  className="h-9 px-5 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow hover:bg-primary/95 transition cursor-pointer flex items-center gap-1.5"
                >
                  {isAddingZone ? 'جاري الحفظ...' : 'حفظ '}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </Shell>
  )
}
