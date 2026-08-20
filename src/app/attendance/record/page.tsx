'use client'

import React, { useState, useEffect } from 'react'
import { Shell } from '@/components/layout/Shell'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { getClasses, ClassItem } from '@/lib/services/classesService'
import { getStudents, StudentItem } from '@/lib/services/studentsService'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Users,
  Camera,
  Keyboard,
  CheckCircle,
  AlertCircle,
  Volume2,
  VolumeX,
  Search,
  Check,
  X,
  Clock,
  Sparkles,
  School,
  Calendar
} from 'lucide-react'
import { Html5QrcodeScanner } from 'html5-qrcode'

function RecordAttendanceContent() {
  const { locale } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Routing presets
  const initialClassId = searchParams.get('classId') || ''
  const meetingId = searchParams.get('meetingId') || ''
  
  // State
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [selectedStage, setSelectedStage] = useState('ابتدائي')
  const [selectedClass, setSelectedClass] = useState(initialClassId)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [students, setStudents] = useState<StudentItem[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeLetter, setActiveLetter] = useState('')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [attendanceState, setAttendanceState] = useState<Record<string, 'present' | 'absent' | 'late' | 'excused'>>({})
  const [massState, setMassState] = useState<Record<string, boolean>>({})
  const [confessState, setConfessState] = useState<Record<string, boolean>>({})
  const [scanAction, setScanAction] = useState<'attendance' | 'mass' | 'confession'>('attendance')

  // Log modes: 'manual' | 'numeric' | 'qr'
  const [mode, setMode] = useState<'manual' | 'numeric' | 'qr'>('manual')

  // Numeric Code Input State
  const [numericCodeInput, setNumericCodeInput] = useState('')
  const [scanStatus, setScanStatus] = useState<{ type: 'success' | 'error' | 'warning'; msg: string } | null>(null)

  // Load classes
  useEffect(() => {
    async function loadClasses() {
      const data = await getClasses()
      setClasses(data)
      
      if (initialClassId && data.length > 0) {
        const activeClass = data.find(c => c.id === initialClassId)
        if (activeClass) {
          setSelectedStage(activeClass.stage_name_ar)
          setSelectedClass(activeClass.id)
          return
        }
      }

      if (data.length > 0 && !initialClassId) {
        // Find St. Bishoy / St. Demiana (first class in ابتدائي)
        const initialStageClasses = data.filter(c => c.stage_name_ar === 'ابتدائي')
        if (initialStageClasses.length > 0) {
          setSelectedClass(initialStageClasses[0].id)
        } else {
          setSelectedClass(data[0].id)
          setSelectedStage(data[0].stage_name_ar)
        }
      }
    }
    loadClasses()
  }, [initialClassId])

  // Load students for active class and PRE-POPULATE from MySQL for selected date!
  useEffect(() => {
    async function loadStudents() {
      if (!selectedClass) return
      setLoading(true)
      const data = await getStudents(selectedClass)
      setStudents(data)
      
      // Fetch saved attendance for the chosen date from MySQL
      const isXampp = typeof window !== 'undefined' && window.location.pathname.includes('/stmina')
      const targetDate = selectedDate || new Date().toISOString().split('T')[0]
      const attUrl = isXampp ? `/stmina/api/attendance.php?date=${targetDate}` : `/api/attendance.php?date=${targetDate}`
      
      let existingAttMap: Record<string, any> = {}
      try {
        const attRes = await fetch(attUrl)
        if (attRes.ok) {
          const attData = await attRes.json()
          if (Array.isArray(attData)) {
            attData.forEach((item: any) => {
              existingAttMap[item.student_id] = item
            })
          }
        }
      } catch (e) {
        console.error('Error fetching date attendance from MySQL:', e)
      }

      // Initialize attendance, mass, and confession dictionaries with live MySQL data
      const dict: Record<string, 'present' | 'absent' | 'late' | 'excused'> = {}
      const mDict: Record<string, boolean> = {}
      const cDict: Record<string, boolean> = {}
      data.forEach((s) => {
        const existing = existingAttMap[s.id]
        dict[s.id] = existing ? (existing.status as any) : 'absent'
        mDict[s.id] = existing ? (existing.attended_mass == 1 || (existing.notes && existing.notes.includes('القداس'))) : false
        cDict[s.id] = existing ? (existing.confessed == 1 || (existing.notes && existing.notes.includes('اعتراف'))) : false
      })
      setAttendanceState(dict)
      setMassState(mDict)
      setConfessState(cDict)
      setLoading(false)
    }
    loadStudents()
  }, [selectedClass, selectedDate])

  const filteredClassesForSelect = classes.filter(c => selectedStage ? c.stage_name_ar === selectedStage : true)

  const handleStageChange = (stage: string) => {
    setSelectedStage(stage)
    const stageClasses = classes.filter(c => c.stage_name_ar === stage)
    if (stageClasses.length > 0) {
      setSelectedClass(stageClasses[0].id)
    } else {
      setSelectedClass('')
    }
  }

  // QR Code camera init
  useEffect(() => {
    if (mode !== 'qr') return

    const scanner = new Html5QrcodeScanner(
      'qr-reader-container',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    )

    scanner.render(
      (decodedText) => {
        // Scanned QR code text
        handleQRScan(decodedText)
      },
      (error) => {
        // Ignore constant scanning errors
      }
    )

    return () => {
      scanner.clear().catch((e) => console.warn('QR scanner clear error:', e))
    }
  }, [mode, students])

  // Sounds
  const playSound = (type: 'success' | 'error' | 'warning') => {
    if (!soundEnabled) return
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = audioCtx.createOscillator()
      const gainNode = audioCtx.createGain()
      osc.connect(gainNode)
      gainNode.connect(audioCtx.destination)

      if (type === 'success') {
        osc.frequency.setValueAtTime(600, audioCtx.currentTime)
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime)
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.15)
        osc.stop(audioCtx.currentTime + 0.2)
      } else if (type === 'error') {
        osc.frequency.setValueAtTime(200, audioCtx.currentTime)
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime)
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.3)
        osc.stop(audioCtx.currentTime + 0.35)
      } else {
        // Warning
        osc.frequency.setValueAtTime(440, audioCtx.currentTime)
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime)
        osc.start()
        osc.stop(audioCtx.currentTime + 0.15)
      }
    } catch (e) {
      console.warn('AudioContext error:', e)
    }
  }

  // Handle manual state change
  const toggleStatus = (studentId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    setAttendanceState((prev) => {
      const updated = { ...prev, [studentId]: status }
      // Play soft sound on success
      if (status === 'present') playSound('success')
      return updated
    })
  }

  const toggleMass = (studentId: string) => {
    setMassState((prev) => {
      const val = !prev[studentId]
      if (val) playSound('success')
      return { ...prev, [studentId]: val }
    })
  }

  const toggleConfess = (studentId: string) => {
    setConfessState((prev) => {
      const val = !prev[studentId]
      if (val) playSound('success')
      return { ...prev, [studentId]: val }
    })
  }

  // Handle Numeric Code Input Form
  const handleNumericSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const code = parseInt(numericCodeInput, 10)
    const match = students.find((s) => s.numeric_code === code)

    if (match) {
      if (scanAction === 'attendance') {
        if (attendanceState[match.id] === 'present') {
          setScanStatus({ type: 'warning', msg: `تم تسجيل حضور ${match.full_name} مسبقاً!` })
          playSound('warning')
        } else {
          setAttendanceState((prev) => ({ ...prev, [match.id]: 'present' }))
          setScanStatus({ type: 'success', msg: `تم تسجيل حضور: ${match.full_name}` })
          playSound('success')
        }
      } else if (scanAction === 'mass') {
        if (massState[match.id]) {
          setScanStatus({ type: 'warning', msg: `تم تسجيل حضور قداس ${match.full_name} مسبقاً!` })
          playSound('warning')
        } else {
          setMassState((prev) => ({ ...prev, [match.id]: true }))
          setScanStatus({ type: 'success', msg: `تم تسجيل حضور قداس: ${match.full_name}` })
          playSound('success')
        }
      } else if (scanAction === 'confession') {
        if (confessState[match.id]) {
          setScanStatus({ type: 'warning', msg: `تم تسجيل اعتراف ${match.full_name} مسبقاً!` })
          playSound('warning')
        } else {
          setConfessState((prev) => ({ ...prev, [match.id]: true }))
          setScanStatus({ type: 'success', msg: `تم تسجيل اعتراف: ${match.full_name}` })
          playSound('success')
        }
      }
    } else {
      setScanStatus({ type: 'error', msg: 'كود الطالب غير صحيح أو لا ينتمي لهذا الفصل!' })
      playSound('error')
    }
    setNumericCodeInput('')
  }

  // Handle QR Scan Decoded Code
  const handleQRScan = (codeText: string) => {
    const match = students.find((s) => s.qr_code === codeText)

    if (match) {
      if (scanAction === 'attendance') {
        if (attendanceState[match.id] === 'present') {
          setScanStatus({ type: 'warning', msg: `تم تسجيل حضور ${match.full_name} مسبقاً!` })
          playSound('warning')
        } else {
          setAttendanceState((prev) => ({ ...prev, [match.id]: 'present' }))
          setScanStatus({ type: 'success', msg: `تم تسجيل حضور: ${match.full_name}` })
          playSound('success')
        }
      } else if (scanAction === 'mass') {
        if (massState[match.id]) {
          setScanStatus({ type: 'warning', msg: `تم تسجيل حضور قداس ${match.full_name} مسبقاً!` })
          playSound('warning')
        } else {
          setMassState((prev) => ({ ...prev, [match.id]: true }))
          setScanStatus({ type: 'success', msg: `تم تسجيل حضور قداس: ${match.full_name}` })
          playSound('success')
        }
      } else if (scanAction === 'confession') {
        if (confessState[match.id]) {
          setScanStatus({ type: 'warning', msg: `تم تسجيل اعتراف ${match.full_name} مسبقاً!` })
          playSound('warning')
        } else {
          setConfessState((prev) => ({ ...prev, [match.id]: true }))
          setScanStatus({ type: 'success', msg: `تم تسجيل اعتراف: ${match.full_name}` })
          playSound('success')
        }
      }
    } else {
      setScanStatus({ type: 'error', msg: 'الرمز المسحوح غير مطابق لمخدومي هذا الفصل!' })
      playSound('error')
    }
  }

  // Filter students by search term and alphabet letter
  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.full_name.includes(searchTerm)
    const matchesLetter = activeLetter ? s.first_name.startsWith(activeLetter) : true
    return matchesSearch && matchesLetter
  })

  // Alphabet list for Arabic sorting
  const arabicAlphabet = [
    'أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'هـ', 'و', 'ي'
  ]

  // Statistics counters
  const totalStudents = students.length
  const presentCount = Object.values(attendanceState).filter((s) => s === 'present' || s === 'late').length
  const absentCount = totalStudents - presentCount

  const handleSaveMeeting = async () => {
    try {
      const isXampp = typeof window !== 'undefined' && window.location.pathname.includes('/stmina')
      const apiUrl = isXampp ? '/stmina/api/attendance.php' : '/api/attendance.php'
      
      const records = students.map((s) => ({
        student_id: s.id,
        status: attendanceState[s.id] || 'absent',
        notes: massState[s.id] ? 'حضر القداس الإلهي' : ''
      }))

      const targetDate = selectedDate || new Date().toISOString().split('T')[0]
      const currentClassObj = classes.find(c => c.id === selectedClass)
      const classNameStr = currentClassObj ? currentClassObj.name_ar : 'فصل عام'
      
      // Save attendance records
      await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meeting_date: targetDate,
          records: records
        })
      })

      // Also create/sync the meeting in MySQL meetings table
      const meetApiUrl = isXampp ? '/stmina/api/meetings.php' : '/api/meetings.php'
      await fetch(meetApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `اجتماع ${classNameStr} الأسبوعي`,
          meeting_date: targetDate,
          stage_name: selectedStage || 'ابتدائي',
          class_id: selectedClass,
          notes: `تسجيل حضور ${presentCount} مخدوم`
        })
      }).catch(() => null)

      alert('تم حفظ كشف الحضور والغياب بنجاح في قاعدة البيانات! 💾✨')
    } catch (e) {
      console.error('Error saving attendance to MySQL:', e)
    }

    if (meetingId) {
      try {
        const savedMeetings = localStorage.getItem('localMeetings')
        let meetingsList = []
        if (savedMeetings) {
          meetingsList = JSON.parse(savedMeetings)
        }
        const updatedMeetings = meetingsList.map((m: any) => {
          if (m.id === meetingId) {
            return {
              ...m,
              present_count: presentCount,
              absent_count: absentCount
            }
          }
          return m
        })
        localStorage.setItem('localMeetings', JSON.stringify(updatedMeetings))
      } catch (e) {
        console.error('Failed to save local meeting count', e)
      }
    }
    const isXampp = typeof window !== 'undefined' && window.location.pathname.includes('/stmina')
    window.location.href = isXampp ? '/stmina/attendance/' : '/attendance/'
  }

  return (
    <Shell>
      <div className="space-y-6">
        {/* Top Header Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl md:text-2xl font-bold text-foreground">تسجيل الحضور:</h1>
            
            {/* Stage Selector */}
            <select
              value={selectedStage}
              onChange={(e) => handleStageChange(e.target.value)}
              className="bg-card border border-border rounded-lg px-3 py-1.5 text-xs font-semibold text-foreground outline-none focus:border-primary/50"
            >
              <option value="ابتدائي">مرحلة ابتدائي</option>
              <option value="إعدادي">مرحلة إعدادي</option>
              <option value="ثانوي">مرحلة ثانوي</option>
            </select>

            {/* Class Selector */}
            {/* Class Selector */}
            <div className="flex items-center gap-1.5 bg-muted/60 border border-border px-3 py-1 rounded-lg">
              <School className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-transparent text-xs font-bold text-foreground outline-none border-none py-1 px-1 focus:ring-0 cursor-pointer"
              >
                {filteredClassesForSelect.length === 0 ? (
                  <option value="">لا يوجد فصول</option>
                ) : (
                  filteredClassesForSelect.map((c) => (
                    <option key={c.id} value={c.id}>
                      فصل {c.name_ar} ({c.grade_name_ar})
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Date Selector */}
            <div className="flex items-center gap-2 bg-primary/5 border border-primary/30 px-3 py-1 rounded-lg shadow-sm">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-primary">تاريخ الاجتماع:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-extrabold text-foreground outline-none border-none py-1 px-1 cursor-pointer"
              />
            </div>
          </div>

          {/* Mode Switcher & Sound Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg border transition-all duration-200 ${
                soundEnabled 
                  ? 'border-primary/20 bg-primary/5 text-primary hover:bg-primary/10' 
                  : 'border-border bg-card text-muted-foreground hover:bg-muted'
              }`}
              title={soundEnabled ? 'إيقاف الصوت' : 'تفعيل صوت التأكيد'}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            
            <div className="flex border border-border rounded-lg bg-muted/50 p-1 gap-1">
              {[
                { id: 'manual', label: 'تسجيل يدوي', icon: Users },
                { id: 'numeric', label: 'كود رقمي', icon: Keyboard },
                { id: 'qr', label: 'كاميرا QR', icon: Camera }
              ].map((m) => {
                const Icon = m.icon
                const isActive = mode === m.id
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setMode(m.id as any)
                      setScanStatus(null)
                    }}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold transition-all duration-200 ${
                      isActive 
                        ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/10'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{m.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* 1. STATS OVERVIEW BAR (PREMIUM STATS CARDS) */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card border border-border/80 p-4 rounded-xl shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground">إجمالي طلاب الفصل</p>
              <p className="text-2xl font-extrabold text-foreground leading-none">{totalStudents}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Users className="h-5 w-5" />
            </div>
          </div>
          
          <div className="bg-card border border-border/80 p-4 rounded-xl shadow-sm flex items-center justify-between">
            <div className="space-y-1 flex-1">
              <p className="text-[10px] font-bold text-muted-foreground">نسبة حضور الاجتماع</p>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-extrabold text-emerald-600 leading-none">{presentCount}</p>
                <span className="text-[10px] text-muted-foreground font-bold">طالب</span>
              </div>
              <div className="w-full bg-muted h-1 rounded-full overflow-hidden mt-2">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${totalStudents ? (presentCount / totalStudents) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mr-3">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-card border border-border/80 p-4 rounded-xl shadow-sm flex items-center justify-between">
            <div className="space-y-1 flex-1">
              <p className="text-[10px] font-bold text-muted-foreground">الغياب والمنقطعين</p>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-extrabold text-rose-600 leading-none">{absentCount}</p>
                <span className="text-[10px] text-muted-foreground font-bold">طالب</span>
              </div>
              <div className="w-full bg-muted h-1 rounded-full overflow-hidden mt-2">
                <div 
                  className="bg-rose-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${totalStudents ? (absentCount / totalStudents) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div className="h-10 w-10 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0 mr-3">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* 2. MODE LAYOUTS */}

        {/* Action Selection for Numeric / QR Modes */}
        {(mode === 'numeric' || mode === 'qr') && (
          <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="space-y-0.5">
              <h4 className="font-bold text-xs text-foreground">نوع العملية المطلوبة:</h4>
              <p className="text-[10px] text-muted-foreground">اختر الإجراء الذي سيتم تنفيذه تلقائياً عند مسح الكود أو إدخاله.</p>
            </div>
            
            <div className="flex border border-border rounded-lg bg-muted/40 p-1 gap-1 w-full sm:w-auto">
              {[
                { id: 'attendance', label: 'تسجيل حضور', color: 'bg-emerald-600' },
                { id: 'mass', label: 'حضور قداس', color: 'bg-blue-600' },
                { id: 'confession', label: 'اعتراف', color: 'bg-purple-600' }
              ].map((act) => {
                const isActive = scanAction === act.id
                return (
                  <button
                    key={act.id}
                    onClick={() => {
                      setScanAction(act.id as any)
                      setScanStatus(null)
                    }}
                    className={`flex-1 sm:flex-none text-center px-4 py-1.5 rounded-md text-xs font-bold transition-all duration-200 ${
                      isActive 
                        ? `${act.color} text-white shadow-sm` 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/10'
                    }`}
                  >
                    {act.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* A. MANUAL LIST MODE */}
        {mode === 'manual' && (
          <div className="space-y-4">
            {/* Search & Letter filter */}
            <div className="bg-card border border-border p-4 rounded-xl shadow-sm space-y-4">
              <div className="relative max-w-md">
                <Search className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground left-3" />
                <input
                  type="text"
                  placeholder="ابحث بالاسم لتسجيل حضور سريع..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-lg pl-9 pr-4 py-2 text-xs outline-none focus:border-primary/50 focus:bg-card transition"
                />
              </div>

              {/* Arabic Alphabet Filter list */}
              <div className="flex flex-wrap gap-1 border-t border-border/60 pt-3">
                <button
                  onClick={() => setActiveLetter('')}
                  className={`h-7 px-3 rounded-full text-[10px] font-bold border transition-all duration-200 ${
                    activeLetter === '' 
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20' 
                      : 'hover:bg-muted text-muted-foreground border-border'
                  }`}
                >
                  الكل
                </button>
                {arabicAlphabet.map((l) => (
                  <button
                    key={l}
                    onClick={() => setActiveLetter(l)}
                    className={`h-7 w-7 rounded-full text-[10px] font-bold border transition-all duration-200 ${
                      activeLetter === l 
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20' 
                        : 'hover:bg-muted text-muted-foreground border-border'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Students Attendance Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                <div className="col-span-full py-12 text-center text-xs text-muted-foreground font-semibold flex items-center justify-center gap-2">
                  <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  جاري تحميل ملفات الطلاب...
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="col-span-full py-12 text-center text-xs text-muted-foreground font-semibold">لا يوجد طلاب يطابقون خيارات البحث.</div>
              ) : (
                filteredStudents.map((s) => {
                  const state = attendanceState[s.id] || 'absent'
                  const isPresent = state === 'present' || state === 'late'
                  return (
                    <div
                      key={s.id}
                      className={`bg-card border rounded-xl p-4 flex flex-col justify-between transition-all duration-300 relative overflow-hidden group shadow-sm hover:shadow-md ${
                        isPresent 
                          ? 'border-emerald-500/30 bg-emerald-500/[0.02] shadow shadow-emerald-500/5' 
                          : 'border-border hover:border-muted-foreground/20'
                      }`}
                    >
                      {/* Top Row: Avatar & Student Details */}
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-border/80 bg-muted shrink-0 relative flex items-center justify-center transition-transform group-hover:scale-105">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={s.gender === 'female' ? '/avatar_girl.jpg' : '/avatar_boy.jpg'}
                            alt={s.full_name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs text-foreground truncate group-hover:text-primary transition-colors">{s.full_name}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[9px] font-bold bg-muted text-muted-foreground px-1.5 py-0.5 rounded">كود: {s.numeric_code}</span>
                            {isPresent && (
                              <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 px-1.5 py-0.5 rounded flex items-center gap-0.5 animate-in fade-in zoom-in-90 duration-150">
                                <Check className="h-2.5 w-2.5 animate-bounce" />
                                حاضر
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bottom Row: Status selectors */}
                      <div className="flex gap-2 mt-4 pt-3 border-t border-border/60">
                        {/* Mass toggle */}
                        <button
                          onClick={() => toggleMass(s.id)}
                          className={`flex-1 h-8 rounded-lg text-[10px] font-bold transition-all duration-200 flex items-center justify-center gap-1 ${
                            massState[s.id]
                              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                              : 'bg-muted text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground'
                          }`}
                          title="حضور القداس اليوم"
                        >
                          قداس
                        </button>

                        {/* Confession toggle */}
                        <button
                          onClick={() => toggleConfess(s.id)}
                          className={`flex-1 h-8 rounded-lg text-[10px] font-bold transition-all duration-200 flex items-center justify-center gap-1 ${
                            confessState[s.id]
                              ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/20'
                              : 'bg-muted text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground'
                          }`}
                          title="اعترف اليوم"
                        >
                          اعترف
                        </button>

                        {/* Present toggle */}
                        <button
                          onClick={() => toggleStatus(s.id, state === 'present' ? 'absent' : 'present')}
                          className={`flex-1 h-8 rounded-lg text-[10px] font-bold transition-all duration-200 flex items-center justify-center gap-1 border ${
                            isPresent
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-500/20'
                              : 'border-border text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground'
                          }`}
                        >
                          {isPresent && <Check className="h-3 w-3" />}
                          حاضر
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* B. NUMERIC CODE INPUT MODE */}
        {mode === 'numeric' && (
          <div className="max-w-md mx-auto space-y-6">
            <div className="bg-card border border-border p-6 rounded-xl shadow-sm space-y-4">
              <div className="text-center space-y-1">
                <h3 className="font-bold text-base text-foreground">تسجيل حضور بالكود الرقمي</h3>
                <p className="text-xs text-muted-foreground">أدخل كود الطالب المكتوب على بطاقة الهوية الخاصة به.</p>
              </div>

              <form onSubmit={handleNumericSubmit} className="space-y-4">
                <input
                  type="number"
                  required
                  placeholder="أدخل الكود هنا (مثال: 10001)..."
                  value={numericCodeInput}
                  onChange={(e) => setNumericCodeInput(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-xl px-4 py-3 text-lg font-bold tracking-widest text-center outline-none focus:border-primary/50 focus:bg-card transition"
                  autoFocus
                />
                <button
                  type="submit"
                  className="w-full h-11 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/95 shadow-md shadow-primary/10 transition"
                >
                  تسجيل الحضور
                </button>
              </form>
            </div>

            {/* Alert result status */}
            {scanStatus && (
              <div className={`p-4 rounded-xl border flex gap-3 items-center animate-in fade-in ${
                scanStatus.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600'
                  : scanStatus.type === 'error'
                  ? 'bg-destructive/10 border-destructive text-destructive'
                  : 'bg-amber-500/10 border-amber-500 text-amber-600'
              }`}>
                {scanStatus.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 shrink-0" />
                )}
                <span className="text-xs font-semibold leading-relaxed">{scanStatus.msg}</span>
              </div>
            )}
          </div>
        )}

        {/* C. CAMERA QR SCAN MODE */}
        {mode === 'qr' && (
          <div className="max-w-md mx-auto space-y-6">
            <div className="bg-card border border-border p-4 rounded-xl shadow-sm space-y-4">
              <div className="text-center space-y-1">
                <h3 className="font-bold text-base text-foreground">ماسح بطاقة الهوية QR Code</h3>
                <p className="text-xs text-muted-foreground">وجه كاميرا الهاتف أو الجهاز اللوحي لرمز الاستجابة السريع.</p>
              </div>

              {/* Reader camera element */}
              <div className="overflow-hidden rounded-xl border border-border bg-black relative shadow-inner">
                <div id="qr-reader-container" className="w-full aspect-square" />
              </div>
            </div>

            {/* Alert result status */}
            {scanStatus && (
              <div className={`p-4 rounded-xl border flex gap-3 items-center animate-in fade-in ${
                scanStatus.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600'
                  : scanStatus.type === 'error'
                  ? 'bg-destructive/10 border-destructive text-destructive'
                  : 'bg-amber-500/10 border-amber-500 text-amber-600'
              }`}>
                {scanStatus.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 shrink-0" />
                )}
                <span className="text-xs font-semibold leading-relaxed">{scanStatus.msg}</span>
              </div>
            )}
          </div>
        )}

        {/* Save & Finish Button */}
        <div className="flex justify-end gap-3 pt-6 border-t border-border/80">
          <button
            onClick={handleSaveMeeting}
            className="h-10 px-6 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/95 shadow-md shadow-primary/15 transition flex items-center gap-1.5"
          >
            <Check className="h-4.5 w-4.5" />
            حفظ وإنهاء الاجتماع
          </button>
        </div>

      </div>
    </Shell>
  )
}

export default function RecordAttendancePage() {
  return (
    <React.Suspense fallback={<div className="h-64 flex items-center justify-center text-muted-foreground">جاري تحميل قارئ الحضور...</div>}>
      <RecordAttendanceContent />
    </React.Suspense>
  )
}
