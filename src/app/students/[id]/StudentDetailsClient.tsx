'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Shell } from '@/components/layout/Shell'
import { getStudentById, getStudentTimeline, getStudents, StudentItem, StudentTimelineEvent } from '@/lib/services/studentsService'
import {
  ArrowLeft,
  Phone,
  Calendar,
  MapPin,
  Award,
  BookOpen,
  Heart,
  CheckCircle,
  XCircle,
  FileText,
  Clock,
  Printer,
  Edit,
  Download,
  Share2,
  Camera,
  Navigation,
  Compass,
  Check,
  ExternalLink,
  LocateFixed,
  Sparkles,
  Save,
  MessageCircle
} from 'lucide-react'
import QRCode from 'qrcode'

export default function StudentDetailsPage() {
    const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Resolve ID from query param, route param, or URL pathname
  let id = searchParams?.get('id') || (params?.id as string)
  if (!id && typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search)
    id = urlParams.get('id') || window.location.pathname.split('/').filter(Boolean).pop() || ''
  }

  const [student, setStudent] = useState<StudentItem | null>(null)
  const [timeline, setTimeline] = useState<StudentTimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [qrUrl, setQrUrl] = useState('')
  const [customAvatar, setCustomAvatar] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'personal' | 'family' | 'attendance' | 'points' | 'hymns' | 'timeline'>('personal')
  const [timelineFilter, setTimelineFilter] = useState<string>('all')
  const [siblings, setSiblings] = useState<StudentItem[]>([])

  // Student GPS Location & Map Pin State
  const [studentLocation, setStudentLocation] = useState<{
    lat?: number
    lng?: number
    mapUrl?: string
    lastUpdated?: string
  } | null>(null)
  
  // Full Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPromoteModal, setShowPromoteModal] = useState(false)
  const [promoteStage, setPromoteStage] = useState('ابتدائي')
  const [promoteClass, setPromoteClass] = useState('فصل عام')
  const [promoteRole, setPromoteRole] = useState('servant')
  const [promoteRoleLabel, setPromoteRoleLabel] = useState('خادم فصل')
  const [promoteUsername, setPromoteUsername] = useState('')
  const [promotePassword, setPromotePassword] = useState('123456')
  const [keepAsStudent, setKeepAsStudent] = useState(true)
  const [isPromoting, setIsPromoting] = useState(false)
  const [editFormData, setEditFormData] = useState<any>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleOpenEditModal = () => {
    if (!student) return
    setEditFormData({
      id: student?.id || "",
      full_name: student.full_name,
      gender: student.gender,
      deacon_rank: student.deacon_rank || 'none',
      birth_date: student.birth_date,
      school: student.school || '',
      class_name: student.class_name,
      stage_name: student.stage_name,
      phone_student: student.student_phone || '',
      phone_father: student.father_phone,
      father_job: student.father_job || '',
      mother_name: student.mother_name || '',
      phone_mother: student.mother_phone || '',
      mother_job: student.mother_job || '',
      area_zone: student.area,
      street_address: student.address,
      gps_location: student.gps_location || studentLocation?.mapUrl || '',
      avatar_url: student.avatar_url || customAvatar || '',
      confession_father_name: student.confession_father,
      confession_last_date: student.confession_last_date || '',
      talents: Array.isArray(student.talents) ? student.talents.join(', ') : (student.talents || ''),
      notes: student.notes || '',
      health_notes: student.health_notes || ''
    })
    setShowEditModal(true)
  }

  const handlePromoteToServant = async () => {
    if (!student) return
    setIsPromoting(true)
    try {
      const isXampp = typeof window !== 'undefined' && window.location.pathname.includes('/stmina')
      const srvApi = isXampp ? '/stmina/api/servants.php' : '/api/servants.php'
      
      const payload = {
        full_name: student.full_name,
        username: promoteUsername.trim() || `srv.${student.full_name.split(' ')[0].toLowerCase()}.${Math.floor(100 + Math.random() * 900)}`,
        email: `${student.full_name.split(' ')[0].toLowerCase()}@church.org`,
        password: promotePassword.trim() || '123456',
        phone: student.student_phone || student.father_phone || '',
        gender: student.gender === 'female' ? 'female' : 'male',
        deacon_rank: student.deacon_rank || 'none',
        birth_date: student.birth_date || null,
        confession_father: student.confession_father || null,
        role: promoteRole,
        role_label: promoteRoleLabel,
        stage_name: promoteStage,
        class_name: promoteClass,
        service_assignments: [
          {
            stage_name: promoteStage,
            class_name: promoteClass,
            role_label: promoteRoleLabel
          }
        ],
        is_also_student: keepAsStudent ? 1 : 0,
        student_stage_name: keepAsStudent ? student.stage_name : null,
        student_class_name: keepAsStudent ? student.class_name : null,
        street_address: student.address || null,
        area_zone: student.area || null,
        gps_location: student.gps_location || studentLocation?.mapUrl || null
      }

      const res = await fetch(srvApi, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        const result = await res.json()
        alert(`تهانينا! 👑 تم تكليف وترقية المخدوم (${student.full_name}) ليصبح خادماً مع نقل كامل بياناته التاريخية بنجاح! 🛡️✨`)
        setShowPromoteModal(false)
        const targetUrl = isXampp ? `/stmina/servants/profile/?id=${encodeURIComponent(result.id)}` : `/servants/profile/?id=${encodeURIComponent(result.id)}`
        window.location.href = targetUrl
      } else {
        alert('حدث خطأ أثناء الترقية')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsPromoting(false)
    }
  }

  const handleSaveStudentEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editFormData) return
    setIsUpdating(true)
    try {
      const isXampp = typeof window !== 'undefined' && window.location.pathname.includes('/stmina')
      const apiUrl = isXampp ? '/stmina/api/students.php' : '/api/students.php'
      
      const res = await fetch(apiUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      })

      if (res.ok) {
        alert('تم تحديث وحفظ بيانات المخدوم  بنجاح!')
        setShowEditModal(false)
        if (id) {
          const updated = await getStudentById(id)
          if (updated) {
            setStudent(updated)
            if (updated.avatar_url) setCustomAvatar(updated.avatar_url)
          }
        }
      } else {
        alert('حدث خطأ أثناء تحديث البيانات في السيرفر')
      }
    } catch (err) {
      console.error(err)
      alert('حدث خطأ أثناء التحديث')
    } finally {
      setIsUpdating(false)
    }
  }

  const [isLocating, setIsLocating] = useState(false)
  const [locationSuccess, setLocationSuccess] = useState(false)
  const [showMapModal, setShowMapModal] = useState(false)
  const [customMapInput, setCustomMapInput] = useState('')

  // Coptic Hymns and Rituals Memorization Tracker
  interface HymnItem {
    id: string
    name_ar: string
    name_en: string
    category: 'ألحان' | 'طقوس' | 'قبطي'
    reward_points: number
    status: 'pending' | 'learning' | 'completed'
    completed_date?: string
    grader_name?: string
  }

    const [hymns, setHymns] = useState<HymnItem[]>([
    { id: 'h1', name_ar: 'لحن تين أويشت (قداس)', name_en: 'Ten Ousht', category: 'ألحان', reward_points: 25, status: 'pending' },
    { id: 'h2', name_ar: 'لحن أجيوس (الثلاثة تقديسات)', name_en: 'Agios', category: 'ألحان', reward_points: 30, status: 'pending' },
    { id: 'h3', name_ar: 'أرباع الناقوس (أيام السنوية)', name_en: 'Naqous Verses', category: 'ألحان', reward_points: 40, status: 'pending' },
    { id: 'h4', name_ar: 'الطقس الكنسي: رفع بخور عشية وباكر', name_en: 'Vespers Rite', category: 'طقوس', reward_points: 35, status: 'pending' },
    { id: 'h5', name_ar: 'اللغة القبطية: الحروف الأبجدية ونطقها', name_en: 'Coptic Alphabet', category: 'قبطي', reward_points: 20, status: 'pending' },
    { id: 'h6', name_ar: 'قانون الإيمان الأرثوذكسي قبطياً', name_en: 'Creed in Coptic', category: 'طقوس', reward_points: 50, status: 'pending' }
  ])

  // Live Attendance & Points from MySQL
  const [liveAttendance, setLiveAttendance] = useState<any[]>([])
  const [livePointsHistory, setLivePointsHistory] = useState<any[]>([])
  const [liveFollowups, setLiveFollowups] = useState<any[]>([])
  const [showAddPointsModal, setShowAddPointsModal] = useState(false)
  const [pointsAmount, setPointsAmount] = useState('15')
  const [pointsReason, setPointsReason] = useState('حضور قداس وحفظ آية')


  useEffect(() => {
    if (student) {
      // 1. Hymns
      const savedHymns = localStorage.getItem(`ssms-student-hymns-${student?.id || ""}`)
      if (savedHymns) {
        setHymns(JSON.parse(savedHymns))
      }

      // 2. GPS Location
      const savedLoc = localStorage.getItem(`ssms-student-location-${student?.id || ""}`)
      if (savedLoc) {
        setStudentLocation(JSON.parse(savedLoc))
      } else {
        const defaultQuery = encodeURIComponent(`${student.address} ${student.area} الاسكندرية`)
        setStudentLocation({
          mapUrl: `https://www.google.com/maps/search/?api=1&query=${defaultQuery}`
        })
      }
    }
  }, [student])

  const handleUpdateHymnStatus = (hymnId: string, newStatus: 'pending' | 'learning' | 'completed') => {
    if (!student) return
    
    setHymns(prev => {
      const updated = prev.map(h => {
        if (h.id === hymnId) {
          const wasCompleted = h.status === 'completed'
          const isNowCompleted = newStatus === 'completed'
          
          if (!wasCompleted && isNowCompleted) {
            setStudent(curr => {
              if (curr) {
                const updatedPoints = curr.points_balance + h.reward_points
                localStorage.setItem(`ssms-student-points-${curr.id}`, updatedPoints.toString())
                return {
                  ...curr,
                  points_balance: updatedPoints
                }
              }
              return curr
            })
            
            const newEvent = {
              id: `t-hymn-${Date.now()}`,
              type: 'points' as const,
              title_ar: `إتمام تسميع: ${h.name_ar}`,
              title_en: `Hymn Completed: ${h.name_en}`,
              description_ar: `حصل على +${h.reward_points} نقطة بعد إتمام تسميع المنهج المقرر بنجاح.`,
              description_en: `Awarded +${h.reward_points} points for Coptic Hymn recitation.`,
              date: new Date().toISOString().replace('T', ' ').substring(0, 16),
              servant_name: 'مينا كمال',
              points_change: h.reward_points
            }
            const existingTimeline = JSON.parse(localStorage.getItem(`ssms-student-timeline-${student?.id || ""}`) || '[]')
            localStorage.setItem(`ssms-student-timeline-${student?.id || ""}`, JSON.stringify([newEvent, ...existingTimeline]))
            
            setTimeline(t => [newEvent, ...t])
            
            return {
              ...h,
              status: newStatus,
              completed_date: new Date().toLocaleDateString('ar-EG'),
              grader_name: 'مينا كمال'
            }
          }
          
          return {
            ...h,
            status: newStatus,
            completed_date: newStatus === 'completed' ? new Date().toLocaleDateString('ar-EG') : undefined,
            grader_name: newStatus === 'completed' ? 'مينا كمال' : undefined
          }
        }
        return h
      })
      
      localStorage.setItem(`ssms-student-hymns-${student?.id || ""}`, JSON.stringify(updated))
      return updated
    })
  }

  // Auto-capture GPS coordinates from phone/device
  const handleCaptureGPS = () => {
    if (!student) return
    if (!navigator.geolocation) {
      alert('خاصية تحديد الموقع GPS غير مدعومة في متصفحك.')
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        const locObj = {
          lat,
          lng,
          mapUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
          lastUpdated: new Date().toLocaleDateString('ar-EG') + ' ' + new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
        }
        setStudentLocation(locObj)
        localStorage.setItem(`ssms-student-location-${student?.id || ""}`, JSON.stringify(locObj))
        setIsLocating(false)
        setLocationSuccess(true)
        setTimeout(() => setLocationSuccess(false), 3000)
      },
      (err) => {
        setIsLocating(false)
        alert('تعذر الوصول إلى الـ GPS. يرجى تفعيل إذن الموقع في متصفح الهاتف أو كتابة رابط الموقع يدوياً.')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleSaveCustomMapUrl = (e: React.FormEvent) => {
    e.preventDefault()
    if (!student || !customMapInput.trim()) return

    const locObj = {
      mapUrl: customMapInput.trim(),
      lastUpdated: new Date().toLocaleDateString('ar-EG')
    }
    setStudentLocation(locObj)
    localStorage.setItem(`ssms-student-location-${student?.id || ""}`, JSON.stringify(locObj))
    setShowMapModal(false)
    setCustomMapInput('')
    setLocationSuccess(true)
    setTimeout(() => setLocationSuccess(false), 3000)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomAvatar(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  useEffect(() => {
    async function loadData() {
      if (!id) return
      const s = await getStudentById(id)
      if (s) {
        setStudent(s)
        const t = await getStudentTimeline(id)
        
        const savedTimeline = localStorage.getItem(`ssms-student-timeline-${id}`)
        if (savedTimeline) {
          try {
            const parsed = JSON.parse(savedTimeline)
            setTimeline([...parsed, ...t])
          } catch (e) {
            console.error('Error parsing timeline:', e)
            setTimeline(t)
          }
        } else {
          setTimeline(t)
        }
        
        try {
          const url = await QRCode.toDataURL(s.qr_code || `ST-${s.numeric_code}`, {
            width: 160,
            margin: 1,
            color: {
              dark: '#1e3a8a',
              light: '#ffffff'
            }
          })
          setQrUrl(url)
        } catch (err) {
          console.error(err)
        }

        
        // Fetch Live Attendance from MySQL
        try {
          const isXampp = typeof window !== 'undefined' && window.location.pathname.includes('/stmina')
          const attUrl = isXampp ? `/stmina/api/attendance.php?student_id=${s.id}` : `/api/attendance.php?student_id=${s.id}`
          const attRes = await fetch(attUrl)
          if (attRes.ok) {
            const attData = await attRes.json()
            if (Array.isArray(attData)) setLiveAttendance(attData)
          }

          // Fetch Live Points from MySQL
          const ptsUrl = isXampp ? `/stmina/api/points.php?student_id=${s.id}` : `/api/points.php?student_id=${s.id}`
          const ptsRes = await fetch(ptsUrl)
          if (ptsRes.ok) {
            const ptsData = await ptsRes.json()
            if (Array.isArray(ptsData)) setLivePointsHistory(ptsData)
          }

          // Fetch Live Followups from MySQL
          const folUrl = isXampp ? `/stmina/api/followups.php?student_id=${s.id}` : `/api/followups.php?student_id=${s.id}`
          const folRes = await fetch(folUrl)
          if (folRes.ok) {
            const folData = await folRes.json()
            if (Array.isArray(folData)) setLiveFollowups(folData)
          }
        } catch (e) {
          console.error('Error fetching live actions:', e)
        }

        const allStudents = await getStudents()
        const matchedSiblings = allStudents.filter(other => {
          if (other.id === s.id) return false
          const hasFatherPhoneMatch = s.father_phone && other.father_phone && s.father_phone === other.father_phone
          const hasMotherPhoneMatch = s.mother_phone && other.mother_phone && s.mother_phone === other.mother_phone
          return hasFatherPhoneMatch || hasMotherPhoneMatch
        })
        setSiblings(matchedSiblings)
      }
      setLoading(false)
    }

    loadData()
  }, [id])

  if (loading) {
    return (
      <Shell>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      
      {/* FULL STUDENT EDIT MODAL */}
      {showEditModal && editFormData && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border w-full max-w-3xl rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 text-right font-sans my-8 max-h-[90vh] overflow-y-auto" dir="rtl">
            
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <Edit className="h-5 w-5 text-primary" />
                  <span>تعديل بيانات المخدوم (حفظ مباشر )</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">تحديث كافة الحقول والبيانات في جدول students</p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStudentEdit} className="space-y-4 text-xs">
              
              {/* 1. Basic Info */}
              <div className="p-4 bg-muted/20 border border-border rounded-2xl space-y-3">
                <h4 className="font-bold text-primary text-xs">١. البيانات الشخصية والكنسية للمخدوم</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-semibold text-foreground">الاسم الكامل *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.full_name}
                      onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 outline-none focus:border-primary font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground text-primary">📱 تليفون المخدوم الشخصي</label>
                    <input
                      type="tel"
                      value={editFormData.phone_student}
                      onChange={(e) => setEditFormData({ ...editFormData, phone_student: e.target.value })}
                      className="w-full bg-primary/5 border border-primary/20 rounded-xl px-3 py-2 outline-none focus:border-primary font-mono text-left font-bold"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">المدرسة / الكلية</label>
                    <input
                      type="text"
                      value={editFormData.school}
                      onChange={(e) => setEditFormData({ ...editFormData, school: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">تاريخ الميلاد</label>
                    <input
                      type="date"
                      value={editFormData.birth_date}
                      onChange={(e) => setEditFormData({ ...editFormData, birth_date: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">الرتبة الشماسية</label>
                    <select
                      value={editFormData.deacon_rank}
                      onChange={(e) => setEditFormData({ ...editFormData, deacon_rank: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 outline-none focus:border-primary cursor-pointer font-bold text-primary"
                    >
                      <option value="none">غير مرسوم شماس</option>
                      <option value="إبصالتس (مرتل)">إبصالتس (مرتل)</option>
                      <option value="أغنسطس (قارئ)">أغنسطس (قارئ)</option>
                      <option value="إيبودياكون (مساعد شماس)">إيبودياكون (مساعد)</option>
                      <option value="دياكون (شماس كامل)">دياكون (شماس كامل)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">الفصل</label>
                    <input
                      type="text"
                      value={editFormData.class_name}
                      onChange={(e) => setEditFormData({ ...editFormData, class_name: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">المرحلة الدراسية</label>
                    <input
                      type="text"
                      value={editFormData.stage_name}
                      onChange={(e) => setEditFormData({ ...editFormData, stage_name: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Parents Info */}
              <div className="p-4 bg-muted/20 border border-border rounded-2xl space-y-3">
                <h4 className="font-bold text-primary text-xs">٢. بيانات الأسرة والوالدين</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">هاتف الأب (واتساب)</label>
                    <input
                      type="tel"
                      value={editFormData.phone_father}
                      onChange={(e) => setEditFormData({ ...editFormData, phone_father: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 outline-none focus:border-primary font-mono text-left font-bold"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">وظيفة / مهنة الأب</label>
                    <input
                      type="text"
                      value={editFormData.father_job}
                      onChange={(e) => setEditFormData({ ...editFormData, father_job: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">اسم الأم بالكامل</label>
                    <input
                      type="text"
                      value={editFormData.mother_name}
                      onChange={(e) => setEditFormData({ ...editFormData, mother_name: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">هاتف الأم</label>
                    <input
                      type="tel"
                      value={editFormData.phone_mother}
                      onChange={(e) => setEditFormData({ ...editFormData, phone_mother: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 outline-none focus:border-primary font-mono text-left font-bold"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">وظيفة / مهنة الأم</label>
                    <input
                      type="text"
                      value={editFormData.mother_job}
                      onChange={(e) => setEditFormData({ ...editFormData, mother_job: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Address & GPS */}
              <div className="p-4 bg-muted/20 border border-border rounded-2xl space-y-3">
                <h4 className="font-bold text-primary text-xs">٣. العنوان والمنطقة وموقع خرائط جوجل</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">المنطقة السكنية</label>
                    <input
                      type="text"
                      value={editFormData.area_zone}
                      onChange={(e) => setEditFormData({ ...editFormData, area_zone: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 outline-none focus:border-primary font-medium"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-semibold text-foreground">العنوان بالتفصيل</label>
                    <input
                      type="text"
                      value={editFormData.street_address}
                      onChange={(e) => setEditFormData({ ...editFormData, street_address: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-3">
                    <label className="font-semibold text-foreground">رابط خرائط جوجل (Google Maps URL)</label>
                    <input
                      type="text"
                      value={editFormData.gps_location}
                      onChange={(e) => setEditFormData({ ...editFormData, gps_location: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 outline-none focus:border-primary font-mono text-left"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Confession & Notes */}
              <div className="p-4 bg-muted/20 border border-border rounded-2xl space-y-3">
                <h4 className="font-bold text-primary text-xs">٤. الرعوية وأب الاعتراف والملاحظات</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">أب الاعتراف</label>
                    <input
                      type="text"
                      value={editFormData.confession_father_name}
                      onChange={(e) => setEditFormData({ ...editFormData, confession_father_name: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">تاريخ آخر اعتراف</label>
                    <input
                      type="date"
                      value={editFormData.confession_last_date}
                      onChange={(e) => setEditFormData({ ...editFormData, confession_last_date: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-semibold text-foreground">المواهب والمهارات</label>
                    <input
                      type="text"
                      value={editFormData.talents}
                      onChange={(e) => setEditFormData({ ...editFormData, talents: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-semibold text-foreground">ملاحظات الخادم الرعوية</label>
                    <textarea
                      rows={2}
                      value={editFormData.notes}
                      onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl p-2.5 outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="h-10 px-5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-muted transition cursor-pointer"
                >
                  إلغاء وتراجع
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="h-10 px-8 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-lg hover:bg-primary/95 transition cursor-pointer flex items-center gap-2"
                >
                  {isUpdating ? 'جاري الحفظ ...' : 'حفظ التعديلات  💾'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    
      {/* ADD POINTS MODAL */}
      {showAddPointsModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[250] flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 text-right font-sans" dir="rtl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                <span>إضافة / خصم نقاط للمخدوم</span>
              </h3>
              <button onClick={() => setShowAddPointsModal(false)} className="text-muted-foreground hover:text-foreground text-xs cursor-pointer">✕</button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault()
              try {
                const isXampp = typeof window !== 'undefined' && window.location.pathname.includes('/stmina')
                const apiUrl = isXampp ? '/stmina/api/points.php' : '/api/points.php'
                const res = await fetch(apiUrl, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    student_id: student?.id || "",
                    amount: parseInt(pointsAmount),
                    reason: pointsReason
                  })
                })
                if (res.ok) {
                  alert('تم تسجيل حركة النقاط  بنجاح!')
                  setShowAddPointsModal(false)
                  if (id) {
                    const updated = await getStudentById(id)
                    if (updated) setStudent(updated)
                    const ptsUrl = isXampp ? `/stmina/api/points.php?student_id=${id}` : `/api/points.php?student_id=${id}`
                    const ptsRes = await fetch(ptsUrl)
                    if (ptsRes.ok) setLivePointsHistory(await ptsRes.json())
                  }
                }
              } catch (err) {
                console.error(err)
              }
            }} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">عدد النقاط (موجب للإضافة / سالب للخصم):</label>
                <input
                  type="number"
                  required
                  value={pointsAmount}
                  onChange={(e) => setPointsAmount(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary font-bold text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">سبب منح / استبدال النقاط:</label>
                <input
                  type="text"
                  required
                  value={pointsReason}
                  onChange={(e) => setPointsReason(e.target.value)}
                  placeholder="مثال: حفظ مزمور، نشاط رسم، استبدال هدية..."
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddPointsModal(false)}
                  className="h-9 px-4 rounded-xl border border-border text-xs text-muted-foreground hover:bg-muted cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow hover:bg-primary/95 cursor-pointer"
                >
                  حفظ  💾
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </Shell>
    )
  }

  if (!student) {
    return (
      <Shell>
        <div className="p-8 text-center bg-card border border-border rounded-xl">
          <h2 className="text-xl font-bold text-foreground">المخدوم غير موجود</h2>
          <p className="text-muted-foreground mt-2">تعذر العثور على سجل المخدوم المطلوب.</p>
          <button
            onClick={() => router.push('/students')}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm"
          >
            العودة لقائمة المخدومين
          </button>
        </div>
      </Shell>
    )
  }

  const effectiveMapUrl = studentLocation?.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${student.address} ${student.area} الاسكندرية`)}`

  return (
    <Shell>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Header / Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>العودة للقائمة</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 border border-border rounded-lg text-xs font-semibold hover:bg-muted transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>طباعة الملف الشامل</span>
            </button>
            <Link
    href={typeof window !== 'undefined' && window.location.pathname.includes('/stmina') ? `/stmina/students/edit/?id=${student?.id || ""}` : `/students/edit/?id=${student?.id || ""}`}
    className="px-3.5 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition flex items-center gap-1.5 shadow-sm cursor-pointer"
  >
    <Edit className="h-3.5 w-3.5" />
    <span>تعديل البيانات</span>
  </Link>
          </div>
        </div>

        {/* Hero Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="h-28 w-28 rounded-full overflow-hidden border-2 border-primary/20 bg-muted/40 shrink-0 shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={customAvatar || (student.gender === 'male' ? '/avatar_boy.jpg' : '/avatar_girl.jpg')}
                  alt={student.full_name}
                  className="h-full w-full object-cover"
                />
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-md hover:bg-primary/90 cursor-pointer transition transform group-hover:scale-105"
                title="تغيير الصورة الشخصية"
              >
                <Camera className="h-4 w-4" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Main Info */}
            <div className="flex-1 text-center md:text-right space-y-2">
              <div className="flex flex-col md:flex-row items-center justify-between gap-2">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{student.full_name}</h1>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    كود المخدوم: <span className="font-mono font-bold text-primary">{student.numeric_code}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    student.status === 'active'
                      ? 'bg-success/15 text-success'
                      : 'bg-destructive/15 text-destructive'
                  }`}>
                    {student.status === 'active' ? 'منتظم بالخدمة' : 'غير منتظم'}
                  </span>
                  <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full">
                    {student.gender === 'male' ? 'شماس / بنين' : 'بنات'}
                  </span>
                </div>
              </div>

              {/* Badges / Meta */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span>فصل: <strong className="text-foreground">{student.class_name}</strong></span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="h-4 w-4 text-primary" />
                  <span>المرحلة: <strong className="text-foreground">{student.stage_name}</strong> ({student.grade_name})</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>منطقة السكن: <strong className="text-foreground">{student.area}</strong></span>
                </div>
              </div>
            </div>

            {/* QR Card */}
            {qrUrl && (
              <div className="bg-muted/30 border border-border/60 p-3 rounded-xl flex flex-col items-center gap-1.5 shrink-0 text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrUrl} alt="QR Code" className="h-20 w-20 rounded-md bg-white p-1" />
                <span className="text-[10px] font-mono text-muted-foreground font-bold">{student.qr_code}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-border font-sans overflow-x-auto">
          {[
            { id: 'personal', label: 'البيانات الشخصية والموقع 📍' },
            { id: 'family', label: 'الأسرة والوالدين 👨‍👩‍👦' },
            { id: 'hymns', label: 'الألحان والطقوس 🎵' },
            { id: 'attendance', label: 'سجل الحضور 📅' },
            { id: 'points', label: 'النقاط والمكافآت ★' },
            { id: 'timeline', label: 'سجل الأحداث والعمليات ⏳' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 border-b-2 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          {/* TAB A: PERSONAL INFO & GPS MAP */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  
                  {/* Contact Phones Box */}
                  <div className="p-4 rounded-xl border border-border bg-muted/10 space-y-3">
                    <h3 className="font-bold text-sm text-primary border-b border-border pb-1.5 flex items-center gap-1.5">
                      <Phone className="h-4 w-4" />
                      <span>بيانات وأرقام التواصل المباشر</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-2.5 bg-card border border-border rounded-xl">
                        <p className="text-[11px] text-muted-foreground">📱 تليفون المخدوم الشخصي</p>
                        {student.student_phone ? (
                          <a href={`tel:${student.student_phone}`} className="font-bold text-primary text-xs mt-1 block font-mono dir-ltr">
                            {student.student_phone}
                          </a>
                        ) : (
                          <p className="text-muted-foreground font-semibold mt-1">غير مسجل</p>
                        )}
                      </div>

                      <div className="p-2.5 bg-card border border-border rounded-xl">
                        <p className="text-[11px] text-muted-foreground">👨 هاتف الوالد (الأب)</p>
                        <a href={`tel:${student.father_phone}`} className="font-bold text-foreground text-xs mt-1 block font-mono dir-ltr">
                          {student.father_phone || 'غير مسجل'}
                        </a>
                      </div>

                      <div className="p-2.5 bg-card border border-border rounded-xl">
                        <p className="text-[11px] text-muted-foreground">👩 هاتف الوالدة (الأم)</p>
                        <a href={`tel:${student.mother_phone}`} className="font-bold text-foreground text-xs mt-1 block font-mono dir-ltr">
                          {student.mother_phone || 'غير مسجل'}
                        </a>
                      </div>
                    </div>
                  </div>

                  <h3 className="font-bold text-sm text-primary border-b border-border pb-1.5">البيانات الأساسية</h3>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">تاريخ الميلاد</p>
                      <p className="font-semibold text-foreground mt-1">{student.birth_date}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">العمر</p>
                      <p className="font-semibold text-foreground mt-1">{student.age} سنوات</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">المدرسة</p>
                      <p className="font-semibold text-foreground mt-1">{student.school || 'غير مسجل'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">المنطقة</p>
                      <p className="font-semibold text-foreground mt-1">{student.area}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-sm text-primary border-b border-border pb-1.5">الرعوية والاعتراف</h3>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">أب الاعتراف</p>
                      <p className="font-semibold text-foreground mt-1">{student.confession_father}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">آخر اعتراف</p>
                      <p className="font-semibold text-foreground mt-1">{student.confession_last_date || 'غير مسجل'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">العنوان بالتفصيل</p>
                      <p className="font-semibold text-foreground mt-1 flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-primary shrink-0" />
                        {student.address}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* INTERACTIVE GPS MAP & LOCATION WIDGET */}
              <div className="bg-gradient-to-l from-primary/5 via-muted/20 to-card border-2 border-primary/20 rounded-2xl p-5 shadow-xs space-y-4 font-sans">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border/80 pb-3">
                  <div>
                    <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                      <Compass className="h-5 w-5 text-primary" />
                      <span>موقع منزل المخدوم على الخريطة (GPS & Google Maps)</span>
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      تحديد الموقع الجغرافي الدقيق لتسهيل وصول الخدام في الافتقاد الميداني.
                    </p>
                  </div>

                  {locationSuccess && (
                    <span className="text-xs text-success bg-success/15 font-bold px-3 py-1 rounded-full flex items-center gap-1 animate-bounce">
                      <Check className="h-3.5 w-3.5" />
                      تم حفظ الموقع بنجاح!
                    </span>
                  )}
                </div>

                {/* Location Meta Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-card border border-border rounded-xl">
                    <span className="text-[10px] text-muted-foreground block">المنطقة والشارع:</span>
                    <strong className="text-foreground mt-0.5 block truncate">{student.area} - {student.address}</strong>
                  </div>

                  <div className="p-3 bg-card border border-border rounded-xl">
                    <span className="text-[10px] text-muted-foreground block">إحداثيات الـ GPS الموثقة:</span>
                    <strong className="text-primary mt-0.5 block font-mono">
                      {studentLocation?.lat && studentLocation?.lng
                        ? `${studentLocation.lat.toFixed(4)}° N, ${studentLocation.lng.toFixed(4)}° E`
                        : 'تم التوجيه بالاسم والعنوان'}
                    </strong>
                  </div>

                  <div className="p-3 bg-card border border-border rounded-xl">
                    <span className="text-[10px] text-muted-foreground block">تاريخ آخر تحديث للموقع:</span>
                    <span className="text-muted-foreground mt-0.5 block">{studentLocation?.lastUpdated || 'تلقائي مع التسجيل'}</span>
                  </div>
                </div>

                {/* Actions Toolbar */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={handleCaptureGPS}
                    disabled={isLocating}
                    className="h-9 px-4 bg-primary text-primary-foreground font-bold rounded-xl text-xs flex items-center gap-1.5 hover:bg-primary/95 transition shadow-xs cursor-pointer"
                  >
                    <LocateFixed className={`h-4 w-4 ${isLocating ? 'animate-spin' : ''}`} />
                    <span>{isLocating ? 'جاري التقاط الإحداثيات...' : '📍 التقاط موقع بيتي الحالي بالـ GPS (من الموبايل)'}</span>
                  </button>

                  <a
                    href={effectiveMapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                  >
                    <Navigation className="h-4 w-4" />
                    <span>فتح الملاحة في Google Maps</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>

                  <button
                    onClick={() => {
                      setCustomMapInput(studentLocation?.mapUrl || '')
                      setShowMapModal(true)
                    }}
                    className="h-9 px-3 border border-border hover:bg-muted text-muted-foreground font-semibold rounded-xl text-xs transition cursor-pointer"
                  >
                    تعديل الرابط يدوياً
                  </button>
                </div>
              </div>

              {/* Hobbies & Talents */}
              <div className="space-y-3 pt-4 border-t border-border">
                <h3 className="font-bold text-sm text-primary">المواهب والهوايات</h3>
                <div className="flex gap-2 flex-wrap">
                  {(Array.isArray(student.talents) ? student.talents : (typeof student.talents === "string" ? student.talents.split(",") : [])).map((t, idx) => (
                    <span key={idx} className="bg-primary/5 text-primary text-xs font-semibold px-3 py-1 rounded-full border border-primary/10">
                      {t}
                    </span>
                  ))}
                  {student.talents.length === 0 && (
                    <span className="text-xs text-muted-foreground">لم يتم تسجيل مواهب بعد.</span>
                  )}
                </div>
              </div>

              {/* Notes */}
              {student.notes && (
                <div className="space-y-2 pt-4 border-t border-border">
                  <h3 className="font-bold text-sm text-primary">ملاحظات الخادم</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-lg border border-border/40">
                    {student.notes}
                  </p>
                </div>
              )}

              {/* Siblings Linker */}
              <div className="space-y-3 pt-4 border-t border-border">
                <h3 className="font-bold text-sm text-primary">الربط العائلي (الأشقاء بالخدمة)</h3>
                {siblings.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {siblings.map((sibling) => (
                      <Link
                        key={sibling.id}
                        href={`/students/${sibling.id}`}
                        className="flex items-center gap-3 p-3 border border-border rounded-xl bg-muted/10 hover:bg-primary/[0.02] hover:border-primary/30 transition cursor-pointer"
                      >
                        <div className="h-10 w-10 rounded-full overflow-hidden border border-muted bg-card shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={sibling.gender === 'male' ? '/avatar_boy.jpg' : '/avatar_girl.jpg'}
                            alt={sibling.full_name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="space-y-0.5 min-w-0 text-right">
                          <span className="font-bold text-xs text-foreground block truncate hover:text-primary transition">
                            {sibling.first_name} {sibling.last_name}
                          </span>
                          <span className="text-[10px] text-muted-foreground block">
                            الفصل: <strong className="text-foreground">{sibling.class_name}</strong> • الصف: {sibling.grade_name}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">لا يوجد أشقاء مسجلين بنفس أرقام هواتف أولياء الأمور.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB B: FAMILY DETAILS */}
          {activeTab === 'family' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl border border-border bg-muted/10 space-y-3">
                  <h3 className="font-bold text-sm text-primary border-b border-border pb-1.5">بيانات الوالد (الأب)</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">الاسم الكامل</p>
                      <p className="font-semibold text-foreground mt-0.5">{student.father_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">رقم الهاتف</p>
                      <a href={`tel:${student.father_phone}`} className="font-semibold text-primary mt-0.5 flex items-center gap-1 dir-ltr inline-block">
                        <Phone className="h-3.5 w-3.5 inline mr-1" />
                        {student.father_phone}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border bg-muted/10 space-y-3">
                  <h3 className="font-bold text-sm text-primary border-b border-border pb-1.5">بيانات الوالدة (الأم)</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">الاسم الكامل</p>
                      <p className="font-semibold text-foreground mt-0.5">{student.mother_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">رقم الهاتف</p>
                      <a href={`tel:${student.mother_phone}`} className="font-semibold text-primary mt-0.5 flex items-center gap-1 dir-ltr inline-block">
                        <Phone className="h-3.5 w-3.5 inline mr-1" />
                        {student.mother_phone}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Siblings Family Links */}
              <div className="bg-muted/10 border border-border p-4 rounded-xl space-y-4">
                <h3 className="font-bold text-sm text-primary border-b border-border pb-1.5">الأشقاء بالخدمة (الربط العائلي تلقائياً)</h3>
                {siblings.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {siblings.map((sibling) => (
                      <Link
                        key={sibling.id}
                        href={`/students/${sibling.id}`}
                        className="flex items-center gap-3 p-3 border border-border rounded-xl bg-card hover:bg-primary/[0.02] hover:border-primary/30 transition cursor-pointer"
                      >
                        <div className="h-10 w-10 rounded-full overflow-hidden border border-muted shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={sibling.gender === 'male' ? '/avatar_boy.jpg' : '/avatar_girl.jpg'}
                            alt={sibling.full_name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="space-y-0.5 min-w-0 text-right animate-in fade-in">
                          <span className="font-bold text-xs text-foreground block truncate hover:text-primary transition">
                            {sibling.first_name} {sibling.last_name}
                          </span>
                          <span className="text-[10px] text-muted-foreground block">
                            الفصل: <strong className="text-foreground">{sibling.class_name}</strong> • الصف: {sibling.grade_name}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">لا يوجد أشقاء مسجلين بنفس أرقام هواتف أولياء الأمور.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB C: HYMNS & RITUALS */}
          {activeTab === 'hymns' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-primary/5 border border-primary/10 p-5 rounded-2xl">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-sans">مستوى تقدم الطالب في الحفظ والتسميع</span>
                  <h2 className="text-lg font-bold text-foreground">
                    تسميع الألحان والطقوس المقررة
                  </h2>
                  <p className="text-xs text-muted-foreground font-sans">
                    تم تسميع <strong className="text-primary">{hymns.filter(h => h.status === 'completed').length}</strong> من أصل <strong className="text-foreground">{hymns.length}</strong> ألحان/طقوس كنسية.
                  </p>
                </div>
                <div className="bg-card border border-border px-4 py-2.5 rounded-xl text-center shrink-0">
                  <span className="text-[10px] text-muted-foreground block">النقاط التي تم تحصيلها من الحفظ</span>
                  <span className="text-sm font-extrabold text-success mt-0.5 block font-sans">
                    +{hymns.filter(h => h.status === 'completed').reduce((acc, curr) => acc + curr.reward_points, 0)} نقطة
                  </span>
                </div>
              </div>

              {/* Hymns Roster */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
                {hymns.map((h) => (
                  <div
                    key={h.id}
                    className={`p-4 border rounded-xl space-y-4 transition-all duration-200 relative ${
                      h.status === 'completed'
                        ? 'border-success/30 bg-success/[0.01]'
                        : h.status === 'learning'
                        ? 'border-primary/20 bg-primary/[0.01]'
                        : 'border-border bg-card'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        h.category === 'ألحان'
                          ? 'bg-blue-500/10 text-blue-700'
                          : h.category === 'طقوس'
                          ? 'bg-amber-500/10 text-amber-700'
                          : 'bg-indigo-500/10 text-indigo-700'
                      }`}>
                        {h.category}
                      </span>
                      <span className="text-[10px] font-extrabold text-success bg-success/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                        ★ +{h.reward_points} نقطة جائزة
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-extrabold text-xs text-foreground leading-normal">{h.name_ar}</h4>
                      <p className="text-[10px] text-muted-foreground font-mono">{h.name_en}</p>
                    </div>

                    {h.status === 'completed' && h.completed_date && (
                      <div className="text-[10px] bg-success/5 border border-success/10 rounded-lg p-2 flex justify-between items-center leading-normal">
                        <span className="text-success font-semibold">تاريخ التسميع: {h.completed_date}</span>
                        <span className="text-muted-foreground">بواسطة: {h.grader_name}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-1 border-t border-border/60 pt-3">
                      {[
                        { status: 'pending', label: 'لم يبدأ' },
                        { status: 'learning', label: 'جارٍ الحفظ' },
                        { status: 'completed', label: 'تم التسميع 🎉' }
                      ].map((opt) => {
                        const isSelected = h.status === opt.status
                        return (
                          <button
                            key={opt.status}
                            onClick={() => handleUpdateHymnStatus(h.id, opt.status as any)}
                            className={`py-1.5 px-1 rounded-md text-[10px] font-bold text-center transition-all cursor-pointer ${
                              isSelected
                                ? opt.status === 'completed'
                                  ? 'bg-success text-white shadow-sm font-extrabold'
                                  : opt.status === 'learning'
                                  ? 'bg-primary text-white shadow-sm font-extrabold'
                                  : 'bg-zinc-500 text-white shadow-sm font-extrabold'
                                : 'bg-muted/40 hover:bg-muted/70 text-muted-foreground'
                            }`}
                          >
                            {opt.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB D: ATTENDANCE */}
          {activeTab === 'attendance' && (
            <div className="space-y-4 font-sans text-right" dir="rtl">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h3 className="font-bold text-sm text-primary">سجل الحضور والغياب الفعلي (قاعدة البيانات)</h3>
                <span className="text-xs text-muted-foreground font-semibold">إجمالي مرات الحضور: {liveAttendance.filter(a => a.status === 'present').length}</span>
              </div>

              {liveAttendance.length === 0 ? (
                <div className="p-8 text-center bg-muted/20 border border-border rounded-2xl space-y-2">
                  <Calendar className="h-8 w-8 text-muted-foreground/60 mx-auto" />
                  <p className="font-bold text-xs text-foreground">لا يوجد سجلات حضور مسجلة لهذا المخدوم حتى الآن</p>
                  <p className="text-[11px] text-muted-foreground">يتم تسجيل الحضور تلقائياً وحفظه  عند رصد الغياب في اجتماع مدارس الأحد.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {liveAttendance.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-border bg-card hover:bg-muted/30 transition shadow-sm">
                      <div className="space-y-0.5">
                        <p className="font-bold text-xs text-foreground">اجتماع مدارس الأحد</p>
                        <p className="text-[11px] text-muted-foreground font-mono">{item.meeting_date}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        item.status === 'present' ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'
                      }`}>
                        {item.status === 'present' ? 'حاضر ✓' : 'غائب ✕'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB E: POINTS */}
          {activeTab === 'points' && (
            <div className="space-y-6 font-sans text-right" dir="rtl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-primary/5 border border-primary/10 p-5 rounded-2xl">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">الرصيد الفعلي للنقاط والمكافآت</span>
                  <h2 className="text-3xl font-extrabold text-primary">{student.points_balance || student.total_points || 0} نقطة</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddPointsModal(true)}
                  className="px-4 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow hover:bg-primary/95 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Award className="h-4 w-4" />
                  <span>+ إضافة / خصم نقاط للمخدوم</span>
                </button>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-sm text-foreground">سجل حركة وتاريخ النقاط (قاعدة البيانات)</h3>
                
                {livePointsHistory.length === 0 ? (
                  <div className="p-8 text-center bg-muted/20 border border-border rounded-2xl space-y-2">
                    <Award className="h-8 w-8 text-muted-foreground/60 mx-auto" />
                    <p className="font-bold text-xs text-foreground">لا توجد حركات نقاط مسجلة حالياً</p>
                    <p className="text-[11px] text-muted-foreground">اضغط على زر "+ إضافة / خصم نقاط" لمنح المخدوم نقاط تشجيعية عند حفظ الآيات والألحان.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {livePointsHistory.map((t, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 border border-border rounded-xl bg-card hover:bg-muted/20 transition shadow-sm">
                        <div>
                          <p className="font-bold text-xs text-foreground">{t.reason}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">{t.created_at}</p>
                        </div>
                        <span className={`text-sm font-bold ${
                          Number(t.amount) >= 0 ? 'text-success' : 'text-destructive'
                        }`}>
                          {Number(t.amount) >= 0 ? `+${t.amount}` : t.amount} نقطة
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB F: TIMELINE LOG */}
          {activeTab === 'timeline' && (
            <div className="space-y-6 font-sans text-right" dir="rtl">
              <h3 className="font-bold text-sm text-primary border-b border-border pb-1.5">سجل الأحداث والعمليات والافتقاد الفعلي</h3>

              {liveFollowups.length === 0 && liveAttendance.length === 0 && livePointsHistory.length === 0 ? (
                <div className="p-8 text-center bg-muted/20 border border-border rounded-2xl space-y-2">
                  <Clock className="h-8 w-8 text-muted-foreground/60 mx-auto" />
                  <p className="font-bold text-xs text-foreground">لا توجد عمليات أو أحداث مسجلة لهذا المخدوم حتى الآن</p>
                  <p className="text-[11px] text-muted-foreground">يتم توثيق الزيارات الميدانية والاتصالات الهاتفية والأنشطة الرعوية تلقائياً عند تسجيلها.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {liveFollowups.map((f, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-border bg-card space-y-1 shadow-sm">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-primary">📞 افتقاد رعوي ({f.visit_type === 'home_visit' ? 'زيارة منزلية' : 'مكالمة هاتفية'})</span>
                        <span className="text-muted-foreground font-mono text-[10px]">{f.visit_date}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{f.notes}</p>
                    </div>
                  ))}
                  {livePointsHistory.map((p, idx) => (
                    <div key={'p' + idx} className="p-3.5 rounded-xl border border-border bg-card space-y-1 shadow-sm">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-success">★ منح نقاط مكافأة ({p.amount > 0 ? '+' : ''}{p.amount} نقطة)</span>
                        <span className="text-muted-foreground font-mono text-[10px]">{p.created_at}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{p.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* EDIT MAP LINK MODAL */}
      {showMapModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col font-sans">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/10">
              <h3 className="font-bold text-sm text-foreground">تعديل رابط موقع الخريطة (Google Maps)</h3>
              <button onClick={() => setShowMapModal(false)} className="text-muted-foreground hover:text-foreground text-lg cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveCustomMapUrl} className="p-6 space-y-4 text-xs text-right" dir="rtl">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">رابط خرائط جوجل (Google Maps Link / Pin):</label>
                <input
                  type="url"
                  placeholder="https://maps.google.com/?q=..."
                  value={customMapInput}
                  onChange={(e) => setCustomMapInput(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary font-mono text-left"
                  required
                />
                <p className="text-[10px] text-muted-foreground">
                  يمكنك مشاركة الموقع من تطبيق Google Maps على الهاتف ولصق الرابط هنا.
                </p>
              </div>

              <div className="flex justify-end gap-2 border-t border-border pt-4 mt-2">
                <button
                  type="submit"
                  className="h-10 px-5 bg-primary text-primary-foreground font-semibold rounded-lg text-xs flex items-center gap-1.5 hover:bg-primary/95 shadow transition cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  حفظ الموقع
                </button>
                <button
                  type="button"
                  onClick={() => setShowMapModal(false)}
                  className="h-10 px-4 border border-border hover:bg-muted text-xs font-semibold rounded-lg text-muted-foreground transition cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Shell>
  )
}