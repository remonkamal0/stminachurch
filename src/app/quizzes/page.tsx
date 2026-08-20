'use client'

import React, { useState, useEffect } from 'react'
import { Shell } from '@/components/layout/Shell'
import { getStudents, StudentItem } from '@/lib/services/studentsService'
import Link from 'next/link'
import {
  HelpCircle,
  Plus,
  Play,
  CheckCircle,
  XCircle,
  Award,
  ChevronRight,
  BookOpen,
  ArrowRight,
  Save,
  CheckCircle2,
  Filter,
  Users
} from 'lucide-react'

interface Question {
  id: string
  text: string
  options: string[]
  answer: string
}

interface Quiz {
  id: string
  title: string
  points: number
  target_stage: string
  target_class: string
  questions: Question[]
}

export default function QuizzesPage() {
  // Quizzes Registry
  const [quizzes, setQuizzes] = useState<Quiz[]>([
    {
      id: 'q1',
      title: 'مسابقة سفر أعمال الرسل (الأصحاحات ١-٥)',
      points: 30,
      target_stage: 'ابتدائي',
      target_class: 'الأنبا بيشوي',
      questions: [
        { id: 'q1_1', text: 'من هو الكاتب لسفر أعمال الرسل؟', options: ['لوقا البشير', 'بولس الرسول', 'بطرس الرسول', 'يوحنا الحبيب'], answer: 'لوقا البشير' },
        { id: 'q1_2', text: 'كم يوماً ظهر السيد المسيح للتلاميذ بعد قيامته؟', options: ['٣٠ يوماً', '٤٠ يوماً', '٥٠ يوماً', '٧ أيام'], answer: '٤٠ يوماً' },
        { id: 'q1_3', text: 'من هو الرسول الذي تم اختياره بديلاً عن يهوذا الإسخريوطي؟', options: ['متياس الرسول', 'برنابا', 'استفانوس', 'سيلا'], answer: 'متياس الرسول' }
      ]
    },
    {
      id: 'q2',
      title: 'مسابقة طقوس وألحان صوم السيدة العذراء مريم',
      points: 20,
      target_stage: 'الكل',
      target_class: 'الكل',
      questions: [
        { id: 'q2_1', text: 'ما هو اللحن الأساسي الذي يقال في زفة صوم العذراء؟', options: ['إبصالية واطس', 'لحن تين أويشت', 'لحن طاي هي تشويني', 'شيريه نيه ماريا'], answer: 'لحن طاي هي تشويني' },
        { id: 'q2_2', text: 'كم مدة صوم السيدة العذراء مريم بالأيام؟', options: ['٧ أيام', '١٥ يوماً', '٤٠ يوماً', '٥٥ يوماً'], answer: '١٥ يوماً' }
      ]
    },
    {
      id: 'q3',
      title: 'مسابقة العقيدة الأرثوذكسية: التجسد الإلهي',
      points: 40,
      target_stage: 'ابتدائي',
      target_class: 'الأنبا بيشوي',
      questions: [
        { id: 'q3_1', text: 'ما معنى كلمة "ثيؤطوكوس" طقسياً وعقائدياً؟', options: ['والدة الإله', 'السماء الثانية', 'الممتلئة نعمة', 'الحمامة الحسنة'], answer: 'والدة الإله' },
        { id: 'q3_2', text: 'في أي المجامع المسكونية تم إقرار مقدمة قانون الإيمان؟', options: ['مجمع نيقية', 'مجمع القسطنطينية', 'مجمع أفسس', 'مجمع خلقيدونية'], answer: 'مجمع أفسس' },
        { id: 'q3_3', text: 'من هو القديس صاحب كتاب "تجسد الكلمة"؟', options: ['القديس أثناسيوس الرسولي', 'القديس كيرلس الكبير', 'القديس باسيليوس الكبير', 'القديس غريغوريوس'], answer: 'القديس أثناسيوس الرسولي' }
      ]
    }
  ])

  // Students list
  const [students, setStudents] = useState<StudentItem[]>([])

  // Modal / Creator State
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newPoints, setNewPoints] = useState('15')
  const [newStage, setNewStage] = useState('الكل')
  const [newClass, setNewClass] = useState('الكل')
  const [newQuestions, setNewQuestions] = useState<Question[]>([
    { id: 'q_new_1', text: '', options: ['', '', '', ''], answer: '' }
  ])

  // Filter in main dashboard
  const [filterStage, setFilterStage] = useState('الكل')

  // Simulation State
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null)
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [simulationStep, setSimulationStep] = useState<'setup' | 'running' | 'results'>('setup')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [scoreEarned, setScoreEarned] = useState(0)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    async function loadStudents() {
      const all = await getStudents()
      setStudents(all)
    }
    loadStudents()

    // Load custom quizzes from localStorage
    const savedQuizzes = localStorage.getItem('ssms-custom-quizzes')
    if (savedQuizzes) {
      setQuizzes(JSON.parse(savedQuizzes))
    }
  }, [])

  const stagesList = Array.from(new Set(students.map(s => s.stage_name)))
  const classesForNewQuiz = Array.from(new Set(
    students
      .filter(s => newStage === 'الكل' || s.stage_name === newStage)
      .map(s => s.class_name)
  ))

  // Create Quiz Logic
  const handleAddQuestion = () => {
    setNewQuestions(prev => [
      ...prev,
      { id: `q_new_${Date.now()}`, text: '', options: ['', '', '', ''], answer: '' }
    ])
  }

  const handleRemoveQuestion = (idx: number) => {
    setNewQuestions(prev => prev.filter((_, i) => i !== idx))
  }

  const handleUpdateQuestion = (idx: number, field: string, val: any, optionIdx?: number) => {
    setNewQuestions(prev => prev.map((q, i) => {
      if (i === idx) {
        if (field === 'option' && optionIdx !== undefined) {
          const opts = [...q.options]
          opts[optionIdx] = val
          return { ...q, options: opts }
        }
        return { ...q, [field]: val }
      }
      return q
    }))
  }

  const handleSaveQuiz = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    const newQuiz: Quiz = {
      id: `quiz-${Date.now()}`,
      title: newTitle,
      points: parseInt(newPoints) || 10,
      target_stage: newStage,
      target_class: newClass,
      questions: newQuestions.map((q, idx) => ({
        ...q,
        id: `q-${Date.now()}-${idx}`,
        answer: q.answer || q.options[0]
      }))
    }

    const updated = [newQuiz, ...quizzes]
    setQuizzes(updated)
    localStorage.setItem('ssms-custom-quizzes', JSON.stringify(updated))

    // Reset Form
    setNewTitle('')
    setNewPoints('15')
    setNewStage('الكل')
    setNewClass('الكل')
    setNewQuestions([{ id: 'q_new_1', text: '', options: ['', '', '', ''], answer: '' }])
    setShowCreateModal(false)
  }

  // Simulation Logic
  const handleStartSimulation = (quiz: Quiz) => {
    setActiveQuiz(quiz)
    
    // Find matching students for this quiz's stage and class
    const matchingStudents = students.filter(s => {
      const matchStage = quiz.target_stage === 'الكل' || s.stage_name === quiz.target_stage
      const matchClass = quiz.target_class === 'الكل' || s.class_name === quiz.target_class
      return matchStage && matchClass
    })

    setSelectedStudentId(matchingStudents[0]?.id || students[0]?.id || '')
    setSimulationStep('setup')
    setAnswers({})
    setScoreEarned(0)
    setSaveSuccess(false)
  }

  const handleSubmitSimulation = () => {
    if (!activeQuiz) return
    let correctCount = 0
    activeQuiz.questions.forEach(q => {
      if (answers[q.id] === q.answer) {
        correctCount++
      }
    })

    const earned = Math.round((correctCount / activeQuiz.questions.length) * activeQuiz.points)
    setScoreEarned(earned)
    setSimulationStep('results')
  }

  const handleSaveSimulationResults = () => {
    if (!activeQuiz || !selectedStudentId) return
    const student = students.find(s => s.id === selectedStudentId)
    if (!student) return

    // 1. Award points
    const currentPoints = parseInt(localStorage.getItem(`ssms-student-points-${student.id}`) || student.points_balance.toString())
    const newPointsTotal = currentPoints + scoreEarned
    localStorage.setItem(`ssms-student-points-${student.id}`, newPointsTotal.toString())

    // 2. Add dynamic timeline event
    const newEvent = {
      id: `t-quiz-${Date.now()}`,
      type: 'points' as const,
      title_ar: `نتائج مسابقة: ${activeQuiz.title}`,
      title_en: `Quiz Completed: ${activeQuiz.title}`,
      description_ar: `حصل على +${scoreEarned} نقطة بعد الإجابة على المسابقة الدينية. النتيجة: ${Object.keys(answers).filter(k => {
        const q = activeQuiz.questions.find(qi => qi.id === k)
        return q && answers[k] === q.answer
      }).length} من أصل ${activeQuiz.questions.length} إجابات صحيحة.`,
      description_en: `Awarded +${scoreEarned} points for religious contest completion.`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      servant_name: 'أمين الخدمة',
      points_change: scoreEarned
    }

    const existingTimeline = JSON.parse(localStorage.getItem(`ssms-student-timeline-${student.id}`) || '[]')
    localStorage.setItem(`ssms-student-timeline-${student.id}`, JSON.stringify([newEvent, ...existingTimeline]))

    setSaveSuccess(true)
    setTimeout(() => {
      setSaveSuccess(false)
      setActiveQuiz(null)
    }, 2000)
  }

  // Filtered quizzes in main dashboard
  const displayedQuizzes = quizzes.filter(q => {
    if (filterStage === 'الكل') return true
    return q.target_stage === 'الكل' || q.target_stage === filterStage
  })

  // Matching students for active simulator quiz
  const simulatorMatchingStudents = activeQuiz ? students.filter(s => {
    const matchStage = activeQuiz.target_stage === 'الكل' || s.stage_name === activeQuiz.target_stage
    const matchClass = activeQuiz.target_class === 'الكل' || s.class_name === activeQuiz.target_class
    return matchStage && matchClass
  }) : students

  return (
    <Shell>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">مسابقات وأنشطة الكتاب المقدس</h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1 font-sans">
              قم بإنشاء مسابقات أسئلة تفاعلية وربطها بمراحل وفصول محددة، مع إمكانية حلها وتطبيقها على الطلاب.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Link
              href="/quizzes/student"
              className="h-10 px-4 border border-primary/20 bg-primary/5 text-primary font-semibold rounded-lg text-xs flex items-center gap-1.5 hover:bg-primary/10 transition shadow-sm cursor-pointer"
            >
              <Award className="h-4 w-4" />
              دخول بوابة حل المسابقات (للطالب)
            </Link>
            <button
              onClick={() => setShowCreateModal(true)}
              className="h-10 px-4 bg-primary text-primary-foreground font-semibold rounded-lg text-xs flex items-center gap-2 hover:bg-primary/95 shadow-sm transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              إنشاء مسابقة جديدة
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-card border border-border p-3.5 rounded-xl shadow-sm flex items-center justify-between gap-4 font-sans">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-bold text-muted-foreground">تصفية المسابقات بالمرحلة:</span>
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="bg-muted/40 border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-primary/50 transition font-bold"
            >
              <option value="الكل">جميع المراحل</option>
              {stagesList.map(stg => (
                <option key={stg} value={stg}>{stg}</option>
              ))}
            </select>
          </div>
          <span className="text-xs text-muted-foreground">
            المعروض: <strong className="text-foreground">{displayedQuizzes.length}</strong> من أصل {quizzes.length} مسابقة
          </span>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
          {/* Main Contest Cards (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-extrabold text-xs text-muted-foreground uppercase tracking-wider mb-1">المسابقات المتاحة</h3>
            
            {displayedQuizzes.map((quiz) => (
              <div key={quiz.id} className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition">
                <div className="space-y-1.5 text-right flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-sm text-foreground">{quiz.title}</h4>
                    <span className="bg-success/15 text-success text-[9px] px-2 py-0.5 rounded-full font-bold">
                      ★ {quiz.points} نقطة
                    </span>
                  </div>

                  {/* Stage & Class Target Badges */}
                  <div className="flex items-center gap-2 flex-wrap text-[10px]">
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                      المرحلة: {quiz.target_stage || 'الكل'}
                    </span>
                    <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded font-semibold">
                      الفصل: {quiz.target_class || 'الكل'}
                    </span>
                    <span className="text-muted-foreground">
                      • {quiz.questions.length} أسئلة
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleStartSimulation(quiz)}
                  className="h-9 px-3 bg-muted hover:bg-primary/5 hover:text-primary hover:border-primary/20 text-muted-foreground font-bold rounded-lg border border-border text-xs flex items-center gap-1.5 transition shrink-0 cursor-pointer self-end sm:self-center"
                >
                  <Play className="h-3.5 w-3.5 fill-current text-primary" />
                  بدء الاختبار للطالب
                </button>
              </div>
            ))}

            {displayedQuizzes.length === 0 && (
              <div className="text-center py-12 bg-card border border-border rounded-xl text-muted-foreground text-xs">
                لا توجد مسابقات تطابق هذه المرحلة. اضغط على زر الإنشاء لإضافة مسابقة جديدة.
              </div>
            )}
          </div>

          {/* Quick Stats & Active Simulator Card (Right 1 col) */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-4">
              <h3 className="font-bold text-xs text-primary border-b border-border pb-1.5 flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                إحصائيات المسابقات الروحية
              </h3>
              <div className="space-y-2.5 text-xs text-muted-foreground">
                <p className="flex justify-between"><span>إجمالي عدد المسابقات:</span> <strong className="text-foreground">{quizzes.length} مسابقة</strong></p>
                <p className="flex justify-between"><span>إجمالي نقاط الجوائز:</span> <strong className="text-foreground">{quizzes.reduce((acc, q) => acc + q.points, 0)} نقطة</strong></p>
                <p className="flex justify-between"><span>متوسط عدد الأسئلة:</span> <strong className="text-foreground">{(quizzes.reduce((acc, q) => acc + q.questions.length, 0) / (quizzes.length || 1)).toFixed(1)} أسئلة</strong></p>
              </div>
            </div>

            {/* Active Simulation Box */}
            {activeQuiz && (
              <div className="bg-card border-2 border-primary/20 rounded-2xl p-5 shadow-lg space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-extrabold text-sm text-primary">محاكي اختبار الطلاب</h3>
                  <button onClick={() => setActiveQuiz(null)} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
                </div>
                <div className="space-y-1 border-b border-border pb-2 text-right">
                  <div className="text-xs font-bold text-foreground">
                    المسابقة: {activeQuiz.title}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    المستهدف: {activeQuiz.target_stage} ({activeQuiz.target_class})
                  </div>
                </div>

                {simulationStep === 'setup' && (
                  <div className="space-y-4 font-sans text-xs text-right">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">اختر الطالب لتسجيل النتيجة له (المتوافق مع مرحلة وفصل المسابقة):</label>
                      <select
                        value={selectedStudentId}
                        onChange={(e) => setSelectedStudentId(e.target.value)}
                        className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition font-bold"
                      >
                        {simulatorMatchingStudents.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.full_name} ({s.class_name} - {s.stage_name})
                          </option>
                        ))}
                      </select>
                      {simulatorMatchingStudents.length === 0 && (
                        <p className="text-[10px] text-destructive font-bold">لا يوجد طلاب مسجلين في هذا الفصل/المرحلة.</p>
                      )}
                    </div>
                    <button
                      onClick={() => setSimulationStep('running')}
                      disabled={!selectedStudentId}
                      className="w-full h-10 bg-primary disabled:bg-muted disabled:text-muted-foreground text-primary-foreground font-semibold rounded-lg text-xs flex items-center justify-center gap-2 hover:bg-primary/95 transition shadow-sm cursor-pointer"
                    >
                      بدء إدخال إجابات الطالب
                      <ChevronRight className="h-4 w-4 rotate-180" />
                    </button>
                  </div>
                )}

                {simulationStep === 'running' && (
                  <div className="space-y-5 font-sans text-xs text-right">
                    {activeQuiz.questions.map((q, idx) => (
                      <div key={q.id} className="space-y-2 border-b border-border/50 pb-3 last:border-0 last:pb-0">
                        <p className="font-bold text-foreground">{idx + 1}. {q.text}</p>
                        <div className="grid grid-cols-2 gap-2">
                          {q.options.map((opt) => {
                            const isSelected = answers[q.id] === opt
                            return (
                              <button
                                key={opt}
                                onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                                className={`p-2 rounded-lg text-[10px] text-right font-semibold transition border cursor-pointer ${
                                  isSelected
                                    ? 'bg-primary/10 border-primary text-primary'
                                    : 'bg-muted/30 border-border hover:bg-muted/50'
                                }`}
                              >
                                {opt}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={handleSubmitSimulation}
                      className="w-full h-10 bg-success text-success-foreground font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 hover:bg-success/90 transition shadow-sm cursor-pointer"
                    >
                      حساب النتيجة ورصد النقاط
                    </button>
                  </div>
                )}

                {simulationStep === 'results' && (
                  <div className="space-y-4 font-sans text-xs text-center py-2">
                    <Award className="h-12 w-12 text-primary mx-auto" />
                    <div className="space-y-1">
                      <p className="font-bold text-foreground">تم إتمام محاكاة المسابقة بنجاح!</p>
                      <p className="text-xs text-muted-foreground">الطالب: {students.find(s => s.id === selectedStudentId)?.full_name}</p>
                    </div>

                    <div className="bg-muted/30 p-3 rounded-lg border border-border text-xs leading-normal space-y-1.5 text-right">
                      <p className="flex justify-between">
                        <span>الأسئلة الصحيحة:</span>
                        <strong className="text-success font-bold">
                          {activeQuiz.questions.filter(q => answers[q.id] === q.answer).length} من أصل {activeQuiz.questions.length}
                        </strong>
                      </p>
                      <p className="flex justify-between">
                        <span>النقاط المستحقة:</span>
                        <strong className="text-success font-extrabold">+{scoreEarned} نقطة من أصل {activeQuiz.points}</strong>
                      </p>
                    </div>

                    {saveSuccess ? (
                      <div className="p-3 bg-success/10 border border-success text-success text-[10px] font-bold rounded-lg flex items-center justify-center gap-1.5 animate-bounce">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>تم رصد وحفظ النقاط في حساب الطالب!</span>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveSimulationResults}
                          className="flex-1 h-9 bg-primary text-primary-foreground font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 hover:bg-primary/95 transition shadow-sm cursor-pointer"
                        >
                          <Save className="h-4 w-4" />
                          حفظ ورصد النقاط
                        </button>
                        <button
                          onClick={() => setSimulationStep('running')}
                          className="h-9 px-3 border border-border hover:bg-muted text-muted-foreground font-semibold rounded-lg text-xs transition cursor-pointer"
                        >
                          تعديل
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CREATE QUIZ MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-border w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh] font-sans">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/10">
              <h3 className="font-bold text-sm text-foreground">إنشاء مسابقة دينية جديدة</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-muted-foreground hover:text-foreground text-lg">✕</button>
            </div>

            <form onSubmit={handleSaveQuiz} className="p-6 overflow-y-auto space-y-4 text-xs flex-1 text-right" dir="rtl">
              {/* Row 1: Title & Points */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <label className="font-semibold text-foreground">عنوان المسابقة</label>
                  <input
                    type="text" required placeholder="مثال: مسابقة شهر كيهك وعقيدة الخلاص..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition text-right"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">إجمالي نقاط المسابقة</label>
                  <input
                    type="number" required min="5" max="100"
                    value={newPoints}
                    onChange={(e) => setNewPoints(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition font-bold text-center"
                  />
                </div>
              </div>

              {/* Row 2: Target Stage & Target Class */}
              <div className="grid grid-cols-2 gap-4 bg-muted/20 p-3.5 rounded-xl border border-border">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">المرحلة المستهدفة للمسابقة:</label>
                  <select
                    value={newStage}
                    onChange={(e) => {
                      setNewStage(e.target.value)
                      setNewClass('الكل')
                    }}
                    className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition font-bold text-center"
                  >
                    <option value="الكل">جميع المراحل (الكل)</option>
                    {stagesList.map(stg => (
                      <option key={stg} value={stg}>{stg}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">الفصل المستهدف (اختياري):</label>
                  <select
                    value={newClass}
                    onChange={(e) => setNewClass(e.target.value)}
                    className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition font-bold text-center"
                  >
                    <option value="الكل">جميع فصول المرحلة (الكل)</option>
                    {classesForNewQuiz.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic Questions List */}
              <div className="space-y-4 border-t border-border pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-primary">قائمة أسئلة المسابقة</span>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="py-1 px-2.5 bg-muted text-foreground border border-border hover:bg-muted/70 font-semibold rounded text-[10px] flex items-center gap-1 transition cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    إضافة سؤال
                  </button>
                </div>

                {newQuestions.map((q, idx) => (
                  <div key={q.id} className="p-4 bg-muted/20 border border-border rounded-xl space-y-3 relative text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(idx)}
                      className="absolute top-3 left-3 text-destructive hover:underline text-[10px] cursor-pointer"
                      disabled={newQuestions.length === 1}
                    >
                      حذف
                    </button>
                    <div className="space-y-1.5 w-11/12">
                      <label className="font-semibold text-foreground">السؤال رقم {idx + 1}</label>
                      <input
                        type="text" required placeholder="اكتب نص السؤال هنا..."
                        value={q.text}
                        onChange={(e) => handleUpdateQuestion(idx, 'text', e.target.value)}
                        className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition text-right"
                      />
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="space-y-1">
                          <span className="text-[9px] text-muted-foreground">الاختيار {optIdx + 1}</span>
                          <input
                            type="text" required placeholder={`الاختيار ${optIdx + 1}`}
                            value={opt}
                            onChange={(e) => handleUpdateQuestion(idx, 'option', e.target.value, optIdx)}
                            className="w-full bg-card border border-border rounded-lg px-3.5 py-1.5 text-xs outline-none focus:border-primary/50 transition text-right"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Correct Answer */}
                    <div className="space-y-1.5">
                      <label className="font-semibold text-success">الاختيار الصحيح (الإجابة النموذجية)</label>
                      <select
                        value={q.answer}
                        onChange={(e) => handleUpdateQuestion(idx, 'answer', e.target.value)}
                        className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition font-bold text-center"
                      >
                        <option value="">-- اختر الإجابة الصحيحة --</option>
                        {q.options.filter(o => o.trim() !== '').map((o, oIdx) => (
                          <option key={oIdx} value={o}>{o}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Toolbar */}
              <div className="flex justify-end gap-2 border-t border-border pt-4 mt-4">
                <button
                  type="submit"
                  className="h-10 px-5 bg-primary text-primary-foreground font-semibold rounded-lg text-xs flex items-center gap-1.5 hover:bg-primary/95 shadow transition cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  حفظ المسابقة
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
    </Shell>
  )
}