'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { Shell } from '@/components/layout/Shell'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { Download, Search, CheckSquare, Square, Users, Shield, School, ArrowDownToLine, QrCode } from 'lucide-react'
import QRCode from 'qrcode'
import { getStudents } from '@/lib/services/studentsService'
import { getClasses } from '@/lib/services/classesService'

type ExportType = 'students' | 'servants'

interface ServantItem {
  id: string
  name: string
  role_label: string
  stage: string
  phone: string
}

export default function QrExportPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-xs text-muted-foreground font-sans">جاري تحميل أداة تصدير الرموز...</div>}>
      <QrExportPageContent />
    </Suspense>
  )
}

function QrExportPageContent() {
  const { locale } = useLanguage()
  const [exportType, setExportType] = useState<ExportType>('students')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClassId, setSelectedClassId] = useState<string>('all')
  
  // Database States
  const [students, setStudents] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)
  
  // High-res QR Data URLs
  const [qrUrls, setQrUrls] = useState<Record<string, string>>({})
  
  // Checkbox Selections
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Mock Servants
  const servants: ServantItem[] = [
    { id: 'srv1', name: 'مينا كمال غبريال', role_label: 'أمين فصل', stage: 'ابتدائي', phone: '01234567890' },
    { id: 'srv2', name: 'يوستينا عادل فوزي', role_label: 'خادمة مرحلة', stage: 'ابتدائي', phone: '01234567891' },
    { id: 'srv3', name: 'تامر شفيق عزمي', role_label: 'أمين المرحلة', stage: 'إعدادي', phone: '01234567892' },
    { id: 'srv4', name: 'فادي فريد نصيف', role_label: 'خادم ثانوي', stage: 'ثانوي', phone: '01234567893' }
  ]

  // Load database data
  useEffect(() => {
    async function loadData() {
      try {
        const [cls, stds] = await Promise.all([
          getClasses(),
          getStudents()
        ])
        if (cls) setClasses(cls)
        if (stds) setStudents(stds)
      } catch (err) {
        console.error('Failed to load database records for QR exporter:', err)
      } finally {
        setLoadingData(false)
      }
    }
    loadData()
  }, [])

  // Generate high-resolution QR codes (512px width for professional print design)
  useEffect(() => {
    async function generateHighResQRs() {
      const urls: Record<string, string> = {}
      
      // Generate for Servants
      for (const s of servants) {
        try {
          const qrContent = `SERVANT:${s.id}|NAME:${s.name}|ROLE:${s.role_label}`
          urls[s.id] = await QRCode.toDataURL(qrContent, { width: 512, margin: 2 })
        } catch (err) {
          console.error(err)
        }
      }
      
      // Generate for Students
      for (const s of students) {
        try {
          const qrContent = s.qr_code || `STUDENT:${s.id}`
          urls[s.id] = await QRCode.toDataURL(qrContent, { width: 512, margin: 2 })
        } catch (err) {
          console.error(err)
        }
      }
      
      setQrUrls(urls)
    }
    
    if (!loadingData) {
      generateHighResQRs()
    }
  }, [students, loadingData])

  // Filter lists based on type, search query, and class dropdown
  const filteredItems = exportType === 'students'
    ? students.filter(s => {
        const matchesSearch = s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              s.numeric_code.toString().includes(searchTerm)
        const matchesClass = selectedClassId === 'all' || s.enrollments?.[0]?.class_id === selectedClassId
        return matchesSearch && matchesClass
      })
    : servants.filter(s => {
        return s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
               s.phone.includes(searchTerm)
      })

  // Select Toggles
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    const visibleIds = filteredItems.map(item => item.id)
    const allVisibleSelected = visibleIds.every(id => selectedIds.includes(id))
    
    if (allVisibleSelected) {
      setSelectedIds(prev => prev.filter(id => !visibleIds.includes(id)))
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...visibleIds])))
    }
  }

  // Trigger individual file downloads in loop
  const triggerBulkDownload = () => {
    const itemsToDownload = exportType === 'students'
      ? students.filter(s => selectedIds.includes(s.id))
      : servants.filter(s => selectedIds.includes(s.id))

    itemsToDownload.forEach((item, index) => {
      // Small timeout to prevent browser download blockages
      setTimeout(() => {
        const url = qrUrls[item.id]
        if (url) {
          const name = exportType === 'students' ? item.full_name : item.name
          const link = document.createElement('a')
          link.href = url
          link.download = `QR_${exportType === 'students' ? 'مخدوم' : 'خادم'}_${name.replace(/\s+/g, '_')}.png`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
      }, index * 150)
    })
  }

  const downloadSingleQR = (id: string, name: string) => {
    const url = qrUrls[id]
    if (url) {
      const link = document.createElement('a')
      link.href = url
      link.download = `QR_${exportType === 'students' ? 'مخدوم' : 'خادم'}_${name.replace(/\s+/g, '_')}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  // Reset selections on export type switch
  useEffect(() => {
    setSelectedIds([])
  }, [exportType])

  return (
    <Shell>
      <div className="p-6 font-sans text-right max-w-6xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-4">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2 justify-end">
              تصدير رموز الاستجابة السريعة (QR Codes)
              <QrCode className="h-5 w-5 text-primary" />
            </h1>
            <p className="text-xs text-muted-foreground mt-1">حمل رموز الـ QR بجودة عالية جداً (512x512 بكسل) لاستخدامها في تصاميمك الخاصة على فوتوشوب أو برامج الكروت الخارجية.</p>
          </div>

          <button
            onClick={triggerBulkDownload}
            disabled={selectedIds.length === 0}
            className="h-10 px-5 bg-primary text-primary-foreground font-semibold rounded-lg text-xs flex items-center gap-2 hover:bg-primary/95 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowDownToLine className="h-4.5 w-4.5" />
            تحميل الرموز المحددة دفعة واحدة ({selectedIds.length})
          </button>
        </div>

        {/* Controls and Filters */}
        <div className="bg-card border border-border rounded-xl p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          
          {/* 1. Type Switcher */}
          <div className="space-y-1.5 col-span-1">
            <label className="block text-[10px] font-bold text-muted-foreground">نوع تصدير الرموز</label>
            <div className="flex gap-2">
              <button
                onClick={() => setExportType('students')}
                className={`flex-1 h-9 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
                  exportType === 'students' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/70 text-muted-foreground'
                }`}
              >
                <Users className="h-4 w-4" />
                المخدومين
              </button>
              <button
                onClick={() => setExportType('servants')}
                className={`flex-1 h-9 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
                  exportType === 'servants' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/70 text-muted-foreground'
                }`}
              >
                <Shield className="h-4 w-4" />
                الخدام
              </button>
            </div>
          </div>

          {/* 2. Class Filter (For students only) */}
          <div className="space-y-1.5 col-span-1">
            {exportType === 'students' ? (
              <>
                <label className="block text-[10px] font-bold text-muted-foreground">تصفية حسب الفصل</label>
                <div className="relative">
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full text-xs h-9 pr-8 pl-3 border border-border rounded-lg bg-card focus:outline-none focus:ring-1 focus:ring-primary appearance-none font-semibold text-foreground"
                  >
                    <option value="all">كل الفصول</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name_ar}</option>
                    ))}
                  </select>
                  <School className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </>
            ) : (
              <div className="h-full flex items-end">
                <span className="text-xs text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg block w-full text-center border border-border/50">
                  عرض كل خدام الخدمة
                </span>
              </div>
            )}
          </div>

          {/* 3. Search Bar */}
          <div className="space-y-1.5 col-span-2">
            <label className="block text-[10px] font-bold text-muted-foreground">البحث عن الخادم أو المخدوم</label>
            <div className="relative">
              <input
                type="text"
                placeholder={exportType === 'students' ? 'ابحث بالاسم أو كود المخدوم...' : 'ابحث باسم الخادم أو رقم الموبايل...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs h-9 pr-9 pl-3 border border-border rounded-lg bg-card focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
              />
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

        </div>

        {/* Selected Counter & Select All Toolbar */}
        <div className="flex justify-between items-center px-2">
          <div className="text-xs text-muted-foreground">
            عرض <span className="font-bold text-foreground">{filteredItems.length}</span> من الأكواد المستهدفة
          </div>
          <button
            onClick={toggleSelectAll}
            className="text-xs text-primary font-bold flex items-center gap-1.5 hover:underline"
          >
            تحديد أو إلغاء كل المعروضين
            <CheckSquare className="h-4 w-4" />
          </button>
        </div>

        {/* QR Code Cards Grid */}
        {loadingData ? (
          <div className="text-center p-12 text-xs text-muted-foreground font-sans">جاري تحميل سجلات الخدام والمخدومين...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            
            {filteredItems.map((item) => {
              const isChecked = selectedIds.includes(item.id)
              const name = exportType === 'students' ? item.full_name : item.name
              const subtitle = exportType === 'students' 
                ? (item.enrollments?.[0]?.classes?.name_ar || 'غير محدد') 
                : item.role_label

              return (
                <div
                  key={item.id}
                  onClick={() => toggleSelect(item.id)}
                  className={`bg-card border-2 rounded-xl p-3 flex flex-col justify-between items-center text-center cursor-pointer transition select-none hover:shadow-md relative group ${
                    isChecked ? 'border-primary' : 'border-border hover:border-muted-foreground/30'
                  }`}
                >
                  {/* Checkbox badge */}
                  <div className="absolute top-2 right-2">
                    {isChecked ? (
                      <CheckSquare className="h-4.5 w-4.5 text-primary" />
                    ) : (
                      <Square className="h-4.5 w-4.5 text-muted-foreground opacity-60 group-hover:opacity-100" />
                    )}
                  </div>

                  {/* QR Image Box */}
                  <div className="h-28 w-28 bg-white p-1.5 rounded-lg border border-border/80 flex items-center justify-center shadow-inner mt-4">
                    {qrUrls[item.id] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={qrUrls[item.id]} alt="QR" className="h-full w-full object-contain" />
                    ) : (
                      <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="mt-3 space-y-1 w-full">
                    <h3 className="font-bold text-xs text-foreground truncate px-1">{name}</h3>
                    <p className="text-[10px] text-muted-foreground font-semibold truncate">{subtitle}</p>
                    {exportType === 'students' && (
                      <p className="text-[9px] text-primary font-bold">كود: {item.numeric_code}</p>
                    )}
                  </div>

                  {/* Download button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      downloadSingleQR(item.id, name)
                    }}
                    className="mt-3 w-full h-8 bg-muted hover:bg-primary hover:text-primary-foreground text-foreground text-[10px] font-bold rounded-lg flex items-center justify-center gap-1.5 transition"
                  >
                    <Download className="h-3.5 w-3.5" />
                    تحميل كصورة
                  </button>

                </div>
              )
            })}

            {filteredItems.length === 0 && (
              <div className="col-span-full text-center p-12 bg-muted/20 border border-border border-dashed rounded-xl text-xs text-muted-foreground">
                لا توجد نتائج تطابق خيارات البحث والتصفية المحددة.
              </div>
            )}

          </div>
        )}

      </div>
    </Shell>
  )
}
