'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shell } from '@/components/layout/Shell'
import { createStudent } from '@/lib/services/studentsService'
import { 
  Plus, Trash2, Camera, MapPin, LocateFixed, Check, ArrowRight, 
  Sparkles, User, Church, Phone, Home, Heart, Shield, Award, Users, Briefcase, Image as ImageIcon
} from 'lucide-react'
import Link from 'next/link'

export default function NewStudentPage() {
  const router = useRouter()

  // 1. Personal Info
  const [firstName, setFirstName] = useState('')
  const [secondName, setSecondName] = useState('')
  const [thirdName, setThirdName] = useState('')
  const [lastName, setLastName] = useState('')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [deaconRank, setDeaconRank] = useState('none')
  const [birthDate, setBirthDate] = useState('')
  const [school, setSchool] = useState('')
  const [studentPhone, setStudentPhone] = useState('')
  
  // Avatar / Profile Picture State
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
  const [houseNumber, setHouseNumber] = useState('')
  const [floor, setFloor] = useState('')
  const [landmark, setLandmark] = useState('')

  // Zones Management State
  const [showAddZoneModal, setShowAddZoneModal] = useState(false)
  const [newZoneInput, setNewZoneInput] = useState('')
  const [isAddingZone, setIsAddingZone] = useState(false)

  // 5. GPS Map
  const [googleMapsUrl, setGoogleMapsUrl] = useState('')
  const [isLocating, setIsLocating] = useState(false)
  const [gpsCaptured, setGpsCaptured] = useState(false)

  // 6. Church & Sacraments
  const [confessionFather, setConfessionFather] = useState('أبونا تادرس')
  const [priestsList, setPriestsList] = useState<{ id: string; name_ar: string; phone?: string; church_name?: string }[]>([])
  const [showAddPriestModal, setShowAddPriestModal] = useState(false)
  const [newPriestName, setNewPriestName] = useState('')
  const [newPriestPhone, setNewPriestPhone] = useState('')
  const [newPriestChurch, setNewPriestChurch] = useState('كنيسة الشهيد مارمينا')
  const [isSavingPriest, setIsSavingPriest] = useState(false)
  const [confessionLastDate, setConfessionLastDate] = useState('')
  const [talents, setTalents] = useState('')
  const [notes, setNotes] = useState('')
  const [healthNotes, setHealthNotes] = useState('')

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
            const names = stgData.map((s: any) => s.name_ar).filter(Boolean)
            setStagesList(names)
            if (!stageName && names.length > 0) setStageName(names[0])
          }
        }

        // Load Classes
        const clsUrl = isXampp ? '/stmina/api/classes.php' : '/api/classes.php'
        const clsRes = await fetch(clsUrl)
        if (clsRes.ok) {
          const clsData = await clsRes.json()
          if (Array.isArray(clsData)) {
            setClassesList(clsData)
            if (clsData.length > 0) {
              setClassName(clsData[0].name_ar)
              if (clsData[0].stage_name) setStageName(clsData[0].stage_name)
            }
          }
        }
      } catch (e) {
        console.error('Error loading stages/classes:', e)
      }
    }

    async function loadPriests() {
      try {
        const isXampp = typeof window !== 'undefined' && window.location.pathname.includes('/stmina')
        const prUrl = isXampp ? '/stmina/api/priests.php' : '/api/priests.php'
        const res = await fetch(prUrl)
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) {
            setPriestsList(data)
            if (!confessionFather || confessionFather === 'أبونا تادرس') {
              setConfessionFather(data[0].name_ar)
            }
          }
        }
      } catch (e) {}
    }

    loadDynamicStagesAndClasses()
    loadPriests()
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

  // Fetch zones on mount
  useEffect(() => {
    async function loadZones() {
      try {
        const isXampp = typeof window !== 'undefined' && window.location.pathname.includes('/stmina')
        const apiUrl = isXampp ? '/stmina/api/zones.php' : '/api/zones.php'
        const res = await fetch(apiUrl)
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) {
            const list = data.map((z: any) => z.name).filter(Boolean)
            setZones(list)
            if (list.length > 0 && !list.includes(area)) {
              setArea(list[0])
            }
          }
        }
      } catch (e) {
        console.error('Error loading zones:', e)
      }
    }
    loadZones()
  }, [])

  // Save new zone to MySQL
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
        if (!zones.includes(added)) {
          setZones(prev => [added, ...prev])
        }
        setArea(added)
        setNewZoneInput('')
        setShowAddZoneModal(false)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsAddingZone(false)
    }
  }

  // Delete current selected zone from MySQL
  const handleDeleteCurrentZone = async () => {
    if (!area) return
    const confirmDelete = window.confirm(`هل أنت متأكد من حذف منطقة "${area}" من قائمة المناطق السكنية؟`)
    if (!confirmDelete) return

    try {
      const isXampp = typeof window !== 'undefined' && window.location.pathname.includes('/stmina')
      const apiUrl = isXampp ? `/stmina/api/zones.php?name=${encodeURIComponent(area)}` : `/api/zones.php?name=${encodeURIComponent(area)}`
      await fetch(apiUrl, { method: 'DELETE' })
      
      const updated = zones.filter(z => z !== area)
      setZones(updated)
      if (updated.length > 0) {
        setArea(updated[0])
      }
    } catch (e) {
      console.error(e)
      alert('حدث خطأ أثناء حذف المنطقة')
    }
  }

  // Capture GPS
  const handleSaveNewPriest = async () => {
    if (!newPriestName.trim()) return
    setIsSavingPriest(true)
    try {
      const isXampp = typeof window !== 'undefined' && window.location.pathname.includes('/stmina')
      const prUrl = isXampp ? '/stmina/api/priests.php' : '/api/priests.php'
      const res = await fetch(prUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name_ar: newPriestName.trim(),
          phone: newPriestPhone.trim(),
          church_name: newPriestChurch.trim()
        })
      })
      if (res.ok) {
        alert('تمت إضافة الأب الكاهن بنجاح!')
        const added = newPriestName.trim()
        const prRes = await fetch(prUrl)
        if (prRes.ok) {
          const data = await prRes.json()
          if (Array.isArray(data)) setPriestsList(data)
        }
        setConfessionFather(added)
        setNewPriestName('')
        setNewPriestPhone('')
        setShowAddPriestModal(false)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsSavingPriest(false)
    }
  }

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
        alert('تعذر جلب موقع GPS. يرجى تفعيل إذن الموقع أو لصق رابط خرائط جوجل يدوياً.')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const fullName = [firstName, secondName, thirdName, lastName].filter(Boolean).join(' ').trim()
    if (!fullName) {
      alert('يرجى إدخال اسم المخدوم')
      return
    }

    setSubmitting(true)
    try {
      const fullAddr = [streetAddress, houseNumber ? `عقار ${houseNumber}` : '', floor ? `دور ${floor}` : '', landmark ? `علامة: ${landmark}` : ''].filter(Boolean).join(' - ')

      const payload = {
        full_name: fullName,
        gender: gender === 'female' ? 'بنات' : 'بنين',
        deacon_rank: deaconRank,
        birth_date: birthDate || '2016-01-01',
        school: school || 'مدرسة مارمينا',
        class_name: className,
        stage_name: stageName,
        phone_student: studentPhone,
        avatar_url: avatarPreview,
        phone_father: fatherPhone,
        father_job: fatherJob,
        mother_name: motherName || 'والدة المخدوم',
        phone_mother: motherPhone,
        mother_job: motherJob,
        area_zone: area,
        street_address: fullAddr || 'العنوان الرئيسي',
        gps_location: googleMapsUrl,
        confession_father_name: confessionFather,
        confession_last_date: confessionLastDate || null,
        talents: talents || 'ألحان, رسم',
        notes: notes,
        health_notes: healthNotes,
        total_points: 0
      }

      await createStudent(payload)
      alert('تم حفظ وتسجيل المخدوم بنجاح !')
      
      const isXampp = typeof window !== 'undefined' && window.location.pathname.includes('/stmina')
      window.location.href = isXampp ? '/stmina/students/' : '/students/'
    } catch (err) {
      console.error(err)
      alert('حدث خطأ أثناء الحفظ')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Shell>
      <div className="max-w-4xl mx-auto space-y-6 pb-20 font-sans text-right" dir="rtl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <User className="h-6 w-6 text-primary" />
              <span>تسجيل مخدوم جديد في الخدمة</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              إضافة مخدوم جديد إلى قاعدة بيانات مدارس الأحد والافتقاد الكنسي
            </p>
          </div>
          <Link
            href="/students"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <ArrowRight className="h-4 w-4" />
            <span>العودة لقائمة المخدومين</span>
          </Link>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 1. Personal Info + Photo Upload + Student Personal Phone */}
          <div className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-sm space-y-5">
            <h2 className="text-sm font-bold text-foreground border-b border-border pb-2 flex items-center gap-2">
              <Church className="h-4 w-4 text-primary" />
              <span>١. البيانات الشخصية والكنسية للمخدوم</span>
            </h2>

            {/* Profile Photo Upload Box */}
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
                <p className="font-bold text-xs text-foreground">الصورة الشخصية للمخدوم (اختياري)</p>
                <p className="text-[11px] text-muted-foreground">اضغط على أيقونة الكاميرا لالتقاط صورة بكاميرا الموبايل أو اختيار صورة من جهازك.</p>
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={() => setAvatarPreview(null)}
                    className="text-[11px] text-destructive hover:underline font-semibold"
                  >
                    إزالة الصورة
                  </button>
                )}
              </div>
            </div>

            {/* Names */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">الاسم الأول *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: كيرلس"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-foreground">اسم الوالد (الأب) *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: جرجس"
                  value={secondName}
                  onChange={(e) => setSecondName(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-foreground">اسم الجد</label>
                <input
                  type="text"
                  placeholder="مثال: حبيب"
                  value={thirdName}
                  onChange={(e) => setThirdName(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-foreground">اللقب / العائلة *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: عزيز"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary font-medium"
                />
              </div>
            </div>

            {/* Gender, Deacon, BirthDate, Personal Mobile Phone, School */}
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
                  required
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary font-medium"
                />
              </div>

              {/* Student Personal Mobile Phone inside Section 1 */}
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

            {/* Dynamic Stage & Class Selection from MySQL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">المرحلة الدراسية</label>
                <select
                  value={stageName}
                  onChange={(e) => {
                    const newStg = e.target.value
                    setStageName(newStg)
                    const matching = classesList.filter(c => (c.stage_name === newStg || c.stage_name_ar === newStg))
                    if (matching.length > 0) {
                      setClassName(matching[0].name_ar)
                    }
                  }}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary cursor-pointer font-bold"
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
                    if (found && found.stage_name) {
                      setStageName(found.stage_name)
                    }
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

            {/* Father Section */}
            <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-3">
              <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                <span>بيانات الوالد (الأب)</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">هاتف الأب (واتساب) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="01223344556"
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
                    placeholder="مثال: مهندس مدني، محاسب، تاجر..."
                    value={fatherJob}
                    onChange={(e) => setFatherJob(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Mother Section */}
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
                    placeholder="مثال: مريم فؤاد حنا"
                    value={motherName}
                    onChange={(e) => setMotherName(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">هاتف الأم</label>
                  <input
                    type="tel"
                    placeholder="01099887766"
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
                    placeholder="مثال: مدرسة، صيدلانية، ربة منزل..."
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
              <span>٣. العنوان بالتفصيل وإدارة المناطق السكنية</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              
              {/* Residential Zone Selection with Add and Delete buttons */}
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

                  {/* Add Zone Button */}
                  <button
                    type="button"
                    onClick={() => setShowAddZoneModal(true)}
                    className="h-10 px-3 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground font-bold rounded-xl transition cursor-pointer flex items-center gap-1 shrink-0"
                    title="إضافة منطقة سكنية جديدة"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">إضافة</span>
                  </button>

                  {/* Delete Zone Button */}
                  <button
                    type="button"
                    onClick={handleDeleteCurrentZone}
                    className="h-10 px-2.5 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-xl transition cursor-pointer flex items-center justify-center shrink-0"
                    title={`حذف منطقة "${area}" من القائمة`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Detailed Street Address */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="font-semibold text-foreground block">اسم الشارع والعنوان بالتفصيل *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: ١٥ شارع كلية الطب، الدور الثالث، شقة ٥"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3.5 py-2.5 outline-none focus:border-primary text-xs font-medium"
                />
              </div>
            </div>

            {/* GPS Capture Box */}
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
                  <span>{isLocating ? 'جاري تحديد الإحداثيات...' : 'التقاط موقعي الحالي بالـ GPS (من الموبايل)'}</span>
                </button>
              </div>

              {gpsCaptured && (
                <div className="text-xs text-success font-bold flex items-center gap-1 animate-in fade-in">
                  <Check className="h-4 w-4" />
                  <span>تم التقاط إحداثيات الموقع بنجاح!</span>
                </div>
              )}

              <input
                type="text"
                placeholder="رابط خرائط جوجل (Google Maps URL)..."
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
                <select
                  value={confessionFather}
                  onChange={(e) => setConfessionFather(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary cursor-pointer font-medium"
                >
                  <option value="أبونا تادرس">أبونا تادرس</option>
                  <option value="أبونا مرقس كمال">أبونا مرقس كمال</option>
                  <option value="أبونا بيشوي كامل">أبونا بيشوي كامل</option>
                  <option value="أبونا مينا جرجس">أبونا مينا جرجس</option>
                </select>
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
                <label className="font-semibold text-foreground">المواهب والمهارات (مفصولة بفواصل)</label>
                <input
                  type="text"
                  placeholder="مثال: ألحان، رسم، تمثيل، كورال"
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
                  placeholder="أي ملاحظات تفيد الخادم في الافتقاد والتشجيع..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-xl p-3 outline-none focus:border-primary text-xs font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">تنبيهات صحية / طبية (إن وجدت)</label>
                <textarea
                  rows={2}
                  placeholder="مثال: حساسية أطعمة معينة، نظارة طبية..."
                  value={healthNotes}
                  onChange={(e) => setHealthNotes(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-xl p-3 outline-none focus:border-primary text-xs font-medium"
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex justify-end gap-3 pt-3">
            <Link
              href="/students"
              className="h-11 px-6 border border-border hover:bg-muted font-bold text-xs rounded-xl flex items-center justify-center text-muted-foreground transition"
            >
              إلغاء وتراجع
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="h-11 px-8 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-lg hover:bg-primary/95 transition cursor-pointer flex items-center gap-2"
            >
              {submitting ? 'جاري الحفظ ...' : 'حفظ ونشر المخدوم 🚀'}
            </button>
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
                  className="text-muted-foreground hover:text-foreground text-xs"
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
