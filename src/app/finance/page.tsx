'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Shell } from '@/components/layout/Shell'
import { EmptyState } from '@/components/layout/EmptyState'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { useAuth } from '@/lib/auth/AuthContext'
import { DollarSign, ArrowUpRight, ArrowDownRight, Plus, FileText, FileSpreadsheet, Calendar, Search, X, Save, Check, Coins, UserCheck, Edit2 } from 'lucide-react'

export default function FinancePage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-xs text-muted-foreground font-sans">جاري تحميل الحسابات والمالية...</div>}>
      <FinancePageContent />
    </Suspense>
  )
}

function FinancePageContent() {
  const handleSaveTxToMysql = async (txData: any) => {
    try {
      const isXampp = typeof window !== 'undefined' && window.location.pathname.includes('/stmina')
      const apiUrl = isXampp ? '/stmina/api/finance.php' : '/api/finance.php'
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(txData)
      })
      if (res.ok) {
        await loadLiveFinance()
      }
    } catch (e) {
      console.error(e)
    }
  }
  const { locale } = useLanguage()
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'budget' | 'tithes' | 'settings'>('budget')

  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam as 'budget' | 'tithes' | 'settings')
    }
  }, [tabParam])
  const [selectedTitheMonth, setSelectedTitheMonth] = useState<number>(8) // Defaults to August

  // Stateful Transactions list with dedicated stage treasury (general, kindergarten, elementary, middle, high)
    const [transactions, setTransactions] = useState<any[]>([])
  const [financeLoading, setFinanceLoading] = useState(true)

  const loadLiveFinance = async () => {
    try {
      setFinanceLoading(true)
      const isXampp = typeof window !== 'undefined' && window.location.pathname.includes('/stmina')
      const apiUrl = isXampp ? '/stmina/api/finance.php' : '/api/finance.php'
      const res = await fetch(apiUrl)
      if (res.ok) {
        const data = await res.json()
        if (data && Array.isArray(data.transactions)) {
          setTransactions(data.transactions.map((t: any) => ({
            id: t.id,
            date: t.tx_date,
            type: t.type,
            amount: Number(t.amount),
            description: t.description || 'معاملة مالية',
            category: t.category || 'عام',
            treasury: 'general',
            recorded_by: t.recorded_by || 'أمين الصندوق'
          })))
        }
      }
    } catch (e) {
      console.error('Error loading finance:', e)
    } finally {
      setFinanceLoading(false)
    }
  }

  useEffect(() => {
    loadLiveFinance()
  }, [])


  // Mock Active Servants for Tithes registry (binds to servants db logic)
  const activeServants = [
    { id: 'srv1', name: 'مينا كمال غبريال', role: 'أمين فصل' },
    { id: 'srv2', name: 'يوستينا عادل فوزي', role: 'خادم' },
    { id: 'srv3', name: 'تامر شفيق عزمي', role: 'أمين المرحلة' }
  ]

  // Servants Target Default Tithes configuration state (Item 54)
  const [defaultTargets, setDefaultTargets] = useState<Record<string, string>>({
    srv1: '200',
    srv2: '150',
    srv3: '300'
  })

  // Servants Tithes record states (pre-populated with default targets)
  const [tithesRecords, setTithesRecords] = useState<Record<string, { amount: string; paid: boolean }>>({
    srv1: { amount: '200', paid: false },
    srv2: { amount: '150', paid: false },
    srv3: { amount: '300', paid: false }
  })

  const { profile } = useAuth()
  const currentServantId = profile?.id || 'srv1' // default for dev preview

  // Form Panel visibility state
  const [showForm, setShowForm] = useState(false)
  const [formSuccess, setFormSuccess] = useState(false)

  // Target Editor Modal visibility state
  const [showTargetModal, setShowTargetModal] = useState(false)
  const [targetSaveSuccess, setTargetSaveSuccess] = useState(false)

  // Treasury Assignment & Delegation Config Modal states (Item 58)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [configTargetId, setConfigTargetId] = useState('')
  const [configLabel, setConfigLabel] = useState('')
  const [configScope, setConfigScope] = useState<'general' | 'stage' | 'class'>('stage')
  const [configScopeName, setConfigScopeName] = useState('')
  const [configViewers, setConfigViewers] = useState<string[]>([])
  const [configPayers, setConfigPayers] = useState<string[]>([])
  const [configSaveSuccess, setConfigSaveSuccess] = useState(false)

  // Sub-Treasuries selection & filter states (Item 58)
  const [selectedTreasury, setSelectedTreasury] = useState<'all' | 'general' | 'kindergarten' | 'elementary' | 'middle' | 'high'>('all')

  // Servants tithes report filters and export actions (Item 57)
  const [titheStatusFilter, setTitheStatusFilter] = useState<'all' | 'paid' | 'unpaid'>('all')
  const [titheViewMode, setTitheViewMode] = useState<'monthly' | 'annual'>('monthly')
  const [selectedTitheYear, setSelectedTitheYear] = useState('2026')
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  // Dynamic Annual Tithes Compliance Calculator (Item 57)
  const getAnnualTitheCompliance = (srvId: string) => {
    let monthlyStatus = [true, true, true, true, true, true, true, true, false, false, false, false]
    if (srvId === 'srv2') {
      monthlyStatus = [true, false, true, false, true, false, true, false, false, false, false, false]
    }
    const paidMonthsCount = monthlyStatus.filter(Boolean).length
    const ratioLabel = `${paidMonthsCount}/12 (${Math.round((paidMonthsCount/12)*100)}%)`
    return { monthlyStatus, paidMonthsCount, ratioLabel }
  }

  const handleExportTithesExcel = () => {
    let headers: string[] = []
    let rows: string[][] = []

    if (titheViewMode === 'annual') {
      headers = ['اسم الخادم', 'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر', 'نسبة الالتزام السنوي']
      rows = activeServants.map(srv => {
        const compliance = getAnnualTitheCompliance(srv.id)
        return [
          srv.name,
          ...compliance.monthlyStatus.map(s => s ? 'تم التسليم' : 'معلق لم يسلم'),
          compliance.ratioLabel
        ]
      })
    } else {
      headers = ['اسم الخادم', 'الدور الصلاحي', 'القيمة المستهدفة', 'الحالة']
      rows = activeServants.map(srv => {
        const record = tithesRecords[srv.id] || { amount: '0', paid: false }
        return [
          srv.name,
          srv.role,
          `${record.amount} ج.م`,
          record.paid ? 'تم التسليم والترحيل' : 'معلق لم يسلم'
        ]
      })
    }

    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `تقرير_عشور_الخدام_${titheViewMode === 'annual' ? `السنوي_${selectedTitheYear}` : `الشهري_شهر_${selectedTitheMonth}`}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportTithesPDF = () => {
    setIsGeneratingPDF(true)
    setTimeout(() => {
      setIsGeneratingPDF(false)
      window.print()
    }, 1000)
  }

  // Form fields state
  const [newType, setNewType] = useState<'income' | 'expense'>('expense')
  const [newAmount, setNewAmount] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newCategory, setNewCategory] = useState('أنشطة ومهرجانات')
  const [newDate, setNewDate] = useState('2026-08-15')
  const [newServant, setNewServant] = useState('تامر شفيق')
  const [newTreasury, setNewTreasury] = useState<'general' | 'kindergarten' | 'elementary' | 'middle' | 'high'>('general')
  const [hasAttachment, setHasAttachment] = useState(false)

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(newAmount)
    if (isNaN(amt) || amt <= 0 || !newDescription) return

    const newTx = {
      id: `tx-${Date.now()}`,
      date: newDate,
      type: newType,
      amount: amt,
      description: newDescription,
      category: newCategory,
      treasury: newTreasury,
      recorded_by: newServant,
      attachment: hasAttachment ? 'invoice_new.pdf' : null
    }

    setTransactions((prev) => [newTx, ...prev])
    setFormSuccess(true)

    setTimeout(() => {
      setFormSuccess(false)
      setShowForm(false)
      // reset fields
      setNewAmount('')
      setNewDescription('')
      setNewTreasury('general')
      setHasAttachment(false)
    }, 1500)
  }

  // Handle post servant tithes to income transactions ledger
  const handlePostTithe = (srvId: string, srvName: string) => {
    const record = tithesRecords[srvId]
    if (!record || !record.amount) return
    const amt = parseFloat(record.amount)
    if (isNaN(amt) || amt <= 0) return

    const monthNames = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ]
    const targetMonthLabel = monthNames[selectedTitheMonth - 1]

    const newTitheIncome = {
      id: `tx-tithe-${Date.now()}-${srvId}`,
      date: '2026-08-15',
      type: 'income' as const,
      amount: amt,
      description: `عشور الخادم ${srvName} - شهر ${targetMonthLabel}`,
      category: 'تبرعات وهبات',
      treasury: 'general', // Tithes default to General Treasury
      recorded_by: srvName,
      attachment: null
    }

    // Insert as income
    setTransactions(prev => [newTitheIncome, ...prev])
    
    // Toggle paid checkbox in registry
    setTithesRecords(prev => ({
      ...prev,
      [srvId]: {
        ...prev[srvId],
        paid: true
      }
    }))
  }

  // Edit inline tithes values
  const handleTitheAmountChange = (srvId: string, value: string) => {
    setTithesRecords(prev => ({
      ...prev,
      [srvId]: {
        ...prev[srvId],
        amount: value
      }
    }))
  }

  // Save new Default Targets and apply to unpaid servants
  const handleSaveDefaultTargets = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Apply changes to unpaid entries immediately
    setTithesRecords(prev => {
      const updated = { ...prev }
      activeServants.forEach(srv => {
        if (!updated[srv.id].paid) {
          updated[srv.id].amount = defaultTargets[srv.id]
        }
      })
      return updated
    })

    setTargetSaveSuccess(true)
    setTimeout(() => {
      setTargetSaveSuccess(false)
      setShowTargetModal(false)
    }, 1200)
  }

  // Edit default target state values
  const handleDefaultTargetChange = (srvId: string, value: string) => {
    setDefaultTargets(prev => ({
      ...prev,
      [srvId]: value
    }))
  }

  // Dynamic Stateful Sub-Treasuries (Item 58)
  const [treasuries, setTreasuries] = useState([
    { id: 'general', label: 'الأمانة العامة للخدمة (عام)', scope: 'general', scopeName: 'عام الخدمة', balance: 5000.0, viewers: ['srv1', 'srv2', 'srv3'], payers: ['srv1', 'srv2', 'srv3'] },
    { id: 'kindergarten', label: 'صندوق مرحلة الحضانة', scope: 'stage', scopeName: 'مرحلة الحضانة', balance: 1200.0, viewers: ['srv3'], payers: ['srv1', 'srv2'] },
    { id: 'elementary', label: 'صندوق مرحلة ابتدائي', scope: 'stage', scopeName: 'مرحلة ابتدائي', balance: 3500.0, viewers: ['srv3'], payers: ['srv1', 'srv3'] },
    { id: 'middle', label: 'صندوق مرحلة إعدادي', scope: 'stage', scopeName: 'مرحلة إعدادي', balance: 2100.0, viewers: ['srv3'], payers: ['srv2', 'srv3'] },
    { id: 'high', label: 'صندوق مرحلة ثانوي', scope: 'stage', scopeName: 'مرحلة ثانوي', balance: 0.0, viewers: ['srv1', 'srv3'], payers: ['srv2'] }
  ])

  const handleOpenConfig = (tr: any) => {
    setConfigTargetId(tr.id)
    setConfigLabel(tr.label)
    setConfigScope(tr.scope)
    setConfigScopeName(tr.scopeName)
    setConfigViewers(tr.viewers || [])
    setConfigPayers(tr.payers || [])
    setShowConfigModal(true)
  }

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault()
    setTreasuries(prev => prev.map(t => {
      if (t.id === configTargetId) {
        return {
          ...t,
          label: configLabel,
          scope: configScope,
          scopeName: configScopeName,
          viewers: configViewers,
          payers: configPayers
        }
      }
      return t
    }))
    setConfigSaveSuccess(true)
    setTimeout(() => {
      setConfigSaveSuccess(false)
      setShowConfigModal(false)
    }, 1000)
  }

  // Calculate dynamic values for a selected treasury
  const getTreasuryStats = (key: 'all' | 'general' | 'kindergarten' | 'elementary' | 'middle' | 'high') => {
    let opening = 0
    if (key === 'all') {
      opening = treasuries.reduce((acc, t) => acc + t.balance, 0)
    } else {
      opening = treasuries.find(t => t.id === key)?.balance || 0
    }

    const txList = key === 'all'
      ? transactions
      : transactions.filter(t => t.treasury === key)

    const income = txList.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0)
    const expense = txList.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0)
    const current = opening + income - expense

    return { opening, income, expense, current }
  }

  const activeStats = getTreasuryStats(selectedTreasury)

  // Filter allowed payers based on chosen target treasury (Item 58)
  const allowedPayers = activeServants.filter(srv => {
    const tr = treasuries.find(t => t.id === newTreasury)
    return tr ? tr.payers.includes(srv.id) : true
  })

  // Filter transactions based on search and selected treasury subbox
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.description.includes(searchTerm) || t.category.includes(searchTerm)
    const matchesTreasury = selectedTreasury === 'all' || t.treasury === selectedTreasury
    return matchesSearch && matchesTreasury
  })

  const months = [
    { value: 1, name: 'يناير (January)' }, { value: 2, name: 'فبراير (February)' },
    { value: 3, name: 'مارس (March)' }, { value: 4, name: 'أبريل (April)' },
    { value: 5, name: 'مايو (May)' }, { value: 6, name: 'يونيو (June)' },
    { value: 7, name: 'يوليو (July)' }, { value: 8, name: 'أغسطس (August)' },
    { value: 9, name: 'سبتمبر (September)' }, { value: 10, name: 'أكتوبر (October)' },
    { value: 11, name: 'نوفمبر (November)' }, { value: 12, name: 'ديسمبر (December)' }
  ]

  return (
    <Shell>
      <div className="space-y-6 font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">حسابات وميزانية الخدمة</h1>
            <p className="text-sm text-muted-foreground mt-1">
              إدارة حركة المصروفات، تسجيل عشور الخدام الشهرية وترحيلها مباشرة للإيرادات.
            </p>
          </div>
          
          <button
            onClick={() => setShowForm(!showForm)}
            className="h-10 px-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm flex items-center gap-2 shadow hover:bg-primary/95 transition self-start"
          >
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            <span>{showForm ? 'إغلاق النموذج' : 'إضافة حركة مالية'}</span>
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-border gap-4">
          <button
            onClick={() => setActiveTab('budget')}
            className={`py-2 px-3 text-sm font-semibold border-b-2 transition ${
              activeTab === 'budget' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            الحركات المالية والميزانية
          </button>
          <button
            onClick={() => setActiveTab('tithes')}
            className={`py-2 px-3 text-sm font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'tithes' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Coins className="h-4 w-4 text-primary shrink-0" />
            عشور واشتراكات الخدام
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-3 text-sm font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'settings' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <UserCheck className="h-4 w-4 text-primary shrink-0" />
            تفويض وإعدادات الصناديق
          </button>
        </div>

        {/* Tab 1: Budget Ledger */}
        {activeTab === 'budget' && (
          <div className="space-y-6 animate-in fade-in">
            {/* DYNAMIC TRANSACTION FORM PANEL */}
            {showForm && (
              <div className="bg-card border border-primary/20 rounded-xl p-5 md:p-6 shadow-md space-y-4 animate-in slide-in-from-top duration-300">
                <h3 className="font-bold text-sm text-primary border-b border-border pb-2 flex items-center gap-1.5">
                  <Plus className="h-4.5 w-4.5" />
                  تسجيل حركة مالية جديدة (إيرادات / مصروفات)
                </h3>

                <form onSubmit={handleSaveTransaction} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">نوع الحركة المالية</label>
                      <select
                        value={newType}
                        onChange={(e) => setNewType(e.target.value as any)}
                        className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition"
                      >
                        <option value="expense">مصروفات (صرف للخارج)</option>
                        <option value="income">إيرادات / تبرعات (دخل للداخل)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">المبلغ (ج.م)</label>
                      <input
                        type="number" step="0.01" required min="0.01" placeholder="0.00"
                        value={newAmount}
                        onChange={(e) => setNewAmount(e.target.value)}
                        className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">التصنيف الفئوي</label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition"
                      >
                        <option value="أنشطة ومهرجانات">أنشطة ومهرجانات</option>
                        <option value="تبرعات وهبات">تبرعات وهبات</option>
                        <option value="أغذية ومأكولات">أغذية ومأكولات</option>
                        <option value="أدوات مكتبية ومطبوعات">أدوات مكتبية ومطبوعات</option>
                        <option value="هدايا وجوائز للمخدومين">هدايا وجوائز للمخدومين</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">تاريخ الحركة</label>
                      <input
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="w-full bg-muted/40 border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-primary/50 transition"
                      />
                    </div>

                      <div className="space-y-1.5 font-sans">
                      <label className="text-xs font-semibold text-foreground">الخادم المسؤول</label>
                      <select
                        value={newServant}
                        onChange={(e) => setNewServant(e.target.value)}
                        className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition font-bold"
                      >
                        {allowedPayers.length > 0 ? (
                          allowedPayers.map(p => (
                            <option key={p.id} value={p.name}>{p.name}</option>
                          ))
                        ) : (
                          <option value="">لا يوجد خادم مفوض بالصندوق</option>
                        )}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">الصندوق المالي (الخدمة)</label>
                      <select
                        value={newTreasury}
                        onChange={(e) => setNewTreasury(e.target.value as any)}
                        className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition font-bold"
                      >
                        <option value="general">الأمانة العامة للخدمة (عام)</option>
                        <option value="kindergarten">صندوق مرحلة حضانة</option>
                        <option value="elementary">صندوق مرحلة ابتدائي</option>
                        <option value="middle">صندوق مرحلة إعدادي</option>
                        <option value="high">صندوق مرحلة ثانوي</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 flex items-center pt-5">
                      <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={hasAttachment}
                          onChange={(e) => setHasAttachment(e.target.checked)}
                          className="h-4.5 w-4.5 text-primary border-border rounded cursor-pointer"
                        />
                        <span>إرفاق إيصال الدفع أو الفاتورة</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">الوصف والبيان التفصيلي</label>
                    <input
                      type="text" required placeholder="مثال: شراء هدايا التخرج لأطفال الحضانة..."
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition"
                    />
                  </div>

                  {formSuccess && (
                    <div className="p-3 bg-success/15 border border-success text-success text-[11px] font-bold rounded-lg flex items-center gap-1.5">
                      <Check className="h-4.5 w-4.5" />
                      <span>تم حفظ الحركة المالية بنجاح!</span>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 border-t border-border pt-4">
                    <button
                      type="submit"
                      className="h-10 px-5 bg-primary text-primary-foreground font-semibold rounded-lg text-xs flex items-center gap-1.5 hover:bg-primary/95 shadow transition"
                    >
                      <Save className="h-4 w-4" />
                      حفظ الحركة بالدفتر
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="h-10 px-4 border border-border hover:bg-muted text-xs font-semibold rounded-lg text-muted-foreground transition"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 1. DYNAMIC TREASURY SWITCHER / OVERVIEW CARDS (Item 58) */}
            <div className="bg-card border border-border p-4 rounded-xl shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-muted-foreground border-b border-border pb-1.5 flex items-center gap-1.5">
                <Coins className="h-4 w-4 text-primary" />
                توزيع الميزانية والصناديق المالية المستقلة لكل مرحلة
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-2.5">
                {/* Total Unified Budget card */}
                <button
                  onClick={() => setSelectedTreasury('all')}
                  className={`p-3 rounded-lg border text-right transition-all duration-200 flex flex-col justify-between h-20 text-right ${
                    selectedTreasury === 'all'
                      ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm'
                      : 'border-border bg-card hover:bg-muted/15'
                  }`}
                >
                  <span className="text-[10px] font-semibold text-muted-foreground block truncate">الميزانية الموحدة (الكل)</span>
                  <span className="text-xs font-extrabold text-foreground mt-1.5 block">
                    {getTreasuryStats('all').current.toFixed(2)} ج.م
                  </span>
                </button>

                {/* Sub-treasuries check based on viewer permissions */}
                {treasuries.map((tr) => {
                  const stats = getTreasuryStats(tr.id as any)
                  const isSelected = selectedTreasury === tr.id
                  const hasViewAccess = tr.viewers.includes(currentServantId)
                  
                  return (
                    <button
                      key={tr.id}
                      disabled={!hasViewAccess}
                      onClick={() => setSelectedTreasury(tr.id as any)}
                      className={`p-3 rounded-lg border text-right transition-all duration-200 flex flex-col justify-between h-20 text-right ${
                        !hasViewAccess
                          ? 'opacity-45 bg-muted/10 border-border cursor-not-allowed'
                          : isSelected
                            ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm'
                            : 'border-border bg-card hover:bg-muted/15'
                      }`}
                    >
                      <span className="text-[10px] font-semibold text-muted-foreground block truncate flex items-center gap-1">
                        {tr.label}
                        {!hasViewAccess && <span className="text-[8px] bg-destructive/15 text-destructive px-1 rounded">مغلق</span>}
                      </span>
                      <span className="text-xs font-extrabold text-foreground mt-1.5 block">
                        {hasViewAccess ? `${stats.current.toFixed(2)} ج.م` : 'غير مصرح للاطلاع'}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* FINANCIAL SUMMARY KPI GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-medium text-muted-foreground">الرصيد الافتتاحي للصندوق</p>
                  <h3 className="text-lg font-bold text-foreground">{activeStats.opening.toFixed(2)} ج.م</h3>
                </div>
                <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                </div>
              </div>

              <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-medium text-muted-foreground">إجمالي الإيرادات</p>
                  <h3 className="text-lg font-bold text-success">+{activeStats.income.toFixed(2)} ج.م</h3>
                </div>
                <div className="h-9 w-9 rounded-lg bg-success/15 flex items-center justify-center text-success">
                  <ArrowUpRight className="h-4.5 w-4.5" />
                </div>
              </div>

              <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-medium text-muted-foreground">إجمالي المصروفات</p>
                  <h3 className="text-lg font-bold text-destructive">-{activeStats.expense.toFixed(2)} ج.م</h3>
                </div>
                <div className="h-9 w-9 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive">
                  <ArrowDownRight className="h-4.5 w-4.5" />
                </div>
              </div>

              <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex items-center justify-between bg-primary/5">
                <div className="space-y-1">
                  <p className="text-[10px] font-medium text-primary font-bold">الرصيد الصافي الحالي</p>
                  <h3 className="text-lg font-extrabold text-primary">{activeStats.current.toFixed(2)} ج.م</h3>
                </div>
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <DollarSign className="h-4.5 w-4.5" />
                </div>
              </div>
            </div>

            {/* TRANSACTION LOG TABLE */}
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-border flex justify-between items-center flex-wrap gap-2">
                <div className="relative max-w-xs">
                  <Search className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground left-3" />
                  <input
                    type="text"
                    placeholder="ابحث بالوصف أو التصنيف..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg pl-9 pr-4 py-1.5 text-xs outline-none focus:border-primary/50 transition"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm border-collapse">
                  <thead className="bg-muted/40 text-muted-foreground text-xs font-semibold border-b border-border">
                    <tr>
                      <th className="px-4 py-3 w-28">التاريخ</th>
                      <th className="px-4 py-3 w-32">المبلغ</th>
                      <th className="px-4 py-3 w-36">الصندوق المالي</th>
                      <th className="px-4 py-3">الوصف والتفاصيل</th>
                      <th className="px-4 py-3 w-32">التصنيف</th>
                      <th className="px-4 py-3 w-20">المرفق</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredTransactions.map((t) => (
                      <tr key={t.id} className="hover:bg-muted/10 transition">
                        <td className="px-4 py-3.5 text-xs text-muted-foreground flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          {t.date}
                        </td>
                        <td className={`px-4 py-3.5 font-bold ${
                          t.type === 'income' ? 'text-success' : 'text-destructive'
                        }`}>
                          {t.type === 'income' ? '+' : '-'}{t.amount.toFixed(2)} ج.م
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            t.treasury === 'kindergarten' ? 'bg-pink-500/10 text-pink-500' :
                            t.treasury === 'elementary' ? 'bg-sky-500/10 text-sky-500' :
                            t.treasury === 'middle' ? 'bg-teal-500/10 text-teal-500' :
                            t.treasury === 'high' ? 'bg-orange-500/10 text-orange-500' :
                            'bg-indigo-500/10 text-indigo-500'
                          }`}>
                            {t.treasury === 'kindergarten' ? 'صندوق الحضانة' :
                             t.treasury === 'elementary' ? 'صندوق الابتدائي' :
                             t.treasury === 'middle' ? 'صندوق الإعدادي' :
                             t.treasury === 'high' ? 'صندوق الثانوي' :
                             'الأمانة العامة'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-xs leading-relaxed text-foreground">
                          <p>{t.description}</p>
                          <p className="text-[9px] text-muted-foreground mt-0.5">بواسطة الخادم: {t.recorded_by}</p>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-muted-foreground">{t.category}</td>
                        <td className="px-4 py-3.5">
                          {t.attachment ? (
                            <button className="p-1 rounded bg-muted hover:bg-primary/10 hover:text-primary text-muted-foreground transition" title="تنزيل المرفق">
                              <FileText className="h-4 w-4" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-muted-foreground/60">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Servants Monthly Tithes Manager */}
        {activeTab === 'tithes' && (() => {
          const totalServantsCount = activeServants.length
          const paidServantsCount = activeServants.filter(s => tithesRecords[s.id]?.paid).length
          const paidAmount = activeServants.filter(s => tithesRecords[s.id]?.paid).reduce((acc, s) => acc + parseFloat(tithesRecords[s.id]?.amount || '0'), 0)
          const unpaidAmount = activeServants.filter(s => !tithesRecords[s.id]?.paid).reduce((acc, s) => acc + parseFloat(tithesRecords[s.id]?.amount || '0'), 0)

          const filteredServantsForTithes = activeServants.filter(srv => {
            const isPaid = tithesRecords[srv.id]?.paid
            if (titheStatusFilter === 'paid') return isPaid
            if (titheStatusFilter === 'unpaid') return !isPaid
            return true
          })

          return (
            <div className="space-y-6 animate-in fade-in">
              {/* TITHES VIEW SWITCHER (Item 57) */}
              <div className="flex bg-muted p-1 rounded-xl max-w-sm border border-border print:hidden font-sans">
                <button
                  onClick={() => setTitheViewMode('monthly')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    titheViewMode === 'monthly' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  دفتر التسليم الشهري
                </button>
                <button
                  onClick={() => setTitheViewMode('annual')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    titheViewMode === 'annual' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  التقرير السنوي الشامل
                </button>
              </div>

              {/* TITHES KPI SUMMARY DECK */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-medium text-muted-foreground">الخدام الذين سلموا العشور</p>
                    <h3 className="text-lg font-bold text-success">
                      {paidServantsCount} / {totalServantsCount} خادم ({Math.round((paidServantsCount / (totalServantsCount || 1)) * 100)}%)
                    </h3>
                  </div>
                  <div className="h-9 w-9 rounded-lg bg-success/15 flex items-center justify-center text-success">
                    <UserCheck className="h-4.5 w-4.5" />
                  </div>
                </div>

                <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-medium text-muted-foreground">إجمالي العشور المستلمة والرحّلة</p>
                    <h3 className="text-lg font-bold text-primary">+{paidAmount.toFixed(2)} ج.م</h3>
                  </div>
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <ArrowUpRight className="h-4.5 w-4.5" />
                  </div>
                </div>

                <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-medium text-muted-foreground">إجمالي العشور المعلقة (متبقية)</p>
                    <h3 className="text-lg font-bold text-warning-foreground">-{unpaidAmount.toFixed(2)} ج.م</h3>
                  </div>
                  <div className="h-9 w-9 rounded-lg bg-warning/15 flex items-center justify-center text-warning-foreground">
                    <ArrowDownRight className="h-4.5 w-4.5" />
                  </div>
                </div>
              </div>

              {/* Control Bar: Month, Status filter & Export Actions */}
              <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground block">الشهر المستهدف</span>
                    <select
                      value={selectedTitheMonth}
                      onChange={(e) => setSelectedTitheMonth(parseInt(e.target.value, 10))}
                      className="bg-muted/40 border border-border rounded-lg px-3 py-1.5 text-xs font-semibold text-primary outline-none focus:border-primary/50"
                    >
                      {months.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground block">حالة التسليم</span>
                    <div className="flex bg-muted rounded-lg p-0.5 border border-border">
                      <button
                        onClick={() => setTitheStatusFilter('all')}
                        className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                          titheStatusFilter === 'all' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        الكل
                      </button>
                      <button
                        onClick={() => setTitheStatusFilter('paid')}
                        className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                          titheStatusFilter === 'paid' ? 'bg-card text-success shadow-sm' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        سلموا العشور
                      </button>
                      <button
                        onClick={() => setTitheStatusFilter('unpaid')}
                        className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                          titheStatusFilter === 'unpaid' ? 'bg-card text-warning-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        معلق / لم يسلم
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleExportTithesExcel}
                    className="h-8 px-3 bg-success/15 hover:bg-success/20 text-success rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                    تصدير Excel (.csv)
                  </button>
                  <button
                    onClick={handleExportTithesPDF}
                    className="h-8 px-3 bg-primary/15 hover:bg-primary/20 text-primary rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    تصدير PDF / طباعة
                  </button>
                  <button
                    onClick={() => setShowTargetModal(true)}
                    className="h-8 px-3 bg-muted hover:bg-primary/10 hover:text-primary text-muted-foreground rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    تعديل الأهداف
                  </button>
                </div>
              </div>

              {/* PREDEFINE TARGETS INTERACTIVE MODAL */}
              {showTargetModal && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-card border border-border w-full max-w-md rounded-xl p-5 md:p-6 shadow-2xl space-y-4 animate-in zoom-in-95 text-right font-sans">
                    <div className="flex justify-between items-center border-b border-border pb-3">
                      <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                        <Edit2 className="h-4.5 w-4.5 text-primary" />
                        تحديد قيم العشور الشهرية الافتراضية للخدام
                      </h3>
                      <button
                        onClick={() => setShowTargetModal(false)}
                        className="p-1 rounded hover:bg-muted text-muted-foreground text-sm"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleSaveDefaultTargets} className="space-y-4">
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        هذه القيم ستعتبر هي المبلغ المستهدف تسليمه افتراضياً لكل خادم شهرياً، وستظهر تلقائياً في دفتر التسليم للشهور القادمة.
                      </p>

                      <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1">
                        {activeServants.map((srv) => (
                          <div key={srv.id} className="flex justify-between items-center bg-muted/20 p-2.5 rounded-lg border border-border">
                            <div className="text-right">
                              <p className="text-xs font-bold text-foreground">{srv.name}</p>
                              <p className="text-[9px] text-muted-foreground">{srv.role}</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                required
                                value={defaultTargets[srv.id] || '0'}
                                onChange={(e) => handleDefaultTargetChange(srv.id, e.target.value)}
                                className="w-24 bg-card border border-border rounded px-2 py-1 text-xs text-center font-bold outline-none focus:border-primary/50"
                              />
                              <span className="text-[10px] text-muted-foreground">ج.م</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {targetSaveSuccess && (
                        <div className="p-2.5 bg-success/15 border border-success text-success text-[10px] font-bold rounded-lg flex items-center gap-1">
                          <Check className="h-4 w-4" />
                          <span>تم حفظ وتحديث القيم الافتراضية للخدام بنجاح!</span>
                        </div>
                      )}

                      <div className="flex justify-end gap-2 border-t border-border pt-4">
                        <button
                          type="submit"
                          className="h-9 px-4 bg-primary text-primary-foreground font-semibold rounded-lg text-xs hover:bg-primary/95 shadow transition"
                        >
                          حفظ المبالغ المستهدفة
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowTargetModal(false)}
                          className="h-9 px-3 border border-border hover:bg-muted text-xs font-semibold rounded-lg text-muted-foreground transition"
                        >
                          إلغاء
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Servants Tithe Registry log list (Conditional: Monthly vs Annual) (Item 57) */}
              {titheViewMode === 'monthly' ? (
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-border bg-muted/10 flex justify-between items-center bg-muted/10">
                    <h3 className="font-bold text-sm text-foreground">كشف تسليم عشور واشتراكات الخدام الشهري</h3>
                    <span className="text-[10px] text-muted-foreground hidden print:inline">
                      شهر: {months.find(m => m.value === selectedTitheMonth)?.name}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs border-collapse">
                      <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border">
                        <tr>
                          <th className="px-4 py-3">اسم الخادم</th>
                          <th className="px-4 py-3">الدور الصلاحي</th>
                          <th className="px-4 py-3 w-40 text-center">المبلغ المستحق (ج.م)</th>
                          <th className="px-4 py-3 w-28 text-center">حالة الدفع</th>
                          <th className="px-4 py-3 w-32 text-left print:hidden">الترحيل والإيراد</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border text-sm text-foreground">
                        {filteredServantsForTithes.map((srv) => {
                          const record = tithesRecords[srv.id] || { amount: '0', paid: false }
                          
                          return (
                            <tr key={srv.id} className="hover:bg-muted/5 transition">
                              <td className="px-4 py-3.5 font-bold">{srv.name}</td>
                              <td className="px-4 py-3.5 text-xs text-muted-foreground">{srv.role}</td>
                              <td className="px-4 py-3.5 text-center">
                                <input
                                  type="number"
                                  disabled={record.paid}
                                  value={record.amount}
                                  onChange={(e) => handleTitheAmountChange(srv.id, e.target.value)}
                                  className="w-24 bg-muted/40 border border-border rounded px-2.5 py-1 text-xs text-center outline-none focus:border-primary/50 transition font-bold"
                                />
                              </td>
                              <td className="px-4 py-3.5 text-center">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  record.paid ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning-foreground animate-pulse'
                                }`}>
                                  {record.paid ? 'تم التسليم والترحيل' : 'معلق لم يسلم'}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 text-left print:hidden">
                                <button
                                  disabled={record.paid}
                                  onClick={() => handlePostTithe(srv.id, srv.name)}
                                  className="h-8 px-3 bg-primary text-primary-foreground disabled:bg-muted disabled:text-muted-foreground font-semibold rounded-lg text-xs hover:bg-primary/95 transition flex items-center justify-center gap-1.5"
                                >
                                  {record.paid ? (
                                    <UserCheck className="h-3.5 w-3.5 text-success" />
                                  ) : (
                                    <Plus className="h-3.5 w-3.5" />
                                  )}
                                  ترحيل كإيراد
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden animate-in fade-in">
                  <div className="p-4 border-b border-border bg-muted/10 flex justify-between items-center">
                    <div className="text-right">
                      <h3 className="font-bold text-sm text-foreground">التقرير السنوي لمتابعة عشور واشتراكات الخدام</h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5 font-sans">جدول تتبع حالة التزام جميع الخدام بالتسليم على مدار الـ ١٢ شهراً للسنة الحالية.</p>
                    </div>
                    <span className="text-xs font-bold text-primary hidden print:inline">السنة المستهدفة: {selectedTitheYear}</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs border-collapse">
                      <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border text-center">
                        <tr>
                          <th className="px-4 py-3 text-right">اسم الخادم</th>
                          <th className="px-2 py-3 w-16 text-center">يناير</th>
                          <th className="px-2 py-3 w-16 text-center">فبراير</th>
                          <th className="px-2 py-3 w-16 text-center">مارس</th>
                          <th className="px-2 py-3 w-16 text-center">أبريل</th>
                          <th className="px-2 py-3 w-16 text-center">مايو</th>
                          <th className="px-2 py-3 w-16 text-center">يونيو</th>
                          <th className="px-2 py-3 w-16 text-center">يوليو</th>
                          <th className="px-2 py-3 w-16 text-center">أغسطس</th>
                          <th className="px-2 py-3 w-16 text-center">سبتمبر</th>
                          <th className="px-2 py-3 w-16 text-center">أكتوبر</th>
                          <th className="px-2 py-3 w-16 text-center">نوفمبر</th>
                          <th className="px-2 py-3 w-16 text-center">ديسمبر</th>
                          <th className="px-4 py-3 w-32 text-center">الالتزام السنوي</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border text-sm text-foreground">
                        {activeServants.map((srv) => {
                          const compliance = getAnnualTitheCompliance(srv.id)
                          return (
                            <tr key={srv.id} className="hover:bg-muted/5 transition">
                              <td className="px-4 py-3.5 font-bold">{srv.name}</td>
                              {compliance.monthlyStatus.map((status, mIdx) => (
                                <td key={mIdx} className="px-2 py-3.5 text-center">
                                  <span className={`h-6 w-6 rounded-full inline-flex items-center justify-center text-xs font-bold ${
                                    status ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground/60'
                                  }`}>
                                    {status ? '✓' : '—'}
                                  </span>
                                </td>
                              ))}
                              <td className="px-4 py-3.5 text-center font-bold text-primary">
                                {compliance.ratioLabel}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          )
        })()}

        {/* Tab 3: Sub-Treasuries Assignments & Config (NEW) */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-card border border-border rounded-xl p-5 md:p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-primary border-b border-border pb-1.5 flex items-center gap-1.5">
                <UserCheck className="h-4.5 w-4.5" />
                صلاحيات وتفويض الصناديق الفرعية للخدمة
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                هنا يمكن للأمين العام تحديد تبعية كل صندوق (سواء كان لمرحلة كاملة أو لفصل دراسي محدد)، وتفويض صلاحيات الرؤية (من يحق له الاطلاع على الرصيد) وصلاحيات الصرف والدفع (من يحق له تسجيل حركات مالية للصندوق).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {treasuries.map((tr) => (
                <div key={tr.id} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start border-b border-border pb-2">
                      <div>
                        <h4 className="font-bold text-sm text-foreground">{tr.label}</h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5 font-normal">التبعية: {tr.scopeName} ({tr.scope === 'stage' ? 'مرحلة كاملة' : tr.scope === 'class' ? 'فصل محدد' : 'عام الخدمة'})</p>
                      </div>
                      <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded">
                        الرصيد: {getTreasuryStats(tr.id as any).current.toFixed(2)} ج.م
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <div>
                        <span className="text-[10px] font-bold text-muted-foreground block">الخدام المصرح لهم بالاطلاع (مين يشوفه):</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {tr.viewers.map(vId => {
                            const srv = activeServants.find(s => s.id === vId) || { name: 'الأمين العام' }
                            return (
                              <span key={vId} className="bg-muted px-2 py-0.5 rounded text-[10px] text-muted-foreground font-semibold">
                                {srv.name}
                              </span>
                            )
                          })}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-muted-foreground block">الخدام المصرح لهم بالدفع والصرف (مين يسجل):</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {tr.payers.map(pId => {
                            const srv = activeServants.find(s => s.id === pId) || { name: 'الخادم المسؤول' }
                            return (
                              <span key={pId} className="bg-primary/5 text-primary border border-primary/15 px-2 py-0.5 rounded text-[10px] font-semibold">
                                {srv.name}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border flex justify-end mt-2">
                    <button
                      onClick={() => handleOpenConfig(tr)}
                      className="h-8 px-3 border border-border hover:bg-muted rounded-lg text-xs font-semibold flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition"
                    >
                      <Edit2 className="h-3 w-3" />
                      تعديل التباعيات والصلاحيات
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONFIG TREASURY INTERACTIVE MODAL */}
        {showConfigModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border w-full max-w-lg rounded-xl p-5 md:p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
              <div className="flex justify-between items-center border-b border-border pb-3">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5 font-sans">
                  <Edit2 className="h-4.5 w-4.5 text-primary" />
                  تعديل صلاحيات وتبعية: {configLabel}
                </h3>
                <button onClick={() => setShowConfigModal(false)} className="p-1 rounded hover:bg-muted text-muted-foreground text-sm">✕</button>
              </div>

              <form onSubmit={handleSaveConfig} className="space-y-4 text-right font-sans">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">اسم الصندوق</label>
                  <input
                    type="text" required
                    value={configLabel} onChange={(e) => setConfigLabel(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">نوع التبعية والهيكلة</label>
                    <select
                      value={configScope} onChange={(e) => setConfigScope(e.target.value as any)}
                      className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition font-bold"
                    >
                      <option value="general">عام الخدمة</option>
                      <option value="stage">مرحلة كاملة</option>
                      <option value="class">فصل دراسي محدد</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">اسم المرحلة أو الفصل المستهدف</label>
                    <input
                      type="text" required
                      value={configScopeName} onChange={(e) => setConfigScopeName(e.target.value)}
                      className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-border pt-3">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground block">صلاحية الاطلاع (من يشوفه):</label>
                    <div className="space-y-2 bg-muted/20 border border-border p-2.5 rounded-lg max-h-40 overflow-y-auto">
                      {activeServants.map(srv => {
                        const isChecked = configViewers.includes(srv.id)
                        return (
                          <label key={srv.id} className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setConfigViewers(prev => [...prev, srv.id])
                                } else {
                                  setConfigViewers(prev => prev.filter(id => id !== srv.id))
                                }
                              }}
                              className="h-4 w-4 text-primary border-border rounded cursor-pointer"
                            />
                            <span>{srv.name}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground block animate-pulse">صلاحية الدفع والصرف (من يسجل فيه):</label>
                    <div className="space-y-2 bg-muted/20 border border-border p-2.5 rounded-lg max-h-40 overflow-y-auto">
                      {activeServants.map(srv => {
                        const isChecked = configPayers.includes(srv.id)
                        return (
                          <label key={srv.id} className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setConfigPayers(prev => [...prev, srv.id])
                                } else {
                                  setConfigPayers(prev => prev.filter(id => id !== srv.id))
                                }
                              }}
                              className="h-4 w-4 text-primary border-border rounded cursor-pointer"
                            />
                            <span>{srv.name}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {configSaveSuccess && (
                  <div className="p-2.5 bg-success/15 border border-success text-success text-[10px] font-bold rounded-lg flex items-center gap-1">
                    <Check className="h-4 w-4" />
                    <span>تم حفظ تعديل صلاحيات وهيكلة الصندوق بنجاح!</span>
                  </div>
                )}

                <div className="flex justify-end gap-2 border-t border-border pt-4">
                  <button type="submit" className="h-9 px-4 bg-primary text-primary-foreground font-semibold rounded-lg text-xs hover:bg-primary/95 shadow transition">
                    حفظ التعديلات
                  </button>
                  <button type="button" onClick={() => setShowConfigModal(false)} className="h-9 px-3 border border-border hover:bg-muted text-xs font-semibold rounded-lg text-muted-foreground transition">
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 5. PRINT PREPARE LOADER OVERLAY (Item 57) */}
        {isGeneratingPDF && (
          <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-[999] flex flex-col items-center justify-center p-6 text-center animate-in fade-in animate-out">
            <div className="h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
            <h3 className="text-lg font-bold text-foreground font-sans">جاري تحضير تقرير العشور للطباعة وتصدير PDF</h3>
            <p className="text-xs text-muted-foreground mt-2 max-w-xs font-sans">
              يرجى الانتظار لحين تهيئة ملف التقارير وتجهيز خيارات حفظ الملف في المتصفح...
            </p>
          </div>
        )}
      </div>
    </Shell>
  )
}
