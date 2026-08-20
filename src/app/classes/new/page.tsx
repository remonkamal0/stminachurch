'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shell } from '@/components/layout/Shell'
import { 
  ArrowRight, Church, Save, Users, Award, Sparkles, MapPin, 
  Check, Baby, GraduationCap, BookOpen, Shield, Heart, Plus, Trash2,
  GripVertical, Edit2
} from 'lucide-react'
import Link from 'next/link'

export default function NewClassPage() {
  const router = useRouter()

  // Dynamic Stages and Grades from MySQL
  const [stages, setStages] = useState<{ id: string; name_ar: string; sort_order?: number }[]>([
    { id: 'stg_1', name_ar: 'حضانة' },
    { id: 'stg_2', name_ar: 'ابتدائي' },
    { id: 'stg_3', name_ar: 'إعدادي' },
    { id: 'stg_4', name_ar: 'ثانوي' },
    { id: 'stg_5', name_ar: 'جامعيين وخريجين' },
    { id: 'stg_6', name_ar: 'إعداد خدام' }
  ])
  const [selectedStage, setSelectedStage] = useState<string>('ابتدائي')

  // Drag & Drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const [grades, setGrades] = useState<{ id: string; name_ar: string }[]>([])
  const [selectedGrade, setSelectedGrade] = useState<string>('')
  
  const [gender, setGender] = useState<'بنين' | 'بنات' | 'مشترك'>('بنين')
  const [className, setClassName] = useState('')
  const [patronSaint, setPatronSaint] = useState('')
  const [roomNumber, setRoomNumber] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 1. Modals: Add & Edit Stage
  const [showAddStageModal, setShowAddStageModal] = useState(false)
  const [newStageInput, setNewStageInput] = useState('')
  const [isSavingStage, setIsSavingStage] = useState(false)

  const [editingStage, setEditingStage] = useState<{ id: string; name_ar: string } | null>(null)
  const [editStageInput, setEditStageInput] = useState('')
  const [isUpdatingStage, setIsUpdatingStage] = useState(false)

  // 2. Modals: Add & Edit Grade
  const [newGradeInput, setNewGradeInput] = useState('')
  const [isSavingGrade, setIsSavingGrade] = useState(false)

  const [editingGrade, setEditingGrade] = useState<{ id: string; name_ar: string } | null>(null)
  const [editGradeInput, setEditGradeInput] = useState('')
  const [isUpdatingGrade, setIsUpdatingGrade] = useState(false)

  // Helper for API base URL
  const getApiUrl = (endpoint: string) => {
    const isXampp = typeof window !== 'undefined' && window.location.pathname.includes('/stmina')
    return isXampp ? `/stmina/api/${endpoint}` : `/api/${endpoint}`
  }

  // Fetch Stages from MySQL
  const loadStages = async () => {
    try {
      const res = await fetch(getApiUrl('stages.php'))
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          setStages(data)
          if (!selectedStage && data.length > 0) {
            setSelectedStage(data[0].name_ar)
          }
        }
      }
    } catch (e) {
      console.error('Error fetching stages:', e)
    }
  }

  // Fetch Grades for the selected stage from MySQL
  const loadGradesForStage = async (stageName: string) => {
    try {
      const res = await fetch(`${getApiUrl('grades.php')}?stage_name=${encodeURIComponent(stageName)}`)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          setGrades(data)
          if (data.length > 0) {
            setSelectedGrade(data[0].name_ar)
          } else {
            setSelectedGrade('')
          }
        }
      }
    } catch (e) {
      console.error('Error fetching grades:', e)
    }
  }

  useEffect(() => {
    loadStages()
  }, [])

  useEffect(() => {
    if (selectedStage) {
      loadGradesForStage(selectedStage)
    }
  }, [selectedStage])

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDrop = async (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    const reordered = [...stages]
    const [moved] = reordered.splice(draggedIndex, 1)
    reordered.splice(targetIndex, 0, moved)

    setStages(reordered)
    setDraggedIndex(null)
    setDragOverIndex(null)

    // Persist new order in MySQL
    try {
      await fetch(getApiUrl('stages.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reorder',
          stages: reordered
        })
      })
    } catch (e) {
      console.error('Failed to persist stage order:', e)
    }
  }

  // Handle stage creation
  const handleSaveNewStage = async () => {
    if (!newStageInput.trim()) return
    setIsSavingStage(true)
    try {
      const res = await fetch(getApiUrl('stages.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name_ar: newStageInput.trim() })
      })
      if (res.ok) {
        alert('تمت إضافة المرحلة وحفظها  بنجاح!')
        const added = newStageInput.trim()
        await loadStages()
        setSelectedStage(added)
        setNewStageInput('')
        setShowAddStageModal(false)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsSavingStage(false)
    }
  }

  // Handle stage rename / edit
  const handleOpenEditStage = (stg: { id: string; name_ar: string }) => {
    setEditingStage(stg)
    setEditStageInput(stg.name_ar)
  }

  const handleSaveEditStage = async () => {
    if (!editingStage || !editStageInput.trim()) return
    setIsUpdatingStage(true)
    try {
      const res = await fetch(getApiUrl('stages.php'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingStage.id,
          old_name: editingStage.name_ar,
          new_name: editStageInput.trim()
        })
      })
      if (res.ok) {
        alert('تم تعديل اسم المرحلة  بنجاح! ✏️')
        const updated = editStageInput.trim()
        await loadStages()
        if (selectedStage === editingStage.name_ar) {
          setSelectedStage(updated)
        }
        setEditingStage(null)
      }
    } catch (e) {
      console.error(e)
      alert('حدث خطأ أثناء تعديل المرحلة')
    } finally {
      setIsUpdatingStage(false)
    }
  }

  // Handle stage deletion
  const handleDeleteStage = async (stageName: string) => {
    if (!confirm(`هل أنت متأكد من حذف مرحلة "${stageName}" ؟`)) return
    try {
      await fetch(`${getApiUrl('stages.php')}?name=${encodeURIComponent(stageName)}`, { method: 'DELETE' })
      await loadStages()
    } catch (e) {}
  }

  // Handle grade creation
  const handleSaveNewGrade = async () => {
    if (!newGradeInput.trim() || !selectedStage) return
    setIsSavingGrade(true)
    try {
      const res = await fetch(getApiUrl('grades.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage_name: selectedStage,
          name_ar: newGradeInput.trim()
        })
      })
      if (res.ok) {
        alert('تمت إضافة الصف/السنة الدراسية وحفظها  بنجاح!')
        const added = newGradeInput.trim()
        await loadGradesForStage(selectedStage)
        setSelectedGrade(added)
        setNewGradeInput('')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsSavingGrade(false)
    }
  }

  // Handle grade rename / edit
  const handleOpenEditGrade = (gradeName: string) => {
    const found = grades.find(g => g.name_ar === gradeName) || { id: '', name_ar: gradeName }
    setEditingGrade(found)
    setEditGradeInput(gradeName)
  }

  const handleSaveEditGrade = async () => {
    if (!editingGrade || !editGradeInput.trim() || !selectedStage) return
    setIsUpdatingGrade(true)
    try {
      const res = await fetch(getApiUrl('grades.php'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingGrade.id,
          stage_name: selectedStage,
          old_name: editingGrade.name_ar,
          new_name: editGradeInput.trim()
        })
      })
      if (res.ok) {
        alert('تم تعديل اسم الصف الدراسي  بنجاح! ✏️')
        const updated = editGradeInput.trim()
        await loadGradesForStage(selectedStage)
        setSelectedGrade(updated)
        setEditingGrade(null)
      }
    } catch (e) {
      console.error(e)
      alert('حدث خطأ أثناء تعديل الصف الدراسي')
    } finally {
      setIsUpdatingGrade(false)
    }
  }

  // Handle grade deletion
  const handleDeleteGrade = async (gradeName: string) => {
    if (!confirm(`هل أنت متأكد من حذف صف "${gradeName}" ؟`)) return
    try {
      await fetch(`${getApiUrl('grades.php')}?name=${encodeURIComponent(gradeName)}`, { method: 'DELETE' })
      await loadGradesForStage(selectedStage)
    } catch (e) {}
  }

  // Quick Saint presets
  const handleQuickSaint = (saint: string) => {
    setPatronSaint(saint)
    if (!className.trim()) {
      setClassName(`فصل ${saint}`)
    }
  }

  // Submit Class to MySQL
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!className.trim()) {
      alert('يرجى كتابة اسم الفصل')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        name_ar: className.trim(),
        stage_name: selectedStage,
        grade_name: selectedGrade || 'الصف الأول',
        gender: gender,
        patron_saint: patronSaint.trim() || className.trim(),
        room_number: roomNumber.trim() || 'قاعة الخدمات'
      }

      const res = await fetch(getApiUrl('classes.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        alert('تم إنشاء وحفظ الفصل  بنجاح! 🏫')
        const targetClassesUrl = typeof window !== 'undefined' && window.location.pathname.includes('/stmina') ? '/stmina/classes/' : '/classes/'
        window.location.href = targetClassesUrl
      } else {
        alert('حدث خطأ أثناء حفظ الفصل في السيرفر')
      }
    } catch (err) {
      console.error(err)
      alert('حدث خطأ في الاتصال بقاعدة البيانات')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Shell>
      <div className="max-w-5xl mx-auto space-y-6 pb-20 font-sans text-right" dir="rtl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground flex items-center gap-2.5">
              <Church className="h-7 w-7 text-primary" />
              <span>إنشاء وتأسيس فصل خدمة جديد</span>
            </h1>
            <p className="text-xs text-muted-foreground">
              يمكنك إضافة وتعديل ✏️ وسحب المراحل والسنوات وحفظها مباشرة في النظام
            </p>
          </div>
          <Link
            href={typeof window !== 'undefined' && window.location.pathname.includes('/stmina') ? '/stmina/classes/' : '/classes/'}
            className="h-10 px-4 rounded-xl border border-border hover:bg-muted font-bold text-xs flex items-center gap-1.5 text-muted-foreground transition"
          >
            <ArrowRight className="h-4 w-4" />
            <span>العودة لقائمة الفصول</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main Form (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* 1. Dynamic Stage Selection with Drag & Drop + Edit + Delete */}
              <div className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2.5">
                  <div className="space-y-0.5">
                    <span className="font-bold text-sm text-foreground flex items-center gap-2">
                      <span className="h-6 w-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">١</span>
                      <span>اختر المرحلة الدراسية الكنسية *</span>
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      💡 يمكنك سحب البطاقات (Drag & Drop ⠿) للترتيب، أو الضغط على القلم ✏️ للتعديل.
                    </span>
                  </div>
                  
                  {/* Add Stage Trigger */}
                  <button
                    type="button"
                    onClick={() => setShowAddStageModal(true)}
                    className="h-8 px-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-primary/95 transition cursor-pointer shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>+ إضافة مرحلة</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {stages.map((stg, index) => {
                    const isSelected = selectedStage === stg.name_ar
                    const isDragging = draggedIndex === index
                    const isDragOver = dragOverIndex === index

                    return (
                      <div
                        key={stg.id || index}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={() => handleDrop(index)}
                        onDragEnd={() => {
                          setDraggedIndex(null)
                          setDragOverIndex(null)
                        }}
                        onClick={() => setSelectedStage(stg.name_ar)}
                        className={`p-3 rounded-2xl border text-right transition-all flex items-center justify-between gap-1.5 cursor-grab active:cursor-grabbing select-none group ${
                          isDragging ? 'opacity-40 scale-95 border-dashed border-primary' : ''
                        } ${
                          isDragOver ? 'border-2 border-primary bg-primary/10 scale-105' : ''
                        } ${
                          isSelected && !isDragging
                            ? 'bg-primary text-primary-foreground border-primary shadow-md font-bold'
                            : 'bg-muted/30 border-border hover:bg-muted text-muted-foreground hover:text-foreground font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <GripVertical className={`h-3.5 w-3.5 shrink-0 ${isSelected ? 'text-primary-foreground/60' : 'text-muted-foreground/50'}`} />
                          <Church className={`h-4 w-4 shrink-0 ${isSelected ? 'text-primary-foreground' : 'text-primary'}`} />
                          <span className="text-xs font-bold truncate">{stg.name_ar}</span>
                        </div>
                        
                        <div className="flex items-center gap-1 shrink-0">
                          {/* Edit Stage Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenEditStage(stg)
                            }}
                            className={`p-1 rounded hover:bg-blue-600 hover:text-white transition ${
                              isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground hover:text-primary'
                            }`}
                            title="تعديل اسم هذه المرحلة"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>

                          {/* Delete Stage Button */}
                          {stages.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteStage(stg.name_ar)
                            }}
                            className={`p-1 rounded hover:bg-destructive hover:text-white transition ${
                              isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            }`}
                            title="حذف هذه المرحلة"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* 2. Grade Selection & Direct Inline Adder + Edit */}
              <div className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2.5">
                  <span className="font-bold text-sm text-foreground flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">٢</span>
                    <span>السنوات / الصفوف الدراسية في مرحلة (<span className="text-primary">{selectedStage}</span>) *</span>
                  </span>
                </div>

                <div className="p-4 bg-muted/20 border border-border rounded-2xl space-y-3.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-foreground text-xs block">
                      اختر السنة أو الصف الدراسي:
                    </label>
                    <span className="text-[11px] text-muted-foreground">اختر أو عدل ✏️ أو أضف سنة جديدة بالأسفل</span>
                  </div>

                  {/* Dropdown + Edit + Delete */}
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedGrade}
                      onChange={(e) => setSelectedGrade(e.target.value)}
                      className="flex-1 bg-background border border-border rounded-xl px-3.5 py-2.5 outline-none focus:border-primary cursor-pointer font-bold text-xs text-foreground shadow-sm"
                    >
                      {grades.length === 0 ? (
                        <option value="">لا توجد سنوات مضافة بعد - أضف أول سنة بالأسفل</option>
                      ) : (
                        grades.map((g) => (
                          <option key={g.id} value={g.name_ar}>{g.name_ar}</option>
                        ))
                      )}
                    </select>

                    {selectedGrade && grades.length > 0 && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Edit Grade Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditGrade(selectedGrade)}
                          className="h-10 px-3 bg-blue-500/10 hover:bg-blue-600 hover:text-white text-blue-600 rounded-xl transition cursor-pointer flex items-center gap-1 text-xs font-semibold shadow-sm"
                          title="تعديل اسم هذا الصف"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          <span>تعديل</span>
                        </button>

                        {/* Delete Grade Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteGrade(selectedGrade)}
                          className="h-10 px-3 bg-rose-500/10 hover:bg-rose-600 hover:text-white text-rose-600 rounded-xl transition cursor-pointer flex items-center gap-1 text-xs font-semibold shadow-sm"
                          title="حذف هذا الصف "
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>حذف</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Quick Inline Add Grade Input */}
                  <div className="pt-2.5 border-t border-border/60">
                    <p className="text-[11px] font-bold text-primary mb-1.5 flex items-center gap-1">
                      <Plus className="h-3.5 w-3.5" />
                      <span>أضف سنة أو صف دراسي جديد لمرحلة ({selectedStage}) :</span>
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="اكتب اسم السنة هنا (مثال: أولى إعداد خدام، تمهيدي، الصف الأول...)"
                        value={newGradeInput}
                        onChange={(e) => setNewGradeInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleSaveNewGrade()
                          }
                        }}
                        className="flex-1 bg-background border border-border rounded-xl px-3.5 py-2 outline-none focus:border-primary text-xs font-bold"
                      />
                      <button
                        type="button"
                        disabled={isSavingGrade || !newGradeInput.trim()}
                        onClick={handleSaveNewGrade}
                        className="h-9 px-4 bg-blue-600 text-white hover:bg-blue-700 font-bold text-xs rounded-xl shadow-sm transition cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>{isSavingGrade ? 'جاري الحفظ...' : '+ إضافة وحفظ '}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Gender Toggle */}
                <div className="space-y-2 text-xs pt-1">
                  <label className="font-bold text-foreground block">نوع الفصل (الطلاب المسجلين):</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'بنين', label: '👦 أولاد (بنين)', desc: 'فصل بنين فقط', activeBg: 'bg-blue-600 border-blue-600 text-white shadow-blue-500/20' },
                      { id: 'بنات', label: '👧 بنات (فتيات)', desc: 'فصل بنات فقط', activeBg: 'bg-pink-600 border-pink-600 text-white shadow-pink-500/20' },
                      { id: 'مشترك', label: '👥 مشترك', desc: 'أولاد وبنات معاً', activeBg: 'bg-purple-600 border-purple-600 text-white shadow-purple-500/20' }
                    ].map((g) => {
                      const isSelected = gender === g.id
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => setGender(g.id as any)}
                          className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer shadow-sm ${
                            isSelected
                              ? `${g.activeBg} font-bold shadow-md`
                              : 'bg-muted/30 border-border hover:bg-muted text-muted-foreground hover:text-foreground font-medium'
                          }`}
                        >
                          <p className="text-xs md:text-sm font-bold">{g.label}</p>
                          <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-white/80' : 'text-muted-foreground'}`}>{g.desc}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* 3. Class Name & Saint Patron */}
              <div className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2.5">
                  <span className="font-bold text-sm text-foreground flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">٣</span>
                    <span>اسم الفصل والشفيع والقاعة</span>
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-foreground block">اسم الفصل بالكامل *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: فصل الشهيد مارمينا العجائبي، فصل الأنبا بيشوي..."
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-2xl px-4 py-3 outline-none focus:border-primary font-bold text-sm text-foreground"
                  />
                </div>

                {/* Quick Saints Badges */}
                <div className="space-y-1.5 text-xs">
                  <label className="text-muted-foreground text-[11px] block">اقتراحات سريعة لشفيع الفصل:</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['الشهيد مارمينا', 'الأنبا بيشوي', 'القديسة دميانة', 'الشهيد مارجرجس', 'البابا كيرلس', 'الملاك ميخائيل', 'القديس أبانوب', 'العذراء مريم'].map((saint) => (
                      <button
                        key={saint}
                        type="button"
                        onClick={() => handleQuickSaint(saint)}
                        className="px-2.5 py-1 rounded-xl bg-primary/10 text-primary text-[11px] font-bold hover:bg-primary hover:text-primary-foreground transition cursor-pointer"
                      >
                        + {saint}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">اسم القديس الشفيع</label>
                    <input
                      type="text"
                      placeholder="مثال: الشهيد مارمينا"
                      value={patronSaint}
                      onChange={(e) => setPatronSaint(e.target.value)}
                      className="w-full bg-muted/40 border border-border rounded-2xl px-3.5 py-2.5 outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">رقم أو اسم القاعة بالكنيسة</label>
                    <input
                      type="text"
                      placeholder="مثال: قاعة 101، مبنى الخدمات..."
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      className="w-full bg-muted/40 border border-border rounded-2xl px-3.5 py-2.5 outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <Link
                  href={typeof window !== 'undefined' && window.location.pathname.includes('/stmina') ? '/stmina/classes/' : '/classes/'}
                  className="h-12 px-6 rounded-2xl border border-border hover:bg-muted font-bold text-xs flex items-center justify-center text-muted-foreground transition"
                >
                  إلغاء وتراجع
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting || !className.trim()}
                  className="h-12 px-8 bg-primary text-primary-foreground font-bold text-xs rounded-2xl shadow-lg hover:bg-primary/95 transition cursor-pointer flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{isSubmitting ? 'جاري الحفظ ...' : 'حفظ وإنشاء الفصل 💾'}</span>
                </button>
              </div>

            </form>
          </div>

          {/* Live Preview Card (Right 1 Col) */}
          <div className="space-y-4 sticky top-6">
            <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>معاينة بطاقة الفصل الحية (Live Preview)</span>
            </span>

            <div className="bg-card border-2 border-primary/20 rounded-3xl p-6 shadow-xl space-y-4 relative overflow-hidden text-right">
              <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-primary via-blue-500 to-indigo-600" />

              <div className="flex justify-between items-start pt-1">
                <div className="space-y-1">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold inline-block ${
                    gender === 'بنين'
                      ? 'bg-blue-500/15 text-blue-600'
                      : gender === 'بنات'
                      ? 'bg-pink-500/15 text-pink-600'
                      : 'bg-purple-500/15 text-purple-600'
                  }`}>
                    {gender === 'بنين' ? '👦 بنين (أولاد)' : gender === 'بنات' ? '👧 بنات' : '👥 مشترك'}
                  </span>
                  <h3 className="text-xl font-extrabold text-foreground pt-1">
                    {className || 'اسم الفصل الجديد'}
                  </h3>
                  <p className="text-xs text-primary font-semibold">
                    شفيع الفصل: {patronSaint || 'غير محدد'}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm shrink-0">
                  <Church className="h-6 w-6" />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-border/80 text-xs">
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground">المرحلة الدراسية:</span>
                  <span className="font-bold text-foreground">{selectedStage}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground">الصف / السنة:</span>
                  <span className="font-bold text-foreground">{selectedGrade || 'لم تحدد'}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground">مكان القاعة:</span>
                  <span className="font-bold text-foreground">{roomNumber || 'قاعة الخدمات'}</span>
                </div>
              </div>

              <div className="p-3 bg-muted/40 rounded-2xl text-[11px] text-muted-foreground flex items-center gap-2">
                <Check className="h-4 w-4 text-success shrink-0" />
                <span>سيتم حفظ الفصل وربطه مباشرة بنظام الحضور وتسجيل الطلاب في النظام.</span>
              </div>
            </div>

            <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl text-xs space-y-1.5 text-muted-foreground">
              <p className="font-bold text-primary">💡 تحكم كامل في المراحل والسنوات:</p>
              <p className="text-[11px] leading-relaxed">
                يمكنك إضافة وتعديل ✏️ وسحب وترتيب كافة المراحل والسنوات بحرية لتناسب نظام كنيستك.
              </p>
            </div>
          </div>

        </div>

        {/* MODAL 1: ADD CUSTOM STAGE */}
        {showAddStageModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 text-right font-sans" dir="rtl">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Church className="h-4 w-4 text-primary" />
                  <span>إضافة مرحلة دراسية كنسية جديدة</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddStageModal(false)}
                  className="text-muted-foreground hover:text-foreground text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <label className="font-bold text-foreground">اسم المرحلة الدراسية:</label>
                <input
                  type="text"
                  placeholder="مثال: مرحلة الكشافة، مرحلة الكورال، مرحلة حضانة..."
                  value={newStageInput}
                  onChange={(e) => setNewStageInput(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-2xl px-3.5 py-2.5 outline-none focus:border-primary text-xs font-bold"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddStageModal(false)}
                  className="h-10 px-4 rounded-xl border border-border text-xs text-muted-foreground hover:bg-muted cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  disabled={isSavingStage || !newStageInput.trim()}
                  onClick={handleSaveNewStage}
                  className="h-10 px-5 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow hover:bg-primary/95 transition cursor-pointer flex items-center gap-1.5"
                >
                  {isSavingStage ? 'جاري الحفظ...' : 'حفظ  💾'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: EDIT STAGE */}
        {editingStage && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 text-right font-sans" dir="rtl">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Edit2 className="h-4 w-4 text-blue-600" />
                  <span>تعديل اسم المرحلة الدراسية</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingStage(null)}
                  className="text-muted-foreground hover:text-foreground text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <label className="font-bold text-foreground">الاسم الجديد للمرحلة:</label>
                <input
                  type="text"
                  value={editStageInput}
                  onChange={(e) => setEditStageInput(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-2xl px-3.5 py-2.5 outline-none focus:border-primary text-xs font-bold text-primary"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingStage(null)}
                  className="h-10 px-4 rounded-xl border border-border text-xs text-muted-foreground hover:bg-muted cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  disabled={isUpdatingStage || !editStageInput.trim()}
                  onClick={handleSaveEditStage}
                  className="h-10 px-5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow hover:bg-blue-700 transition cursor-pointer flex items-center gap-1.5"
                >
                  {isUpdatingStage ? 'جاري التعديل...' : 'حفظ التعديل 💾'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 3: EDIT GRADE */}
        {editingGrade && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 text-right font-sans" dir="rtl">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Edit2 className="h-4 w-4 text-blue-600" />
                  <span>تعديل اسم الصف / السنة الدراسية</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingGrade(null)}
                  className="text-muted-foreground hover:text-foreground text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <label className="font-bold text-foreground">الاسم الجديد للصف / السنة لمرحلة ({selectedStage}):</label>
                <input
                  type="text"
                  value={editGradeInput}
                  onChange={(e) => setEditGradeInput(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-2xl px-3.5 py-2.5 outline-none focus:border-primary text-xs font-bold text-primary"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingGrade(null)}
                  className="h-10 px-4 rounded-xl border border-border text-xs text-muted-foreground hover:bg-muted cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  disabled={isUpdatingGrade || !editGradeInput.trim()}
                  onClick={handleSaveEditGrade}
                  className="h-10 px-5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow hover:bg-blue-700 transition cursor-pointer flex items-center gap-1.5"
                >
                  {isUpdatingGrade ? 'جاري التعديل...' : 'حفظ التعديل 💾'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </Shell>
  )
}
