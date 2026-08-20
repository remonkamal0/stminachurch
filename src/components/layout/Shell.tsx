'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { useAuth } from '@/lib/auth/AuthContext'
import {
  LayoutDashboard,
  Users,
  School,
  CheckSquare,
  MessageSquare,
  Shield,
  Award,
  DollarSign,
  BookOpen,
  BarChart3,
  Settings,
  Menu,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  Globe,
  Plus,
  LogOut,
  User,
  MoreHorizontal,
  HelpCircle,
  Compass,
  HeartHandshake
} from 'lucide-react'

interface ShellProps {
  children: React.ReactNode
}

export function Shell({ children }: ShellProps) {
  const { t, locale, toggleLocale, dir } = useLanguage()
  const { user, profile, loading, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showQuickAdd, setShowQuickAdd] = useState(false)

  const [churchName, setChurchName] = useState('كنيسة مارمينا')
  const [churchLogo, setChurchLogo] = useState<string | null>(null)

  useEffect(() => {
    // Load initial configuration
    const savedName = localStorage.getItem('churchName')
    const savedLogo = localStorage.getItem('churchLogo')
    if (savedName) setChurchName(savedName)
    if (savedLogo) setChurchLogo(savedLogo)

    const applyThemeColors = () => {
      const savedTheme = localStorage.getItem('appTheme')
      if (savedTheme) {
        try {
          const { primary, secondary } = JSON.parse(savedTheme)
          if (primary && secondary) {
            document.documentElement.style.setProperty('--primary', primary)
            document.documentElement.style.setProperty('--secondary', secondary)
          }
        } catch (e) {
          console.error(e)
        }
      } else {
        document.documentElement.style.setProperty('--primary', '220 70% 30%')
        document.documentElement.style.setProperty('--secondary', '38 90% 50%')
      }
    }

    applyThemeColors()

    // Listen to localStorage changes in real time
    const handleStorage = () => {
      const n = localStorage.getItem('churchName')
      const l = localStorage.getItem('churchLogo')
      if (n) setChurchName(n)
      if (l) setChurchLogo(l)
      applyThemeColors()
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  // Close menus on click outside
  useEffect(() => {
    const handleOutsideClick = () => {
      setShowProfileMenu(false)
      setShowNotifications(false)
      setShowQuickAdd(false)
    }
    window.addEventListener('click', handleOutsideClick)
    return () => window.removeEventListener('click', handleOutsideClick)
  }, [])

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const menuItems = [
    { name: t('navigation.dashboard'), path: '/', icon: LayoutDashboard },
    { name: t('navigation.students'), path: '/students', icon: Users },
    { name: t('navigation.classes'), path: '/classes', icon: School },
    { name: t('navigation.attendance'), path: '/attendance', icon: CheckSquare },
    { 
      name: t('navigation.followups'), 
      path: '/followups', 
      icon: MessageSquare,
      subItems: [
        { name: 'سجل وبلاغات الافتقاد', path: '/followups?tab=logs', tab: 'logs' },
        { name: 'قوائم المتابعة الذكية والغياب', path: '/followups?tab=smart-list', tab: 'smart-list' },
        { name: 'خريطة ومناطق الافتقاد الميداني', path: '/followups?tab=zones', tab: 'zones' }
      ]
    },
    { 
      name: t('navigation.points'), 
      path: '/points', 
      icon: Award,
      subItems: [
        { name: 'متجر الهدايا والجوائز', path: '/points?tab=store', tab: 'store' },
        { name: 'لوحة التميز والصدارة', path: '/points?tab=rankings', tab: 'rankings' },
        { name: 'رصد النقاط والمكافآت', path: '/points?tab=award', tab: 'award' },
        { name: 'قواعد وإعدادات النقاط', path: '/points?tab=rules', tab: 'rules' }
      ]
    },
    { 
      name: t('navigation.finance'), 
      path: '/finance', 
      icon: DollarSign,
      subItems: [
        { name: 'سجل الحركة والمدفوعات', path: '/finance?tab=budget', tab: 'budget' },
        { name: 'تقرير الاشتراكات السنوية', path: '/finance?tab=tithes', tab: 'tithes' },
        { name: 'إعدادات المصاريف والخزائن', path: '/finance?tab=settings', tab: 'settings' }
      ]
    },
    { 
      name: t('navigation.curriculum'), 
      path: '/curriculum', 
      icon: BookOpen,
      subItems: [
        { name: 'جميع المناهج والملفات', path: '/curriculum?tab=all', tab: 'all' },
        { name: 'تاريخ كنسي وعقيدة', path: '/curriculum?tab=history', tab: 'history' },
        { name: 'اللغة القبطية والطقوس', path: '/curriculum?tab=coptic', tab: 'coptic' },
        { name: 'الألحان والتسبحة', path: '/curriculum?tab=hymns', tab: 'hymns' }
      ]
    },
    { 
      name: t('navigation.reports'), 
      path: '/reports', 
      icon: BarChart3,
      subItems: [
        { name: 'العرض الإحصائي الشامل', path: '/reports?tab=dashboard', tab: 'dashboard' },
        { name: 'كشوفات أسماء الفصول التفصيلية', path: '/reports?tab=rosters', tab: 'rosters' },
        { name: 'مصفوفة أداء الفصول', path: '/reports?tab=classes-matrix', tab: 'classes-matrix' },
        { name: 'كشف الغياب والمنقطعين', path: '/reports?tab=absentees', tab: 'absentees' },
        { name: 'ميزانية الخدمة والمالية', path: '/reports?tab=finance', tab: 'finance' },
        { name: 'أعياد ميلاد المخدومين والخدام', path: '/reports?tab=birthdays', tab: 'birthdays' }
      ]
    },
    { 
      name: 'مسابقات وأنشطة الكتاب', 
      path: '/quizzes', 
      icon: HelpCircle 
    },
    { 
      name: 'إدارة الرحلات والمعسكرات', 
      path: '/trips', 
      icon: Compass 
    },
    { 
      name: 'بوابة ولي الأمر التفاعلية', 
      path: '/parents', 
      icon: HeartHandshake 
    },
    { 
      name: t('navigation.servants'), 
      path: '/servants', 
      icon: Shield,
      subItems: [
        { name: 'دليل الخدام وتكليفات الفصول', path: '/servants?tab=directory', tab: 'directory' },
        { name: 'تسجيل حضور الخدام', path: '/servants?tab=record', tab: 'record' },
        { name: 'تقرير حضور الخدام', path: '/servants?tab=report-attendance', tab: 'report-attendance' },
        { name: 'تقرير افتقاد الخدام', path: '/servants?tab=report-visitation', tab: 'report-visitation' },
        { name: 'كارنيهات وبطاقات الهوية للطباعة', path: '/servants/id-cards', tab: 'id-cards' },
        { name: 'تصدير رموز QR للطباعة والتصميم', path: '/servants/qr-export', tab: 'qr-export' }
      ]
    },
    { 
      name: t('navigation.settings'), 
      path: '/settings', 
      icon: Settings,
      subItems: [
        { name: 'إعدادات التهيئة والحقول', path: '/settings?tab=system', tab: 'system' },
        { name: 'الصلاحيات وأدوار الخدمة', path: '/settings?tab=permissions', tab: 'permissions' },
        { name: 'قاعدة بيانات الآباء الكهنة', path: '/settings?tab=priests', tab: 'priests' },
        { name: 'النسخ الاحتياطي والاسترداد', path: '/settings?tab=backup', tab: 'backup' },
        { name: 'شعار الكنيسة وهويتها', path: '/settings?tab=branding', tab: 'branding' },
        { name: 'تسجيل البيانات عن بعد', path: '/settings?tab=remote-reg', tab: 'remote-reg' },
        { name: 'المراحل الدراسية والخدمية', path: '/settings?tab=stages', tab: 'stages' }
      ]
    },
  ]

  // Key items shown in mobile bottom bar
  const mobileBottomItems = [
    { name: t('navigation.dashboard'), path: '/', icon: LayoutDashboard },
    { name: t('navigation.students'), path: '/students', icon: Users },
    { name: t('navigation.attendance'), path: '/attendance', icon: CheckSquare },
    { name: t('navigation.followups'), path: '/followups', icon: MessageSquare },
  ]

  const toggleSidebar = () => setIsCollapsed(!isCollapsed)

  return (
    <div className="flex h-screen w-full overflow-hidden bg-muted/30">
      {/* 1. DESKTOP SIDEBAR */}
      <aside
        className={`hidden md:flex flex-col border-l border-border bg-card transition-all duration-300 z-30 shadow-sm relative ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand / Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {!isCollapsed ? (
            <div className="flex items-center gap-3">
              {churchLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={churchLogo} alt="Logo" className="h-9 w-9 object-contain rounded-md" />
              ) : (
                <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-sm">
                  ☦
                </div>
              )}
              <div className="space-y-0.5">
                <span className="font-extrabold text-xs text-foreground tracking-tight block truncate max-w-[140px]">{churchName}</span>
                <span className="text-[10px] text-muted-foreground block">مدارس الأحد الأرثوذكسية</span>
              </div>
            </div>
          ) : (
            <div className="mx-auto">
              {churchLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={churchLogo} alt="Logo" className="h-8 w-8 object-contain rounded-md" />
              ) : (
                <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                  ☦
                </div>
              )}
            </div>
          )}
          
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
          >
            {isCollapsed ? (
              dir === 'rtl' ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
            ) : (
              dir === 'rtl' ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation list with Suspense support */}
        <Suspense fallback={<div className="p-4 text-xs text-muted-foreground">جاري تحميل القوائم...</div>}>
          <SidebarNavigation
            menuItems={menuItems}
            isCollapsed={isCollapsed}
            locale={locale}
            pathname={pathname}
            t={t}
          />
        </Suspense>

        {/* User profile strip footer */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-muted/40 border border-border/50">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
              {profile?.name ? profile.name.charAt(0) : 'خ'}
            </div>
            {!isCollapsed && (
              <div className="space-y-0.5 min-w-0 flex-1">
                <p className="text-xs font-bold text-foreground truncate">{profile?.name || 'خادم مسؤول'}</p>
                <p className="text-[10px] text-muted-foreground truncate">{profile?.email || 'admin@stmina.church'}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* 2. MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header Toolbar */}
        <header className="h-16 border-b border-border bg-card px-4 md:px-6 flex items-center justify-between shrink-0 shadow-xs z-20 print:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-lg border border-border">
              <span className="font-semibold text-foreground">{churchName}</span>
              <span>•</span>
              <span>نظام إدارة الخدمة المتكامل</span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Direct Parent Portal Link Button */}
            <Link
              href="/parents"
              className="hidden lg:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition"
            >
              <HeartHandshake className="h-3.5 w-3.5" />
              بوابة ولي الأمر
            </Link>

            {/* Quick Add Dropdown */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowQuickAdd(!showQuickAdd); setShowNotifications(false); setShowProfileMenu(false); }}
                className="h-9 px-3 bg-primary text-primary-foreground font-semibold rounded-lg text-xs flex items-center gap-1.5 hover:bg-primary/95 shadow-sm transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">إضافة سريعة</span>
              </button>

              {showQuickAdd && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute left-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-xl p-1 z-50 animate-in fade-in slide-in-from-top-2 text-xs"
                >
                  <Link
                    href="/students/new"
                    onClick={() => setShowQuickAdd(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-muted text-foreground transition"
                  >
                    <Users className="h-4 w-4 text-primary" />
                    <span>إضافة مخدوم جديد</span>
                  </Link>
                  <Link
                    href="/classes/new"
                    onClick={() => setShowQuickAdd(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-muted text-foreground transition"
                  >
                    <School className="h-4 w-4 text-primary" />
                    <span>إضافة فصل جديد</span>
                  </Link>
                  <Link
                    href="/curriculum"
                    onClick={() => setShowQuickAdd(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-muted text-foreground transition"
                  >
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span>إضافة درس وتحضير</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowProfileMenu(!showProfileMenu); setShowNotifications(false); setShowQuickAdd(false); }}
                className="h-9 w-9 rounded-full bg-muted/60 border border-border flex items-center justify-center text-foreground hover:bg-muted transition cursor-pointer"
              >
                <User className="h-4 w-4" />
              </button>

              {showProfileMenu && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute left-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 text-xs space-y-1"
                >
                  <div className="p-2 border-b border-border">
                    <p className="font-bold text-foreground">{profile?.name || 'خادم مسؤول'}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{profile?.email || 'admin@stmina.church'}</p>
                  </div>
                  <Link
                    href="/settings"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-foreground transition"
                  >
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span>إعدادات النظام</span>
                  </Link>
                  <button
                    onClick={async () => {
                      setShowProfileMenu(false)
                      await logout()
                      router.push('/login')
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-destructive/10 text-destructive transition text-right cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>تسجيل الخروج</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 3. SCROLLABLE PAGE CONTAINER */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6 relative z-10">
          {children}
        </main>

        {/* 4. MOBILE BOTTOM NAVIGATION BAR */}
        <nav className="md:hidden h-16 shrink-0 border-t border-border bg-card flex items-center justify-around absolute bottom-0 left-0 right-0 z-30 shadow-lg px-2">
          {mobileBottomItems.map((item) => {
            const Icon = item.icon
            const isActive = item.path === '/' ? pathname === '/' : pathname.startsWith(item.path)
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex flex-col items-center gap-1.5 text-[10px] font-medium transition-all duration-200 ${
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                <span>{item.name}</span>
              </Link>
            )
          })}
          
          {/* Mobile "More" Trigger */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex flex-col items-center gap-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <MoreHorizontal className="h-5 w-5" />
            <span>المزيد</span>
          </button>
        </nav>
        
        {/* Dynamic Print-Only Footer */}
        <div className="print-footer hidden justify-between items-center text-[10px] text-zinc-500 w-full font-sans px-4 py-2" dir="rtl">
          <div className="text-right">
            <span>المستند مطبوع بواسطة: <strong>{profile?.name || 'خادم مسؤول'}</strong></span>
          </div>
          <div className="text-center font-bold print-page-number"></div>
          <div className="text-left font-mono">
            <span>تاريخ وساعة الطباعة: {new Date().toLocaleDateString('ar-EG')} - {new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      {/* 5. MOBILE DRAWER OVERLAY */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 md:hidden flex justify-end">
          <div
            className={`w-72 max-w-xs bg-card border-l border-border h-full flex flex-col p-6 shadow-2xl animate-in ${
              locale === 'ar' ? 'slide-in-from-right' : 'slide-in-from-left'
            }`}
          >
            <div className="flex justify-between items-center border-b border-border pb-4 mb-4">
              <div className="flex items-center gap-2">
                {churchLogo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={churchLogo} alt="Logo" className="h-7 w-7 object-contain rounded-md" />
                ) : (
                  <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
                    ☦
                  </div>
                )}
                <span className="font-bold text-xs text-primary">{churchName}</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            {/* Drawer items */}
            <nav className="flex-1 overflow-y-auto space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = item.path === '/' ? pathname === '/' : pathname.startsWith(item.path)
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      )}
    </div>
  )
}

function SidebarNavigation({ 
  menuItems, 
  isCollapsed, 
  locale, 
  pathname, 
  t 
}: { 
  menuItems: any[]
  isCollapsed: boolean
  locale: string
  pathname: string
  t: any 
}) {
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab') || ''

  return (
    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
      {menuItems.map((item) => {
        const Icon = item.icon
        const isActive = item.path === '/' ? pathname === '/' : pathname.startsWith(item.path)
        
        return (
          <div key={item.path} className="space-y-1">
            <Link
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'}`} />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
              
              {/* Tooltip on Collapsed */}
              {isCollapsed && (
                <div className={`absolute z-50 invisible group-hover:visible bg-popover text-popover-foreground border border-border text-xs rounded px-2 py-1 shadow-md whitespace-nowrap ${
                  locale === 'ar' ? 'right-24' : 'left-24'
                }`}>
                  {item.name}
                </div>
              )}
            </Link>

            {/* Submenu */}
            {item.subItems && isActive && !isCollapsed && (
              <div className="mr-6 mt-1 space-y-1 border-r border-border pr-2 animate-in slide-in-from-top-1">
                {item.subItems.map((sub: any) => {
                  const isSubActive = pathname === sub.path ||
                                      currentTab === sub.tab || 
                                      (sub.tab === 'system' && !currentTab && item.path === '/settings') ||
                                      (sub.tab === 'dashboard' && !currentTab && item.path === '/reports') ||
                                      (sub.tab === 'store' && !currentTab && item.path === '/points') ||
                                      (sub.tab === 'budget' && !currentTab && item.path === '/finance') ||
                                      (sub.tab === 'all' && !currentTab && item.path === '/curriculum') ||
                                      (sub.tab === 'directory' && !currentTab && item.path === '/servants' && pathname === '/servants') ||
                                      (sub.tab === 'logs' && !currentTab && item.path === '/followups')
                  return (
                    <Link
                      key={sub.path}
                      href={sub.path}
                      className={`block px-3 py-1.5 rounded-md text-[11px] font-bold transition ${
                        isSubActive
                          ? 'text-primary bg-primary/5'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                      }`}
                    >
                      {sub.name}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )
}
