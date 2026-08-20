'use client'

import React, { useState, useEffect } from 'react'
import { getStudents, StudentItem } from '@/lib/services/studentsService'
import {
  BookOpen,
  Award,
  ChevronRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Play,
  ArrowRight,
  TrendingUp,
  User,
  Star,
  Check
} from 'lucide-react'
import Link from 'next/link'

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

export default function StudentQuizzesPage() {
  const [students, setStudents] = useState<StudentItem[]>([])
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

  // Session state
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null)
  const [studentPoints, setStudentPoints] = useState(100)
  
  // Filtering students for login
  const [loginStage, setLoginStage] = useState('الكل')
  const [loginClass, setLoginClass] = useState('الكل')
  const [loginStudentId, setLoginStudentId] = useState('')

  // Quiz progression
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null)
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [quizFinished, setQuizFinished] = useState(false)
  const [quizScore, setQuizScore] = useState(0)

  // Tracking solved quizzes per student
  const [solvedQuizzesRecord, setSolvedQuizzesRecord] = useState<Record<string, { score: number, earned: number }>>({})

  useEffect(() => {
    async function loadStudents() {
      const all = await getStudents()
      setStudents(all)
    }
    loadStudents()

    // Load custom quizzes if any
    const savedQuizzes = localStorage.getItem('ssms-custom-quizzes')
    if (savedQuizzes) {
      setQuizzes(JSON.parse(savedQuizzes))
    }
  }, [])

  // Sync solved records and current points when student changes
  useEffect(() => {
    if (selectedStudent) {
      const pointsVal = parseInt(localStorage.getItem(`ssms-student-points-${selectedStudent.id}`) || selectedStudent.points_balance.toString())
      setStudentPoints(pointsVal)

      const savedSolved = localStorage.getItem(`ssms-student-solved-quizzes-${selectedStudent.id}`)
      if (savedSolved) {
        setSolvedQuizzesRecord(JSON.parse(savedSolved))
      } else {
        setSolvedQuizzesRecord({})
      }
    }
  }, [selectedStudent])

  const stages = Array.from(new Set(students.map(s => s.stage_name)))
  const classes = Array.from(new Set(students.filter(s => loginStage === 'الكل' || s.stage_name === loginStage).map(s => s.class_name)))

  const filteredStudents = students.filter(s => {
    return (loginStage === 'الكل' || s.stage_name === loginStage) &&
           (loginClass === 'الكل' || s.class_name === loginClass)
  })

  const handleStudentLogin = () => {
    const s = students.find(item => item.id === loginStudentId)
    if (s) {
      setSelectedStudent(s)
    }
  }

  const handleStartQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz)
    setCurrentQuestionIdx(0)
    setSelectedAnswer('')
    setAnswers({})
    setQuizFinished(false)
  }

  const handleNextQuestion = () => {
    if (!activeQuiz) return
    const currentQ = activeQuiz.questions[currentQuestionIdx]
    const updatedAnswers = { ...answers, [currentQ.id]: selectedAnswer }
    setAnswers(updatedAnswers)

    if (currentQuestionIdx < activeQuiz.questions.length - 1) {
      const nextQ = activeQuiz.questions[currentQuestionIdx + 1]
      setCurrentQuestionIdx(prev => prev + 1)
      setSelectedAnswer(updatedAnswers[nextQ.id] || '')
    } else {
      // Calculate results
      let correctCount = 0
      activeQuiz.questions.forEach(q => {
        if (updatedAnswers[q.id] === q.answer) {
          correctCount++
        }
      })

      const earnedPoints = Math.round((correctCount / activeQuiz.questions.length) * activeQuiz.points)
      const scorePercent = Math.round((correctCount / activeQuiz.questions.length) * 100)
      
      setQuizScore(scorePercent)

      // Award points & write logs to localStorage
      if (selectedStudent) {
        // 1. Save new points balance
        const updatedBalance = studentPoints + earnedPoints
        setStudentPoints(updatedBalance)
        localStorage.setItem(`ssms-student-points-${selectedStudent.id}`, updatedBalance.toString())

        // 2. Log timeline event
        const newEvent = {
          id: `t-quiz-student-${Date.now()}`,
          type: 'points' as const,
          title_ar: `إتمام مسابقة شخصية: ${activeQuiz.title}`,
          title_en: `Solved Quiz: ${activeQuiz.title}`,
          description_ar: `قام المخدوم بحل المسابقة بنفسه وحصل على +${earnedPoints} نقطة. النسبة: ${scorePercent}% (${correctCount} من ${activeQuiz.questions.length} إجابات صحيحة).`,
          description_en: `Student self-solved quiz and earned +${earnedPoints} points. Score: ${scorePercent}%`,
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          servant_name: 'بوابة المخدوم التفاعلية',
          points_change: earnedPoints
        }

        const existingTimeline = JSON.parse(localStorage.getItem(`ssms-student-timeline-${selectedStudent.id}`) || '[]')
        localStorage.setItem(`ssms-student-timeline-${selectedStudent.id}`, JSON.stringify([newEvent, ...existingTimeline]))

        // 3. Mark quiz as solved for this student
        const newSolvedRecords = {
          ...solvedQuizzesRecord,
          [activeQuiz.id]: { score: scorePercent, earned: earnedPoints }
        }
        setSolvedQuizzesRecord(newSolvedRecords)
        localStorage.setItem(`ssms-student-solved-quizzes-${selectedStudent.id}`, JSON.stringify(newSolvedRecords))
      }

      setQuizFinished(true)
    }
  }

  const handleBackToDashboard = () => {
    setActiveQuiz(null)
    setQuizFinished(false)
  }

  // Filter quizzes according to the student's assigned stage & class
  const studentVisibleQuizzes = selectedStudent ? quizzes.filter(q => {
    const matchStage = q.target_stage === 'الكل' || q.target_stage === selectedStudent.stage_name
    const matchClass = q.target_class === 'الكل' || q.target_class === selectedStudent.class_name
    return matchStage && matchClass
  }) : []

  return (
    <div className="min-h-screen bg-muted/30 font-sans flex flex-col" dir="rtl">
      {/* Coptic top banner */}
      <header className="bg-primary text-primary-foreground py-4 px-6 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          <h1 className="font-extrabold text-sm md:text-base">بوابة مسابقات الكتاب المقدس التفاعلية (للطالب)</h1>
        </div>
        {selectedStudent && (
          <button
            onClick={() => setSelectedStudent(null)}
            className="text-xs bg-primary-foreground/15 hover:bg-primary-foreground/25 px-3 py-1 rounded transition cursor-pointer"
          >
            تسجيل خروج ({selectedStudent.first_name})
          </button>
        )}
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto p-4 md:p-6 flex flex-col justify-center">
        {/* LOGIN SCREEN */}
        {!selectedStudent && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg space-y-6 animate-in fade-in">
            <div className="text-center space-y-2">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto text-xl font-bold">
                ☦
              </div>
              <h2 className="text-xl font-extrabold text-foreground">مرحباً بك في اختبارات مدارس الأحد التفاعلية</h2>
              <p className="text-xs text-muted-foreground">اختر فصلك الدراسي واسمك للبدء في حل المسابقات وتجميع النقاط!</p>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 text-right">
                  <label className="font-bold text-muted-foreground">اختر المرحلة:</label>
                  <select
                    value={loginStage}
                    onChange={(e) => { setLoginStage(e.target.value); setLoginClass('الكل'); setLoginStudentId(''); }}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 text-xs outline-none focus:border-primary/50 transition font-bold"
                  >
                    <option value="الكل">كل المراحل</option>
                    {stages.map(stg => (
                      <option key={stg} value={stg}>{stg}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 text-right">
                  <label className="font-bold text-muted-foreground">اختر الفصل:</label>
                  <select
                    value={loginClass}
                    onChange={(e) => { setLoginClass(e.target.value); setLoginStudentId(''); }}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 text-xs outline-none focus:border-primary/50 transition font-bold"
                  >
                    <option value="الكل">كل الفصول</option>
                    {classes.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1 text-right">
                <label className="font-bold text-muted-foreground">اسم المخدوم (أنت):</label>
                <select
                  value={loginStudentId}
                  onChange={(e) => setLoginStudentId(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 text-xs outline-none focus:border-primary/50 transition font-bold text-right"
                >
                  <option value="">-- اختر اسمك للبدء --</option>
                  {filteredStudents.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.full_name} ({s.class_name})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleStudentLogin}
                disabled={!loginStudentId}
                className="w-full h-11 bg-primary disabled:bg-muted disabled:text-muted-foreground text-primary-foreground font-semibold rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-primary/95 transition shadow-sm cursor-pointer"
              >
                دخول إلى لوحة الاختبارات
                <ChevronRight className="h-4 w-4 rotate-180" />
              </button>
            </div>
          </div>
        )}

        {/* STUDENT DASHBOARD SCREEN */}
        {selectedStudent && !activeQuiz && (
          <div className="space-y-6 animate-in fade-in">
            {/* Student Info Card */}
            <div className="bg-gradient-to-l from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-5 shadow-sm flex justify-between items-center">
              <div className="space-y-1">
                <span className="text-[10px] text-primary font-bold uppercase tracking-wider">لوحة الطالب</span>
                <h2 className="text-lg font-extrabold text-foreground">أهلاً بك يا بطل، {selectedStudent.first_name}! 🌟</h2>
                <p className="text-xs text-muted-foreground">الفصل: {selectedStudent.class_name} • مرحلة: {selectedStudent.stage_name}</p>
              </div>

              <div className="bg-card border border-border px-4 py-2 rounded-xl text-center shadow-sm">
                <span className="text-[9px] text-muted-foreground block">رصيد نقاطك الحالي</span>
                <span className="text-base font-extrabold text-success mt-0.5 block flex items-center justify-center gap-1">
                  ★ {studentPoints} نقطة
                </span>
              </div>
            </div>

            {/* List of Available Quizzes for Student's Stage and Class */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-xs text-muted-foreground uppercase tracking-wider mr-1">
                المسابقات الروحية المقررة لفصلك ومرحلتك
              </h3>
              
              {studentVisibleQuizzes.map((quiz) => {
                const solvedRecord = solvedQuizzesRecord[quiz.id]
                const isSolved = !!solvedRecord

                return (
                  <div
                    key={quiz.id}
                    className={`bg-card border rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition ${
                      isSolved ? 'border-success/20 bg-success/[0.01]' : 'border-border hover:shadow-md'
                    }`}
                  >
                    <div className="space-y-1 text-right flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-xs md:text-sm text-foreground">{quiz.title}</h4>
                        <span className="bg-primary/15 text-primary text-[9px] px-2 py-0.5 rounded-full font-bold">
                          ★ {quiz.points} نقطة
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground flex-wrap">
                        <span className="bg-muted px-2 py-0.5 rounded font-semibold text-foreground">
                          المستهدف: {quiz.target_stage} ({quiz.target_class})
                        </span>
                        <span>• عدد الأسئلة: {quiz.questions.length} أسئلة</span>
                      </div>
                    </div>

                    {isSolved ? (
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <span className="text-[10px] text-success bg-success/15 font-bold px-3 py-1 rounded-full flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          تم الحل بنجاح ({solvedRecord.score}%)
                        </span>
                        <span className="text-[10px] text-muted-foreground font-semibold">
                          ربحت: +{solvedRecord.earned} نقطة
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartQuiz(quiz)}
                        className="h-9 px-4 bg-success text-success-foreground font-bold rounded-lg text-xs flex items-center gap-1.5 hover:bg-success/90 transition shadow-sm self-end sm:self-center cursor-pointer"
                      >
                        <Play className="h-3.5 w-3.5 fill-current rotate-180" />
                        ابدأ حل المسابقة الآن
                      </button>
                    )}
                  </div>
                )
              })}

              {studentVisibleQuizzes.length === 0 && (
                <div className="text-center py-12 bg-card border border-border rounded-2xl text-muted-foreground text-xs">
                  لا توجد مسابقات مخصصة لفصلك ({selectedStudent.class_name}) حالياً.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ACTIVE QUIZ SCREEN */}
        {selectedStudent && activeQuiz && !quizFinished && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg space-y-6 animate-in fade-in">
            {/* Header info */}
            <div className="flex justify-between items-center border-b border-border pb-3">
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-foreground">{activeQuiz.title}</h3>
                <p className="text-[10px] text-muted-foreground">
                  السؤال {currentQuestionIdx + 1} من أصل {activeQuiz.questions.length}
                </p>
              </div>
              <button
                onClick={handleBackToDashboard}
                className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                إلغاء والعودة ✕
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${((currentQuestionIdx + 1) / activeQuiz.questions.length) * 100}%` }}
              />
            </div>

            {/* Question Text */}
            <div className="space-y-4 font-sans text-xs">
              <h4 className="text-sm font-extrabold text-foreground leading-relaxed">
                {activeQuiz.questions[currentQuestionIdx].text}
              </h4>

              {/* Radio Choices */}
              <div className="grid grid-cols-1 gap-2">
                {activeQuiz.questions[currentQuestionIdx].options.map((opt) => {
                  const isChecked = selectedAnswer === opt
                  return (
                    <button
                      key={opt}
                      onClick={() => setSelectedAnswer(opt)}
                      className={`p-3.5 rounded-xl text-right font-bold transition-all border text-xs flex items-center justify-between cursor-pointer ${
                        isChecked
                          ? 'bg-primary/10 border-primary text-primary shadow-sm'
                          : 'bg-muted/20 border-border hover:bg-muted/40 text-foreground'
                      }`}
                    >
                      <span>{opt}</span>
                      {isChecked && <Star className="h-4 w-4 fill-current text-primary" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <button
                onClick={handleNextQuestion}
                disabled={!selectedAnswer}
                className="h-10 px-6 bg-primary disabled:bg-muted disabled:text-muted-foreground text-primary-foreground font-semibold rounded-lg text-xs flex items-center gap-1.5 hover:bg-primary/95 transition cursor-pointer"
              >
                <span>{currentQuestionIdx === activeQuiz.questions.length - 1 ? 'إنهاء وحساب الدرجة' : 'السؤال التالي'}</span>
                <ChevronRight className="h-4 w-4 rotate-180" />
              </button>
            </div>
          </div>
        )}

        {/* QUIZ RESULTS FINISHED SCREEN */}
        {selectedStudent && activeQuiz && quizFinished && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg space-y-6 text-center animate-in fade-in">
            <Award className="h-16 w-16 text-success mx-auto animate-bounce" />
            
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-foreground">تهانينا الحارة يا {selectedStudent.first_name}! 🎉</h2>
              <p className="text-xs text-muted-foreground">لقد قمت بحل مسابقة: {activeQuiz.title} بنجاح.</p>
            </div>

            <div className="bg-muted/40 p-4 rounded-xl border border-border/80 max-w-xs mx-auto space-y-2 text-right text-xs">
              <p className="flex justify-between">
                <span>نسبة إجاباتك الصحيحة:</span>
                <strong className="text-success font-extrabold text-sm">{quizScore}%</strong>
              </p>
              <p className="flex justify-between">
                <span>إجمالي النقاط المضافة لحسابك:</span>
                <strong className="text-success font-extrabold text-sm">
                  +{solvedQuizzesRecord[activeQuiz.id]?.earned || 0} نقطة
                </strong>
              </p>
              <p className="flex justify-between border-t border-border/60 pt-2 mt-1">
                <span>رصيدك الإجمالي الجديد:</span>
                <strong className="text-primary font-extrabold text-sm">{studentPoints} نقطة ★</strong>
              </p>
            </div>

            <button
              onClick={handleBackToDashboard}
              className="h-10 px-6 bg-primary text-primary-foreground font-semibold rounded-lg text-xs hover:bg-primary/95 transition shadow cursor-pointer mx-auto"
            >
              العودة للوحة المسابقات الكبرى
            </button>
          </div>
        )}
      </main>

      <footer className="py-4 text-center text-[10px] text-muted-foreground border-t border-border mt-auto">
        تطبيق إدارة مدارس الأحد كنيسة مارمينا • بوابة الطالب التفاعلية الآمنة
      </footer>
    </div>
  )
}