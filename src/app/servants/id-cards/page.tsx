'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { Shell } from '@/components/layout/Shell'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { Printer, Shield, Check, FileDown, Eye, QrCode, CreditCard, LayoutGrid, CheckSquare, Square, RefreshCw, Users, BookOpen, School } from 'lucide-react'
import QRCode from 'qrcode'
import { getStudents } from '@/lib/services/studentsService'
import { getClasses } from '@/lib/services/classesService'
import Link from 'next/link'

type CardType = 'servants' | 'students'
type CardTheme = 'gold' | 'blue' | 'burgundy' | 'olive' | 'white'
type CardOrientation = 'vertical' | 'horizontal'

interface ServantItem {
  id: string
  name: string
  role_label: string
  stage: string
  phone: string
  email: string
}

export default function ServantsIdCardsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-xs text-muted-foreground font-sans">جاري تحميل مولد الكارنيهات...</div>}>
      <IdCardsPageContent />
    </Suspense>
  )
}

function IdCardsPageContent() {
  const { locale } = useLanguage()
  const [churchName, setChurchName] = useState('كنيسة القديسة دميانة')
  const [churchLogo, setChurchLogo] = useState<string | null>(null)
  
  // Custom Card Title / Subtitle
  const [cardSubtitle, setCardSubtitle] = useState('')
  
  // Card Type Selector
  const [cardType, setCardType] = useState<CardType>('servants')
  
  // Layout Options
  const [theme, setTheme] = useState<CardTheme>('gold')
  const [orientation, setOrientation] = useState<CardOrientation>('vertical')
  const [showQR, setShowQR] = useState(true)
  const [showPhone, setShowPhone] = useState(true)
  
  // Database State
  const [students, setStudents] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [selectedClassId, setSelectedClassId] = useState<string>('all')
  
  // Selection States
  const [selectedServantIds, setSelectedServantIds] = useState<string[]>(['srv1', 'srv2', 'srv3'])
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])
  const [qrUrls, setQrUrls] = useState<Record<string, string>>({})

  // Mock Servants (Consistent with servants directory)
  const servants: ServantItem[] = [
    { id: 'srv1', name: 'مينا كمال غبريال', role_label: 'أمين فصل', stage: 'ابتدائي', phone: '01234567890', email: 'mina.kamal@church.org' },
    { id: 'srv2', name: 'يوستينا عادل فوزي', role_label: 'خادمة مرحلة', stage: 'ابتدائي', phone: '01234567891', email: 'justina.adel@church.org' },
    { id: 'srv3', name: 'تامر شفيق عزمي', role_label: 'أمين المرحلة', stage: 'إعدادي', phone: '01234567892', email: 'tamer.shafik@church.org' },
    { id: 'srv4', name: 'فادي فريد نصيف', role_label: 'خادم ثانوي', stage: 'ثانوي', phone: '01234567893', email: 'fady.farid@gmail.com' }
  ]

  // Sync settings branding from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('churchName')
      const storedLogo = localStorage.getItem('churchLogo')
      if (storedName) setChurchName(storedName)
      if (storedLogo) setChurchLogo(storedLogo)
    }
  }, [])

  // Fetch Database Data (Classes and Students)
  useEffect(() => {
    async function loadDbData() {
      try {
        const [cls, stds] = await Promise.all([
          getClasses(),
          getStudents()
        ])
        if (cls) setClasses(cls)
        if (stds) {
          setStudents(stds)
          // Default pre-select first 3 students for preview
          setSelectedStudentIds(stds.slice(0, 3).map(s => s.id))
        }
      } catch (err) {
        console.error('Failed to load database records for ID generator:', err)
      } finally {
        setLoadingData(false)
      }
    }
    loadDbData()
  }, [])

  // Generate QR Codes dynamically on card data changes
  useEffect(() => {
    async function generateQRs() {
      const urls: Record<string, string> = {}
      
      // Generate for Servants
      for (const s of servants) {
        try {
          const qrContent = `SERVANT:${s.id}|NAME:${s.name}|ROLE:${s.role_label}|CHURCH:${churchName}`
          urls[s.id] = await QRCode.toDataURL(qrContent, { width: 100, margin: 1 })
        } catch (err) {
          console.error(err)
        }
      }
      
      // Generate for Students
      for (const s of students) {
        try {
          urls[s.id] = await QRCode.toDataURL(s.qr_code || `STUDENT:${s.id}`, { width: 100, margin: 1 })
        } catch (err) {
          console.error(err)
        }
      }
      
      setQrUrls(urls)
    }
    generateQRs()
  }, [students, churchName])

  // Filtered Students list based on class dropdown selection
  const filteredStudents = students.filter(s => {
    if (selectedClassId === 'all') return true
    return s.enrollments?.[0]?.class_id === selectedClassId
  })

  // Select Toggles
  const toggleSelectServant = (id: string) => {
    setSelectedServantIds(prev =>
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    )
  }

  const toggleSelectStudent = (id: string) => {
    setSelectedStudentIds(prev =>
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    )
  }

  const toggleSelectAllServants = () => {
    if (selectedServantIds.length === servants.length) {
      setSelectedServantIds([])
    } else {
      setSelectedServantIds(servants.map(s => s.id))
    }
  }

  const toggleSelectAllStudents = () => {
    const visibleIds = filteredStudents.map(s => s.id)
    const allVisibleSelected = visibleIds.every(id => selectedStudentIds.includes(id))
    
    if (allVisibleSelected) {
      // Unselect all currently visible students
      setSelectedStudentIds(prev => prev.filter(id => !visibleIds.includes(id)))
    } else {
      // Select all currently visible students
      setSelectedStudentIds(prev => Array.from(new Set([...prev, ...visibleIds])))
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const downloadCardAsImage = async (item: any, type: 'servant' | 'student') => {
    const canvas = document.createElement('canvas')
    const scale = 3 // high DPI download resolution
    const width = orientation === 'vertical' ? 350 * scale : 550 * scale
    const height = orientation === 'vertical' ? 550 * scale : 350 * scale
    canvas.width = width
    canvas.height = height
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    ctx.textAlign = 'right'
    
    let bgColors: string[] = []
    let borderStyle = ''
    let textColor = ''
    let accentBg = ''
    let accentText = ''

    if (theme === 'gold') {
      bgColors = ['#0f172a', '#1e293b']
      borderStyle = '#f59e0b'
      textColor = '#ffffff'
      accentBg = '#f59e0b'
      accentText = '#0f172a'
    } else if (theme === 'blue') {
      bgColors = ['#082f49', '#0c4a6e']
      borderStyle = '#38bdf8'
      textColor = '#ffffff'
      accentBg = '#0ea5e9'
      accentText = '#ffffff'
    } else if (theme === 'burgundy') {
      bgColors = ['#4c0519', '#881337']
      borderStyle = '#ea580c'
      textColor = '#ffffff'
      accentBg = '#ea580c'
      accentText = '#ffffff'
    } else if (theme === 'olive') {
      bgColors = ['#022c22', '#064e3b']
      borderStyle = '#f59e0b'
      textColor = '#ffffff'
      accentBg = '#f59e0b'
      accentText = '#022c22'
    } else {
      bgColors = ['#ffffff', '#f8fafc']
      borderStyle = '#cbd5e1'
      textColor = '#1e293b'
      accentBg = '#1e293b'
      accentText = '#ffffff'
    }

    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, bgColors[0])
    gradient.addColorStop(1, bgColors[1])
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    ctx.lineWidth = 4 * scale
    ctx.strokeStyle = borderStyle
    ctx.strokeRect(8 * scale, 8 * scale, width - 16 * scale, height - 16 * scale)

    ctx.lineWidth = 1 * scale
    ctx.strokeStyle = borderStyle + '40'
    ctx.strokeRect(12 * scale, 12 * scale, width - 24 * scale, height - 24 * scale)

    const nameText = type === 'servant' ? item.name : item.full_name
    const roleText = type === 'servant' ? item.role_label : `فصل ${item.enrollments?.[0]?.classes?.name_ar || 'غير محدد'}`
    const stageText = type === 'servant' ? `المرحلة: ${item.stage}` : `المرحلة: ${item.enrollments?.[0]?.stages?.name_ar || 'عام'}`
    const detailSubtitle = cardSubtitle || (type === 'servant' ? 'كارنيه خادم مكرس' : 'بطاقة حضور مخدوم')
    const phoneText = type === 'servant' ? item.phone : `الوالد: ${item.father_phone || ''}`

    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.src = src
        img.onload = () => resolve(img)
        img.onerror = (e) => reject(e)
      })
    }

    if (orientation === 'vertical') {
      ctx.fillStyle = borderStyle
      ctx.font = `bold ${10 * scale}px sans-serif`
      ctx.fillText(churchName, width - 25 * scale, 35 * scale)
      
      ctx.font = `bold ${14 * scale}px sans-serif`
      ctx.fillStyle = borderStyle
      ctx.fillText('☦', 35 * scale, 38 * scale)

      ctx.strokeStyle = borderStyle + '30'
      ctx.lineWidth = 1 * scale
      ctx.beginPath()
      ctx.moveTo(20 * scale, 48 * scale)
      ctx.lineTo(width - 20 * scale, 48 * scale)
      ctx.stroke()

      try {
        let avatarSrc = ''
        if (type === 'student') {
          avatarSrc = item.gender === 'female' ? '/avatar_girl.jpg' : '/avatar_boy.jpg'
        } else {
          ctx.beginPath()
          ctx.arc(width / 2, 125 * scale, 35 * scale, 0, Math.PI * 2)
          ctx.fillStyle = borderStyle + '20'
          ctx.fill()
          ctx.lineWidth = 2 * scale
          ctx.strokeStyle = borderStyle + '50'
          ctx.stroke()
          
          ctx.textAlign = 'center'
          ctx.fillStyle = textColor
          ctx.font = `bold ${24 * scale}px sans-serif`
          ctx.fillText(nameText.slice(0, 2), width / 2, 133 * scale)
          ctx.textAlign = 'right'
        }

        if (avatarSrc) {
          const avatarImg = await loadImage(avatarSrc)
          ctx.save()
          ctx.beginPath()
          ctx.arc(width / 2, 125 * scale, 35 * scale, 0, Math.PI * 2)
          ctx.closePath()
          ctx.clip()
          ctx.drawImage(avatarImg, width / 2 - 35 * scale, 125 * scale - 35 * scale, 70 * scale, 70 * scale)
          ctx.restore()

          ctx.beginPath()
          ctx.arc(width / 2, 125 * scale, 35 * scale, 0, Math.PI * 2)
          ctx.lineWidth = 2 * scale
          ctx.strokeStyle = borderStyle + '50'
          ctx.stroke()
        }
      } catch (err) {
        console.error(err)
      }

      ctx.textAlign = 'center'
      ctx.fillStyle = textColor
      ctx.font = `bold ${13 * scale}px sans-serif`
      ctx.fillText(nameText, width / 2, 190 * scale)

      const bannerWidth = 120 * scale
      const bannerHeight = 18 * scale
      const rx = width / 2 - bannerWidth / 2
      const ry = 205 * scale
      
      ctx.fillStyle = accentBg
      ctx.beginPath()
      ctx.roundRect(rx, ry, bannerWidth, bannerHeight, 8 * scale)
      ctx.fill()

      ctx.fillStyle = accentText
      ctx.font = `bold ${8 * scale}px sans-serif`
      ctx.fillText(roleText, width / 2, ry + 12 * scale)

      ctx.strokeStyle = borderStyle + '30'
      ctx.lineWidth = 1 * scale
      ctx.beginPath()
      ctx.moveTo(20 * scale, 255 * scale)
      ctx.lineTo(width - 20 * scale, 255 * scale)
      ctx.stroke()

      ctx.textAlign = 'right'
      ctx.fillStyle = textColor
      ctx.font = `bold ${8 * scale}px sans-serif`
      ctx.fillText(detailSubtitle, width - 25 * scale, 280 * scale)

      ctx.font = `${7.5 * scale}px sans-serif`
      ctx.fillStyle = textColor
      ctx.globalAlpha = 0.8
      ctx.fillText(stageText, width - 25 * scale, 298 * scale)
      if (showPhone) {
        ctx.fillText(phoneText, width - 25 * scale, 313 * scale)
      }
      ctx.globalAlpha = 1.0

      if (showQR && qrUrls[item.id]) {
        try {
          const qrImg = await loadImage(qrUrls[item.id])
          ctx.drawImage(qrImg, 25 * scale, 268 * scale, 50 * scale, 50 * scale)
        } catch (err) {
          console.error(err)
        }
      }
    } else {
      try {
        let avatarSrc = ''
        if (type === 'student') {
          avatarSrc = item.gender === 'female' ? '/avatar_girl.jpg' : '/avatar_boy.jpg'
        } else {
          ctx.beginPath()
          ctx.arc(80 * scale, 100 * scale, 30 * scale, 0, Math.PI * 2)
          ctx.fillStyle = borderStyle + '20'
          ctx.fill()
          ctx.lineWidth = 2 * scale
          ctx.strokeStyle = borderStyle + '50'
          ctx.stroke()
          
          ctx.textAlign = 'center'
          ctx.fillStyle = textColor
          ctx.font = `bold ${20 * scale}px sans-serif`
          ctx.fillText(nameText.slice(0, 2), 80 * scale, 107 * scale)
          ctx.textAlign = 'right'
        }

        if (avatarSrc) {
          const avatarImg = await loadImage(avatarSrc)
          ctx.save()
          ctx.beginPath()
          ctx.arc(80 * scale, 100 * scale, 30 * scale, 0, Math.PI * 2)
          ctx.closePath()
          ctx.clip()
          ctx.drawImage(avatarImg, 80 * scale - 30 * scale, 100 * scale - 30 * scale, 60 * scale, 60 * scale)
          ctx.restore()

          ctx.beginPath()
          ctx.arc(80 * scale, 100 * scale, 30 * scale, 0, Math.PI * 2)
          ctx.lineWidth = 2 * scale
          ctx.strokeStyle = borderStyle + '50'
          ctx.stroke()
        }

        if (showQR && qrUrls[item.id]) {
          const qrImg = await loadImage(qrUrls[item.id])
          ctx.drawImage(qrImg, 55 * scale, 150 * scale, 50 * scale, 50 * scale)
        }
      } catch (err) {
        console.error(err)
      }

      ctx.strokeStyle = borderStyle + '20'
      ctx.lineWidth = 1 * scale
      ctx.beginPath()
      ctx.moveTo(150 * scale, 20 * scale)
      ctx.lineTo(150 * scale, height - 20 * scale)
      ctx.stroke()

      ctx.textAlign = 'right'
      ctx.fillStyle = borderStyle
      ctx.font = `bold ${10 * scale}px sans-serif`
      ctx.fillText(churchName, width - 25 * scale, 35 * scale)
      
      ctx.font = `bold ${13 * scale}px sans-serif`
      ctx.fillStyle = borderStyle
      ctx.fillText('☦', 170 * scale, 38 * scale)

      ctx.strokeStyle = borderStyle + '20'
      ctx.beginPath()
      ctx.moveTo(165 * scale, 48 * scale)
      ctx.lineTo(width - 25 * scale, 48 * scale)
      ctx.stroke()

      ctx.fillStyle = textColor
      ctx.font = `bold ${12 * scale}px sans-serif`
      ctx.fillText(nameText, width - 25 * scale, 85 * scale)

      const bannerWidth = 100 * scale
      const bannerHeight = 16 * scale
      const rx = width - 25 * scale - bannerWidth
      const ry = 100 * scale
      
      ctx.fillStyle = accentBg
      ctx.beginPath()
      ctx.roundRect(rx, ry, bannerWidth, bannerHeight, 6 * scale)
      ctx.fill()

      ctx.fillStyle = accentText
      ctx.textAlign = 'center'
      ctx.font = `bold ${7.5 * scale}px sans-serif`
      ctx.fillText(roleText, rx + bannerWidth / 2, ry + 11 * scale)
      ctx.textAlign = 'right'

      ctx.strokeStyle = borderStyle + '10'
      ctx.beginPath()
      ctx.moveTo(165 * scale, 170 * scale)
      ctx.lineTo(width - 25 * scale, 170 * scale)
      ctx.stroke()

      ctx.fillStyle = textColor
      ctx.globalAlpha = 0.8
      ctx.font = `${7.5 * scale}px sans-serif`
      ctx.fillText(stageText, width - 25 * scale, 195 * scale)
      if (showPhone) {
        ctx.fillText(phoneText, width - 25 * scale, 210 * scale)
      }
      ctx.fillText(detailSubtitle, 170 * scale, 195 * scale)
      ctx.globalAlpha = 1.0
    }

    const dataUrl = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `card_${nameText.replace(/\s+/g, '_')}.png`
    link.href = dataUrl
    link.click()
  }

  // Theme styling helpers
  const getThemeClasses = (cardTheme: CardTheme) => {
    switch (cardTheme) {
      case 'gold':
        return {
          cardBg: 'bg-slate-900 border-amber-500/80 text-white',
          accentBg: 'bg-amber-500 text-slate-900',
          accentText: 'text-amber-400',
          borderColor: 'border-amber-500/50',
          logoColor: 'text-amber-500'
        }
      case 'blue':
        return {
          cardBg: 'bg-sky-950 border-sky-400 text-white',
          accentBg: 'bg-sky-500 text-white',
          accentText: 'text-sky-300',
          borderColor: 'border-sky-500/50',
          logoColor: 'text-sky-400'
        }
      case 'burgundy':
        return {
          cardBg: 'bg-rose-950 border-amber-600 text-white',
          accentBg: 'bg-amber-600 text-white',
          accentText: 'text-amber-500',
          borderColor: 'border-amber-600/50',
          logoColor: 'text-amber-500'
        }
      case 'olive':
        return {
          cardBg: 'bg-emerald-950 border-amber-500 text-white',
          accentBg: 'bg-amber-500 text-emerald-950',
          accentText: 'text-amber-400',
          borderColor: 'border-amber-500/50',
          logoColor: 'text-amber-500'
        }
      case 'white':
      default:
        return {
          cardBg: 'bg-white border-slate-300 text-slate-800 shadow-sm',
          accentBg: 'bg-slate-800 text-white',
          accentText: 'text-slate-600',
          borderColor: 'border-slate-200',
          logoColor: 'text-slate-700'
        }
    }
  }

  const activeTheme = getThemeClasses(theme)
  const selectedServants = servants.filter(s => selectedServantIds.includes(s.id))
  const selectedStudents = students.filter(s => selectedStudentIds.includes(s.id))

  // Determine current active cards for preview & printing
  const activeCardsCount = cardType === 'servants' ? selectedServants.length : selectedStudents.length
  const currentSubtitle = cardSubtitle || (cardType === 'servants' ? 'كارنيه خادم مكرس' : 'بطاقة حضور مخدوم')

  return (
    <Shell>
      <div className="p-6 font-sans text-right max-w-6xl mx-auto space-y-6 print:p-0 print:max-w-none">
        
        {/* Page Header (Hidden in Print) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-4 print:hidden">
          <div>
            <h1 className="text-xl font-bold text-foreground">كارنيهات وبطاقات الهوية للطباعة</h1>
            <p className="text-xs text-muted-foreground mt-1">توليد وتصدير بطاقات تعريفية مخصصة للخدام والمخدومين بهوية الكنيسة وأكواد الاستجابة السريعة (QR) للفحص التلقائي.</p>
          </div>
          
          <button
            onClick={handlePrint}
            disabled={activeCardsCount === 0}
            className="h-10 px-5 bg-primary text-primary-foreground font-semibold rounded-lg text-xs flex items-center gap-2 hover:bg-primary/95 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer className="h-4.5 w-4.5" />
            طباعة البطاقات المحددة ({activeCardsCount})
          </button>
        </div>

        {/* 2-Column Workspace (Control vs Live Preview) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start print:block">
          
          {/* Column 1 & 2: Live Preview Panel */}
          <div className="lg:col-span-2 space-y-4 print:w-full print:p-0">
            
            {/* Live Cards Grid */}
            <div className="bg-muted/30 border border-border p-4 rounded-xl print:bg-transparent print:border-none print:p-0">
              <div className="flex justify-between items-center mb-4 print:hidden">
                <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                  <Eye className="h-4.5 w-4.5 text-primary" />
                  معاينة مباشرة لصفحة الطباعة ({activeCardsCount} كارنيه جاهز)
                </span>
                <span className="text-[10px] text-muted-foreground">تطبع الكارنيهات تلقائياً بحدود قص دقيقة</span>
              </div>

              {/* Servants / Students Grid */}
              <div className={`grid gap-6 justify-center items-center print:gap-10 ${
                orientation === 'vertical' 
                  ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 print:grid-cols-3' 
                  : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 print:grid-cols-2'
              }`}>
                
                {/* 1. RENDER SERVANT CARDS */}
                {cardType === 'servants' && selectedServants.map((servant) => (
                  <div 
                    key={servant.id}
                    className={`relative overflow-hidden border-2 rounded-xl transition duration-200 select-none shadow-md print:shadow-none print:border-slate-400/80 ${
                      activeTheme.cardBg
                    } ${
                      orientation === 'vertical' 
                        ? 'w-[54mm] h-[86mm] flex flex-col p-4 justify-between' 
                        : 'w-[86mm] h-[54mm] flex flex-row p-4 justify-between gap-3'
                    }`}
                    style={{ pageBreakInside: 'avoid', boxSizing: 'border-box' }}
                  >
                    {orientation === 'vertical' ? (
                      <>
                        <div className="flex items-center justify-between border-b pb-1.5 border-amber-500/20">
                          <span className="text-[9px] font-bold tracking-wide truncate max-w-[120px]">{churchName}</span>
                          {churchLogo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={churchLogo} alt="Logo" className="h-5 w-5 object-contain" />
                          ) : (
                            <span className={`text-xs font-bold ${activeTheme.logoColor}`}>☦</span>
                          )}
                        </div>

                        <div className="flex flex-col items-center justify-center my-auto py-2 text-center space-y-1.5">
                          <div className="h-16 w-16 rounded-full border-2 border-amber-500/40 bg-muted/20 flex items-center justify-center text-lg font-bold shadow-inner relative overflow-hidden">
                            {servant.name.slice(0, 2)}
                          </div>
                          <div>
                            <h3 className="font-bold text-xs tracking-tight">{servant.name}</h3>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${activeTheme.accentBg}`}>
                              {servant.role_label}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-end justify-between border-t pt-1.5 border-amber-500/20 text-[8px]">
                          <div className="space-y-0.5 text-right flex-1">
                            <div className="font-medium text-[8px] opacity-80">{currentSubtitle}</div>
                            <div className="opacity-70">المرحلة: {servant.stage}</div>
                            {showPhone && <div className="opacity-70">{servant.phone}</div>}
                          </div>
                          {showQR && qrUrls[servant.id] && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={qrUrls[servant.id]} alt="QR" className="h-10 w-10 bg-white p-0.5 rounded shadow-sm shrink-0 mr-1.5" />
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex flex-col justify-between items-center w-1/3 text-center border-l border-amber-500/20 pl-2">
                          <div className="h-14 w-14 rounded-full border-2 border-amber-500/40 bg-muted/20 flex items-center justify-center text-sm font-bold shadow-inner relative overflow-hidden">
                            {servant.name.slice(0, 2)}
                          </div>
                          {showQR && qrUrls[servant.id] && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={qrUrls[servant.id]} alt="QR" className="h-10 w-10 bg-white p-0.5 rounded shadow-sm" />
                          )}
                        </div>
                        <div className="flex flex-col justify-between w-2/3">
                          <div className="flex items-center justify-between border-b pb-1 border-amber-500/20">
                            <span className="text-[9px] font-bold tracking-wide truncate max-w-[100px]">{churchName}</span>
                            {churchLogo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={churchLogo} alt="Logo" className="h-4.5 w-4.5 object-contain" />
                            ) : (
                              <span className={`text-[10px] font-bold ${activeTheme.logoColor}`}>☦</span>
                            )}
                          </div>
                          <div className="my-auto py-1">
                            <h3 className="font-bold text-xs tracking-tight">{servant.name}</h3>
                            <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${activeTheme.accentBg}`}>
                              {servant.role_label}
                            </span>
                          </div>
                          <div className="flex items-end justify-between text-[8px] opacity-80 pt-1 border-t border-amber-500/10">
                            <div>
                              <div>المرحلة: {servant.stage}</div>
                              {showPhone && <div>{servant.phone}</div>}
                            </div>
                            <div className="font-medium opacity-70">{currentSubtitle}</div>
                          </div>
                        </div>
                      </>
                    )}
                    
                    {/* Hover Download Button (Hidden in Print) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        downloadCardAsImage(servant, 'servant')
                      }}
                      className="absolute bottom-2 left-2 bg-primary/95 text-primary-foreground hover:bg-primary h-7 w-7 rounded-full flex items-center justify-center shadow-lg transition hover:scale-105 print:hidden z-10"
                      title="تحميل كصورة عالية الجودة"
                    >
                      <FileDown className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {/* 2. RENDER STUDENT CARDS (with Class Name & Stage) */}
                {cardType === 'students' && selectedStudents.map((student) => {
                  const studentClass = student.enrollments?.[0]?.classes?.name_ar || 'غير محدد'
                  const studentStage = student.enrollments?.[0]?.stages?.name_ar || 'عام'
                  
                  return (
                    <div 
                      key={student.id}
                      className={`relative overflow-hidden border-2 rounded-xl transition duration-200 select-none shadow-md print:shadow-none print:border-slate-400/80 ${
                        activeTheme.cardBg
                      } ${
                        orientation === 'vertical' 
                          ? 'w-[54mm] h-[86mm] flex flex-col p-4 justify-between' 
                          : 'w-[86mm] h-[54mm] flex flex-row p-4 justify-between gap-3'
                      }`}
                      style={{ pageBreakInside: 'avoid', boxSizing: 'border-box' }}
                    >
                      {orientation === 'vertical' ? (
                        <>
                          <div className="flex items-center justify-between border-b pb-1.5 border-amber-500/20">
                            <span className="text-[9px] font-bold tracking-wide truncate max-w-[120px]">{churchName}</span>
                            {churchLogo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={churchLogo} alt="Logo" className="h-5 w-5 object-contain" />
                            ) : (
                              <span className={`text-xs font-bold ${activeTheme.logoColor}`}>☦</span>
                            )}
                          </div>

                          <div className="flex flex-col items-center justify-center my-auto py-2 text-center space-y-1.5">
                            {/* Avatar circle */}
                            <div className="h-16 w-16 rounded-full border-2 border-amber-500/40 bg-muted/20 flex items-center justify-center overflow-hidden shadow-inner relative">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img 
                                src={student.gender === 'female' ? '/avatar_girl.jpg' : '/avatar_boy.jpg'} 
                                alt={student.full_name} 
                                className="h-full w-full object-cover"
                              />
                            </div>
                            
                            <div>
                              <h3 className="font-bold text-[11px] tracking-tight leading-tight max-w-[150px] mx-auto">{student.full_name}</h3>
                              <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${activeTheme.accentBg}`}>
                                فصل {studentClass}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-end justify-between border-t pt-1.5 border-amber-500/20 text-[8px]">
                            <div className="space-y-0.5 text-right flex-1">
                              <div className="font-medium text-[8px] opacity-80">{currentSubtitle}</div>
                              <div className="opacity-70">المرحلة: {studentStage}</div>
                              {showPhone && student.father_phone && <div className="opacity-70">الوالد: {student.father_phone}</div>}
                            </div>
                            
                            {showQR && qrUrls[student.id] && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={qrUrls[student.id]} alt="QR" className="h-10 w-10 bg-white p-0.5 rounded shadow-sm shrink-0 mr-1.5" />
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex flex-col justify-between items-center w-1/3 text-center border-l border-amber-500/20 pl-2">
                            <div className="h-14 w-14 rounded-full border-2 border-amber-500/40 bg-muted/20 flex items-center justify-center overflow-hidden shadow-inner relative">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img 
                                src={student.gender === 'female' ? '/avatar_girl.jpg' : '/avatar_boy.jpg'} 
                                alt={student.full_name} 
                                className="h-full w-full object-cover"
                              />
                            </div>
                            {showQR && qrUrls[student.id] && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={qrUrls[student.id]} alt="QR" className="h-10 w-10 bg-white p-0.5 rounded shadow-sm" />
                            )}
                          </div>

                          <div className="flex flex-col justify-between w-2/3">
                            <div className="flex items-center justify-between border-b pb-1 border-amber-500/20">
                              <span className="text-[9px] font-bold tracking-wide truncate max-w-[100px]">{churchName}</span>
                              {churchLogo ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={churchLogo} alt="Logo" className="h-4.5 w-4.5 object-contain" />
                              ) : (
                                <span className={`text-[10px] font-bold ${activeTheme.logoColor}`}>☦</span>
                              )}
                            </div>

                            <div className="my-auto py-1">
                              <h3 className="font-bold text-[11px] leading-tight">{student.full_name}</h3>
                              <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${activeTheme.accentBg}`}>
                                فصل {studentClass}
                              </span>
                            </div>

                            <div className="flex items-end justify-between text-[8px] opacity-80 pt-1 border-t border-amber-500/10">
                              <div>
                                <div>المرحلة: {studentStage}</div>
                                {showPhone && student.father_phone && <div>الوالد: {student.father_phone}</div>}
                              </div>
                              <div className="font-medium opacity-70">{currentSubtitle}</div>
                            </div>
                          </div>
                        </>
                      )}
                      
                      {/* Hover Download Button (Hidden in Print) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          downloadCardAsImage(student, 'student')
                        }}
                        className="absolute bottom-2 left-2 bg-primary/95 text-primary-foreground hover:bg-primary h-7 w-7 rounded-full flex items-center justify-center shadow-lg transition hover:scale-105 print:hidden z-10"
                        title="تحميل كصورة عالية الجودة"
                      >
                        <FileDown className="h-4 w-4" />
                      </button>
                    </div>
                  )
                })}

                {/* Empty State */}
                {activeCardsCount === 0 && (
                  <div className="col-span-full text-center p-12 bg-card border border-border rounded-xl text-xs text-muted-foreground print:hidden">
                    الرجاء اختيار خادم أو مخدوم واحد على الأقل من القائمة باليسار لتوليد الكارنيهات الخاصة به.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Column 3: Control Panel (Hidden in Print) */}
          <div className="space-y-4 print:hidden">
            
            {/* Card Type Switcher */}
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <label className="block text-[10px] font-bold text-muted-foreground">نوع الكارنيهات والبطاقات</label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setCardType('servants')
                    setCardSubtitle('')
                  }}
                  className={`flex-1 h-9 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
                    cardType === 'servants' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/70 text-muted-foreground'
                  }`}
                >
                  <Shield className="h-3.5 w-3.5" />
                  خدام الخدمة
                </button>
                <button
                  onClick={() => {
                    setCardType('students')
                    setCardSubtitle('')
                  }}
                  className={`flex-1 h-9 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
                    cardType === 'students' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/70 text-muted-foreground'
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  الطلاب والمخدومين
                </button>
              </div>
            </div>

            {/* Template & Visual Customizer */}
            <div className="bg-card border border-border rounded-xl p-4 space-y-4">
              <h3 className="font-bold text-xs text-foreground flex items-center gap-1.5 pb-2 border-b border-border">
                <CreditCard className="h-4 w-4 text-primary" />
                تخصيص الكارنيه والبطاقة
              </h3>

              {/* Church Name & Title inputs */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground mb-1">اسم الكنيسة / الجهة</label>
                  <input
                    type="text"
                    value={churchName}
                    onChange={(e) => setChurchName(e.target.value)}
                    className="w-full text-xs h-8 px-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-card"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground mb-1">العنوان الفرعي للكارنيه</label>
                  <input
                    type="text"
                    placeholder={cardType === 'servants' ? 'كارنيه خادم مكرس' : 'بطاقة حضور مخدوم'}
                    value={cardSubtitle}
                    onChange={(e) => setCardSubtitle(e.target.value)}
                    className="w-full text-xs h-8 px-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-card"
                  />
                </div>
              </div>

              {/* Theme presets */}
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground mb-1.5">مظهر ولون الكارنيه</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { id: 'gold', name: 'ذهبي', bg: 'bg-slate-900 border-amber-500' },
                    { id: 'blue', name: 'أزرق', bg: 'bg-sky-950 border-sky-400' },
                    { id: 'burgundy', name: 'خمري', bg: 'bg-rose-950 border-amber-600' },
                    { id: 'olive', name: 'زيتوني', bg: 'bg-emerald-950 border-amber-500' },
                    { id: 'white', name: 'أبيض', bg: 'bg-white border-slate-300' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id as CardTheme)}
                      className={`h-9 rounded-md border text-[9px] font-bold flex flex-col items-center justify-center transition ${t.bg} ${
                        theme === t.id ? 'ring-2 ring-primary ring-offset-2' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <span className={t.id === 'white' ? 'text-slate-800' : 'text-white'}>{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Orientation toggle */}
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground mb-1.5">اتجاه الكارنيه</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setOrientation('vertical')}
                    className={`flex-1 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
                      orientation === 'vertical' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/70 text-muted-foreground'
                    }`}
                  >
                    رأسي (Vertical)
                  </button>
                  <button
                    onClick={() => setOrientation('horizontal')}
                    className={`flex-1 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
                      orientation === 'horizontal' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/70 text-muted-foreground'
                    }`}
                  >
                    أفقي (Horizontal)
                  </button>
                </div>
              </div>

              {/* Visual elements checklist */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => setShowQR(!showQR)}
                  className="flex items-center gap-2 text-xs font-semibold text-foreground"
                >
                  {showQR ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4 text-muted-foreground" />}
                  إدراج كود الاستجابة السريعة (QR Code)
                </button>
                
                <button
                  onClick={() => setShowPhone(!showPhone)}
                  className="flex items-center gap-2 text-xs font-semibold text-foreground"
                >
                  {showPhone ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4 text-muted-foreground" />}
                  {cardType === 'servants' ? 'إظهار رقم الموبايل الشخصي' : 'إظهار هاتف ولي الأمر (الأب)'}
                </button>
              </div>
            </div>

            {/* Checklist lists based on card type selection */}
            {cardType === 'servants' ? (
              <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <h3 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <LayoutGrid className="h-4 w-4 text-primary" />
                    الخدام المشمولين بالكارنيهات
                  </h3>
                  <button 
                    onClick={toggleSelectAllServants}
                    className="text-[10px] text-primary hover:underline font-bold"
                  >
                    {selectedServantIds.length === servants.length ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
                  </button>
                </div>

                <div className="divide-y divide-border max-h-[30vh] overflow-y-auto pr-1">
                  {servants.map((servant) => {
                    const isChecked = selectedServantIds.includes(servant.id)
                    return (
                      <div
                        key={servant.id}
                        onClick={() => toggleSelectServant(servant.id)}
                        className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition px-1 rounded-md"
                      >
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                            {servant.name.slice(0, 2)}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-foreground">{servant.name}</div>
                            <div className="text-[9px] text-muted-foreground">{servant.role_label} - {servant.stage}</div>
                          </div>
                        </div>
                        {isChecked ? (
                          <CheckSquare className="h-4 w-4 text-primary shrink-0" />
                        ) : (
                          <Square className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                <div className="space-y-2 pb-2 border-b border-border">
                  <h3 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <LayoutGrid className="h-4 w-4 text-primary" />
                    المخدومين المشمولين بالبطاقات
                  </h3>
                  
                  {/* Class Filter Dropdown */}
                  <div className="flex items-center gap-2 pt-1">
                    <School className="h-3.5 w-3.5 text-muted-foreground" />
                    <select
                      value={selectedClassId}
                      onChange={(e) => setSelectedClassId(e.target.value)}
                      className="w-full text-[11px] h-7 px-1.5 border border-border rounded bg-card focus:outline-none"
                    >
                      <option value="all">كل الفصول الدراسية</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>{c.name_ar}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-1">
                    <span>الطلاب المصفون: {filteredStudents.length}</span>
                    <button 
                      onClick={toggleSelectAllStudents}
                      className="text-primary hover:underline font-bold"
                    >
                      تحديد/إلغاء المصفى
                    </button>
                  </div>
                </div>

                {loadingData ? (
                  <div className="text-center p-6 text-xs text-muted-foreground">جاري تحميل سجلات الفصول والمخدومين...</div>
                ) : (
                  <div className="divide-y divide-border max-h-[35vh] overflow-y-auto pr-1">
                    {filteredStudents.map((std) => {
                      const isChecked = selectedStudentIds.includes(std.id)
                      const stdClass = std.enrollments?.[0]?.classes?.name_ar || 'غير محدد'
                      return (
                        <div
                          key={std.id}
                          onClick={() => toggleSelectStudent(std.id)}
                          className="py-2 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition px-1 rounded-md"
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full overflow-hidden border border-border bg-muted flex items-center justify-center shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img 
                                src={std.gender === 'female' ? '/avatar_girl.jpg' : '/avatar_boy.jpg'} 
                                alt={std.full_name} 
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-foreground leading-tight truncate max-w-[130px]">{std.full_name}</div>
                              <div className="text-[8px] text-muted-foreground">فصل: {stdClass}</div>
                            </div>
                          </div>
                          {isChecked ? (
                            <CheckSquare className="h-4 w-4 text-primary shrink-0" />
                          ) : (
                            <Square className="h-4 w-4 text-muted-foreground shrink-0" />
                          )}
                        </div>
                      )
                    })}
                    {filteredStudents.length === 0 && (
                      <div className="text-center p-6 text-xs text-muted-foreground">لا يوجد طلاب في هذا الفصل حالياً.</div>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

        {/* Global Print Cut Styles Component */}
        <style jsx global>{`
          @media print {
            body {
              background: white !important;
              color: black !important;
            }
            .print\\:hidden {
              display: none !important;
            }
            /* Reset Layout for Printer */
            #__next, main, div, aside, section {
              background: transparent !important;
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
              margin: 0 !important;
            }
            header, footer, nav, aside {
              display: none !important;
            }
            /* Layout Grid setup for cards on standard A4 print sheets */
            .print\\:gap-10 {
              gap: 12mm !important;
            }
            .print\\:grid-cols-3 {
              grid-template-columns: repeat(3, 54mm) !important;
            }
            .print\\:grid-cols-2 {
              grid-template-columns: repeat(2, 86mm) !important;
            }
            /* Sizing & Borders */
            div[style*="page-break-inside"] {
              border: 0.5px dashed #64748b !important;
              box-shadow: none !important;
              background-color: transparent !important;
              color: black !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        `}</style>

      </div>
    </Shell>
  )
}
