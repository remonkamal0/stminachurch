'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shell } from '@/components/layout/Shell'
import { 
  Plus, Trash2, Camera, MapPin, LocateFixed, Check, ArrowRight, 
  Sparkles, User, Church, Phone, Home, Heart, Shield, Award, Users, Briefcase, Image as ImageIcon,
  Key, Lock, Save, CheckSquare, Layers, Music, Flag, BookOpen, Star
} from 'lucide-react'
import Link from 'next/link'

interface ServiceAssignment {
  id: string
  stage_name: string
  grade_name?: string
  class_name: string
  role_label: string
}

export default function NewServantPage() {
  const router = useRouter()

  // 1. Personal Info
  const [firstName, setFirstName] = useState('')
  const [secondName, setSecondName] = useState('')
  const [thirdName, setThirdName] = useState('')
  const [lastName, setLastName] = useState('')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [deaconRank, setDeaconRank] = useState('none')
  const [birthDate, setBirthDate] = useState('')
  const [jobOrCollege, setJobOrCollege] = useState('')
  const [servantPhone, setServantPhone] = useState('')
  
  // Avatar / Profile Picture State
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  
  // 2. MULTIPLE SERVICE ASSIGNMENTS (4 Cascaded Columns: Stage -> Grade -> Class -> Role)
  const [assignments, setAssignments] = useState<ServiceAssignment[]>([
    { id: 'asg_1', stage_name: 'ابتدائي', grade_name: 'الصف الأول الابتدائي', class_name: '', role_label: 'خادم فصل' }
  ])

  // 3. Dual Role: Servant is also a student in another meeting
  const [isAlsoStudent, setIsAlsoStudent] = useState(false)
  const [studentStage, setStudentStage] = useState('جامعيين وخريجين')
  const [studentClass, setStudentClass] = useState('')

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

  // Custom Service / Stage Modal in Servants Page
  const [showAddServiceModal, setShowAddServiceModal] = useState(false)
  const [newServiceName, setNewServiceName] = useState('')
  const [isSavingService, setIsSavingService] = useState(false)
  const [activeAssignmentIdForModal, setActiveAssignmentIdForModal] = useState<string | null>(null)

  const [confessionLastDate, setConfessionLastDate] = useState('')
  const [talents, setTalents] = useState('')
  const [notes, setNotes] = useState('')

  // 7. Credentials & Permissions
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [systemRole, setSystemRole] = useState<'priest' | 'service_admin' | 'sector_leader' | 'stage_leader' | 'class_leader' | 'servant' | 'treasurer'>('servant')

  const [submitting, setSubmitting] = useState(false)

  // Live Stages, Grades, and Classes from MySQL
  const [stagesList, setStagesList] = useState<string[]>([])
  const [gradesList, setGradesList] = useState<{ id: string; stage_name: string; name_ar: string }[]>([])
  const [classesList, setClassesList] = useState<any[]>([])

  const getApiUrl = (endpoint: string) => {
    const isXampp = typeof window !== 'undefined' && window.location.pathname.includes('/stmina')
    return isXampp ? `/stmina/api/${endpoint}` : `/api/${endpoint}`
  }

  useEffect(() => {
    async function loadData() {
      try {
        const [stgRes, grdRes, clsRes, znRes, prRes] = await Promise.all([
          fetch(getApiUrl('stages.php')).catch(() => null),
          fetch(getApiUrl('grades.php')).catch(() => null),
          fetch(getApiUrl('classes.php')).catch(() => null),
          fetch(getApiUrl('zones.php')).catch(() => null),
          fetch(getApiUrl('priests.php')).catch(() => null)
        ])

        if (stgRes && stgRes.ok) {
          const stgData = await stgRes.json()
          if (Array.isArray(stgData) && stgData.length > 0) {
            const names = stgData.map((s: any) => s.name_ar).filter(Boolean)
            setStagesList(names)
            if (names.length > 0) {
              setStudentStage(names.includes('جامعيين وخريجين') ? 'جامعيين وخريجين' : names[0])
              setAssignments(prev => prev.map((a, i) => i === 0 ? { ...a, stage_name: names[0] } : a))
            }
          }
        }

        if (grdRes && grdRes.ok) {
          const grdData = await grdRes.json()
          if (Array.isArray(grdData)) setGradesList(grdData)
        }

        if (clsRes && clsRes.ok) {
          const clsData = await clsRes.json()
          if (Array.isArray(clsData)) {
            setClassesList(clsData)
            if (clsData.length > 0) {
              setStudentClass(clsData[0].name_ar)
              setAssignments(prev => prev.map((a, i) => i === 0 ? { ...a, class_name: clsData[0].name_ar } : a))
            }
          }
        }

        if (prRes && prRes.ok) {
          const prData = await prRes.json()
          if (Array.isArray(prData) && prData.length > 0) {
            setPriestsList(prData)
            if (!confessionFather || confessionFather === 'أبونا تادرس') {
              setConfessionFather(prData[0].name_ar)
            }
          }
        }

        if (znRes && znRes.ok) {
          const znData = await znRes.json()
          if (Array.isArray(znData) && znData.length > 0) {
            const list = znData.map((z: any) => z.name).filter(Boolean)
            setZones(list)
            if (list.length > 0) setArea(list[0])
          }
        }
      } catch (e) {
        console.error(e)
      }
    }
    loadData()
  }, [])

  // Add another service assignment
  const handleAddAssignment = () => {
    const defaultStage = stagesList[0] || 'ابتدائي'
    const matchingGrade = gradesList.find(g => g.stage_name === defaultStage)?.name_ar || ''
    const matchingClass = classesList.find(c => c.stage_name === defaultStage)?.name_ar || ''
    setAssignments(prev => [
      ...prev,
      {
        id: `asg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        stage_name: defaultStage,
        grade_name: matchingGrade,
        class_name: matchingClass,
        role_label: 'خادم فصل'
      }
    ])
  }

  // Quick preset activity adder
  const handleAddQuickActivity = (actName: string, roleTitle: string) => {
    setAssignments(prev => [
      ...prev,
      {
        id: `asg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        stage_name: 'أنشطة ولجان عامة',
        grade_name: 'عام لكل الصفوف',
        class_name: actName,
        role_label: roleTitle
      }
    ])
  }

  const handleUpdateAssignment = (id: string, field: keyof ServiceAssignment, value: string) => {
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a))
  }

  const handleRemoveAssignment = (id: string) => {
    if (assignments.length <= 1) {
      alert('يجب الإبقاء على تكليف خدمة واحد على الأقل للخادم')
      return
    }
    setAssignments(prev => prev.filter(a => a.id !== id))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setAvatarPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSaveNewService = async () => {
    if (!newServiceName.trim()) return
    setIsSavingService(true)
    try {
      const res = await fetch(getApiUrl('stages.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name_ar: newServiceName.trim() })
      })
      if (res.ok) {
        alert('تمت إضافة الخدمة / المرحلة الجديدة بنجاح!')
        const added = newServiceName.trim()
        const stgRes = await fetch(getApiUrl('stages.php'))
        if (stgRes.ok) {
          const data = await stgRes.json()
          if (Array.isArray(data)) {
            const names = data.map((s: any) => s.name_ar).filter(Boolean)
            setStagesList(names)
          }
        }
        if (activeAssignmentIdForModal) {
          handleUpdateAssignment(activeAssignmentIdForModal, 'stage_name', added)
        }
        setNewServiceName('')
        setShowAddServiceModal(false)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsSavingService(false)
    }
  }

  const handleSaveNewPriest = async () => {
    if (!newPriestName.trim()) return
    setIsSavingPriest(true)
    try {
      const res = await fetch(getApiUrl('priests.php'), {
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
        const prRes = await fetch(getApiUrl('priests.php'))
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

  const handleSaveNewZone = async () => {
    if (!newZoneInput.trim()) return
    setIsAddingZone(true)
    try {
      await fetch(getApiUrl('zones.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newZoneInput.trim() })
      })
      const updated = [...zones, newZoneInput.trim()]
      setZones(updated)
      setArea(newZoneInput.trim())
      setNewZoneInput('')
      setShowAddZoneModal(false)
    } catch (e) {
    } finally {
      setIsAddingZone(false)
    }
  }

  const handleDeleteCurrentZone = async () => {
    if (!area) return
    if (!confirm(`هل أنت متأكد من حذف منطقة "${area}"؟`)) return
    try {
      await fetch(`${getApiUrl('zones.php')}?name=${encodeURIComponent(area)}`, { method: 'DELETE' })
      const updated = zones.filter(z => z !== area)
      setZones(updated)
      if (updated.length > 0) setArea(updated[0])
    } catch (e) {}
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
        setGoogleMapsUrl(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`)
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

  const handleFirstNameChange = (val: string) => {
    setFirstName(val)
    if (!username && val) {
      const uname = `srv.${val.toLowerCase()}.${Math.floor(100 + Math.random() * 900)}`
      setUsername(uname)
      if (!email) setEmail(`${uname}@church.org`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const fullName = [firstName, secondName, thirdName, lastName].filter(Boolean).join(' ').trim()
    if (!fullName) {
      alert('يرجى إدخال اسم الخادم بالكامل')
      return
    }

    setSubmitting(true)
    try {
      const fullAddr = [streetAddress, houseNumber ? `عقار ${houseNumber}` : '', floor ? `دور ${floor}` : '', landmark ? `علامة: ${landmark}` : ''].filter(Boolean).join(' - ')

      const payload = {
        full_name: fullName,
        username: username.trim() || `srv_${Date.now()}`,
        email: email.trim() || `${username || Date.now()}@church.org`,
        password: password.trim() || '123456',
        phone: servantPhone.trim(),
        gender: gender,
        deacon_rank: deaconRank,
        birth_date: birthDate || null,
        confession_father: confessionFather.trim() || null,
        role: systemRole,
        role_label: assignments[0]?.role_label || 'خادم',
        stage_name: assignments[0]?.stage_name || 'عام',
        class_name: assignments[0]?.class_name || 'عام',
        service_assignments: assignments,
        is_also_student: isAlsoStudent ? 1 : 0,
        student_stage_name: isAlsoStudent ? studentStage : null,
        student_class_name: isAlsoStudent ? studentClass : null,
        street_address: fullAddr || null,
        area_zone: area || null,
        gps_location: googleMapsUrl || null,
        notes: notes || null
      }

      const res = await fetch(getApiUrl('servants.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        alert('تم تسجيل الخادم وتعيين خدماته المتعددة وصلاحياته بنجاح! 🛡️✨')
        const isXampp = typeof window !== 'undefined' && window.location.pathname.includes('/stmina')
        window.location.href = isXampp ? '/stmina/servants/' : '/servants/'
      } else {
        alert('حدث خطأ أثناء الحفظ')
      }
    } catch (err) {
      console.error(err)
      alert('حدث خطأ في الاتصال بقاعدة البيانات')
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
              <Shield className="h-6 w-6 text-primary" />
              <span>تسجيل وإضافة خادم جديد بالخدمة</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              إدخال الاسم الرباعي، وتعيين أكثر من خدمة ومرحلة من فصول الداتابيز، وازدواجية الدور، وحساب الدخول
            </p>
          </div>
          <Link
            href={typeof window !== 'undefined' && window.location.pathname.includes('/stmina') ? '/stmina/servants/' : '/servants/'}
            className="h-9 px-4 rounded-xl border border-border hover:bg-muted font-bold text-xs flex items-center gap-1.5 text-muted-foreground transition"
          >
            <ArrowRight className="h-4 w-4" />
            <span>العودة لقائمة الخدام</span>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* 1. Personal & Church Info (Exact 4-Name Inputs like Students) */}
          <div className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-foreground border-b border-border pb-2 flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <span>١. البيانات الشخصية والكنسية للخادم</span>
            </h2>

            {/* Avatar Upload */}
            <div className="flex items-center gap-4 py-2">
              <div className="relative group h-16 w-16 rounded-full overflow-hidden border-2 border-primary/30 bg-muted/40 flex items-center justify-center shrink-0 shadow-sm">
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarPreview} alt="صورة الخادم" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-8 w-8 text-muted-foreground" />
                )}
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-white">
                  <Camera className="h-4 w-4" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              </div>
              <div className="space-y-0.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1">
                  <ImageIcon className="h-3.5 w-3.5 text-primary" />
                  <span>صورة الخادم الشخصية</span>
                </label>
                <p className="text-[11px] text-muted-foreground">اضغط لاختيار صورة رسمية للخادم لطباعة كارنيه الخادم واستخدامها في التطبيق.</p>
              </div>
            </div>

            {/* 4-Name Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">الاسم الأول *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: بيشوي"
                  value={firstName}
                  onChange={(e) => handleFirstNameChange(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">اسم الأب *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: كمال"
                  value={secondName}
                  onChange={(e) => setSecondName(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">اسم الجد</label>
                <input
                  type="text"
                  placeholder="مثال: مرقس"
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
                  placeholder="مثال: إبراهيم"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary font-medium"
                />
              </div>
            </div>

            {/* Gender, Deacon, BirthDate, Phone, Job/College */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs pt-1">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">النوع *</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary cursor-pointer font-medium"
                >
                  <option value="male">خادم (بنين)</option>
                  <option value="female">خادمة (بنات)</option>
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
                  <label className="font-semibold text-muted-foreground">خدمة الشابات والخادمات</label>
                  <input type="text" disabled value="خادمة بمدارس الأحد" className="w-full bg-muted/20 border border-border/50 text-muted-foreground rounded-xl px-3 py-2.5 text-xs" />
                </div>
              )}

              <div className="space-y-1">
                <label className="font-semibold text-foreground">تاريخ الميلاد</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary font-medium"
                />
              </div>

              {/* Servant Phone */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground flex items-center gap-1 text-primary">
                  <Phone className="h-3.5 w-3.5" />
                  <span>تليفون / واتساب الخادم *</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="01234567890"
                  value={servantPhone}
                  onChange={(e) => setServantPhone(e.target.value)}
                  className="w-full bg-primary/5 border border-primary/20 rounded-xl px-3 py-2.5 outline-none focus:border-primary font-mono text-left font-bold"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-foreground">المهنة / الكلية</label>
                <input
                  type="text"
                  placeholder="مثال: مهندس برمجيات، كلية الطب، مدرس..."
                  value={jobOrCollege}
                  onChange={(e) => setJobOrCollege(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary font-medium"
                />
              </div>
            </div>
          </div>

          {/* 2. MULTIPLE SERVICE ASSIGNMENTS (4 CASCADED COLUMNS) */}
          <div className="bg-card border-2 border-primary/20 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3 flex-wrap gap-2">
              <div>
                <h2 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  <span>٢. أماكن وتكليفات الخدمة بمدارس الأحد (مرحلة ← صف ← فصل ← مسؤولية)</span>
                </h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  اختر المرحلة ليتم تحديث الصفوف وفصول الداتابيز التابعة لها تلقائياً.
                </p>
              </div>

              {/* Add Assignment Button */}
              <button
                type="button"
                onClick={handleAddAssignment}
                className="h-8 px-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-1.5 shadow hover:bg-primary/95 transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ إضافة خدمة / فصل آخر</span>
              </button>
            </div>

            {/* Quick Activity Badges */}
            <div className="space-y-1.5 text-xs bg-muted/20 p-3 rounded-xl border border-border">
              <span className="text-[11px] font-bold text-muted-foreground block">
                ⚡ إضافة سريعة لخدمات وأنشطة الكنيسة العامة:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { name: 'خدمة الكورال والترانيم', role: 'خادم كورال', icon: '🎵' },
                  { name: 'خدمة الكشافة والمرشدات', role: 'قائد كشفي', icon: '⚜️' },
                  { name: 'خدمة تعليم الألحان والطقس', role: 'معلم ألحان', icon: '⛪' },
                  { name: 'خدمة المسرح والدراما', role: 'خادم مسرح وفنون', icon: '🎭' },
                  { name: 'لجنة النظام والاستقبال', role: 'مسؤول نظام', icon: '🛡️' },
                  { name: 'الأنشطة الرياضية والنادي', role: 'مسؤول أنشطة رياضية', icon: '⚽' },
                  { name: 'خدمة وسائل الإيضاح والميديا', role: 'مسؤول ميديا وإعلام', icon: '💻' }
                ].map((act) => (
                  <button
                    key={act.name}
                    type="button"
                    onClick={() => handleAddQuickActivity(act.name, act.role)}
                    className="px-2.5 py-1 rounded-xl bg-card border border-border text-foreground text-[11px] font-bold hover:bg-primary hover:text-primary-foreground hover:border-primary transition cursor-pointer shadow-sm flex items-center gap-1"
                  >
                    <span>{act.icon}</span>
                    <span>+ {act.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Assignments List */}
            <div className="space-y-3 pt-1">
              {assignments.map((asg, index) => {
                const stageClasses = classesList.filter(c => c.stage_name === asg.stage_name || c.stage_name_ar === asg.stage_name)
                const isGeneralActivity = asg.stage_name === 'أنشطة ولجان عامة' || asg.stage_name === 'خدمة عامة بالكنيسة'

                return (
                  <div
                    key={asg.id}
                    className="bg-card border border-border p-4 md:p-5 rounded-2xl space-y-3.5 relative group transition shadow-sm hover:border-primary/50"
                  >
                    <div className="flex items-center justify-between border-b border-border/70 pb-2.5">
                      <span className="font-extrabold text-xs text-primary flex items-center gap-1.5">
                        <span className="h-5 w-5 rounded-full bg-primary/15 text-primary text-[10px] flex items-center justify-center font-bold">
                          {index + 1}
                        </span>
                        <span>بيانات التكليف الكنسي ({index + 1}):</span>
                      </span>

                      {assignments.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAssignment(asg.id)}
                          className="h-7 px-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-600 hover:text-white text-rose-600 font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                          title="حذف هذا التكليف"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>حذف هذا التكليف</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      
                      {/* 1. Stage Dropdown (From MySQL stages table) */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="font-bold text-foreground flex items-center gap-1">
                            <Church className="h-3.5 w-3.5 text-primary" />
                            <span>المرحلة *</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveAssignmentIdForModal(asg.id)
                              setShowAddServiceModal(true)
                            }}
                            className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                            <span>+ مرحلة</span>
                          </button>
                        </div>
                        <select
                          value={asg.stage_name}
                          onChange={(e) => {
                            const newStg = e.target.value
                            const matchingGrades = gradesList.filter(g => g.stage_name === newStg)
                            const matchingClasses = classesList.filter(c => c.stage_name === newStg || c.stage_name_ar === newStg)
                            handleUpdateAssignment(asg.id, 'stage_name', newStg)
                            if (matchingGrades.length > 0) {
                              handleUpdateAssignment(asg.id, 'grade_name', matchingGrades[0].name_ar)
                            } else {
                              handleUpdateAssignment(asg.id, 'grade_name', '')
                            }
                            if (matchingClasses.length > 0) {
                              handleUpdateAssignment(asg.id, 'class_name', matchingClasses[0].name_ar)
                            } else {
                              handleUpdateAssignment(asg.id, 'class_name', '')
                            }
                          }}
                          className="w-full bg-muted/30 border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary cursor-pointer font-bold text-foreground shadow-sm"
                        >
                          {stagesList.map((stg, idx) => (
                            <option key={idx} value={stg}>{stg}</option>
                          ))}
                          <option disabled>──────────</option>
                          <option value="أنشطة ولجان عامة">أنشطة ولجان عامة</option>
                          <option value="خدمة عامة بالكنيسة">خدمة عامة بالكنيسة</option>
                        </select>
                      </div>

                      {/* 2. Grade / Year Dropdown (Strictly from MySQL grades table) */}
                      <div className="space-y-1">
                        <label className="font-bold text-foreground flex items-center gap-1">
                          <BookOpen className="h-3.5 w-3.5 text-primary" />
                          <span>الصف / السنة الدراسية:</span>
                        </label>
                        {(() => {
                          const stageGrades = gradesList.filter(g => g.stage_name === asg.stage_name)
                          return stageGrades.length > 0 ? (
                            <select
                              value={asg.grade_name || stageGrades[0]?.name_ar}
                              onChange={(e) => handleUpdateAssignment(asg.id, 'grade_name', e.target.value)}
                              className="w-full bg-muted/30 border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary cursor-pointer font-bold text-foreground shadow-sm"
                            >
                              {stageGrades.map((grd) => (
                                <option key={grd.id} value={grd.name_ar}>{grd.name_ar}</option>
                              ))}
                              <option value="عام لكل الصفوف">عام لكل الصفوف</option>
                            </select>
                          ) : (
                            <input
                              type="text"
                              placeholder="عام / كل الصفوف"
                              value={asg.grade_name || ''}
                              onChange={(e) => handleUpdateAssignment(asg.id, 'grade_name', e.target.value)}
                              className="w-full bg-muted/30 border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-xs"
                            />
                          )
                        })()}
                      </div>

                      {/* 3. Class Dropdown (From MySQL classes table) */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="font-bold text-foreground flex items-center gap-1">
                            <Users className="h-3.5 w-3.5 text-primary" />
                            <span>الفصل المكلف به *</span>
                          </label>
                          <Link
                            href={typeof window !== 'undefined' && window.location.pathname.includes('/stmina') ? '/stmina/classes/new/' : '/classes/new/'}
                            target="_blank"
                            className="text-[10px] text-primary hover:underline font-bold"
                          >
                            + إنشاء فصل
                          </Link>
                        </div>

                        {isGeneralActivity ? (
                          <input
                            type="text"
                            placeholder="اكتب اسم النشاط (مثال: كورال، كشافة...)"
                            value={asg.class_name}
                            onChange={(e) => handleUpdateAssignment(asg.id, 'class_name', e.target.value)}
                            className="w-full bg-muted/30 border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary font-bold text-primary shadow-sm"
                          />
                        ) : stageClasses.length > 0 ? (
                          <select
                            value={asg.class_name}
                            onChange={(e) => handleUpdateAssignment(asg.id, 'class_name', e.target.value)}
                            className="w-full bg-muted/30 border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary cursor-pointer font-bold text-primary shadow-sm"
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
                            placeholder="اكتب اسم الفصل (مثال: فصل مارمينا)"
                            value={asg.class_name}
                            onChange={(e) => handleUpdateAssignment(asg.id, 'class_name', e.target.value)}
                            className="w-full bg-muted/30 border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary font-bold text-primary shadow-sm"
                          />
                        )}
                      </div>

                      {/* 4. Role / Responsibility */}
                      <div className="space-y-1">
                        <label className="font-bold text-foreground flex items-center gap-1">
                          <Award className="h-3.5 w-3.5 text-primary" />
                          <span>المسمى والمسؤولية:</span>
                        </label>
                        <select
                          value={asg.role_label}
                          onChange={(e) => handleUpdateAssignment(asg.id, 'role_label', e.target.value)}
                          className="w-full bg-muted/30 border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary cursor-pointer font-bold shadow-sm"
                        >
                          <option value="أمين مرحلة">🎖️ أمين مرحلة</option>
                          <option value="أمين فصل">⭐ أمين فصل</option>
                          <option value="خادم فصل">🛡️ خادم فصل</option>
                          <option value="مساعد خادم">مساعد خادم</option>
                          <option value="معلم ألحان وطقس">معلم ألحان وطقس</option>
                          <option value="خادم كورال وترانيم">خادم كورال وترانيم</option>
                          <option value="قائد كشفي">قائد كشفي</option>
                          <option value="مسؤول نظام واستقبال">مسؤول نظام واستقبال</option>
                          <option value="خادم افتقاد ومتابعة">خادم افتقاد ومتابعة</option>
                        </select>
                      </div>

                    </div>

                    {/* Quick Helper Notice if stage is empty */}
                    {!isGeneralActivity && stageClasses.length === 0 && (
                      <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-700 dark:text-amber-400 flex items-center justify-between gap-2">
                        <span>💡 لم تقم بإنشاء فصول في مرحلة (<strong>{asg.stage_name}</strong>) في الداتابيز بعد.</span>
                        <Link
                          href={typeof window !== 'undefined' && window.location.pathname.includes('/stmina') ? '/stmina/classes/new/' : '/classes/new/'}
                          target="_blank"
                          className="font-bold underline text-amber-800 dark:text-amber-300 shrink-0"
                        >
                          إنشاء فصل الآن ↗
                        </Link>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* 3. DUAL ROLE: SERVANT IS ALSO A STUDENT */}
          <div className="bg-primary/5 border-2 border-primary/30 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <label className="font-extrabold text-sm text-primary flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAlsoStudent}
                    onChange={(e) => setIsAlsoStudent(e.target.checked)}
                    className="h-5 w-5 rounded-lg border-primary text-primary focus:ring-primary cursor-pointer"
                  />
                  <span>👥 هذا الخادم مخدوم أيضاً في اجتماع آخر (ازدواجية الدور)</span>
                </label>
                <p className="text-xs text-muted-foreground pr-7 leading-relaxed">
                  فعل هذا الخيار إذا كان الخادم يخدم في مرحلة (مثال: ابتدائي) وهو نفسه مخدوم يحضر في اجتماع آخر (مثل: اجتماع الشباب / خريجين / إعداد خدام).
                </p>
              </div>
            </div>

            {isAlsoStudent && (
              <div className="pt-3 border-t border-primary/20 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs animate-in fade-in">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">المرحلة التي هو مخدوم فيها:</label>
                  <select
                    value={studentStage}
                    onChange={(e) => setStudentStage(e.target.value)}
                    className="w-full bg-card border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary cursor-pointer font-bold"
                  >
                    {stagesList.length > 0 ? (
                      stagesList.map((stg, idx) => (
                        <option key={idx} value={stg}>{stg}</option>
                      ))
                    ) : (
                      <>
                        <option value="جامعيين وخريجين">جامعيين وخريجين</option>
                        <option value="إعداد خدام">إعداد خدام</option>
                        <option value="ثانوي">ثانوي</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">الفصل أو الاجتماع الذي هو مخدوم فيه:</label>
                  <input
                    type="text"
                    placeholder="مثال: اجتماع الشباب، فرقة أولى إعداد خدام..."
                    value={studentClass}
                    onChange={(e) => setStudentClass(e.target.value)}
                    className="w-full bg-card border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary font-bold"
                  />
                </div>

                <div className="sm:col-span-2 p-3 bg-card/80 border border-border rounded-xl text-[11px] text-muted-foreground flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-primary shrink-0" />
                  <span>سيتم إدراج الخادم تلقائياً في كشف الحضور والافتقاد كمخدوم في الاجتماع المذكور أعلاه.</span>
                </div>
              </div>
            )}
          </div>

          {/* 4. Address, Residential Zone & GPS */}
          <div className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Home className="h-4 w-4 text-primary" />
                <span>٤. العنوان والسكن وتحديد الموقع الجغرافي</span>
              </h2>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddZoneModal(true)}
                  className="text-[11px] bg-primary/10 text-primary hover:bg-primary/20 px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  <span>إضافة منطقة جديدة</span>
                </button>
                {zones.length > 1 && (
                  <button
                    type="button"
                    onClick={handleDeleteCurrentZone}
                    className="text-[11px] bg-destructive/10 text-destructive hover:bg-destructive/20 px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer"
                    title="حذف المنطقة الحالية"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>حذف</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">المنطقة / الحي *</label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary cursor-pointer font-bold"
                >
                  {zones.map((z, idx) => (
                    <option key={idx} value={z}>{z}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-foreground">اسم الشارع</label>
                <input
                  type="text"
                  placeholder="مثال: شارع سوريا"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">رقم العقار</label>
                <input
                  type="text"
                  placeholder="15"
                  value={houseNumber}
                  onChange={(e) => setHouseNumber(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">الدور / الشقة</label>
                <input
                  type="text"
                  placeholder="الدور 3 شقة 6"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1 sm:col-span-3">
                <label className="font-semibold text-foreground">علامة مميزة للسكن</label>
                <input
                  type="text"
                  placeholder="مثال: بجوار صيدلية الأمل"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* GPS Location Capture */}
            <div className="p-3 bg-muted/20 border border-border rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>تحديد موقع المنزل على خرائط Google Maps للزيارات</span>
                </span>
                <button
                  type="button"
                  onClick={handleCaptureGPS}
                  disabled={isLocating}
                  className="h-8 px-3 rounded-lg bg-primary text-primary-foreground font-bold text-[11px] flex items-center gap-1.5 shadow hover:bg-primary/95 transition cursor-pointer"
                >
                  <LocateFixed className="h-3.5 w-3.5" />
                  <span>{isLocating ? 'جاري الالتقاط...' : 'التقاط موقعي الحالي GPS 📍'}</span>
                </button>
              </div>

              {googleMapsUrl && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    readOnly
                    value={googleMapsUrl}
                    className="flex-1 bg-background border border-border rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-muted-foreground outline-none"
                  />
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="h-8 px-3 bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white rounded-lg flex items-center text-[11px] font-bold transition"
                  >
                    فتح الخريطة
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* 5. Church Sacraments & Notes */}
          <div className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-foreground border-b border-border pb-2 flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              <span>٥. الأسرار الكنسية، المواهب، والملاحظات</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-foreground flex items-center gap-1">
                    <span>أب الاعتراف:</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddPriestModal(true)}
                    className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    <span>+ إضافة أب اعتراف</span>
                  </button>
                </div>
                <select
                  value={confessionFather}
                  onChange={(e) => setConfessionFather(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary cursor-pointer font-bold text-primary shadow-sm"
                >
                  {priestsList.length === 0 ? (
                    <option value="أبونا تادرس">أبونا تادرس</option>
                  ) : (
                    priestsList.map((pr) => (
                      <option key={pr.id} value={pr.name_ar}>{pr.name_ar} {pr.church_name ? `(${pr.church_name})` : ''}</option>
                    ))
                  )}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">تاريخ آخر اعتراف</label>
                <input
                  type="date"
                  value={confessionLastDate}
                  onChange={(e) => setConfessionLastDate(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-foreground">المواهب والمهارات الخاصة بالخادم</label>
                <input
                  type="text"
                  placeholder="مثال: ألحان قبطية، عزف وترانيم، تمثيل مسرحي، تصميم وجرافيك، كمبيوتر..."
                  value={talents}
                  onChange={(e) => setTalents(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-foreground">ملاحظات إضافية</label>
                <textarea
                  rows={2}
                  placeholder="أي ملاحظات إدارية أو روحية..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-xl p-3 outline-none focus:border-primary resize-none"
                />
              </div>
            </div>
          </div>

          {/* 6. Credentials & Permissions */}
          <div className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-foreground border-b border-border pb-2 flex items-center gap-2">
              <Key className="h-4 w-4 text-primary" />
              <span>٦. بيانات الدخول وصلاحيات النظام (Credentials & Permissions)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-foreground">اسم المستخدم للدخول *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: beshoy.kamal"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary font-mono font-bold text-left"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">كلمة المرور *</label>
                <input
                  type="text"
                  placeholder="123456"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary font-mono font-bold text-left"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">البريد الإلكتروني للربط</label>
                <input
                  type="email"
                  placeholder="beshoy@church.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary font-mono text-left"
                  dir="ltr"
                />
              </div>
            </div>

            {/* System Permissions Selector */}
            <div className="space-y-2 pt-2">
              <label className="font-bold text-xs text-foreground block">اختر مستوى الصلاحية الممنوحة للخادم:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {[
                  { id: 'priest', title: '✝️ كاهن / أب اعتراف', desc: 'رعاية روحية واطلاع كامل على تقارير وسجلات الاعتراف والافتقاد' },
                  { id: 'service_admin', title: '👑 أمين عام الخدمة', desc: 'صلاحيات إدارية ومالية شاملة على كل المراحل والخدام والميزانيات' },
                  { id: 'sector_leader', title: '🏛️ أمين قطاع', desc: 'إشراف ومتابعة على فصول ومراحل متعددة داخل قطاع محدد' },
                  { id: 'stage_leader', title: '🎖️ أمين مرحلة', desc: 'إدارة وتعديل المرحلة وفصولها ومناهجها والخدام التابعين لها' },
                  { id: 'class_leader', title: '⭐ أمين فصل', desc: 'إدارة فصله بالكامل مع صلاحيات تعديل بيانات الطلاب ورصد النقاط' },
                  { id: 'servant', title: '🛡️ خادم فصل', desc: 'تسجيل الحضور والغياب والافتقاد الأسبوعي ونقاط المخدومين' },
                  { id: 'treasurer', title: '💰 أمين صندوق ومسؤول مالي', desc: 'تسجيل وإدارة حسابات الخدمة والاشتراكات والعهد والمصروفات' }
                ].map((role) => {
                  const isSelected = systemRole === role.id
                  return (
                    <div
                      key={role.id}
                      onClick={() => setSystemRole(role.id as any)}
                      className={`p-3 rounded-2xl border text-right transition cursor-pointer flex flex-col justify-between gap-1 ${
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary shadow-md font-bold'
                          : 'bg-muted/20 border-border hover:bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <p className="text-xs font-extrabold">{role.title}</p>
                      <p className={`text-[10px] leading-relaxed ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                        {role.desc}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>

          {/* Submit Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Link
              href={typeof window !== 'undefined' && window.location.pathname.includes('/stmina') ? '/stmina/servants/' : '/servants/'}
              className="h-12 px-6 rounded-2xl border border-border hover:bg-muted font-bold text-xs flex items-center justify-center text-muted-foreground transition"
            >
              إلغاء وتراجع
            </Link>
            <button
              type="submit"
              disabled={submitting || !firstName.trim()}
              className="h-12 px-8 bg-primary text-primary-foreground font-bold text-xs rounded-2xl shadow-lg hover:bg-primary/95 transition cursor-pointer flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              <span>{submitting ? 'جاري الحفظ...' : 'حفظ وتسجيل الخادم والصلاحيات 💾'}</span>
            </button>
          </div>

        </form>

        {/* MODAL: ADD CUSTOM SERVICE / STAGE */}
        {showAddServiceModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-3 animate-in zoom-in-95 text-right font-sans" dir="rtl">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <h3 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                  <Church className="h-4 w-4 text-primary" />
                  <span>إضافة مرحلة أو خدمة كنسية جديدة</span>
                </h3>
                <button type="button" onClick={() => setShowAddServiceModal(false)} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">اسم الخدمة أو المرحلة الجديدة *</label>
                  <input
                    type="text"
                    placeholder="مثال: خدمة أخوة الرب، خدمة المسنين، خدمة المرضى..."
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary text-xs font-bold"
                    autoFocus
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">سيتم حفظ هذه الخدمة في النظام لتظهر في كافة القوائم والتكليفات.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button type="button" onClick={() => setShowAddServiceModal(false)} className="h-9 px-3 rounded-xl border border-border text-xs text-muted-foreground hover:bg-muted">إلغاء</button>
                <button
                  type="button"
                  disabled={isSavingService || !newServiceName.trim()}
                  onClick={handleSaveNewService}
                  className="h-9 px-4 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow hover:bg-primary/95 transition"
                >
                  {isSavingService ? 'جاري الحفظ...' : 'حفظ وإضافة'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ADD PRIEST */}
        {showAddPriestModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-3 animate-in zoom-in-95 text-right font-sans" dir="rtl">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <h3 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                  <Church className="h-4 w-4 text-primary" />
                  <span>إضافة أب اعتراف / كاهن جديد</span>
                </h3>
                <button type="button" onClick={() => setShowAddPriestModal(false)} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">اسم الأب الكاهن بالكامل *</label>
                  <input
                    type="text"
                    placeholder="مثال: القمص تادرس يعقوب، أبونا يوحنا..."
                    value={newPriestName}
                    onChange={(e) => setNewPriestName(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary text-xs font-bold"
                    autoFocus
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">رقم الهاتف (اختياري)</label>
                  <input
                    type="tel"
                    placeholder="01234567890"
                    value={newPriestPhone}
                    onChange={(e) => setNewPriestPhone(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary text-xs font-mono"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">اسم الكنيسة / الإيبارشية</label>
                  <input
                    type="text"
                    placeholder="كنيسة الشهيد العظيم مارمينا"
                    value={newPriestChurch}
                    onChange={(e) => setNewPriestChurch(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button type="button" onClick={() => setShowAddPriestModal(false)} className="h-9 px-3 rounded-xl border border-border text-xs text-muted-foreground hover:bg-muted">إلغاء</button>
                <button
                  type="button"
                  disabled={isSavingPriest || !newPriestName.trim()}
                  onClick={handleSaveNewPriest}
                  className="h-9 px-4 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow hover:bg-primary/95 transition"
                >
                  {isSavingPriest ? 'جاري الحفظ...' : 'تأكيد الحفظ'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ADD ZONE */}
        {showAddZoneModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-3 animate-in zoom-in-95 text-right font-sans" dir="rtl">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <h3 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>إضافة منطقة / حي سكني جديد</span>
                </h3>
                <button type="button" onClick={() => setShowAddZoneModal(false)} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="font-semibold text-foreground">اسم المنطقة الجديدة:</label>
                <input
                  type="text"
                  placeholder="مثال: لوران، بحري، الدخيلة..."
                  value={newZoneInput}
                  onChange={(e) => setNewZoneInput(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary text-xs font-bold"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button type="button" onClick={() => setShowAddZoneModal(false)} className="h-9 px-3 rounded-xl border border-border text-xs text-muted-foreground hover:bg-muted">إلغاء</button>
                <button
                  type="button"
                  disabled={isAddingZone || !newZoneInput.trim()}
                  onClick={handleSaveNewZone}
                  className="h-9 px-4 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow hover:bg-primary/95 transition"
                >
                  {isAddingZone ? 'جاري الحفظ...' : 'تأكيد الحفظ'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </Shell>
  )
}
