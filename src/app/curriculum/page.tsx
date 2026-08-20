'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Shell } from '@/components/layout/Shell'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { useAuth } from '@/lib/auth/AuthContext'
import { getStudents, StudentItem } from '@/lib/services/studentsService'
import { 
  BookOpen, 
  Search, 
  Download, 
  Plus, 
  FileText, 
  User, 
  Bookmark, 
  Quote, 
  Sparkles, 
  Trash2, 
  UploadCloud,
  CheckCircle,
  FileUp,
  X,
  School,
  CalendarDays,
  Layers,
  ShieldCheck,
  Printer,
  FileSpreadsheet,
  Pencil,
  Music,
  GraduationCap,
  Volume2,
  Award,
  Play,
  Check,
  Filter,
  Save,
  Clock,
  ChevronRight,
  ExternalLink,
  ChevronDown,
  Church,
  Scroll,
  UserCheck,
  Library,
  BookMarked,
  Eye,
  Calendar,
  Share2,
  LayoutGrid,
  Table as TableIcon,
  ListOrdered
} from 'lucide-react'
import Link from 'next/link'

interface LessonFile {
  name: string
  size: string
}

interface LessonItem {
  id: string
  title: string
  stage: string
  className: string
  gradeName?: string
  servantName: string
  meetingDay: string
  lessonDate: string
  week: number
  bibleVerse: string
  bibleCitation: string
  references: string[]
  content: string
  files?: LessonFile[]
}

interface MasterHymnItem {
  id: string
  name_ar: string
  name_en: string
  coptic_text?: string
  phonetics?: string
  category: 'ألحان سنوية' | 'ألحان مناسبات' | 'طقوس كنسية' | 'لغة قبطية'
  stage: string
  reward_points: number
  description: string
}

interface HistoryItem {
  id: string
  title: string
  stage: string
  era?: string
  desc: string
}

export default function CurriculumPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-xs text-muted-foreground font-sans">جاري تحميل منهج مدارس الأحد والمكتبة...</div>}>
      <CurriculumPageContent />
    </Suspense>
  )
}

function CurriculumPageContent() {
  const { locale } = useLanguage()
  const { profile } = useAuth()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab') as 'sunday-school' | 'hymns' | 'coptic' | 'history' | 'all' | null

  const [activeTab, setActiveTab] = useState<'sunday-school' | 'hymns' | 'coptic' | 'history'>(
    tabParam === 'all' ? 'sunday-school' : (tabParam as any) || 'sunday-school'
  )
  
  // Display View Modes: 'grid' (Cards) | 'table' (Roster Table) | 'timeline' (Weekly Plan)
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'timeline'>('grid')

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStage, setSelectedStage] = useState<string>('الكل')
  const [selectedClass, setSelectedClass] = useState<string>('الكل')
  const [students, setStudents] = useState<StudentItem[]>([])

  // Servants List
  const servantsList = [
    'مينا كمال غبريال (أمين الفصل)',
    'تامر شفيق عزمي (أمين المرحلة)',
    'يوسف سامح سمير (خادم التربية الكنسية)',
    'مارينا رأفت عياد (خادمة مسؤولة)',
    'سارة فوزي شكري (خادمة وسائل الإيضاح)',
    'كيرلس مجدي عادل (خادم الأنشطة)'
  ]

  // Modals Visibility
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [showAddLessonModal, setShowAddLessonModal] = useState(false)
  const [showAddHymnModal, setShowAddHymnModal] = useState(false)
  const [showAddHistoryModal, setShowAddHistoryModal] = useState(false)

  // Lesson Detailed View Modal State
  const [viewingLesson, setViewingLesson] = useState<LessonItem | null>(null)

  // Add Lesson Form State
  const [lessonTitle, setLessonTitle] = useState('')
  const [lessonStage, setLessonStage] = useState('ابتدائي')
  const [lessonClass, setLessonClass] = useState('فصل الأنبا بيشوي')
  const [lessonGrade, setLessonGrade] = useState('ثالثة ابتدائي')
  const [lessonServant, setLessonServant] = useState(servantsList[0])
  const [lessonMeetingDay, setLessonMeetingDay] = useState('الجمعة الأولى من الشهر')
  const [lessonDate, setLessonDate] = useState(new Date().toISOString().substring(0, 10))
  const [lessonWeek, setLessonWeek] = useState('1')
  const [lessonVerse, setLessonVerse] = useState('')
  const [lessonCitation, setLessonCitation] = useState('')
  const [lessonContent, setLessonContent] = useState('')
  const [lessonReferences, setLessonReferences] = useState<string[]>([
    'تفسير القمص تادرس يعقوب ملطي',
    'كتاب تفسير العهد القديم - الكلية الإكليريكية'
  ])

  // Add Hymn Form State
  const [newHymnTitle, setNewHymnTitle] = useState('')
  const [newHymnEn, setNewHymnEn] = useState('')
  const [newHymnCoptic, setNewHymnCoptic] = useState('')
  const [newHymnPhonetics, setNewHymnPhonetics] = useState('')
  const [newHymnCategory, setNewHymnCategory] = useState<'ألحان سنوية' | 'ألحان مناسبات' | 'طقوس كنسية' | 'لغة قبطية'>('ألحان سنوية')
  const [newHymnStage, setNewHymnStage] = useState('ابتدائي')
  const [newHymnPoints, setNewHymnPoints] = useState('25')
  const [newHymnDesc, setNewHymnDesc] = useState('')

  // Add History Form State
  const [historyTitle, setHistoryTitle] = useState('')
  const [historyStage, setHistoryStage] = useState('إعدادي وثانوي')
  const [historyEra, setHistoryEra] = useState('عصر المجامع المسكونية')
  const [historyDesc, setHistoryDesc] = useState('')

  // Registry of Lessons
  const [lessons, setLessons] = useState<LessonItem[]>([
    {
      id: 'l1',
      title: 'قصة داود النبي وجليات الجبار',
      stage: 'ابتدائي',
      className: 'فصل الأنبا بيشوي',
      gradeName: 'ثالثة ابتدائي',
      servantName: 'مينا كمال غبريال',
      meetingDay: 'جمعة (الأسبوع الأول)',
      lessonDate: '2026-08-21',
      week: 1,
      bibleVerse: 'أَنْتَ تَأْتِي إِلَيَّ بِسَيْفٍ وَبِرُمْحٍ وَبِتُرْسٍ، وَأَنَا آتِي إِلَيْكَ بِاسْمِ رَبِّ الْجُنُودِ',
      bibleCitation: '١ صموئيل ١٧: ٤٥',
      references: [
        'تفسير سفر صموئيل الأول للقمص تادرس يعقوب ملطي',
        'كتاب حياة داود النبي - قداسة البابا شنوده الثالث',
        'موسوعة العهد القديم - الكلية الإكليريكية'
      ],
      content: 'دراسة في الشجاعة والاتكال على اسم رب الجنود، وكيف انتصر داود الصغير بمقلاعه على جليات الجبار رمزاً للغلبة بالإيمان والاتكال على الله.'
    },
    {
      id: 'l2',
      title: 'قصة يوسف البار في مصر (الأمانة والنصرة)',
      stage: 'ابتدائي',
      className: 'فصل القديسة دميانة',
      gradeName: 'رابعة ابتدائي',
      servantName: 'تامر شفيق عزمي',
      meetingDay: 'جمعة (الأسبوع الثاني)',
      lessonDate: '2026-08-28',
      week: 2,
      bibleVerse: 'أَنْتُمْ قَصَدْتُمْ لِي شَرًّا، أَمَّا اللهُ فَقَصَدَ بِهِ خَيْرًا',
      bibleCitation: 'تكوين ٥٠: ٢٠',
      references: [
        'تفسير سفر التكوين - القمص أنطونيوس فكري',
        'سير الآباء البطاركة وأمانة يوسف - كنيسة مارمينا'
      ],
      content: 'كيف حول الرب الشر إلى خير في حياة يوسف الصديق، وأمانته في بيت فوطيفار وفي السجن حتى صار وزيراً لمصر.'
    },
    {
      id: 'l3',
      title: 'سر المعمودية والولادة الجديدة من الماء والروح',
      stage: 'إعدادي',
      className: 'فصل مارجرجس',
      gradeName: 'أولى إعدادي',
      servantName: 'يوسف سامح سمير',
      meetingDay: 'جمعة (الأسبوع الثالث)',
      lessonDate: '2026-09-04',
      week: 3,
      bibleVerse: 'إِنْ كَانَ أَحَدٌ لاَ يُولَدُ مِنَ الْمَاءِ وَالرُّوحِ لاَ يَقْدِرُ أَنْ يَدْخُلَ مَلَكُوتَ اللهِ',
      bibleCitation: 'يوحنا ٣: ٥',
      references: [
        'كتاب اللاهوت الطقسي والمقارن - الأنبا غريغوريوس',
        'أسرار الكنيسة السبعة - الأرشيدياكون رشدي واصف'
      ],
      content: 'شرح عقيدة المعمودية، الرموز النبوية في العهد القديم، وطقس المعمودية بالتغطيس الثلاثي باسم الآب والابن والروح القدس.'
    },
    {
      id: 'l4',
      title: 'مفهوم الخدمة والتكريس في العهد الجديد',
      stage: 'ثانوي',
      className: 'فصل الشهيد مرقوريوس',
      gradeName: 'ثانية ثانوي',
      servantName: 'كيرلس مجدي عادل',
      meetingDay: 'جمعة (الأسبوع الرابع)',
      lessonDate: '2026-09-11',
      week: 4,
      bibleVerse: 'لأَنَّ ابْنَ الإِنْسَانِ لَمْ يَأْتِ لِيُخْدَمَ بَلْ لِيَخْدِمَ وَلِيَبْذِلَ نَفْسَهُ فِدْيَةً عَنْ كَثِيرِينَ',
      bibleCitation: 'مرقس ١٠: ٤٥',
      references: [
        'كتاب الخدمة الروحية والخادم الروحي - البابا شنوده الثالث',
        'رسائل القديس بولس الرسول الرعوية'
      ],
      content: 'معنى التكريس القلبي، بذل الذات من أجل الآخرين، وكيف يكون الشاب خادماً للمسيح في المدرسة والجامعة والمجتمع.'
    }
  ])

  // Hymns Database
  const [masterHymns, setMasterHymns] = useState<MasterHymnItem[]>([
    {
      id: 'mh1',
      name_ar: 'لحن تين أويشت (قداس)',
      name_en: 'Ten Ousht',
      coptic_text: 'Ⲧⲉⲛⲟⲩⲱϣⲧ ⲙ̀Ⲫⲓⲱⲧ ⲛⲉⲙ Ⲡϣⲏⲣⲓ: ⲛⲉⲙ Ⲡⲓⲡⲛⲉⲩⲙⲁ ⲉⲑⲟⲩⲁⲃ',
      phonetics: 'تين أويشت إم إفيوت نيم إبشيري: نيم بي إبنفما إثؤواب',
      category: 'ألحان سنوية',
      stage: 'ابتدائي',
      reward_points: 25,
      description: 'يقال في بداية القداس الإلهي، ومعناه: نسجد للآب والابن والروح القدس الثالوث الأقدس المساوي.'
    },
    {
      id: 'mh2',
      name_ar: 'لحن أجيوس (الثلاثة تقديسات)',
      name_en: 'Agios O Theos',
      coptic_text: 'Ⲁⲅⲓⲟⲥ ⲟ Ⲑⲉⲟⲥ: ⲁⲅⲓⲟⲥ ⲓⲥⲭⲩⲣⲟⲥ: ⲁⲅⲓⲟⲥ ⲁⲑⲁⲛⲁⲧⲟⲥ',
      phonetics: 'أجيوس أو ثيئوس: أجيوس إسشيروس: أجيوس أثاناتوس',
      category: 'ألحان سنوية',
      stage: 'ابتدائي',
      reward_points: 30,
      description: 'تسبحة الملائكة قبل قراءة الإنجيل المقدس: قدوس الله، قدوس القوي، قدوس الذي لا يموت.'
    }
  ])

  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([
    { id: 'his1', title: 'مجمع نيقية المسكوني الأول (٣٢٥ م)', era: 'عصر المجامع المسكونية', desc: 'قانون الإيمان الأرثوذكسي ودور القديس أثناسيوس الرسولي في دحض بدعة أريوس.', stage: 'إعدادي وثانوي' },
    { id: 'his2', title: 'تاريخ الرهبنة القبطية: القديس أنطونيوس الكبير', era: 'عصر الآباء والرهبنة', desc: 'نشأة الرهبنة في برية مصر وتأثيرها على العالم المسيحي أجمع.', stage: 'ابتدائي وإعدادي' }
  ])

  useEffect(() => {
    if (tabParam) {
      if (tabParam === 'all') setActiveTab('sunday-school')
      else setActiveTab(tabParam as any)
    }
  }, [tabParam])

  useEffect(() => {
    async function load() {
      const all = await getStudents()
      setStudents(all)
    }
    load()

    const savedLessons = localStorage.getItem('ssms-custom-lessons')
    if (savedLessons) setLessons(JSON.parse(savedLessons))

    const savedHymns = localStorage.getItem('ssms-custom-hymns')
    if (savedHymns) setMasterHymns(JSON.parse(savedHymns))

    const savedHistory = localStorage.getItem('ssms-custom-history')
    if (savedHistory) setHistoryItems(JSON.parse(savedHistory))
  }, [])

  // Reference fields handlers
  const handleAddReferenceField = () => {
    setLessonReferences([...lessonReferences, ''])
  }

  const handleUpdateReferenceField = (index: number, value: string) => {
    const updated = [...lessonReferences]
    updated[index] = value
    setLessonReferences(updated)
  }

  const handleRemoveReferenceField = (index: number) => {
    if (lessonReferences.length <= 1) return
    setLessonReferences(lessonReferences.filter((_, i) => i !== index))
  }

  // Excel Export Handler for Sunday School Lessons
  const handleExportExcel = () => {
    const headers = [
      'رقم الأسبوع',
      'يوم اللقاء / الجمعة',
      'تاريخ الإلقاء',
      'المرحلة',
      'الفصل',
      'عنوان الدرس',
      'الخادم المكلف بالشرح',
      'الآية الذهبية',
      'شاهد الآية',
      'المراجع الكنسية والتفسيرية',
      'ملخص وأهداف الدرس'
    ]

    const rows = filteredLessons.map(l => [
      l.week,
      `"${(l.meetingDay || 'الجمعة').replace(/"/g, '""')}"`,
      `"${l.lessonDate || ''}"`,
      `"${l.stage.replace(/"/g, '""')}"`,
      `"${l.className.replace(/"/g, '""')}"`,
      `"${l.title.replace(/"/g, '""')}"`,
      `"${l.servantName.replace(/"/g, '""')}"`,
      `"${l.bibleVerse.replace(/"/g, '""')}"`,
      `"${l.bibleCitation.replace(/"/g, '""')}"`,
      `"${(l.references || []).join(' | ').replace(/"/g, '""')}"`,
      `"${(l.content || '').replace(/"/g, '""')}"`
    ])

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `منهج_مدارس_الأحد_${new Date().toISOString().substring(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Save Lesson Handler
  const handleSaveLesson = (e: React.FormEvent) => {
    e.preventDefault()
    if (!lessonTitle.trim()) return

    const validReferences = lessonReferences.filter(r => r.trim() !== '')

    const newLesson: LessonItem = {
      id: `l-${Date.now()}`,
      title: lessonTitle,
      stage: lessonStage,
      className: lessonClass,
      gradeName: lessonGrade,
      servantName: lessonServant,
      meetingDay: lessonMeetingDay,
      lessonDate: lessonDate || new Date().toISOString().substring(0, 10),
      week: parseInt(lessonWeek) || 1,
      bibleVerse: lessonVerse,
      bibleCitation: lessonCitation,
      references: validReferences.length > 0 ? validReferences : ['مناهج مدارس الأحد الكنسية'],
      content: lessonContent
    }

    const updated = [newLesson, ...lessons]
    setLessons(updated)
    localStorage.setItem('ssms-custom-lessons', JSON.stringify(updated))

    setShowAddLessonModal(false)
    setLessonTitle('')
    setLessonVerse('')
    setLessonCitation('')
    setLessonContent('')
    setLessonReferences(['تفسير القمص تادرس يعقوب ملطي'])
  }

  // Save Hymn Handler
  const handleSaveHymn = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newHymnTitle.trim()) return

    const newHymn: MasterHymnItem = {
      id: `mh-${Date.now()}`,
      name_ar: newHymnTitle,
      name_en: newHymnEn,
      coptic_text: newHymnCoptic,
      phonetics: newHymnPhonetics,
      category: newHymnCategory,
      stage: newHymnStage,
      reward_points: parseInt(newHymnPoints) || 20,
      description: newHymnDesc
    }

    const updated = [newHymn, ...masterHymns]
    setMasterHymns(updated)
    localStorage.setItem('ssms-custom-hymns', JSON.stringify(updated))

    setShowAddHymnModal(false)
    setNewHymnTitle('')
    setNewHymnEn('')
    setNewHymnCoptic('')
    setNewHymnPhonetics('')
    setNewHymnDesc('')
  }

  // Save History Handler
  const handleSaveHistory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!historyTitle.trim()) return

    const newItem: HistoryItem = {
      id: `his-${Date.now()}`,
      title: historyTitle,
      stage: historyStage,
      era: historyEra,
      desc: historyDesc
    }

    const updated = [newItem, ...historyItems]
    setHistoryItems(updated)
    localStorage.setItem('ssms-custom-history', JSON.stringify(updated))

    setShowAddHistoryModal(false)
    setHistoryTitle('')
    setHistoryDesc('')
  }

  const distinctStages = ['الكل', 'حضانة', 'ابتدائي', 'إعدادي', 'ثانوي']
  const distinctClasses = ['الكل', ...Array.from(new Set(lessons.map(l => l.className)))]

  const filteredLessons = lessons.filter(l => {
    const matchStage = selectedStage === 'الكل' || l.stage === selectedStage
    const matchClass = selectedClass === 'الكل' || l.className === selectedClass
    const matchSearch = !searchTerm || l.title.includes(searchTerm) || l.bibleVerse.includes(searchTerm) || l.servantName.includes(searchTerm) || (l.meetingDay && l.meetingDay.includes(searchTerm))
    return matchStage && matchClass && matchSearch
  })

  const filteredHymns = masterHymns.filter(h => {
    const matchCategory = activeTab === 'coptic'
      ? (h.category === 'لغة قبطية' || h.category === 'طقوس كنسية')
      : activeTab === 'hymns'
      ? (h.category === 'ألحان سنوية' || h.category === 'ألحان مناسبات')
      : true

    const matchStage = selectedStage === 'الكل' || h.stage === selectedStage || h.stage === 'الكل'
    const matchSearch = !searchTerm || h.name_ar.includes(searchTerm) || h.name_en.toLowerCase().includes(searchTerm.toLowerCase()) || (h.phonetics && h.phonetics.includes(searchTerm))
    return matchCategory && matchStage && matchSearch
  })

  return (
    <Shell>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">منهج مدارس الأحد والمكتبة الكنسية</h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1 font-sans">
              تحضير الدروس، مواعيد الجمعة واللقاءات، تكليفات الخدام، الآيات والشواهد، وبنك المراجع التفسيرية.
            </p>
          </div>

          {/* Primary Action Button */}
          <div className="relative flex gap-2">
            {activeTab === 'sunday-school' && (
              <button
                onClick={() => setShowAddLessonModal(true)}
                className="h-10 px-4 bg-primary text-primary-foreground font-semibold rounded-xl text-xs flex items-center gap-2 hover:bg-primary/95 shadow-sm transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                إضافة تحضير درس جديد
              </button>
            )}

            {(activeTab === 'coptic' || activeTab === 'hymns') && (
              <button
                onClick={() => {
                  setNewHymnCategory(activeTab === 'coptic' ? 'لغة قبطية' : 'ألحان سنوية')
                  setShowAddHymnModal(true)
                }}
                className="h-10 px-4 bg-primary text-primary-foreground font-semibold rounded-xl text-xs flex items-center gap-2 hover:bg-primary/95 shadow-sm transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                {activeTab === 'coptic' ? 'إضافة طقس / درس قبطي' : 'إضافة لحن كنسي جديد'}
              </button>
            )}

            {activeTab === 'history' && (
              <button
                onClick={() => setShowAddHistoryModal(true)}
                className="h-10 px-4 bg-primary text-primary-foreground font-semibold rounded-xl text-xs flex items-center gap-2 hover:bg-primary/95 shadow-sm transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                إضافة موضوع تاريخ وعقيدة
              </button>
            )}

            {/* Quick Add Split Menu */}
            <div className="relative">
              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="h-10 px-3 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
              >
                <ChevronDown className="h-4 w-4" />
              </button>

              {showAddMenu && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute left-0 mt-2 w-60 bg-card border border-border rounded-xl shadow-xl p-1 z-50 animate-in fade-in slide-in-from-top-2 text-xs"
                >
                  <button
                    onClick={() => { setShowAddMenu(false); setShowAddLessonModal(true); }}
                    className="w-full text-right flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-foreground transition cursor-pointer"
                  >
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span>إضافة درس وتحضير أسبوعي</span>
                  </button>
                  <button
                    onClick={() => { setShowAddMenu(false); setNewHymnCategory('ألحان سنوية'); setShowAddHymnModal(true); }}
                    className="w-full text-right flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-foreground transition cursor-pointer"
                  >
                    <Music className="h-4 w-4 text-primary" />
                    <span>إضافة لحن كنسي للتسميع</span>
                  </button>
                  <button
                    onClick={() => { setShowAddMenu(false); setNewHymnCategory('لغة قبطية'); setShowAddHymnModal(true); }}
                    className="w-full text-right flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-foreground transition cursor-pointer"
                  >
                    <Church className="h-4 w-4 text-primary" />
                    <span>إضافة درس لغة قبطية وطقوس</span>
                  </button>
                  <button
                    onClick={() => { setShowAddMenu(false); setShowAddHistoryModal(true); }}
                    className="w-full text-right flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-foreground transition cursor-pointer"
                  >
                    <Scroll className="h-4 w-4 text-primary" />
                    <span>إضافة موضوع تاريخ وعقيدة</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4 Main Nav Tabs */}
        <div className="flex border-b border-border font-sans overflow-x-auto">
          {[
            { id: 'sunday-school', label: '📖 منهج مدارس الأحد والتحضير', count: lessons.length },
            { id: 'hymns', label: '🎵 الألحان والتسبحة الكنسية', count: masterHymns.filter(h => h.category.includes('ألحان')).length },
            { id: 'coptic', label: '☦ اللغة القبطية والطقوس', count: masterHymns.filter(h => h.category === 'لغة قبطية' || h.category === 'طقوس كنسية').length },
            { id: 'history', label: '📜 تاريخ كنسي وعقيدة', count: historyItems.length }
          ].map((tab) => {
            const isSelected = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-3 border-b-2 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Filter bar + View Mode Switcher */}
        <div className="bg-card border border-border p-4 rounded-xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-3 font-sans">
          <div className="relative flex-1 max-w-sm w-full">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="بحث في أسماء الدروس، الآيات، الخدام، المراجع، الجمعة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-9 pl-3 py-1.5 bg-muted/40 border border-border rounded-lg text-xs outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-1.5">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-bold text-muted-foreground">المرحلة:</span>
              <select
                value={selectedStage}
                onChange={(e) => { setSelectedStage(e.target.value); setSelectedClass('الكل'); }}
                className="bg-muted/40 border border-border rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none"
              >
                {distinctStages.map(stg => (
                  <option key={stg} value={stg}>{stg}</option>
                ))}
              </select>
            </div>

            {activeTab === 'sunday-school' && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-muted-foreground">الفصل:</span>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="bg-muted/40 border border-border rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none"
                >
                  {distinctClasses.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
            )}

            {/* View Mode Switcher Buttons */}
            {activeTab === 'sunday-school' && (
              <div className="flex bg-muted/50 p-1 rounded-xl border border-border">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                    viewMode === 'grid' ? 'bg-card text-primary shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="عرض الكروت التفصيلية"
                >
                  <LayoutGrid className="h-4 w-4" />
                  <span className="hidden sm:inline">كروت</span>
                </button>

                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                    viewMode === 'table' ? 'bg-card text-primary shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="عرض جدول التكليفات المنظم"
                >
                  <TableIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">جدول</span>
                </button>

                <button
                  onClick={() => setViewMode('timeline')}
                  className={`p-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                    viewMode === 'timeline' ? 'bg-card text-primary shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="عرض الخطة الأسبوعية للجمعات"
                >
                  <ListOrdered className="h-4 w-4" />
                  <span className="hidden sm:inline">خطة أسبوعية</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 1. SUNDAY SCHOOL CURRICULUM TAB (3 ALTERNATIVE VIEWS) */}
        {/* ========================================================================= */}
        {activeTab === 'sunday-school' && (
          <div className="space-y-6 font-sans animate-in fade-in">
            {/* Action Banner */}
            <div className="bg-gradient-to-l from-primary/10 via-primary/5 to-card border border-primary/20 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <span className="text-[10px] bg-primary text-primary-foreground font-bold px-2 py-0.5 rounded-full">
                  المنهج الأسبوعي لمدارس الأحد
                </span>
                <h2 className="text-base font-extrabold text-foreground">
                  سجل تحضير الدروس والآيات ومواعيد الجمعة والمراجع
                </h2>
                <p className="text-xs text-muted-foreground">
                  اختر طريقة العرض المفضلة: كروت مفصلة، جدول مصفوفة التكليفات، أو الخطة الزمنية للجمعات.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleExportExcel}
                  className="h-10 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>تصدير إكسيل (Excel)</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="h-10 px-3.5 bg-card border border-border hover:bg-muted text-foreground font-semibold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  طباعة الكشف
                </button>
                <button
                  onClick={() => setShowAddLessonModal(true)}
                  className="h-10 px-4 bg-primary text-primary-foreground font-bold rounded-xl text-xs flex items-center gap-2 hover:bg-primary/95 transition shadow-xs shrink-0 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>إضافة تحضير درس جديد</span>
                </button>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* VIEW A: CARDS GRID VIEW (الفيو الأول: كروت تفصيلية) */}
            {/* ------------------------------------------------------------- */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-in fade-in">
                {filteredLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 hover:border-primary/40 transition relative flex flex-col justify-between"
                  >
                    <div className="space-y-3.5">
                      {/* Header Badges */}
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="bg-primary/10 text-primary text-[10px] font-extrabold px-2.5 py-0.5 rounded-md">
                            {lesson.stage} {lesson.gradeName ? '(' + lesson.gradeName + ')' : ''}
                          </span>
                          <span className="bg-muted text-foreground text-[10px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1">
                            <School className="h-3 w-3 text-primary" />
                            {lesson.className}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 text-[10px]">
                          <span className="bg-amber-500/15 text-amber-800 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {lesson.meetingDay || 'الجمعة'}
                          </span>
                          <span className="text-muted-foreground font-mono font-bold bg-muted/40 px-2 py-0.5 rounded">
                            {lesson.lessonDate}
                          </span>
                        </div>
                      </div>

                      {/* Lesson Title */}
                      <h3 className="font-extrabold text-base text-foreground leading-snug">
                        {lesson.title}
                      </h3>

                      {/* Assigned Servant Badge */}
                      <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                            <UserCheck className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="text-[9px] text-muted-foreground block">الخادم المكلف بالشرح:</span>
                            <strong className="text-xs text-foreground block">{lesson.servantName}</strong>
                          </div>
                        </div>
                        <span className="text-[10px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded">
                          مكلف بالإلقاء
                        </span>
                      </div>

                      {/* Golden Verse Card */}
                      <div className="p-3.5 bg-gradient-to-r from-amber-500/5 via-primary/5 to-transparent border border-primary/15 rounded-xl space-y-1.5 text-right">
                        <span className="text-[10px] text-primary font-bold flex items-center gap-1">
                          <Quote className="h-3 w-3" />
                          الآية الذهبية للحفظ والتسميع:
                        </span>
                        <p className="text-xs font-extrabold text-foreground leading-relaxed">
                          «{lesson.bibleVerse}»
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono font-bold">
                          ({lesson.bibleCitation})
                        </p>
                      </div>

                      {/* Multiple References Section */}
                      {lesson.references && lesson.references.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] text-primary font-bold flex items-center gap-1">
                            <BookMarked className="h-3.5 w-3.5" />
                            المراجع التفسيرية والكنسية ({lesson.references.length} مراجع):
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {lesson.references.map((ref, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-muted/70 text-foreground border border-border px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1"
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                {ref}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card Footer Actions: VIEW (الفيو) + PRINT */}
                    <div className="pt-3 border-t border-border/60 flex justify-between items-center text-xs">
                      <button
                        onClick={() => setViewingLesson(lesson)}
                        className="h-8 px-4 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Eye className="h-4 w-4" />
                        <span>عرض تفاصيل الدرس (الفيو الشامل)</span>
                      </button>

                      <button
                        onClick={() => {
                          setViewingLesson(lesson)
                          setTimeout(() => window.print(), 300)
                        }}
                        className="h-8 px-3 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-xl text-[10px] flex items-center gap-1 transition cursor-pointer"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        طباعة
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* VIEW B: TABLE MATRIX VIEW (الفيو الثاني: جدول التكليفات المنظم) */}
            {/* ------------------------------------------------------------- */}
            {viewMode === 'table' && (
              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs animate-in fade-in">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs border-collapse">
                    <thead className="bg-muted/60 text-muted-foreground font-bold border-b border-border">
                      <tr>
                        <th className="p-3.5">الأسبوع / الموعد</th>
                        <th className="p-3.5">المرحلة والفصل</th>
                        <th className="p-3.5">عنوان الدرس</th>
                        <th className="p-3.5">الخادم الملقي</th>
                        <th className="p-3.5">الآية والشاهد</th>
                        <th className="p-3.5">المراجع</th>
                        <th className="p-3.5 text-center">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredLessons.map((lesson) => (
                        <tr key={lesson.id} className="hover:bg-muted/20 transition">
                          <td className="p-3.5 font-bold">
                            <span className="bg-amber-500/15 text-amber-800 px-2 py-0.5 rounded text-[10px] block w-max font-extrabold mb-1">
                              {lesson.meetingDay || 'الجمعة'}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">{lesson.lessonDate}</span>
                          </td>
                          <td className="p-3.5">
                            <strong className="text-foreground block">{lesson.stage}</strong>
                            <span className="text-[10px] text-muted-foreground">{lesson.className}</span>
                          </td>
                          <td className="p-3.5 font-extrabold text-foreground text-xs max-w-xs">
                            {lesson.title}
                          </td>
                          <td className="p-3.5">
                            <span className="text-primary font-bold block">{lesson.servantName}</span>
                          </td>
                          <td className="p-3.5 max-w-xs">
                            <p className="font-semibold text-foreground truncate" title={lesson.bibleVerse}>«{lesson.bibleVerse}»</p>
                            <span className="text-[10px] text-muted-foreground font-mono">({lesson.bibleCitation})</span>
                          </td>
                          <td className="p-3.5">
                            <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {lesson.references?.length || 1} مراجع
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            <button
                              onClick={() => setViewingLesson(lesson)}
                              className="h-8 px-3 bg-primary text-primary-foreground font-bold rounded-lg text-xs hover:bg-primary/95 transition cursor-pointer"
                            >
                              الفيو 👁️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* VIEW C: TIMELINE WEEKLY PLAN (الفيو الثالث: الخطة الأسبوعية للجمعات) */}
            {/* ------------------------------------------------------------- */}
            {viewMode === 'timeline' && (
              <div className="space-y-4 animate-in fade-in relative border-r-2 border-primary/30 pr-6 mr-3">
                {filteredLessons.map((lesson, idx) => (
                  <div key={lesson.id} className="relative space-y-2">
                    {/* Circle timeline bullet */}
                    <span className="absolute right-[-31.5px] top-2 h-6 w-6 rounded-full border-2 border-primary bg-card flex items-center justify-center text-xs font-bold text-primary shadow-xs">
                      {idx + 1}
                    </span>

                    <div className="bg-card border border-border rounded-2xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-primary/40 transition">
                      <div className="space-y-2 text-right flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="bg-amber-500/15 text-amber-800 text-xs font-extrabold px-2.5 py-0.5 rounded-md flex items-center gap-1">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {lesson.meetingDay || 'الجمعة'} ({lesson.lessonDate})
                          </span>
                          <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-md">
                            {lesson.stage} • {lesson.className}
                          </span>
                        </div>

                        <h3 className="font-extrabold text-base text-foreground">{lesson.title}</h3>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                          <span>الخادم الملقي: <strong className="text-foreground">{lesson.servantName}</strong></span>
                          <span>•</span>
                          <span className="font-semibold text-primary">«{lesson.bibleVerse}» ({lesson.bibleCitation})</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setViewingLesson(lesson)}
                        className="h-9 px-4 bg-primary text-primary-foreground font-bold rounded-xl text-xs flex items-center gap-1.5 hover:bg-primary/95 transition shadow-xs self-end md:self-center shrink-0 cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>عرض كشكول الدرس</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredLessons.length === 0 && (
              <div className="text-center py-12 bg-card border border-border rounded-2xl text-muted-foreground text-xs">
                لا توجد دروس مطابقة لمعايير البحث. اضغط زر "إضافة تحضير درس جديد" بالأعلى لإضافة درس جديد.
              </div>
            )}
          </div>
        )}

        {/* 2. HYMNS & COPTIC TAB VIEW */}
        {(activeTab === 'hymns' || activeTab === 'coptic') && (
          <div className="space-y-6 font-sans animate-in fade-in">
            <div className="bg-gradient-to-l from-primary/10 via-primary/5 to-card border border-primary/20 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <span className="text-[10px] bg-primary text-primary-foreground font-bold px-2 py-0.5 rounded-full">
                  {activeTab === 'hymns' ? 'معهد الألحان والتسبيح' : 'أكاديمية اللغة القبطية والطقوس'}
                </span>
                <h2 className="text-base font-extrabold text-foreground">
                  {activeTab === 'hymns' ? 'منهج الألحان الكنسية والتسبحة المقررة' : 'منهج اللغة القبطية وقواعد الطقس الكنسي'}
                </h2>
                <p className="text-xs text-muted-foreground">
                  الألحان المعتمدة مرتبطة مباشرة بملفات المخدومين في صفحاتهم الشخصية وبوابة أولياء الأمور للتقييم والتسميع.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setNewHymnCategory(activeTab === 'coptic' ? 'لغة قبطية' : 'ألحان سنوية')
                    setShowAddHymnModal(true)
                  }}
                  className="h-9 px-4 bg-primary text-primary-foreground text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-primary/95 transition shadow-xs cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>{activeTab === 'coptic' ? 'إضافة طقس / قبطي جديد' : 'إضافة لحن جديد'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredHymns.map((hymn) => (
                <div
                  key={hymn.id}
                  className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4 hover:border-primary/30 transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                        hymn.category === 'ألحان سنوية'
                          ? 'bg-blue-500/10 text-blue-700'
                          : hymn.category === 'ألحان مناسبات'
                          ? 'bg-amber-500/10 text-amber-700'
                          : hymn.category === 'لغة قبطية'
                          ? 'bg-indigo-500/10 text-indigo-700'
                          : 'bg-emerald-500/10 text-emerald-700'
                      }`}>
                        {hymn.category} • {hymn.stage}
                      </span>
                      <span className="text-[10px] font-extrabold text-success bg-success/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                        ★ {hymn.reward_points} نقطة
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-extrabold text-sm text-foreground">{hymn.name_ar}</h3>
                      <p className="text-[10px] text-muted-foreground font-mono">{hymn.name_en}</p>
                    </div>

                    {hymn.coptic_text && (
                      <div className="p-3 bg-muted/20 border border-border/50 rounded-xl space-y-1.5 text-right">
                        <p className="text-xs font-bold text-primary leading-relaxed font-serif">
                          {hymn.coptic_text}
                        </p>
                        {hymn.phonetics && (
                          <p className="text-[11px] text-muted-foreground font-semibold">
                            النطق: {hymn.phonetics}
                          </p>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {hymn.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border/60 flex justify-between items-center text-xs">
                    <span className="text-[10px] text-muted-foreground">
                      مقرر على مرحلة: <strong className="text-foreground">{hymn.stage}</strong>
                    </span>

                    <Link
                      href="/students"
                      className="h-8 px-3 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-lg text-[10px] flex items-center gap-1 transition cursor-pointer"
                    >
                      <Check className="h-3 w-3" />
                      تسميع ورصد درجات الطلاب
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. CHURCH HISTORY & DOCTRINE VIEW */}
        {activeTab === 'history' && (
          <div className="space-y-4 font-sans animate-in fade-in">
            <div className="bg-muted/20 border border-border p-4 rounded-2xl flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-foreground">مناهج التاريخ الكنسي والعقيدة الأرثوذكسية</h3>
                <p className="text-xs text-muted-foreground">سير البطاركة، المجامع المسكونية، والرد على البدع والهرطقات.</p>
              </div>
              <button
                onClick={() => setShowAddHistoryModal(true)}
                className="h-9 px-4 bg-primary text-primary-foreground text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-primary/95 transition shadow-xs cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                إضافة موضوع تاريخ وعقيدة
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {historyItems.map((item) => (
                <div key={item.id} className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                      {item.era || 'تاريخ وعقيدة'} • {item.stage}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-foreground">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 🔍 LESSON DETAILED VIEW MODAL (الفيو الشامل للدرس) */}
      {/* ========================================================================= */}
      {viewingLesson && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-border w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col font-sans max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-gradient-to-l from-primary/10 via-primary/5 to-muted/20">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-sm">
                  📖
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-foreground">{viewingLesson.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    كشكول التحضير النموذجي • مدارس الأحد كنيسة مارمينا
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setViewingLesson(null)}
                className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-right" dir="rtl">
              {/* Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/30 p-4 rounded-2xl border border-border/80">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-muted-foreground block font-bold">المرحلة والفصل:</span>
                  <strong className="text-foreground text-xs block">{viewingLesson.stage} ({viewingLesson.className})</strong>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] text-muted-foreground block font-bold">الخادم الملقي:</span>
                  <strong className="text-primary text-xs block">{viewingLesson.servantName}</strong>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] text-muted-foreground block font-bold">يوم اللقاء / الجمعة:</span>
                  <span className="text-amber-800 font-extrabold text-xs block bg-amber-500/15 px-2 py-0.5 rounded-md inline-block">
                    {viewingLesson.meetingDay || 'الجمعة'}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] text-muted-foreground block font-bold">تاريخ الإلقاء:</span>
                  <strong className="text-foreground text-xs block font-mono">{viewingLesson.lessonDate}</strong>
                </div>
              </div>

              {/* Golden Verse Section */}
              <div className="p-5 rounded-2xl bg-gradient-to-l from-primary/10 via-primary/5 to-transparent border-2 border-primary/20 space-y-2">
                <div className="flex items-center gap-1.5 text-primary font-extrabold text-xs">
                  <Quote className="h-4 w-4" />
                  <span>الآية الذهبية المقررة للحفظ والتسميع بالمنزل:</span>
                </div>
                <p className="text-sm font-extrabold text-foreground leading-relaxed pr-2">
                  «{viewingLesson.bibleVerse}»
                </p>
                <div className="flex justify-between items-center pt-1 pr-2">
                  <span className="text-xs text-primary font-mono font-extrabold">الشاهد: ({viewingLesson.bibleCitation})</span>
                  <span className="text-[10px] bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-bold">حفظ إجباري</span>
                </div>
              </div>

              {/* Lesson Objectives & Content */}
              <div className="space-y-2 bg-card border border-border p-5 rounded-2xl">
                <h4 className="font-extrabold text-xs text-foreground flex items-center gap-1.5 border-b border-border pb-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span>ملخص الشرح والأهداف التربوية والروحية للدرس:</span>
                </h4>
                <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-line pt-1">
                  {viewingLesson.content}
                </p>
              </div>

              {/* References Section */}
              {viewingLesson.references && viewingLesson.references.length > 0 && (
                <div className="space-y-2 bg-card border border-border p-5 rounded-2xl">
                  <h4 className="font-extrabold text-xs text-foreground flex items-center gap-1.5 border-b border-border pb-2">
                    <BookMarked className="h-4 w-4 text-primary" />
                    <span>المراجع التفسيرية والكنسية المعتمدة ({viewingLesson.references.length} مراجع):</span>
                  </h4>
                  <div className="space-y-2 pt-1">
                    {viewingLesson.references.map((ref, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2.5 bg-muted/20 border border-border/50 rounded-xl">
                        <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-semibold text-foreground">{ref}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-4 border-t border-border bg-muted/10 flex justify-between items-center">
              <span className="text-[10px] text-muted-foreground">
                كنيسة الشهيد العظيم مارمينا العجائبي • قطاع مدارس الأحد
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="h-9 px-4 bg-primary text-primary-foreground font-semibold rounded-xl text-xs flex items-center gap-1.5 hover:bg-primary/95 shadow-sm transition cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  طباعة تحضير الدرس
                </button>
                <button
                  onClick={() => setViewingLesson(null)}
                  className="h-9 px-4 border border-border hover:bg-muted text-xs font-semibold rounded-xl text-muted-foreground transition cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. MODAL: ADD SUNDAY SCHOOL LESSON WITH DATE & FRIDAY & REFERENCES */}
      {/* ========================================================================= */}
      {showAddLessonModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-border w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col font-sans max-h-[90vh]">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/10">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-primary" />
                <span>إضافة وتحضير درس مدارس الأحد</span>
              </h3>
              <button onClick={() => setShowAddLessonModal(false)} className="text-muted-foreground hover:text-foreground text-lg cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveLesson} className="p-6 space-y-4 text-xs text-right overflow-y-auto" dir="rtl">
              {/* Row 1: Title & Week */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="font-semibold text-foreground">عنوان الدرس *</label>
                  <input
                    type="text" required placeholder="مثال: قصة شمشون الجبار ونعمة القوة..."
                    value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">رقم الأسبوع:</label>
                  <input
                    type="number" min="1" max="52"
                    value={lessonWeek} onChange={(e) => setLessonWeek(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none font-bold text-center"
                  />
                </div>
              </div>

              {/* Row 2: Stage, Class, and Servant */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-muted/20 p-3.5 rounded-xl border border-border">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">المرحلة المستهدفة:</label>
                  <select
                    value={lessonStage} onChange={(e) => setLessonStage(e.target.value)}
                    className="w-full bg-card border border-border rounded-lg px-2.5 py-2 text-xs font-bold outline-none"
                  >
                    <option value="حضانة">حضانة</option>
                    <option value="ابتدائي">ابتدائي</option>
                    <option value="إعدادي">إعدادي</option>
                    <option value="ثانوي">ثانوي</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">الفصل المستهدف:</label>
                  <input
                    type="text" placeholder="مثال: فصل الأنبا بيشوي"
                    value={lessonClass} onChange={(e) => setLessonClass(e.target.value)}
                    className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs outline-none font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">الخادم المكلف بالشرح:</label>
                  <select
                    value={lessonServant} onChange={(e) => setLessonServant(e.target.value)}
                    className="w-full bg-card border border-border rounded-lg px-2.5 py-2 text-xs font-bold outline-none"
                  >
                    {servantsList.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Meeting Day (جمعة) & Lesson Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-primary/[0.02] p-3.5 rounded-xl border border-primary/20">
                <div className="space-y-1">
                  <label className="font-bold text-primary flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    تحديد يوم اللقاء / الجمعة:
                  </label>
                  <select
                    value={lessonMeetingDay}
                    onChange={(e) => setLessonMeetingDay(e.target.value)}
                    className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-primary"
                  >
                    <option value="الجمعة الأولى من الشهر">الجمعة الأولى من الشهر</option>
                    <option value="الجمعة الثانية من الشهر">الجمعة الثانية من الشهر</option>
                    <option value="الجمعة الثالثة من الشهر">الجمعة الثالثة من الشهر</option>
                    <option value="الجمعة الرابعة من الشهر">الجمعة الرابعة من الشهر</option>
                    <option value="جمعة (لقاء أسبوعي)">جمعة (لقاء أسبوعي)</option>
                    <option value="الأحد (مدارس الأحد)">الأحد (مدارس الأحد)</option>
                    <option value="قداس ومناسبة خاصة">قداس ومناسبة خاصة</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-primary flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    تاريخ إلقاء الدرس:
                  </label>
                  <input
                    type="date"
                    required
                    value={lessonDate}
                    onChange={(e) => setLessonDate(e.target.value)}
                    className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs font-bold outline-none font-mono focus:border-primary"
                  />
                </div>
              </div>

              {/* Row 4: Golden Verse & Citation */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="font-semibold text-primary">الآية الذهبية للحفظ بالمنزل *</label>
                  <input
                    type="text" required placeholder="«اكتب نص الآية الذهبية هنا...»"
                    value={lessonVerse} onChange={(e) => setLessonVerse(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">شاهد الآية (الإنجيل) *</label>
                  <input
                    type="text" required placeholder="مثال: يوحنا ٣: ١٦"
                    value={lessonCitation} onChange={(e) => setLessonCitation(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none font-mono"
                  />
                </div>
              </div>

              {/* Row 5: Multiple References System */}
              <div className="space-y-2 border-t border-border pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-primary flex items-center gap-1">
                    <BookMarked className="h-4 w-4" />
                    المراجع الكنسية والتفسيرية (يمكن إضافة أكثر من مرجع):
                  </span>
                  <button
                    type="button"
                    onClick={handleAddReferenceField}
                    className="py-1 px-2.5 bg-muted text-foreground border border-border hover:bg-muted/80 rounded-md text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    إضافة مرجع آخر
                  </button>
                </div>

                <div className="space-y-2">
                  {lessonReferences.map((ref, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-muted-foreground w-16">مرجع {idx + 1}:</span>
                      <input
                        type="text"
                        placeholder="مثال: تفسير القمص تادرس يعقوب ملطي / كتاب تفسير العهد القديم..."
                        value={ref}
                        onChange={(e) => handleUpdateReferenceField(idx, e.target.value)}
                        className="flex-1 bg-muted/40 border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-primary"
                      />
                      {lessonReferences.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveReferenceField(idx)}
                          className="text-destructive hover:bg-destructive/10 p-1.5 rounded-md text-xs transition cursor-pointer"
                          title="حذف هذا المرجع"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 6: Content & Objectives */}
              <div className="space-y-1.5 border-t border-border pt-3">
                <label className="font-semibold text-foreground">ملخص وشرح الدرس والأهداف التربوية:</label>
                <textarea
                  rows={3} placeholder="اكتب ملخص الهدف الرعوي والتربوي من الدرس والنقاط الأساسية للشرح..."
                  value={lessonContent} onChange={(e) => setLessonContent(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-lg p-2.5 text-xs outline-none leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 border-t border-border pt-4 mt-2">
                <button
                  type="submit"
                  className="h-10 px-5 bg-primary text-primary-foreground font-semibold rounded-lg text-xs flex items-center gap-1.5 hover:bg-primary/95 shadow transition cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  حفظ ونشر الدرس
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddLessonModal(false)}
                  className="h-10 px-4 border border-border hover:bg-muted text-xs font-semibold rounded-lg text-muted-foreground transition cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. MODAL: ADD HYMN */}
      {showAddHymnModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col font-sans">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/10">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <Music className="h-4 w-4 text-primary" />
                <span>إضافة لحن أو طقس جديد للمنهج الكنسي</span>
              </h3>
              <button onClick={() => setShowAddHymnModal(false)} className="text-muted-foreground hover:text-foreground text-lg cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveHymn} className="p-6 space-y-4 text-xs text-right" dir="rtl">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">اسم اللحن بالعربية:</label>
                  <input
                    type="text" required placeholder="مثال: لحن إبؤرو (يا ملك السلام)"
                    value={newHymnTitle} onChange={(e) => setNewHymnTitle(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">الاسم بالإنجليزية / المعرب:</label>
                  <input
                    type="text" placeholder="Epoorou"
                    value={newHymnEn} onChange={(e) => setNewHymnEn(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary font-mono text-left"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">التصنيف:</label>
                  <select
                    value={newHymnCategory} onChange={(e) => setNewHymnCategory(e.target.value as any)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-2.5 py-2 text-xs font-bold outline-none"
                  >
                    <option value="ألحان سنوية">ألحان سنوية</option>
                    <option value="ألحان مناسبات">ألحان مناسبات</option>
                    <option value="لغة قبطية">لغة قبطية</option>
                    <option value="طقوس كنسية">طقوس كنسية</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">المرحلة المقررة:</label>
                  <select
                    value={newHymnStage} onChange={(e) => setNewHymnStage(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-2.5 py-2 text-xs font-bold outline-none"
                  >
                    <option value="الكل">كل المراحل</option>
                    <option value="حضانة">حضانة</option>
                    <option value="ابتدائي">ابتدائي</option>
                    <option value="إعدادي">إعدادي</option>
                    <option value="ثانوي">ثانوي</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">نقاط الجائزة:</label>
                  <input
                    type="number" min="5" max="100"
                    value={newHymnPoints} onChange={(e) => setNewHymnPoints(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none font-bold text-center"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">النص القبطي (Coptic Text):</label>
                <input
                  type="text" placeholder="Ⲉⲡⲟⲩⲣⲟ ⲛ̀ⲧⲉ ϯϩⲓⲣⲏⲛⲏ..."
                  value={newHymnCoptic} onChange={(e) => setNewHymnCoptic(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none font-serif text-right"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">طريقة النطق بالمعرب (Phonetics):</label>
                <input
                  type="text" placeholder="إبؤرو إنتي تي هيريني..."
                  value={newHymnPhonetics} onChange={(e) => setNewHymnPhonetics(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none font-semibold text-right"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">شرح ومعنى اللحن ومناسبته:</label>
                <textarea
                  rows={2} placeholder="اكتب مناسبة اللحن والطقس الخاص به..."
                  value={newHymnDesc} onChange={(e) => setNewHymnDesc(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-lg p-2.5 text-xs outline-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-border pt-4 mt-2">
                <button
                  type="submit"
                  className="h-10 px-5 bg-primary text-primary-foreground font-semibold rounded-lg text-xs flex items-center gap-1.5 hover:bg-primary/95 shadow transition cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  حفظ اللحن في المنهج
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddHymnModal(false)}
                  className="h-10 px-4 border border-border hover:bg-muted text-xs font-semibold rounded-lg text-muted-foreground transition cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. MODAL: ADD HISTORY */}
      {showAddHistoryModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col font-sans">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/10">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <Scroll className="h-4 w-4 text-primary" />
                <span>إضافة موضوع تاريخ كنسي أو عقيدة أرثوذكسية</span>
              </h3>
              <button onClick={() => setShowAddHistoryModal(false)} className="text-muted-foreground hover:text-foreground text-lg cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveHistory} className="p-6 space-y-4 text-xs text-right" dir="rtl">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">عنوان الموضوع / المجمع / السيرة:</label>
                <input
                  type="text" required placeholder="مثال: مجمع القسطنطينية المسكوني (٣٨١ م)..."
                  value={historyTitle} onChange={(e) => setHistoryTitle(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">المرحلة الدراسية:</label>
                  <select
                    value={historyStage} onChange={(e) => setHistoryStage(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-2.5 py-2 text-xs font-bold outline-none"
                  >
                    <option value="الكل">كل المراحل</option>
                    <option value="ابتدائي">ابتدائي</option>
                    <option value="إعدادي">إعدادي</option>
                    <option value="ثانوي">ثانوي</option>
                    <option value="إعدادي وثانوي">إعدادي وثانوي</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">التصنيف / العصر:</label>
                  <input
                    type="text" placeholder="عصر المجامع / الرهبنة / العقيدة"
                    value={historyEra} onChange={(e) => setHistoryEra(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">الشرح والعناصر التعليمية:</label>
                <textarea
                  rows={3} placeholder="اكتب ملخص الأحداث والشخصيات والعقائد الإيمانية المستفادة..."
                  value={historyDesc} onChange={(e) => setHistoryDesc(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-lg p-2.5 text-xs outline-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-border pt-4 mt-2">
                <button
                  type="submit"
                  className="h-10 px-5 bg-primary text-primary-foreground font-semibold rounded-lg text-xs flex items-center gap-1.5 hover:bg-primary/95 shadow transition cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  حفظ الموضوع
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddHistoryModal(false)}
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
