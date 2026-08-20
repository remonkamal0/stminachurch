'use client'

import React, { useState, useEffect } from 'react'
import { Shell } from '@/components/layout/Shell'
import { EmptyState } from '@/components/layout/EmptyState'
import { getStudents, StudentItem } from '@/lib/services/studentsService'
import { useAuth } from '@/lib/auth/AuthContext'
import {
  Compass,
  Plus,
  Users,
  DollarSign,
  Bus,
  Save,
  CheckCircle,
  AlertTriangle,
  Printer,
  ChevronRight,
  TrendingUp,
  MapPin,
  Calendar
} from 'lucide-react'

interface Participant {
  id: string
  student_id: string
  student_name: string
  class_name: string
  paid_amount: number
  bus_number: number
}

interface Trip {
  id: string
  title: string
  date: string
  cost: number
  stage: string
  total_buses: number
  participants: Participant[]
}

export default function TripsPage() {
    const [trips, setTrips] = useState<Trip[]>([])
  const [tripsLoading, setTripsLoading] = useState(true)

  const loadLiveTrips = async () => {
    try {
      setTripsLoading(true)
      const isXampp = typeof window !== 'undefined' && window.location.pathname.includes('/stmina')
      const apiUrl = isXampp ? '/stmina/api/trips.php' : '/api/trips.php'
      const res = await fetch(apiUrl)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          setTrips(data.map((t: any) => ({
            id: t.id,
            title: t.title,
            date: t.trip_date,
            cost: Number(t.price) || 0,
            stage: t.stage_name || 'الكل',
            total_buses: Number(t.capacity) > 50 ? Math.ceil(Number(t.capacity)/50) : 1,
            participants: []
          })))
          if (data.length > 0 && !selectedTripId) setSelectedTripId(data[0].id)
        }
      }
    } catch (e) {
      console.error('Error loading trips:', e)
    } finally {
      setTripsLoading(false)
    }
  }

  useEffect(() => {
    loadLiveTrips()
  }, [])


  // Students Directory
  const [students, setStudents] = useState<StudentItem[]>([])

  // Selection states
  const [selectedTripId, setSelectedTripId] = useState('tr1')
  
  // Trip Creator Form
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDate, setNewDate] = useState('2026-08-30')
  const [newCost, setNewCost] = useState('300')
  const [newStage, setNewStage] = useState('الكل')
  const [newTotalBuses, setNewTotalBuses] = useState('2')

  // Register Participant Form
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [regStudentId, setRegStudentId] = useState('')
  const [regPaidAmount, setRegPaidAmount] = useState('')
  const [regBusNumber, setRegBusNumber] = useState('1')

  // Dynamic Stage/Class filters inside the modal
  const [regStage, setRegStage] = useState('الكل')
  const [regClass, setRegClass] = useState('الكل')

  const { assignments, hasPermission } = useAuth()

  // Dynamic lists based on roles/scopes
  const isGlobalUser = hasPermission('students:view', ['global']) || assignments.length === 0

  const allowedStages = isGlobalUser
    ? Array.from(new Set(students.map(s => s.stage_name)))
    : Array.from(new Set(assignments.map(a => a.stage_name_ar).filter(Boolean))) as string[]

  const allowedClasses = isGlobalUser
    ? Array.from(new Set(students.filter(s => regStage === 'الكل' || s.stage_name === regStage).map(s => s.class_name)))
    : Array.from(new Set(assignments.filter(a => regStage === 'الكل' || a.stage_name_ar === regStage).map(a => a.class_name_ar).filter(Boolean))) as string[]

  const filteredStudentsForReg = students.filter(s => {
    // Must match selected stage and class
    const matchStage = regStage === 'الكل' || s.stage_name === regStage
    const matchClass = regClass === 'الكل' || s.class_name === regClass
    
    // Must also be within permission scope (if not global)
    if (!isGlobalUser) {
      const permittedStages = assignments.map(a => a.stage_name_ar).filter(Boolean)
      const permittedClasses = assignments.map(a => a.class_id).filter(Boolean)
      
      const inPermittedStage = permittedStages.includes(s.stage_name)
      const inPermittedClass = s.class_id ? permittedClasses.includes(s.class_id) : false
      
      return matchStage && matchClass && (inPermittedStage || inPermittedClass)
    }
    
    return matchStage && matchClass
  })

  // Auto-update student selection on filters change
  useEffect(() => {
    if (showRegisterModal && filteredStudentsForReg.length > 0) {
      const exists = filteredStudentsForReg.some(s => s.id === regStudentId)
      if (!exists) {
        setRegStudentId(filteredStudentsForReg[0].id)
      }
    } else if (showRegisterModal && filteredStudentsForReg.length === 0) {
      setRegStudentId('')
    }
  }, [regStage, regClass, showRegisterModal, filteredStudentsForReg, regStudentId])

  const openRegisterModal = () => {
    const isGlobal = hasPermission('students:view', ['global']) || assignments.length === 0
    if (isGlobal) {
      setRegStage('الكل')
      setRegClass('الكل')
    } else {
      const allowedStgs = Array.from(new Set(assignments.map(a => a.stage_name_ar).filter(Boolean))) as string[]
      const allowedCls = Array.from(new Set(assignments.map(a => a.class_name_ar).filter(Boolean))) as string[]
      
      setRegStage(allowedStgs[0] || '')
      setRegClass(allowedCls[0] || 'الكل')
    }
    
    setRegStudentId('')
    setRegPaidAmount(activeTrip ? activeTrip.cost.toString() : '300')
    setRegBusNumber('1')
    setShowRegisterModal(true)
  }

  useEffect(() => {
    async function loadStudents() {
      const all = await getStudents()
      setStudents(all)
    }
    loadStudents()

    const savedTrips = localStorage.getItem('ssms-church-trips')
    if (savedTrips) {
      setTrips(JSON.parse(savedTrips))
    }
  }, [])

  const activeTrip = trips.find(t => t.id === selectedTripId) || trips[0]

  const persistTrips = (updated: Trip[]) => {
    setTrips(updated)
    localStorage.setItem('ssms-church-trips', JSON.stringify(updated))
  }

  // Create Trip handler
    const handleSaveTripToMysql = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    try {
      const isXampp = typeof window !== 'undefined' && window.location.pathname.includes('/stmina')
      const apiUrl = isXampp ? '/stmina/api/trips.php' : '/api/trips.php'
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          trip_date: newDate,
          price: Number(newCost) || 0,
          stage_name: newStage,
          capacity: Number(newTotalBuses) * 50
        })
      })
      if (res.ok) {
        alert('تم حفظ الرحلة  بنجاح! 🚌')
        setShowCreateModal(false)
        setNewTitle('')
        await loadLiveTrips()
      }
    } catch (err) {
      console.error(err)
    }
  }
  const handleCreateTrip = (e: React.FormEvent) => {
    handleSaveTripToMysql(e);
    return;
    e.preventDefault()
    if (!newTitle.trim()) return

    const newTrip: Trip = {
      id: `tr-${Date.now()}`,
      title: newTitle,
      date: newDate,
      cost: parseFloat(newCost) || 0,
      stage: newStage,
      total_buses: parseInt(newTotalBuses) || 1,
      participants: []
    }

    const updated = [newTrip, ...trips]
    persistTrips(updated)
    setSelectedTripId(newTrip.id)
    setShowCreateModal(false)

    // Reset fields
    setNewTitle('')
    setNewCost('300')
    setNewTotalBuses('2')
  }

  // Register Participant handler
  const handleRegisterParticipant = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeTrip || !regStudentId) return
    const student = students.find(s => s.id === regStudentId)
    if (!student) return

    // Avoid double registrations
    const alreadyRegistered = activeTrip.participants.some(p => p.student_id === regStudentId)
    if (alreadyRegistered) {
      alert('هذا الطالب مسجل بالفعل في الرحلة!')
      return
    }

    const newPart: Participant = {
      id: `part-${Date.now()}`,
      student_id: regStudentId,
      student_name: student.full_name,
      class_name: student.class_name,
      paid_amount: parseFloat(regPaidAmount) || 0,
      bus_number: parseInt(regBusNumber) || 1
    }

    const updatedTrips = trips.map(t => {
      if (t.id === activeTrip.id) {
        return {
          ...t,
          participants: [...t.participants, newPart]
        }
      }
      return t
    })

    persistTrips(updatedTrips)
    setShowRegisterModal(false)
    setRegStudentId('')
    setRegPaidAmount('')
  }

  // Edit Bus Assignment
  const handleMoveBus = (partId: string, newBus: number) => {
    if (!activeTrip) return
    const updatedTrips = trips.map(t => {
      if (t.id === activeTrip.id) {
        return {
          ...t,
          participants: t.participants.map(p => {
            if (p.id === partId) {
              return { ...p, bus_number: newBus }
            }
            return p
          })
        }
      }
      return t
    })
    persistTrips(updatedTrips)
  }

  // Remove Participant
  const handleRemoveParticipant = (partId: string) => {
    if (!activeTrip) return
    if (!confirm('هل أنت متأكد من إلغاء اشتراك هذا الطالب في الرحلة؟')) return
    const updatedTrips = trips.map(t => {
      if (t.id === activeTrip.id) {
        return {
          ...t,
          participants: t.participants.filter(p => p.id !== partId)
        }
      }
      return t
    })
    persistTrips(updatedTrips)
  }

  return (
    <Shell>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">إدارة الرحلات والمعسكرات الكنسية</h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1 font-sans">
              لوحة متكاملة لإعداد الرحلات الروحية، تسجيل الاشتراكات المالية، وتوزيع كشوف الأتوبيسات والغرف.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="h-10 px-4 bg-primary text-primary-foreground font-semibold rounded-lg text-xs flex items-center gap-2 hover:bg-primary/95 shadow-sm transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            إضافة رحلة جديدة
          </button>
        </div>

        {/* Trips Select Bar */}
        <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans print:hidden">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xs font-bold text-muted-foreground shrink-0">اختر الرحلة للتحكم بها:</span>
            <select
              value={selectedTripId}
              onChange={(e) => setSelectedTripId(e.target.value)}
              className="bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition font-bold"
            >
              {trips.map(tr => (
                <option key={tr.id} value={tr.id}>{tr.title}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="h-9 px-3 bg-muted hover:bg-muted/70 text-muted-foreground font-semibold rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              طباعة كشوفات الباصات
            </button>
            {activeTrip && (
              <button
                onClick={openRegisterModal}
                className="h-9 px-4 bg-primary text-primary-foreground font-semibold rounded-lg text-xs flex items-center gap-1.5 hover:bg-primary/95 transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                تسجيل مشترك بالرحلة
              </button>
            )}
          </div>
        </div>

        {activeTrip ? (
          <>
            {/* KPI statistics grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-sans">
              <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-medium text-muted-foreground">عدد المشتركين الفعلي</p>
                  <h3 className="text-lg font-bold text-foreground">{activeTrip.participants.length} مشترك</h3>
                </div>
                <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                  <Users className="h-4.5 w-4.5" />
                </div>
              </div>

              <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-medium text-muted-foreground">تكلفة الاشتراك للطفل</p>
                  <h3 className="text-lg font-bold text-primary">{activeTrip.cost} ج.م</h3>
                </div>
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <DollarSign className="h-4.5 w-4.5" />
                </div>
              </div>

              <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-medium text-muted-foreground">إجمالي المبالغ المحصلة</p>
                  <h3 className="text-lg font-bold text-success">
                    {activeTrip.participants.reduce((acc, p) => acc + p.paid_amount, 0)} ج.م
                  </h3>
                </div>
                <div className="h-9 w-9 rounded-lg bg-success/10 flex items-center justify-center text-success">
                  <TrendingUp className="h-4.5 w-4.5" />
                </div>
              </div>

              <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-medium text-muted-foreground">المتبقي المطلوب تحصيله</p>
                  <h3 className="text-lg font-bold text-destructive">
                    {activeTrip.participants.length * activeTrip.cost - activeTrip.participants.reduce((acc, p) => acc + p.paid_amount, 0)} ج.م
                  </h3>
                </div>
                <div className="h-9 w-9 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive">
                  <AlertTriangle className="h-4.5 w-4.5" />
                </div>
              </div>
            </div>

            {/* Busses breakdown grids */}
            <div className="space-y-6">
              <h2 className="text-sm font-bold text-foreground border-b border-border pb-1.5 font-sans">
                كشوفات توزيع الأتوبيسات وتسكين الطلاب ({activeTrip.total_buses} أتوبيسات مقررين)
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans">
                {Array.from({ length: activeTrip.total_buses }, (_, busIdx) => {
                  const busNum = busIdx + 1
                  const busParts = activeTrip.participants.filter(p => p.bus_number === busNum)
                  
                  return (
                    <div key={busNum} className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                      {/* Bus Header */}
                      <div className="flex justify-between items-center bg-muted/20 border border-border/60 p-3 rounded-xl">
                        <div className="flex items-center gap-2">
                          <Bus className="h-5 w-5 text-primary" />
                          <h3 className="font-extrabold text-sm text-foreground">أتوبيس رقم {busNum}</h3>
                        </div>
                        <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-0.5 rounded-full">
                          {busParts.length} راكب مقيد
                        </span>
                      </div>

                      {/* Bus List */}
                      <div className="overflow-x-auto min-h-[150px]">
                        <table className="w-full text-right text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-border/80 text-muted-foreground font-semibold">
                              <th className="py-2.5">اسم الطالب المشترك</th>
                              <th className="py-2.5">الفصل</th>
                              <th className="py-2.5 text-center">المسدد</th>
                              <th className="py-2.5 text-left print:hidden">التحكم بالباص</th>
                            </tr>
                          </thead>
                          <tbody>
                            {busParts.map((p) => {
                              const isFullyPaid = p.paid_amount >= activeTrip.cost
                              return (
                                <tr key={p.id} className="border-b border-border/40 hover:bg-muted/10">
                                  <td className="py-2.5 font-bold text-foreground">{p.student_name}</td>
                                  <td className="py-2.5 text-muted-foreground">{p.class_name}</td>
                                  <td className="py-2.5 text-center">
                                    <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                                      isFullyPaid ? 'bg-success/15 text-success' : 'bg-amber-500/15 text-amber-700'
                                    }`}>
                                      {p.paid_amount} ج.م
                                    </span>
                                  </td>
                                  <td className="py-2.5 text-left print:hidden space-y-1">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <select
                                        value={p.bus_number}
                                        onChange={(e) => handleMoveBus(p.id, parseInt(e.target.value))}
                                        className="bg-muted border border-border rounded px-1.5 py-0.5 text-[9px] outline-none"
                                      >
                                        {Array.from({ length: activeTrip.total_buses }, (_, bIdx) => (
                                          <option key={bIdx + 1} value={bIdx + 1}>باص {bIdx + 1}</option>
                                        ))}
                                      </select>
                                      <button
                                        onClick={() => handleRemoveParticipant(p.id)}
                                        className="text-destructive hover:underline text-[9px] font-bold"
                                      >
                                        إلغاء
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              )
                            })}

                            {busParts.length === 0 && (
                              <tr>
                                <td colSpan={4} className="py-8 text-center text-muted-foreground text-xs">
                                  لا يوجد طلاب مسكنين بالباص رقم {busNum} بعد.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-16 bg-card border border-border rounded-2xl text-muted-foreground text-xs font-sans">
            لا توجد رحلات كنسية مضافة حالياً. اضغط على الزر بالعلالي لتهيئة أول معسكر صيفي!
          </div>
        )}
      </div>

      {/* CREATE TRIP MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col font-sans">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/10">
              <h3 className="font-bold text-sm text-foreground">تهيئة رحلة أو مؤتمر كنسي جديد</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-muted-foreground hover:text-foreground text-lg">✕</button>
            </div>

            <form onSubmit={handleCreateTrip} className="p-6 space-y-4 text-xs text-right" dir="rtl">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">عنوان ومكان الرحلة / المؤتمر</label>
                <input
                  type="text" required placeholder="مثال: مؤتمر صيف إعدادي - بيت أبو تلات..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition text-right"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">تاريخ الرحلة</label>
                  <input
                    type="date" required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-primary/50 transition text-center"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">قيمة الاشتراك (ج.م)</label>
                  <input
                    type="number" required min="0"
                    value={newCost}
                    onChange={(e) => setNewCost(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition font-bold text-center"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">المرحلة المستهدفة</label>
                  <select
                    value={newStage}
                    onChange={(e) => setNewStage(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition font-bold text-center"
                  >
                    <option value="الكل">جميع المراحل (الكل)</option>
                    <option value="حضانة">حضانة</option>
                    <option value="ابتدائي">ابتدائي</option>
                    <option value="إعدادي">إعدادي</option>
                    <option value="ثانوي">ثانوي</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">عدد الأتوبيسات المقررة</label>
                  <input
                    type="number" required min="1" max="10"
                    value={newTotalBuses}
                    onChange={(e) => setNewTotalBuses(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition font-bold text-center"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-border pt-4 mt-4">
                <button
                  type="submit"
                  className="h-10 px-5 bg-primary text-primary-foreground font-semibold rounded-lg text-xs flex items-center gap-1.5 hover:bg-primary/95 shadow transition cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  حفظ وتأكيد الرحلة
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="h-10 px-4 border border-border hover:bg-muted text-xs font-semibold rounded-lg text-muted-foreground transition cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTER PARTICIPANT MODAL */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col font-sans">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/10">
              <h3 className="font-bold text-sm text-foreground">تسجيل طالب مشترك في الرحلة</h3>
              <button onClick={() => setShowRegisterModal(false)} className="text-muted-foreground hover:text-foreground text-lg">✕</button>
            </div>

            <form onSubmit={handleRegisterParticipant} className="p-6 space-y-4 text-xs text-right font-sans" dir="rtl">
              {/* Filter controls */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 text-right">
                  <label className="font-semibold text-foreground">المرحلة الدراسية:</label>
                  <select
                    value={regStage}
                    onChange={(e) => {
                      setRegStage(e.target.value)
                      setRegClass('الكل')
                    }}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition font-bold text-center"
                  >
                    {isGlobalUser && <option value="الكل font-bold">كل المراحل</option>}
                    {allowedStages.map(stg => (
                      <option key={stg} value={stg}>{stg}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 text-right">
                  <label className="font-semibold text-foreground">الفصل الدراسي:</label>
                  <select
                    value={regClass}
                    onChange={(e) => setRegClass(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition font-bold text-center"
                  >
                    <option value="الكل font-bold">كل الفصول</option>
                    {allowedClasses.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Student selector */}
              <div className="space-y-1.5 text-right">
                <label className="font-semibold text-foreground">اختر الطالب المشترك:</label>
                <select
                  value={regStudentId}
                  onChange={(e) => setRegStudentId(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition font-bold text-right"
                  required
                >
                  <option value="">-- اختر الطالب المشترك --</option>
                  {filteredStudentsForReg.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.full_name} ({s.class_name} - {s.stage_name})
                    </option>
                  ))}
                </select>
                {filteredStudentsForReg.length === 0 && (
                  <span className="text-[10px] text-destructive font-bold block mt-1">لا يوجد طلاب متوافقين مع خيارات التصفية أو صلاحياتك.</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground font-sans">المبلغ المدفوع حالياً (ج.م)</label>
                  <input
                    type="number" required placeholder="0.00"
                    value={regPaidAmount}
                    onChange={(e) => setRegPaidAmount(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition font-bold text-center"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">التسكين في أتوبيس رقم</label>
                  <select
                    value={regBusNumber}
                    onChange={(e) => setRegBusNumber(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition font-bold text-center"
                  >
                    {activeTrip && Array.from({ length: activeTrip.total_buses }, (_, idx) => (
                      <option key={idx + 1} value={idx + 1}>باص {idx + 1}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-border pt-4 mt-4">
                <button
                  type="submit"
                  className="h-10 px-5 bg-primary text-primary-foreground font-semibold rounded-lg text-xs flex items-center gap-1.5 hover:bg-primary/95 shadow transition cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  تسجيل في الكشف وتسكين الباص
                </button>
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
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
