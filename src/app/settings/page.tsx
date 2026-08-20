'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Shell } from '@/components/layout/Shell'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import {
  Settings,
  Database,
  Upload,
  Plus,
  UserCheck,
  Trash2,
  ShieldAlert,
  Save,
  CheckCircle2,
  Sparkles,
  Link2,
  ExternalLink,
  ClipboardCheck,
  Check,
  School,
  Pencil
} from 'lucide-react'

type RoleKey = 'priest' | 'service_admin' | 'sector_leader' | 'stage_leader' | 'class_leader' | 'servant' | 'treasurer'

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-xs text-muted-foreground font-sans">جاري تحميل الإعدادات...</div>}>
      <SettingsPageContent />
    </Suspense>
  )
}

function SettingsPageContent() {
  const { locale } = useLanguage()
  const [activeTab, setActiveTab] = useState<'system' | 'backup' | 'priests' | 'permissions' | 'branding' | 'remote-reg' | 'stages'>('system')

  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')

  useEffect(() => {
    if (
      tabParam === 'system' ||
      tabParam === 'permissions' ||
      tabParam === 'priests' ||
      tabParam === 'backup' ||
      tabParam === 'branding' ||
      tabParam === 'remote-reg' ||
      tabParam === 'stages'
    ) {
      setActiveTab(tabParam)
    } else {
      setActiveTab('system')
    }
  }, [tabParam])

  // Remote registration link states (Item 57)
  const [copiedLink, setCopiedLink] = useState(false)
  const [remoteLinkEnabled, setRemoteLinkEnabled] = useState(true)

  const handleCopyLink = () => {
    const linkText = typeof window !== 'undefined' 
      ? `${window.location.origin}/Anonymous_Register?m=9f0858f9bd70995ffb84ce85073a52c8f280df31` 
      : 'https://madareselahadplus.com/Anonymous_Register?m=9f0858f9bd70995ffb84ce85073a52c8f280df31'
    navigator.clipboard.writeText(linkText)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  // Church details branding state
  const [churchNameInput, setChurchNameInput] = useState('كنيسة مارمينا')
  const [churchLogoInput, setChurchLogoInput] = useState<string | null>(null)
  const [saveChurchSuccess, setSaveChurchSuccess] = useState(false)

  const themePresets = [
    { id: 'byzantine-blue', nameAr: 'أزرق بيزنطي (الافتراضي)', primary: '220 70% 30%', secondary: '38 90% 50%', previewPrimary: '#1e3a8a', previewSecondary: '#f59e0b' },
    { id: 'coptic-red', nameAr: 'أحمر قبطي عريق', primary: '0 75% 35%', secondary: '200 70% 30%', previewPrimary: '#991b1b', previewSecondary: '#0369a1' },
    { id: 'olive-green', nameAr: 'أخضر زيتوني هادئ', primary: '100 50% 25%', secondary: '45 80% 45%', previewPrimary: '#3f6212', previewSecondary: '#a16207' },
    { id: 'royal-purple', nameAr: 'أرجواني ملكي وذهبي', primary: '270 65% 30%', secondary: '40 85% 55%', previewPrimary: '#581c87', previewSecondary: '#d97706' },
    { id: 'calm-rose', nameAr: 'وردي هادئ وفيروزي', primary: '340 60% 40%', secondary: '180 50% 35%', previewPrimary: '#9d174d', previewSecondary: '#0f766e' }
  ]

  const [selectedThemeId, setSelectedThemeId] = useState('byzantine-blue')

  useEffect(() => {
    const savedName = localStorage.getItem('churchName')
    const savedLogo = localStorage.getItem('churchLogo')
    if (savedName) setChurchNameInput(savedName)
    if (savedLogo) setChurchLogoInput(savedLogo)

    const savedTheme = localStorage.getItem('appTheme')
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme)
        const matched = themePresets.find(p => p.primary === parsed.primary)
        if (matched) setSelectedThemeId(matched.id)
      } catch (e) {
        console.error(e)
      }
    }

    const savedYear = localStorage.getItem('activeAcademicYear')
    if (savedYear) {
      setAcademicYears(prev => prev.map(y => ({ ...y, active: y.label === savedYear })))
    }
  }, [])

  const handleActivateYear = (id: string, label: string) => {
    setAcademicYears(prev => prev.map(y => ({ ...y, active: y.id === id })))
    localStorage.setItem('activeAcademicYear', label)
    window.dispatchEvent(new Event('storage'))
  }

  const handleSaveChurchBranding = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem('churchName', churchNameInput)
    if (churchLogoInput) localStorage.setItem('churchLogo', churchLogoInput)
    
    // Save selected theme
    const theme = themePresets.find(p => p.id === selectedThemeId)
    if (theme) {
      localStorage.setItem('appTheme', JSON.stringify({ primary: theme.primary, secondary: theme.secondary }))
    }

    window.dispatchEvent(new Event('storage')) // Dispatch storage update to layout Shell
    setSaveChurchSuccess(true)
    setTimeout(() => setSaveChurchSuccess(false), 2000)
  }

  const handleLogoUploadSettings = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        const target = event.target
        if (target && target.result) {
          setChurchLogoInput(target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Custom Fields State (Item 56)
  const [customFields, setCustomFields] = useState([
    { id: 'f1', name: 'blood_type', label: 'فصيلة الدم', type: 'نصي (Text)' },
    { id: 'f2', name: 'bus_number', label: 'رقم الأوتوبيس (السيارة)', type: 'رقمي (Number)' }
  ])

  // Academic Years State
  const [academicYears, setAcademicYears] = useState([
    { id: 'y1', label: '2026/2027', period: '١ سبتمبر ٢٠٢٦ إلى ٣١ أغسطس ٢٠٢٧', active: true }
  ])

  // Year Modal Form states
  const [showYearModal, setShowYearModal] = useState(false)
  const [newYearLabel, setNewYearLabel] = useState('2027/2028')
  const [newYearPeriod, setNewYearPeriod] = useState('١ سبتمبر ٢٠٢٧ إلى ٣١ أغسطس ٢٠٢٨')

  // Custom Field Modal Form states
  const [showFieldModal, setShowFieldModal] = useState(false)
  const [newFieldLabel, setNewFieldLabel] = useState('')
  const [newFieldName, setNewFieldName] = useState('')
  const [newFieldType, setNewFieldType] = useState('نصي (Text)')

  // Stages management states
  const [stages, setStages] = useState<{ id: string; nameAr: string; nameEn: string; defaultDay: string; defaultDayLabel: string }[]>([])
  const [showStageModal, setShowStageModal] = useState(false)
  const [newStageAr, setNewStageAr] = useState('')
  const [newStageEn, setNewStageEn] = useState('')
  const [newStageDay, setNewStageDay] = useState('5') // default Friday

  const [editingStage, setEditingStage] = useState<{ id: string; nameAr: string; nameEn: string; defaultDay: string; defaultDayLabel: string } | null>(null)
  const [showEditStageModal, setShowEditStageModal] = useState(false)
  const [editStageAr, setEditStageAr] = useState('')
  const [editStageEn, setEditStageEn] = useState('')
  const [editStageDay, setEditStageDay] = useState('5')

  useEffect(() => {
    const saved = localStorage.getItem('academicStages')
    if (saved) {
      setStages(JSON.parse(saved))
    } else {
      const initial = [
        { id: 'primary', nameAr: 'ابتدائي', nameEn: 'Primary', defaultDay: '5', defaultDayLabel: 'الجمعة' },
        { id: 'prep', nameAr: 'إعدادي', nameEn: 'Prep', defaultDay: '6', defaultDayLabel: 'السبت' },
        { id: 'secondary', nameAr: 'ثانوي', nameEn: 'Secondary', defaultDay: '0', defaultDayLabel: 'الأحد' }
      ]
      setStages(initial)
      localStorage.setItem('academicStages', JSON.stringify(initial))
    }
  }, [])

  const getDayLabel = (dayCode: string) => {
    const days: Record<string, string> = {
      '0': 'الأحد',
      '1': 'الاثنين',
      '2': 'الثلاثاء',
      '3': 'الأربعاء',
      '4': 'الخميس',
      '5': 'الجمعة',
      '6': 'السبت',
    }
    return days[dayCode] || 'الجمعة'
  }

  const handleAddStage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStageAr || !newStageEn) return
    const id = newStageEn.toLowerCase().trim().replace(/\s+/g, '-')
    const newStage = {
      id,
      nameAr: newStageAr.trim(),
      nameEn: newStageEn.trim(),
      defaultDay: newStageDay,
      defaultDayLabel: getDayLabel(newStageDay)
    }
    const updated = [...stages, newStage]
    setStages(updated)
    localStorage.setItem('academicStages', JSON.stringify(updated))
    window.dispatchEvent(new Event('storage')) // Broadcast update to components
    setShowStageModal(false)
    setNewStageAr('')
    setNewStageEn('')
    setNewStageDay('5')
  }

  const handleStartEditStage = (stg: { id: string; nameAr: string; nameEn: string; defaultDay: string; defaultDayLabel: string }) => {
    setEditingStage(stg)
    setEditStageAr(stg.nameAr)
    setEditStageEn(stg.nameEn)
    setEditStageDay(stg.defaultDay)
    setShowEditStageModal(true)
  }

  const handleSaveEditStage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingStage || !editStageAr || !editStageEn) return
    const updated = stages.map(s => {
      if (s.id === editingStage.id) {
        return {
          ...s,
          nameAr: editStageAr.trim(),
          nameEn: editStageEn.trim(),
          defaultDay: editStageDay,
          defaultDayLabel: getDayLabel(editStageDay)
        }
      }
      return s
    })
    setStages(updated)
    localStorage.setItem('academicStages', JSON.stringify(updated))
    window.dispatchEvent(new Event('storage'))
    setShowEditStageModal(false)
    setEditingStage(null)
  }

  const handleDeleteStage = (id: string) => {
    if (stages.length <= 1) {
      alert('يجب أن يتبقى مرحلة واحدة على الأقل في النظام!')
      return
    }
    const updated = stages.filter(s => s.id !== id)
    setStages(updated)
    localStorage.setItem('academicStages', JSON.stringify(updated))
    window.dispatchEvent(new Event('storage')) // Broadcast update to components
  }

  const handleAddYear = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newYearLabel || !newYearPeriod) return
    setAcademicYears((prev) => {
      // Deactivate previous years
      const deactivated = prev.map(y => ({ ...y, active: false }))
      return [
        ...deactivated,
        { id: Date.now().toString(), label: newYearLabel, period: newYearPeriod, active: true }
      ]
    })
    localStorage.setItem('activeAcademicYear', newYearLabel)
    window.dispatchEvent(new Event('storage'))
    setShowYearModal(false)
  }

  const handleAddCustomField = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFieldLabel || !newFieldName) return
    setCustomFields((prev) => [
      ...prev,
      { id: Date.now().toString(), name: newFieldName, label: newFieldLabel, type: newFieldType }
    ])
    setNewFieldLabel('')
    setNewFieldName('')
    setShowFieldModal(false)
  }

  const handleDeleteField = (fieldId: string) => {
    setCustomFields((prev) => prev.filter(f => f.id !== fieldId))
  }

  const backups = [
    { id: 'b1', date: '2026-08-15 03:00', type: 'تلقائي (قاعدة بيانات)', size: '2.4 MB', file: 'backup_db_20260815.sql' },
    { id: 'b2', date: '2026-08-14 03:00', type: 'تلقائي (قاعدة بيانات)', size: '2.4 MB', file: 'backup_db_20260814.sql' },
    { id: 'b3', date: '2026-08-01 12:00', type: 'يدوي (شامل)', size: '115.6 MB', file: 'backup_full_20260801.tar.gz' }
  ]

  // Live Servants & Priests State for Permissions Matrix
  const [liveServantsForPerms, setLiveServantsForPerms] = useState<any[]>([])
  const [isSavingPerms, setIsSavingPerms] = useState(false)
  const [selectedRole, setSelectedRole] = useState<RoleKey>('service_admin')

  // Priests State Registry
  const [priests, setPriests] = useState([
    { id: 'p1', name: 'أبونا مرقس كمال', phone: '01234567801', church: 'كنيسة مارجرجس' },
    { id: 'p2', name: 'أبونا بطرس صليب', phone: '01234567802', church: 'كنيسة الأنبا بيشوي' },
    { id: 'p3', name: 'أبونا أنطونيوس صبحي', phone: '01234567803', church: 'كنيسة العذراء مريم' }
  ])

  const [newPriestName, setNewPriestName] = useState('')
  const [newPriestPhone, setNewPriestPhone] = useState('')
  const [newPriestChurch, setNewPriestChurch] = useState('')

  // Specific Roles requested by user with rich metadata and scopes
  const getAssignedServantsForRole = (roleKey: string) => {
    const list = liveServantsForPerms.filter(s => s.role === roleKey || (roleKey === 'priest' && s.role === 'confessor')).map(s => s.full_name)
    return list.length > 0 ? list : ['لا يوجد خدام معينين بهذا الدور حالياً']
  }

  const roles: { key: RoleKey; label: string; scope: string; scopeClass: string; description: string; scopeDetails: string; assignedServants: string[] }[] = [
    { 
      key: 'priest', 
      label: '✝️ كاهن / أب اعتراف', 
      scope: 'رعوي وإشرافي كامل', 
      scopeClass: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
      description: 'رعاية روحية كاملة واطلاع على كافة التقارير وسجلات الاعتراف والحسابات دون تعديل إداري.',
      scopeDetails: 'اطلاع كامل على كافة الفصول والتقارير والملفات وسجلات الاعتراف لضمان السرية والاستقلالية الرعوية للآباء الكهنة.',
      assignedServants: getAssignedServantsForRole('priest')
    },
    { 
      key: 'service_admin', 
      label: '👑 أمين عام الخدمة', 
      scope: 'إداري ومالي شامل', 
      scopeClass: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
      description: 'صلاحيات إدارية ومالية كاملة على مستوى جميع الكنائس والخدمات والمراحل.',
      scopeDetails: 'تحكم كامل في كافة مفاصل النظام الإدارية، تعديل الفصول والخدام، إدارة الميزانيات، وضبط شجرة المراحل التعليمية.',
      assignedServants: getAssignedServantsForRole('service_admin')
    },
    { 
      key: 'sector_leader', 
      label: '🏛️ أمين قطاع', 
      scope: 'إشراف قطاع كنسي', 
      scopeClass: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20',
      description: 'إشراف على فصول ومراحل متعددة داخل قطاع محدد بالكنيسة.',
      scopeDetails: 'صلاحيات كاملة للتعديل والمتابعة داخل الفصول والمراحل الواقعة في قطاعه التعليمي فقط.',
      assignedServants: getAssignedServantsForRole('sector_leader')
    },
    { 
      key: 'stage_leader', 
      label: '🎖️ أمين مرحلة', 
      scope: 'إشراف مرحلة', 
      scopeClass: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
      description: 'إشراف على الخدام والفصول والتقارير والمناهج داخل مرحلته الدراسية فقط.',
      scopeDetails: 'تعديل المناهج وتقارير المخدومين والغياب والافتقاد للخدام والطلاب المسجلين بمرحلته الدراسية.',
      assignedServants: getAssignedServantsForRole('stage_leader')
    },
    { 
      key: 'class_leader', 
      label: '⭐ أمين فصل', 
      scope: 'أمين فصل دراسي', 
      scopeClass: 'bg-violet-500/10 text-violet-700 border-violet-500/20',
      description: 'مسؤول عن فصله الدراسي، رصد الحضور، النقاط، ومتابعة الافتقاد وتعديل المخدومين.',
      scopeDetails: 'رصد وتعديل بيانات الطلاب، الحضور والغياب، النقاط والمكافآت، وكشوف الافتقاد للفصل الدراسي المسؤول عنه.',
      assignedServants: getAssignedServantsForRole('class_leader')
    },
    { 
      key: 'servant', 
      label: '🛡️ خادم فصل', 
      scope: 'خادم مساند', 
      scopeClass: 'bg-zinc-500/10 text-zinc-700 border-zinc-500/20',
      description: 'تسجيل الحضور والغياب، رصد نقاط النشاط، وكتابة تقارير الافتقاد لفصله.',
      scopeDetails: 'رصد الحضور الأسبوعي، تسجيل مكالمات الافتقاد، ورؤية تفاصيل نقاط طلاب الفصل دون صلاحيات نقلهم أو تغيير فصولهم.',
      assignedServants: getAssignedServantsForRole('servant')
    },
    { 
      key: 'treasurer', 
      label: '💰 أمين صندوق ومسؤول مالي', 
      scope: 'مالي وحسابات', 
      scopeClass: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
      description: 'تسجيل وإدارة حسابات الخدمة والاشتراكات والعهد المالية والمصروفات.',
      scopeDetails: 'صلاحيات كاملة للوصول إلى السجلات المالية، سندات القبض والصرف، وتقارير الميزانية دون تعديل بيانات الخدام أو الفصول.',
      assignedServants: getAssignedServantsForRole('treasurer')
    }
  ]
  const loadPermsData = async () => {
    try {
      const isXampp = typeof window !== 'undefined' && window.location.pathname.includes('/stmina')
      const [pRes, sRes] = await Promise.all([
        fetch(isXampp ? '/stmina/api/permissions.php' : '/api/permissions.php').catch(() => null),
        fetch(isXampp ? '/stmina/api/servants.php' : '/api/servants.php').catch(() => null)
      ])

      if (pRes && pRes.ok) {
        const pData = await pRes.json()
        if (pData && typeof pData === 'object' && Object.keys(pData).length > 0) {
          setPermissionMatrix(prev => ({ ...prev, ...pData }))
        }
      }

      if (sRes && sRes.ok) {
        const sData = await sRes.json()
        if (Array.isArray(sData)) setLiveServantsForPerms(sData)
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadPermsData()
  }, [])

  // Permission Matrix State
  const [permissionMatrix, setPermissionMatrix] = useState<Record<RoleKey, Record<string, boolean>>>({
    priest: {
      'students:view': true, 'students:edit': false, 'attendance:view': true, 'attendance:record': false,
      'followup:view': true, 'followup:edit': false, 'finance:view': true, 'finance:edit': false, 'settings:view': true, 'settings:edit': false
    },
    service_admin: {
      'students:view': true, 'students:edit': true, 'attendance:view': true, 'attendance:record': true,
      'followup:view': true, 'followup:edit': true, 'finance:view': true, 'finance:edit': true, 'settings:view': true, 'settings:edit': true
    },
    sector_leader: {
      'students:view': true, 'students:edit': true, 'attendance:view': true, 'attendance:record': true,
      'followup:view': true, 'followup:edit': true, 'finance:view': true, 'finance:edit': false, 'settings:view': true, 'settings:edit': false
    },
    stage_leader: {
      'students:view': true, 'students:edit': true, 'attendance:view': true, 'attendance:record': true,
      'followup:view': true, 'followup:edit': true, 'finance:view': false, 'finance:edit': false, 'settings:view': false, 'settings:edit': false
    },
    class_leader: {
      'students:view': true, 'students:edit': true, 'attendance:view': true, 'attendance:record': true,
      'followup:view': true, 'followup:edit': true, 'finance:view': false, 'finance:edit': false, 'settings:view': false, 'settings:edit': false
    },
    servant: {
      'students:view': true, 'students:edit': false, 'attendance:view': true, 'attendance:record': true,
      'followup:view': true, 'followup:edit': true, 'finance:view': false, 'finance:edit': false, 'settings:view': false, 'settings:edit': false
    },
    treasurer: {
      'students:view': true, 'students:edit': false, 'attendance:view': true, 'attendance:record': false,
      'followup:view': false, 'followup:edit': false, 'finance:view': true, 'finance:edit': true, 'settings:view': false, 'settings:edit': false
    }
  })

  const [saveSuccess, setSaveSuccess] = useState(false)

  const togglePermission = (role: RoleKey, perm: string) => {
    setPermissionMatrix((prev) => {
      const rolePerms = prev[role]
      return {
        ...prev,
        [role]: {
          ...rolePerms,
          [perm]: !rolePerms[perm]
        }
      }
    })
  }

  const handleSavePermissions = () => {
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
    // In production, persists changes to role_permissions in Supabase database
  }

  const addPriest = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPriestName || !newPriestPhone || !newPriestChurch) return
    setPriests((prev) => [
      ...prev,
      { id: Date.now().toString(), name: newPriestName, phone: newPriestPhone, church: newPriestChurch }
    ])
    setNewPriestName('')
    setNewPriestPhone('')
    setNewPriestChurch('')
  }

  const removePriest = (priestId: string) => {
    setPriests((prev) => prev.filter((p) => p.id !== priestId))
  }

  return (
    <Shell>
      <div className="space-y-6 font-sans">
        {/* Header */}
        <div className="border-b border-border pb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">إعدادات النظام والنسخ الاحتياطي</h1>
          <p className="text-sm text-muted-foreground mt-1">
            إعداد النظام الأكاديمي، تهيئة الحقول المخصصة، صلاحيات الخدام، وإجراء عمليات النسخ الاحتياطي.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap border-b border-border gap-x-4 gap-y-1 print:hidden">
          <Link
            href="/settings?tab=system"
            className={`py-2 px-3 text-xs md:text-sm font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'system' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Settings className="h-4 w-4" />
            إعدادات التهيئة والحقول
          </Link>

          <Link
            href="/settings?tab=permissions"
            className={`py-2 px-3 text-xs md:text-sm font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'permissions' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            صلاحيات وأدوار الخدمة
          </Link>
          
          <Link
            href="/settings?tab=priests"
            className={`py-2 px-3 text-xs md:text-sm font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'priests' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <UserCheck className="h-4 w-4" />
            قاعدة بيانات الآباء الكهنة
          </Link>

          <Link
            href="/settings?tab=backup"
            className={`py-2 px-3 text-xs md:text-sm font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'backup' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Database className="h-4 w-4" />
            النسخ الاحتياطي والتحديثات
          </Link>

          <Link
            href="/settings?tab=branding"
            className={`py-2 px-3 text-xs md:text-sm font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'branding' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            شعار الكنيسة وهويتها
          </Link>

          <Link
            href="/settings?tab=remote-reg"
            className={`py-2 px-3 text-xs md:text-sm font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'remote-reg' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Link2 className="h-4 w-4" />
            تسجيل البيانات عن بعد
          </Link>

          <Link
            href="/settings?tab=stages"
            className={`py-2 px-3 text-xs md:text-sm font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'stages' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <School className="h-4 w-4" />
            المراحل الدراسية والخدمية
          </Link>
        </div>

        {/* Tab 1: System Settings & Custom Fields */}
        {activeTab === 'system' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Academic Years Section */}
              <div className="bg-card border border-border rounded-xl p-5 md:p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-primary border-b border-border pb-1.5 flex justify-between items-center">
                  <span>الأعوام الدراسية النشطة</span>
                  <button
                    onClick={() => setShowYearModal(true)}
                    className="h-7 px-2.5 bg-primary text-primary-foreground font-semibold rounded text-[10px] flex items-center gap-1 hover:bg-primary/95 transition"
                  >
                    <Plus className="h-3 w-3" />
                    عام جديد
                  </button>
                </h3>
                
                <div className="space-y-2.5">
                  {academicYears.map((yr) => (
                    <div
                      key={yr.id}
                      className={`flex items-center justify-between p-3 border rounded-lg text-xs transition ${
                        yr.active
                          ? 'bg-success/5 border-success/30 text-success'
                          : 'bg-muted/30 border-border text-muted-foreground'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <p className="font-bold text-foreground">العام الدراسي: {yr.label}</p>
                        <p className="text-muted-foreground">الفترة: {yr.period}</p>
                      </div>
                      {yr.active ? (
                        <span className="font-bold text-success text-[10px]">العام النشط حالياً</span>
                      ) : (
                        <button
                          onClick={() => handleActivateYear(yr.id, yr.label)}
                          className="h-6 px-2 border border-border hover:bg-muted text-[9px] font-bold rounded transition text-muted-foreground"
                        >
                          تنشيط العام
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Fields Section */}
              <div className="bg-card border border-border rounded-xl p-5 md:p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-primary border-b border-border pb-1.5 flex justify-between items-center">
                  <span>الحقول الإضافية المخصصة (ملفات المخدومين)</span>
                  <button
                    onClick={() => setShowFieldModal(true)}
                    className="h-7 px-2.5 bg-primary text-primary-foreground font-semibold rounded text-[10px] flex items-center gap-1 hover:bg-primary/95 transition"
                  >
                    <Plus className="h-3 w-3" />
                    حقل مخصص
                  </button>
                </h3>
                
                <div className="space-y-3">
                  {customFields.map((field) => (
                    <div key={field.id} className="flex justify-between items-center p-3 border border-border rounded-lg bg-muted/20 hover:bg-muted/40 transition text-xs">
                      <div>
                        <p className="font-bold text-foreground">{field.label}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 font-normal">معرف النظام: {field.name}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-primary">{field.type}</span>
                        <button
                          onClick={() => handleDeleteField(field.id)}
                          className="p-1 rounded hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition"
                          title="حذف الحقل المخصص"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-wider border-b border-border pb-2">تفاصيل وإصدار التطبيق</h3>
                <div className="space-y-2.5 text-xs text-muted-foreground">
                  <p className="flex justify-between"><span>إصدار التطبيق:</span> <strong className="text-foreground">v1.0.0</strong></p>
                  <p className="flex justify-between"><span>نسخة قاعدة البيانات:</span> <strong className="text-foreground">v1.0.4-mig</strong></p>
                  <p className="flex justify-between"><span>تاريخ آخر تحديث:</span> <strong className="text-foreground">١٥ أغسطس ٢٠٢٦</strong></p>
                  <p className="flex justify-between"><span>بيئة العمل الحالية:</span> <strong className="text-success font-bold">المحلية (Development)</strong></p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Roles & Permissions Matrix */}
        {activeTab === 'permissions' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in">
            {/* Roles Selection list */}
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm h-fit space-y-3">
              <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-wider mb-2">الأدوار الوظيفية</h3>
              <div className="flex flex-col gap-2">
                {roles.map((r) => {
                  const isActive = selectedRole === r.key
                  return (
                    <div
                      key={r.key}
                      onClick={() => setSelectedRole(r.key as RoleKey)}
                      className={`w-full text-right p-3 rounded-xl border transition cursor-pointer select-none text-right flex flex-col gap-1.5 ${
                        isActive
                          ? 'border-primary bg-primary/[0.02] shadow-sm'
                          : 'border-border bg-card hover:bg-muted/15'
                      }`}
                    >
                      <div className="flex justify-between items-center gap-2">
                        <span className={`font-extrabold text-xs leading-normal ${isActive ? 'text-primary' : 'text-foreground'}`}>
                          {r.label.split('(')[0].trim()}
                        </span>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded border font-bold shrink-0 scale-90 whitespace-nowrap ${r.scopeClass}`}>
                          {r.scope}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        {r.description}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Permissions list Grid */}
            <div className="lg:col-span-3 bg-card border border-border rounded-xl p-5 md:p-6 shadow-sm space-y-6">
              
              {/* Stylized Access Scope Header */}
              <div className="bg-muted/30 border border-border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-sm text-foreground">طبيعة ومستوى وصول دور: {roles.find(r => r.key === selectedRole)?.label.split('(')[0].trim()}</span>
                    <span className={`text-[9px] px-2.5 py-0.5 rounded-full border font-bold ${roles.find(r => r.key === selectedRole)?.scopeClass}`}>
                      {roles.find(r => r.key === selectedRole)?.scope}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {roles.find(r => r.key === selectedRole)?.scopeDetails}
                  </p>
                </div>
                
                {/* Assigned Servants */}
                <div className="shrink-0 bg-card border border-border p-2.5 rounded-lg max-w-[200px] w-full md:w-auto">
                  <span className="text-[9px] font-bold text-muted-foreground block mb-1">الخدام المشمولين بهذا الدور:</span>
                  <div className="flex flex-wrap gap-1">
                    {roles.find(r => r.key === selectedRole)?.assignedServants.map((srv, idx) => (
                      <span key={idx} className="bg-muted text-foreground px-1.5 py-0.5 rounded text-[8px] font-bold">
                        {srv}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Matrix checkboxes */}
              <div className="space-y-6 border-t border-border pt-5">
                {[
                  { 
                    section: 'ملفات المخدومين والطلاب', 
                    items: [
                      { id: 'students:view', label: 'رؤية وعرض ملفات المخدومين', desc: 'الاطلاع على بيانات الطلاب الشخصية، سجل التفاعل التاريخي، الحالة الاجتماعية، وسوابق الافتقاد.' },
                      { id: 'students:edit', label: 'إضافة وتعديل بيانات المخدومين', desc: 'تسجيل طلاب جدد، تحديث بيانات التواصل لأولياء الأمور، تفعيل/تعطيل الحسابات، ونقل الطلاب بين الفصول.' }
                    ]
                  },
                  { 
                    section: 'دفتر الحضور والغياب للأنشطة والقداسات', 
                    items: [
                      { id: 'attendance:view', label: 'عرض تقارير الحضور والغياب للطلاب', desc: 'استعراض نسب الحضور الأسبوعية للقداسات والاجتماعات، وتحليل معدلات الغياب على مستوى المراحل والفصول.' },
                      { id: 'attendance:record', label: 'رصد الحضور اليومي وتأكيد الغياب', desc: 'تسجيل حضور الطلاب الفعلي بالكود الرقمي أو الـ QR، وإثبات حضور القداس الإلهي، والاعترافات الأسبوعية.' }
                    ]
                  },
                  { 
                    section: 'الافتقاد والمتابعة الدورية للطلاب', 
                    items: [
                      { id: 'followup:view', label: 'عرض سجل الافتقاد ومذكرات الخدام', desc: 'قراءة تقارير زيارات ومكالمات الخدام للطلاب، واستعراض تنبيهات المنقطعين والغياب المتكرر.' },
                      { id: 'followup:edit', label: 'تسجيل افتقاد ومكالمات وزيارات جديدة', desc: 'إثبات تفاصيل الافتقاد الجديد (مكالمة هاتفية، زيارة منزلية، رسالة إلكترونية) وإضافة ملاحظات المتابعة العاجلة.' }
                    ]
                  },
                  { 
                    section: 'الحسابات والميزانية وصناديق المراحل', 
                    items: [
                      { id: 'finance:view', label: 'عرض ميزانية الخدمة وحركات المال', desc: 'الاطلاع على حركة الصندوق المالي الموحد وميزانيات المراحل، وتقارير العشور السنوية وصافي الإيرادات والمصروفات.' },
                      { id: 'finance:edit', label: 'تسجيل مصروفات أو إيرادات جديدة', desc: 'تدوين حركات صرف النقدية وتبرعات الإيرادات، وتعديل الرصيد الافتتاحي وربط الخدام المفوضين بالصناديق.' }
                    ]
                  },
                  { 
                    section: 'إعدادات النظام والنسخ الاحتياطي والصلاحيات', 
                    items: [
                      { id: 'settings:view', label: 'عرض ملفات الخدام وإصدارات النظام', desc: 'تصفح دليل بيانات الخدام النشطين، والاطلاع على إعدادات المراحل والمناهج والنسخ الاحتياطية.' },
                      { id: 'settings:edit', label: 'إدارة أدوار الخدام والنسخ الاحتياطي', desc: 'تعديل جدول الصلاحيات للأدوار، إضافة آباء كهنة جدد، وتعديل أيام الخدمة، وتنزيل ملفات استعادة النظام.' }
                    ]
                  }
                ].map((sec, idx) => (
                  <div key={idx} className="space-y-2.5">
                    <h4 className="font-extrabold text-xs text-primary border-r-2 border-primary pr-2">{sec.section}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                      {sec.items.map((perm) => {
                        const isChecked = permissionMatrix[selectedRole]?.[perm.id] || false
                        return (
                          <div
                            key={perm.id}
                            onClick={() => togglePermission(selectedRole, perm.id)}
                            className={`flex items-start gap-3 p-3.5 border rounded-lg transition cursor-pointer select-none ${
                              isChecked 
                                ? 'border-primary/30 bg-primary/[0.01] hover:bg-primary/[0.03]' 
                                : 'border-border bg-muted/10 hover:bg-muted/30'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className="h-4.5 w-4.5 text-primary border-border rounded cursor-pointer mt-0.5 shrink-0"
                            />
                            <div className="space-y-0.5">
                              <span className="font-bold text-foreground block text-xs">{perm.label}</span>
                              <span className="text-[10px] text-muted-foreground block leading-normal">{perm.desc}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Save Success Alert */}
              {saveSuccess && (
                <div className="p-3 bg-success/10 border border-success text-success text-xs font-semibold rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>تم حفظ وتحديث الصلاحيات بنجاح!</span>
                </div>
              )}

              {/* Save Button */}
              <div className="flex justify-end pt-4 border-t border-border">
                <button
                  onClick={handleSavePermissions}
                  className="h-10 px-5 bg-primary text-primary-foreground font-semibold rounded-lg text-xs flex items-center gap-2 hover:bg-primary/95 shadow transition"
                >
                  <Save className="h-4 w-4" />
                  حفظ الصلاحيات لهذا الدور
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Priests Registry */}
        {activeTab === 'priests' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
            <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 md:p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-primary border-b border-border pb-1.5">الآباء الكهنة بكنائس الإيبارشية</h3>
              
              <div className="space-y-3">
                {priests.map((p) => (
                  <div key={p.id} className="flex justify-between items-center p-3.5 border border-border rounded-lg bg-muted/20 hover:bg-muted/40 transition">
                    <div className="space-y-0.5">
                      <p className="font-bold text-sm text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground">الكنيسة: {p.church} • رقم الهاتف والتواصل: {p.phone}</p>
                    </div>
                    <button
                      onClick={() => removePriest(p.id)}
                      className="p-2 rounded bg-muted hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition cursor-pointer"
                      title="حذف الكاهن"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4 h-fit">
              <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-wider border-b border-border pb-2">إضافة كاهن جديد</h3>
              
              <form onSubmit={addPriest} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">اسم الكاهن بالكامل</label>
                  <input
                    type="text" required placeholder="مثال: أبونا مرقس كمال..."
                    value={newPriestName} onChange={(e) => setNewPriestName(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">رقم الهاتف</label>
                  <input
                    type="tel" required placeholder="مثال: 01234567890..."
                    value={newPriestPhone} onChange={(e) => setNewPriestPhone(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">الكنيسة التابع لها</label>
                  <input
                    type="text" required placeholder="مثال: كنيسة مارجرجس..."
                    value={newPriestChurch} onChange={(e) => setNewPriestChurch(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-9 bg-primary text-primary-foreground font-semibold rounded-lg text-xs hover:bg-primary/95 shadow transition"
                >
                  حفظ الكاهن
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 4: Backups & Safe Recovery */}
        {activeTab === 'backup' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-xl p-5 md:p-6 shadow-sm space-y-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-primary">إنشاء نسخة احتياطية جديدة</h3>
                  <p className="text-xs text-muted-foreground">قم بأخذ لقطة فورية لقاعدة البيانات وحفظها بأمان.</p>
                </div>
                <div className="flex gap-2.5 flex-wrap pt-2">
                  <button className="flex-1 h-9 bg-primary text-primary-foreground font-semibold rounded-lg text-xs hover:bg-primary/95 shadow transition">
                    نسخة قاعدة بيانات فقط
                  </button>
                  <button className="flex-1 h-9 border border-border hover:bg-muted rounded-lg text-xs font-semibold text-muted-foreground transition">
                    نسخة شاملة (شامل الصور والوسائط)
                  </button>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-5 md:p-6 shadow-sm space-y-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-primary">استعادة نقطة حفظ سابقة</h3>
                  <p className="text-xs text-muted-foreground">ارفع ملف النسخة الاحتياطية لاستعادة البيانات السابقة.</p>
                </div>
                
                <div className="border border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:bg-muted/10 transition relative">
                  <input type="file" className="absolute inset-0 opacity-0 w-full cursor-pointer" />
                  <div className="flex flex-col items-center gap-1.5 text-xs text-muted-foreground">
                    <Upload className="h-5 w-5 text-primary" />
                    <span>اسحب ملف النسخة الاحتياطية (.sql أو .tar.gz) أو تصفح</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-bold text-sm">تاريخ النسخ الاحتياطية المحفوظة</h3>
              </div>

              <div className="divide-y divide-border">
                {backups.map((b) => (
                  <div key={b.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition flex-wrap gap-2 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{b.file}</span>
                        <span className="bg-muted text-[10px] text-muted-foreground px-1.5 py-0.5 rounded font-semibold">{b.type}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">تم الحفظ في: {b.date} • الحجم الكلي: {b.size}</p>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button className="h-8 px-3 border border-border hover:bg-muted rounded text-[10px] font-semibold text-muted-foreground transition">
                        تنزيل الملف
                      </button>
                      <button className="h-8 px-3 bg-destructive/10 hover:bg-destructive hover:text-white rounded text-[10px] font-semibold text-destructive transition">
                        حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* Tab 5: Church Branding & Identity (NEWLY IMPLEMENTED) */}
        {activeTab === 'branding' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
            <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 md:p-6 shadow-sm space-y-5">
              <h3 className="font-bold text-sm text-primary border-b border-border pb-2 flex items-center gap-1.5">
                <Sparkles className="h-4.5 w-4.5" />
                تخصيص هوية وشعار الكنيسة
              </h3>

              <form onSubmit={handleSaveChurchBranding} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">اسم الكنيسة / الخدمة الرسمي</label>
                  <input
                    type="text"
                    required
                    value={churchNameInput}
                    onChange={(e) => setChurchNameInput(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition font-bold"
                  />
                  <p className="text-[10px] text-muted-foreground">يظهر هذا الاسم في القائمة الجانبية للتطبيق وفي التقارير المطبوعة.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">تحميل شعار الكنيسة (Church Logo)</label>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-muted/30 border border-border rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                      {churchLogoInput ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={churchLogoInput} alt="Preview" className="h-full w-full object-contain" />
                      ) : (
                        <span className="text-2xl text-muted-foreground">☦</span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        id="logo-upload"
                        onChange={handleLogoUploadSettings}
                        className="hidden"
                      />
                      <label
                        htmlFor="logo-upload"
                        className="h-8 px-3 border border-border hover:bg-muted rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer text-muted-foreground transition"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        اختر صورة الشعار...
                      </label>
                      <p className="text-[9px] text-muted-foreground">يفضل اختيار صورة مربعة ذات خلفية شفافة وبحجم أقل من ٢ ميجابايت.</p>
                    </div>
                  </div>
                </div>

                {/* Theme Selector */}
                <div className="space-y-2.5 pt-4 border-t border-border/60">
                  <label className="text-xs font-bold text-foreground">اختيار طابع وألوان التطبيق (Theme Colors)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-right">
                    {themePresets.map((theme) => {
                      const isSelected = selectedThemeId === theme.id
                      return (
                        <div
                          key={theme.id}
                          onClick={() => setSelectedThemeId(theme.id)}
                          className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition select-none ${
                            isSelected 
                              ? 'bg-primary/5 border-primary shadow-sm ring-1 ring-primary/30' 
                              : 'bg-card border-border hover:bg-muted/40'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="h-4 w-4 rounded-full border border-border flex items-center justify-center shrink-0">
                              {isSelected && <span className="h-2 w-2 rounded-full bg-primary" />}
                            </span>
                            <span className="text-xs font-bold">{theme.nameAr}</span>
                          </div>
                          {/* Theme Preview Dot Indicators */}
                          <div className="flex gap-1 shrink-0">
                            <span className="h-4.5 w-4.5 rounded-full shadow-sm border border-black/10" style={{ backgroundColor: theme.previewPrimary }} />
                            <span className="h-4.5 w-4.5 rounded-full shadow-sm border border-black/10" style={{ backgroundColor: theme.previewSecondary }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {saveChurchSuccess && (
                  <div className="p-3 bg-success/15 border border-success text-success text-[11px] font-bold rounded-lg flex items-center gap-1.5 animate-pulse">
                    <CheckCircle2 className="h-4.5 w-4.5" />
                    <span>تم حفظ شعار واسم الكنيسة وتعميمهم على النظام بالكامل!</span>
                  </div>
                )}

                <div className="flex justify-end pt-4 border-t border-border">
                  <button
                    type="submit"
                    className="h-10 px-5 bg-primary text-primary-foreground font-semibold rounded-lg text-xs flex items-center gap-1.5 hover:bg-primary/95 shadow transition"
                  >
                    <Save className="h-4 w-4" />
                    حفظ وتعميم الهوية
                  </button>
                </div>
              </form>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4 h-fit">
              <h3 className="font-bold text-xs text-muted-foreground border-b border-border pb-2">تفاصيل وعرض شعار الكنيسة</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                بمجرد حفظ الهوية، سيتم استبدال الرمز الافتراضي (☦) في القائمة الجانبية والشريط العلوي بشعار كنيستكم الجديد مباشرة، مع تحديث المسمى بشكل فوري على جميع أجهزة الخدام المتصلين بالنظام.
              </p>
            </div>
          </div>
        )}

        {/* YEAR MODAL DIALOG OVERLAY */}
        {showYearModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border w-full max-w-md rounded-xl p-5 md:p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
              <div className="flex justify-between items-center border-b border-border pb-3">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5 font-sans">
                  <Plus className="h-4.5 w-4.5 text-primary" />
                  إضافة عام أكاديمي جديد للخدمة
                </h3>
                <button onClick={() => setShowYearModal(false)} className="p-1 rounded hover:bg-muted text-muted-foreground text-sm">✕</button>
              </div>

              <form onSubmit={handleAddYear} className="space-y-4 font-sans">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">العام الدراسي المستهدف</label>
                  <input
                    type="text" required placeholder="مثال: 2027/2028"
                    value={newYearLabel} onChange={(e) => setNewYearLabel(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition font-bold"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">الفترة الزمنية للعام الدراسي</label>
                  <input
                    type="text" required placeholder="مثال: ١ سبتمبر ٢٠٢٧ إلى ٣١ أغسطس ٢٠٢٨"
                    value={newYearPeriod} onChange={(e) => setNewYearPeriod(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition"
                  />
                </div>

                <div className="flex justify-end gap-2 border-t border-border pt-4">
                  <button type="submit" className="h-9 px-4 bg-primary text-primary-foreground font-semibold rounded-lg text-xs hover:bg-primary/95 shadow transition">
                    إضافة وتنشيط العام الدراسي
                  </button>
                  <button type="button" onClick={() => setShowYearModal(false)} className="h-9 px-3 border border-border hover:bg-muted text-xs font-semibold rounded-lg text-muted-foreground transition">
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CUSTOM FIELD MODAL DIALOG OVERLAY */}
        {showFieldModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border w-full max-w-md rounded-xl p-5 md:p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
              <div className="flex justify-between items-center border-b border-border pb-3">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5 font-sans">
                  <Plus className="h-4.5 w-4.5 text-primary" />
                  إضافة حقل بيانات مخصص لملفات الطلاب
                </h3>
                <button onClick={() => setShowFieldModal(false)} className="p-1 rounded hover:bg-muted text-muted-foreground text-sm">✕</button>
              </div>

              <form onSubmit={handleAddCustomField} className="space-y-4 font-sans">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">مسمى الحقل (بالعربية)</label>
                  <input
                    type="text" required placeholder="مثال: مقاس التيشيرت، وسيلة الانتقال..."
                    value={newFieldLabel} onChange={(e) => setNewFieldLabel(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition font-bold"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">معرف الحقل البرمجي (بالإنجيلزية)</label>
                  <input
                    type="text" required placeholder="مثال: tshirt_size"
                    value={newFieldName} onChange={(e) => setNewFieldName(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">نوع البيانات</label>
                  <select
                    value={newFieldType} onChange={(e) => setNewFieldType(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition font-bold"
                  >
                    <option value="نصي (Text)">نصي (Text)</option>
                    <option value="رقمي (Number)">رقمي (Number)</option>
                    <option value="تاريخ (Date)">تاريخ (Date)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 border-t border-border pt-4">
                  <button type="submit" className="h-9 px-4 bg-primary text-primary-foreground font-semibold rounded-lg text-xs hover:bg-primary/95 shadow transition">
                    إضافة الحقل
                  </button>
                  <button type="button" onClick={() => setShowFieldModal(false)} className="h-9 px-3 border border-border hover:bg-muted text-xs font-semibold rounded-lg text-muted-foreground transition">
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Tab 6: Remote Data Registration (Item 57) */}
        {activeTab === 'remote-reg' && (
          <div className="space-y-6 animate-in fade-in font-sans text-right">
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              {/* Header Bar */}
              <div className="p-4 border-b border-border bg-muted/10 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-primary" />
                  <span className="font-bold text-sm text-foreground">تسجيل البيانات عن بعد</span>
                </div>
                <span className="text-xs text-muted-foreground">▼</span>
              </div>

              {/* Body */}
              <div className="p-5 md:p-6 space-y-6">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  يمكنك دعوة المخدومين ليقوموا بتسجيل بياناتهم بأنفسهم، دون الحاجة لتسجيل حساب بالموقع..
                </p>

                <div className="space-y-2 text-xs">
                  <p className="text-primary hover:underline cursor-pointer font-semibold">
                    طريقة الاستخدام (إضغط هنا)
                  </p>
                  <p 
                    onClick={() => setRemoteLinkEnabled(!remoteLinkEnabled)} 
                    className="text-primary hover:underline cursor-pointer font-semibold flex items-center gap-1.5 justify-end"
                  >
                    <span>التفعيل أو إلغاء التفعيل ({remoteLinkEnabled ? 'نشط حالياً' : 'معطل حالياً'} - إضغط هنا).</span>
                  </p>
                </div>

                {remoteLinkEnabled ? (
                  <div className="space-y-3 pt-4 border-t border-border">
                    <label className="block text-xs font-bold text-muted-foreground">
                      رابط إستمارة تسجيل البيانات:
                    </label>
                    <div className="w-full bg-muted/30 border border-border rounded-lg p-3 text-xs font-mono text-left select-all overflow-x-auto whitespace-nowrap">
                      {typeof window !== 'undefined' 
                        ? `${window.location.origin}/Anonymous_Register?m=9f0858f9bd70995ffb84ce85073a52c8f280df31` 
                        : 'https://madareselahadplus.com/Anonymous_Register?m=9f0858f9bd70995ffb84ce85073a52c8f280df31'}
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="w-full h-10 bg-primary text-primary-foreground font-semibold rounded-lg text-xs flex items-center justify-center gap-2 hover:bg-primary/95 shadow transition"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span>تم نسخ الرابط بنجاح!</span>
                        </>
                      ) : (
                        <>
                          <ClipboardCheck className="h-4 w-4" />
                          <span>نسخ الرابط</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-xs font-bold text-center">
                    رابط التسجيل عن بعد معطل حالياً. يرجى تفعيله لعرض الرابط.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: Academic Stages Configuration */}
        {activeTab === 'stages' && (
          <div className="space-y-6 animate-in fade-in font-sans text-right">
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/10 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <School className="h-5 w-5 text-primary" />
                  <span className="font-bold text-sm text-foreground">إدارة المراحل الدراسية والخدمية</span>
                </div>
                <button
                  onClick={() => setShowStageModal(true)}
                  className="h-9 px-3 bg-primary text-primary-foreground font-semibold rounded-lg text-xs flex items-center gap-1 hover:bg-primary/95 shadow transition"
                >
                  <Plus className="h-4 w-4" />
                  مرحلة جديدة
                </button>
              </div>

              <div className="p-5 md:p-6 space-y-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  تتيح لك هذه الشاشة إضافة وتخصيص المراحل الدراسية والخدمية في مدارس الأحد. سيتم تفعيل هذه المراحل تلقائياً في شاشات إنشاء الفصول الجديدة، تفويض صلاحيات الخدام، وجدولة لقاءات الخدمة الأسبوعية.
                </p>

                <div className="overflow-x-auto border border-border rounded-lg">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-muted/40 text-muted-foreground font-bold border-b border-border">
                      <tr>
                        <th className="px-4 py-3">كود المرحلة (ID)</th>
                        <th className="px-4 py-3">الاسم بالعربية</th>
                        <th className="px-4 py-3">الاسم بالإنجليزية</th>
                        <th className="px-4 py-3">يوم الاجتماع الافتراضي</th>
                        <th className="px-4 py-3 text-center w-24">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-foreground">
                      {stages.map((stg) => (
                        <tr key={stg.id} className="hover:bg-muted/20 transition">
                          <td className="px-4 py-3 font-mono">{stg.id}</td>
                          <td className="px-4 py-3 font-bold">{stg.nameAr}</td>
                          <td className="px-4 py-3">{stg.nameEn}</td>
                          <td className="px-4 py-3 text-success font-semibold">{stg.defaultDayLabel}</td>
                          <td className="px-4 py-3 text-center flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleStartEditStage(stg)}
                              className="p-1.5 text-primary hover:bg-primary/10 rounded transition"
                              title="تعديل المرحلة"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteStage(stg.id)}
                              className="p-1.5 text-destructive hover:bg-destructive/10 rounded transition"
                              title="حذف المرحلة"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stage Creation Modal Dialog */}
        {showStageModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans text-right">
            <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-border bg-muted/10 flex justify-between items-center">
                <span className="font-bold text-sm text-primary flex items-center gap-1.5">
                  <School className="h-4.5 w-4.5" />
                  إضافة مرحلة دراسية جديدة
                </span>
                <button onClick={() => setShowStageModal(false)} className="text-muted-foreground hover:text-foreground text-sm font-bold">✕</button>
              </div>

              <form onSubmit={handleAddStage} className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">اسم المرحلة بالعربية</label>
                  <input
                    type="text"
                    required
                    value={newStageAr}
                    onChange={(e) => setNewStageAr(e.target.value)}
                    placeholder="مثال: حضانة، جامعيين، خريجين"
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 text-right"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">اسم المرحلة بالإنجليزية</label>
                  <input
                    type="text"
                    required
                    value={newStageEn}
                    onChange={(e) => setNewStageEn(e.target.value)}
                    placeholder="مثال: Kindergarten, College"
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 text-left font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">يوم الاجتماع الأسبوعي الافتراضي</label>
                  <select
                    value={newStageDay}
                    onChange={(e) => setNewStageDay(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 font-bold"
                  >
                    <option value="5">الجمعة (Friday)</option>
                    <option value="6">السبت (Saturday)</option>
                    <option value="0">الأحد (Sunday)</option>
                    <option value="1">الاثنين (Monday)</option>
                    <option value="2">الثلاثاء (Tuesday)</option>
                    <option value="3">الأربعاء (Wednesday)</option>
                    <option value="4">الخميس (Thursday)</option>
                  </select>
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t border-border/60">
                  <button type="submit" className="h-9 px-4 bg-primary text-primary-foreground font-semibold rounded-lg text-xs hover:bg-primary/95 shadow transition">
                    حفظ المرحلة
                  </button>
                  <button type="button" onClick={() => setShowStageModal(false)} className="h-9 px-3 border border-border hover:bg-muted text-xs font-semibold rounded-lg text-muted-foreground transition">
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Stage Edit Modal Dialog */}
        {showEditStageModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans text-right">
            <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-border bg-muted/10 flex justify-between items-center">
                <span className="font-bold text-sm text-primary flex items-center gap-1.5">
                  <Pencil className="h-4 w-4" />
                  تعديل بيانات المرحلة الدراسية
                </span>
                <button onClick={() => setShowEditStageModal(false)} className="text-muted-foreground hover:text-foreground text-sm font-bold">✕</button>
              </div>

              <form onSubmit={handleSaveEditStage} className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">اسم المرحلة بالعربية</label>
                  <input
                    type="text"
                    required
                    value={editStageAr}
                    onChange={(e) => setEditStageAr(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 text-right font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">اسم المرحلة بالإنجليزية</label>
                  <input
                    type="text"
                    required
                    value={editStageEn}
                    onChange={(e) => setEditStageEn(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 text-left font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">يوم الاجتماع الأسبوعي الافتراضي</label>
                  <select
                    value={editStageDay}
                    onChange={(e) => setEditStageDay(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 font-bold"
                  >
                    <option value="5">الجمعة (Friday)</option>
                    <option value="6">السبت (Saturday)</option>
                    <option value="0">الأحد (Sunday)</option>
                    <option value="1">الاثنين (Monday)</option>
                    <option value="2">الثلاثاء (Tuesday)</option>
                    <option value="3">الأربعاء (Wednesday)</option>
                    <option value="4">الخميس (Thursday)</option>
                  </select>
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t border-border/60">
                  <button type="submit" className="h-9 px-4 bg-primary text-primary-foreground font-semibold rounded-lg text-xs hover:bg-primary/95 shadow transition">
                    حفظ التعديلات
                  </button>
                  <button type="button" onClick={() => setShowEditStageModal(false)} className="h-9 px-3 border border-border hover:bg-muted text-xs font-semibold rounded-lg text-muted-foreground transition">
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Shell>
  )
}
