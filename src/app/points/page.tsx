'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Shell } from '@/components/layout/Shell'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { Award, ShoppingCart, ListOrdered, Settings, Plus, Sparkles, Check, CheckSquare, Square, Trash2 } from 'lucide-react'

export default function PointsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-xs text-muted-foreground font-sans">جاري تحميل النقاط والجوائز...</div>}>
      <PointsPageContent />
    </Suspense>
  )
}

function PointsPageContent() {
  const { locale } = useLanguage()
  const [activeTab, setActiveTab] = useState<'store' | 'rankings' | 'award' | 'rules'>('store')

  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam as 'store' | 'rankings' | 'award' | 'rules')
    }
  }, [tabParam])

  // Mock Rewards Store Catalog
  const [rewards, setRewards] = useState([
    { id: 'r1', name: 'علبة ألوان مائية فاخرة', cost: 100, stock: 12, image: '🎨' },
    { id: 'r2', name: 'لعبة بنك الحظ اللوحية', cost: 150, stock: 5, image: '🎲' },
    { id: 'r3', name: 'كتاب سير القديسين للأطفال', cost: 75, stock: 20, image: '📚' },
    { id: 'r4', name: 'كرة قدم ماركة ميكاسا', cost: 250, stock: 3, image: '⚽' }
  ])

  // Mock Student Rankings Leaderboard (Stateful to show dynamic updates)
  const [leaderboard, setLeaderboard] = useState([
    { id: 's1', rank: 1, name: 'مارينا رأفت عياد', class: 'القديسة دميانة', points: 240 },
    { id: 's2', rank: 2, name: 'كيرلس جرجس حبيب', class: 'الأنبا بيشوي', points: 185 },
    { id: 's3', rank: 3, name: 'يوحنا سامح توفيق', class: 'الأنبا بيشوي', points: 95 },
    { id: 's4', rank: 4, name: 'مريم شريف فوزي', class: 'العذراء مريم', points: 60 }
  ])

  // Mock Points Accrual Rules
  const pointsRules = [
    { id: 'pr1', name_ar: 'حضور اجتماع مدارس الأحد الأساسي', points: 20 },
    { id: 'pr2', name_ar: 'حضور القداس الإلهي والتناول', points: 30 },
    { id: 'pr3', name_ar: 'حفظ آية الإنجيل وتسميعها', points: 15 },
    { id: 'pr4', name_ar: 'حفظ لحن التسبحة الكنسي', points: 25 },
    { id: 'pr5', name_ar: 'المشاركة الفعالة في الأنشطة', points: 10 }
  ]

  // Award Wizard State
  const [selectedClass, setSelectedClass] = useState('الأنبا بيشوي')
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]) // array of student ids
  const [selectedRule, setSelectedRule] = useState('pr3') // default to saving verse
  const [customPoints, setCustomPoints] = useState('15')
  const [customReason, setCustomReason] = useState('')
  const [awardSuccess, setAwardSuccess] = useState(false)

  // Students in selected class mock helper
  const classStudents = [
    { id: 's2', name: 'كيرلس جرجس حبيب' },
    { id: 's3', name: 'يوحنا سامح توفيق' },
    { id: 's5', name: 'مينا عماد نصيف' }
  ]

  const handleSelectStudent = (id: string) => {
    setSelectedStudents(prev =>
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    )
  }

  const handleSelectAllStudents = () => {
    if (selectedStudents.length === classStudents.length) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(classStudents.map(s => s.id))
    }
  }

  const handleAwardPoints = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedStudents.length === 0) return

    // Determine points amount
    let pts = parseInt(customPoints, 10) || 0
    const ruleObj = pointsRules.find(r => r.id === selectedRule)
    if (selectedRule !== 'custom' && ruleObj) {
      pts = ruleObj.points
    }

    // Update points in leaderboard state
    setLeaderboard((prev) => {
      const updated = prev.map((student) => {
        if (selectedStudents.includes(student.id)) {
          return {
            ...student,
            points: student.points + pts
          }
        }
        return student
      })

      // Re-sort leaderboard descending by points and re-assign ranks
      return updated
        .sort((a, b) => b.points - a.points)
        .map((item, index) => ({
          ...item,
          rank: index + 1
        }))
    })

    setAwardSuccess(true)
    setTimeout(() => {
      setAwardSuccess(false)
      setSelectedStudents([])
      setCustomReason('')
      setActiveTab('rankings') // switch to rankings tab so they see results
    }, 2000)
  }

  const handleRedeemGift = (rewardId: string, cost: number) => {
    alert(`تم استبدال الهدية بنجاح! خصم ${cost} نقطة من رصيد الطالب.`)
    // Deducts from target student (e.g. St. Marina)
    setLeaderboard(prev =>
      prev.map(s => s.id === 's1' ? { ...s, points: Math.max(0, s.points - cost) } : s)
        .sort((a, b) => b.points - a.points)
        .map((s, idx) => ({ ...s, rank: idx + 1 }))
    )
  }

  return (
    <Shell>
      <div className="space-y-6 font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">نقاط ومكافآت المخدومين</h1>
            <p className="text-sm text-muted-foreground mt-1">
              تحفيز المخدومين عبر رصد النقاط واستبدال الهدايا والمكافآت العينية.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('award')}
            className="h-10 px-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm flex items-center gap-2 shadow hover:bg-primary/95 transition self-start"
          >
            <Plus className="h-4 w-4" />
            <span>رصد نقاط جديدة للمخدومين</span>
          </button>
        </div>

        {/* Navigation tabs */}
        <div className="flex border-b border-border gap-4 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('store')}
            className={`py-2 px-3 text-xs md:text-sm font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'store' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            متجر المكافآت (الهدايا)
          </button>
          
          <button
            onClick={() => setActiveTab('award')}
            className={`py-2 px-3 text-xs md:text-sm font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'award' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Plus className="h-4 w-4 text-success" />
            رصد وحوافز النقاط
          </button>

          <button
            onClick={() => setActiveTab('rankings')}
            className={`py-2 px-3 text-xs md:text-sm font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'rankings' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <ListOrdered className="h-4 w-4" />
            جدول المتصدرين والأعلى نقاطاً
          </button>
          
          <button
            onClick={() => setActiveTab('rules')}
            className={`py-2 px-3 text-xs md:text-sm font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'rules' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Settings className="h-4 w-4" />
            قواعد احتساب النقاط
          </button>
        </div>

        {/* Tab 1: Rewards Catalog Store */}
        {activeTab === 'store' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="h-28 bg-muted/40 rounded-lg flex items-center justify-center text-4xl border border-border/40 select-none">
                    {reward.image}
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-foreground">{reward.name}</h4>
                    <p className="text-[10px] text-muted-foreground">الكمية المتاحة بالخزنة: {reward.stock} قطع</p>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-border mt-4 pt-3">
                  <span className="text-sm font-extrabold text-primary">{reward.cost} نقطة</span>
                  <button
                    onClick={() => handleRedeemGift(reward.id, reward.cost)}
                    className="h-8 px-3 bg-primary text-primary-foreground hover:bg-primary/95 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                  >
                    استبدال
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Award Points Wizard */}
        {activeTab === 'award' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
            {/* Left 2 cols: Student selectors list */}
            <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 md:p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <h3 className="font-bold text-sm text-foreground">تحديد طلاب فصل: {selectedClass}</h3>
                <button
                  onClick={handleSelectAllStudents}
                  className="text-xs text-primary hover:underline font-semibold"
                >
                  {selectedStudents.length === classStudents.length ? 'إلغاء تحديد الكل' : 'تحديد كل طلاب الفصل'}
                </button>
              </div>

              <div className="space-y-2.5">
                {classStudents.map((s) => {
                  const isChecked = selectedStudents.includes(s.id)
                  return (
                    <div
                      key={s.id}
                      onClick={() => handleSelectStudent(s.id)}
                      className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition select-none ${
                        isChecked ? 'border-success bg-success/5' : 'border-border hover:bg-muted/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isChecked ? (
                          <CheckSquare className="h-4.5 w-4.5 text-success shrink-0" />
                        ) : (
                          <Square className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
                        )}
                        <span className="text-xs font-bold text-foreground">{s.name}</span>
                      </div>
                      
                      <span className="text-[10px] text-muted-foreground">كود: 30{s.id.replace('s', '')}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right col: points configurations & submit form */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-5 h-fit">
              <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-wider border-b border-border pb-2">تفاصيل الحافز والتحفيز</h3>

              <form onSubmit={handleAwardPoints} className="space-y-4">
                {/* Predefined Rules */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">النشاط أو البند المستحق</label>
                  <select
                    value={selectedRule}
                    onChange={(e) => setSelectedRule(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition"
                  >
                    {pointsRules.map((rule) => (
                      <option key={rule.id} value={rule.id}>
                        {rule.name_ar} (+{rule.points} نقطة)
                      </option>
                    ))}
                    <option value="custom">بند / نقاط مخصصة...</option>
                  </select>
                </div>

                {/* Custom Points amount */}
                {selectedRule === 'custom' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">عدد النقاط المستحقة</label>
                    <input
                      type="number" required min="1"
                      value={customPoints} onChange={(e) => setCustomPoints(e.target.value)}
                      className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition"
                    />
                  </div>
                )}

                {/* Custom description text */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">ملاحظات إضافية (اختياري)</label>
                  <textarea
                    placeholder="مثال: التميز في الحفظ السريع للآية..."
                    value={customReason} onChange={(e) => setCustomReason(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition h-20 resize-none"
                  />
                </div>

                {awardSuccess && (
                  <div className="p-3 bg-success/15 border border-success text-success text-[11px] font-bold rounded-lg flex items-center gap-1.5">
                    <Check className="h-4.5 w-4.5" />
                    <span>تم رصد وإضافة النقاط بنجاح! جاري التحديث...</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={selectedStudents.length === 0}
                  className="w-full h-10 bg-primary hover:bg-primary/95 text-primary-foreground disabled:bg-muted disabled:text-muted-foreground font-semibold rounded-lg text-xs shadow transition flex items-center justify-center gap-1.5"
                >
                  رصد النقاط لـ ({selectedStudents.length}) طلاب
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 3: Rankings Leaderboard */}
        {activeTab === 'rankings' && (
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-bold text-sm">ترتيب مخدومي مدارس الأحد</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm border-collapse">
                <thead className="bg-muted/40 text-muted-foreground text-xs font-semibold border-b border-border">
                  <tr>
                    <th className="px-4 py-3 w-16 text-center">المركز</th>
                    <th className="px-4 py-3">اسم المخدوم</th>
                    <th className="px-4 py-3">الفصل</th>
                    <th className="px-4 py-3 w-28 text-left">الرصيد الكلي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {leaderboard.map((student) => (
                    <tr key={student.id} className="hover:bg-muted/20 transition duration-150">
                      <td className="px-4 py-3.5 text-center font-bold text-primary">#{student.rank}</td>
                      <td className="px-4 py-3.5 font-bold text-foreground">{student.name}</td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">{student.class}</td>
                      <td className="px-4 py-3.5 text-left font-extrabold text-success">{student.points} نقطة</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Configuration Rules */}
        {activeTab === 'rules' && (
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h3 className="font-bold text-sm">قواعد احتساب وحوافز النقاط التلقائية</h3>
              <button className="h-8 px-3 bg-primary text-primary-foreground font-semibold rounded-lg text-xs flex items-center gap-1 hover:bg-primary/95 transition">
                <Plus className="h-3.5 w-3.5" />
                إضافة قاعدة جديدة
              </button>
            </div>

            <div className="divide-y divide-border">
              {pointsRules.map((rule) => (
                <div key={rule.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition">
                  <h4 className="font-bold text-xs text-foreground">{rule.name_ar}</h4>
                  <span className="text-sm font-bold text-success">+{rule.points} نقطة</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Shell>
  )
}
