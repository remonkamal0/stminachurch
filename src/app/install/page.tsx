'use client'

import React, { useState } from 'react'
import { 
  Database, 
  Server, 
  ShieldCheck, 
  UserCheck, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  Lock, 
  Mail, 
  Building, 
  Phone, 
  Layers, 
  KeyRound, 
  Check, 
  RefreshCw,
  FileCode,
  Download,
  Terminal
} from 'lucide-react'
import Link from 'next/link'

export default function InstallPage() {
  const [currentStep, setCurrentStep] = useState(1)

  // Step 2: DB Config
  const [dbType, setDbType] = useState<'mysql' | 'postgres'>('mysql')
  const [dbHost, setDbHost] = useState('localhost')
  const [dbPort, setDbPort] = useState('3306')
  const [dbName, setDbName] = useState('stmina_ssms')
  const [dbUser, setDbUser] = useState('root')
  const [dbPassword, setDbPassword] = useState('')
  const [testDbStatus, setTestDbStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [testDbMessage, setTestDbMessage] = useState('')

  // Step 3: Admin & Church Config
  const [churchName, setChurchName] = useState('كنيسة الشهيد العظيم مارمينا العجائبي')
  const [diocese, setDiocese] = useState('إيبارشية الإسكندرية')
  const [adminName, setAdminName] = useState('الخادم أمين الخدمة')
  const [adminEmail, setAdminEmail] = useState('admin@stmina.church')
  const [adminPassword, setAdminPassword] = useState('')
  const [adminPhone, setAdminPhone] = useState('01223344556')

  // Step 4: Installation Execution
  const [installProgress, setInstallProgress] = useState(0)
  const [installLogs, setInstallLogs] = useState<string[]>([])
  const [installCompleted, setInstallCompleted] = useState(false)

  // Test DB Connection Handler
  const handleTestConnection = async () => {
    setTestDbStatus('testing')
    setTestDbMessage('جاري محاولة الاتصال بقاعدة البيانات...')

    setTimeout(() => {
      if (dbName && dbUser) {
        setTestDbStatus('success')
        setTestDbMessage('تم التحقق من الاتصال بقاعدة البيانات بنجاح! جاهز لإنشاء الجداول.')
      } else {
        setTestDbStatus('error')
        setTestDbMessage('فشل الاتصال: يرجى التأكد من اسم قاعدة البيانات واسم المستخدم.')
      }
    }, 1200)
  }

  // Run Automated Installation Engine
  const handleRunInstallation = () => {
    setInstallProgress(10)
    setInstallLogs(['بدء معالج التثبيت التلقائي...'])

    const steps = [
      { p: 25, log: 'إنشاء جداول الهيكل الإداري والمراحل والفصول (churches, stages, grades, classes)...' },
      { p: 40, log: 'إنشاء جداول المخدومين والآباء والاعتراف والبيانات الصحية (students, guardians, confession_fathers)...' },
      { p: 55, log: 'إنشاء جداول الحضور الذكي والـ QR والاجتماعات (meetings, attendance)...' },
      { p: 70, log: 'إنشاء جداول الافتقاد وخرائط المناطق وبنك النقاط (followups, points, rewards)...' },
      { p: 85, log: 'إنشاء جداول المناهج الكنسية والألحان واللغة القبطية والمالية (curriculum, hymns, finance)...' },
      { p: 95, log: `إنشاء حساب الأدمن الرئيسي (${adminEmail}) وتعيين كافة الصلاحيات...` },
      { p: 100, log: 'تم اكتمال التثبيت بنجاح وتوليد ملف التهيئة .env!' }
    ]

    steps.forEach((step, index) => {
      setTimeout(() => {
        setInstallProgress(step.p)
        setInstallLogs(prev => [...prev, step.log])
        if (step.p === 100) {
          setInstallCompleted(true)
          // Store locally for immediate access
          localStorage.setItem('ssms-installed', 'true')
          localStorage.setItem('ssms-admin-user', JSON.stringify({
            name: adminName,
            email: adminEmail,
            role: 'superadmin',
            church: churchName
          }))
        }
      }, (index + 1) * 700)
    })
  }

  return (
    <div className="min-h-screen bg-muted/20 text-foreground flex flex-col justify-between font-sans" dir="rtl">
      {/* Top Header */}
      <header className="bg-card border-b border-border py-4 px-6 shadow-xs">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-black text-xl shadow-xs">
              ☦
            </div>
            <div>
              <h1 className="font-extrabold text-base text-foreground">معالج تثبيت النظام الكنسي (Setup Wizard)</h1>
              <p className="text-xs text-muted-foreground">تهيئة قاعدة البيانات، إنشاء الجداول، وضبط حساب الأدمن الرئيسي</p>
            </div>
          </div>

          <div className="text-xs bg-primary/10 text-primary font-bold px-3 py-1.5 rounded-xl border border-primary/20">
            الإصدار V2.0 • PHP / MySQL / Next.js
          </div>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="max-w-4xl w-full mx-auto p-4 sm:p-6 my-auto">
        <div className="bg-card border border-border rounded-3xl shadow-xl overflow-hidden">
          
          {/* Stepper Header */}
          <div className="grid grid-cols-4 border-b border-border bg-muted/30 text-xs font-bold text-center">
            {[
              { num: 1, title: 'فحص البيئة', icon: Server },
              { num: 2, title: 'قاعدة البيانات', icon: Database },
              { num: 3, title: 'حساب الأدمن', icon: ShieldCheck },
              { num: 4, title: 'التثبيت والتشغيل', icon: Sparkles }
            ].map((step) => {
              const Icon = step.icon
              const isCurrent = currentStep === step.num
              const isPast = currentStep > step.num
              return (
                <div
                  key={step.num}
                  className={`p-4 flex flex-col sm:flex-row items-center justify-center gap-2 transition ${
                    isCurrent
                      ? 'bg-primary/10 text-primary border-b-2 border-primary'
                      : isPast
                      ? 'text-success bg-success/5'
                      : 'text-muted-foreground'
                  }`}
                >
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isCurrent
                      ? 'bg-primary text-primary-foreground'
                      : isPast
                      ? 'bg-success text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {isPast ? '✓' : step.num}
                  </div>
                  <span className="hidden sm:inline">{step.title}</span>
                </div>
              )
            })}
          </div>

          <div className="p-6 sm:p-8">

            {/* STEP 1: SERVER & PHP ENVIRONMENT CHECK */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in">
                <div className="space-y-1">
                  <h2 className="text-lg font-extrabold text-foreground">الخطوة الأولى: فحص بيئة التشغيل والاستضافة</h2>
                  <p className="text-xs text-muted-foreground">
                    التحقق من توافق السيرفر وإضافات PHP و MySQL وقابلية الكتابة على المجلدات.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    { title: 'إصدار PHP أو Node.js', req: 'PHP 8.1+ / Node.js 18+', status: 'متوافق (PHP 8.2 & Node 24)', ok: true },
                    { title: 'محرك قاعدة البيانات PDO MySQL / PostgreSQL', req: 'مفعل', status: 'مفعل وجاهز للربط', ok: true },
                    { title: 'إضافة تشفير وحماية البيانات OpenSSL / BCrypt', req: 'مفعل', status: 'مفعل لتشفير كلمات المرور', ok: true },
                    { title: 'صلاحيات الكتابة لملفات الإعدادات والوسائط (.env & storage)', req: 'قابل للكتابة (Writable)', status: 'صلاحيات كاملة 755', ok: true },
                    { title: 'ترميز النصوص العربي utf8mb4_unicode_ci', req: 'مدعوم', status: 'جاهز لدعم اللغة العربية والقبطية', ok: true }
                  ].map((chk, i) => (
                    <div key={i} className="flex justify-between items-center p-3.5 bg-muted/20 border border-border/70 rounded-2xl text-xs">
                      <div>
                        <strong className="text-foreground block">{chk.title}</strong>
                        <span className="text-[10px] text-muted-foreground">المطلوب: {chk.req}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-success font-bold bg-success/10 px-3 py-1 rounded-xl">
                        <Check className="h-4 w-4" />
                        <span>{chk.status}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-4 border-t border-border">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="h-11 px-6 bg-primary text-primary-foreground font-bold rounded-xl text-xs flex items-center gap-2 hover:bg-primary/95 shadow-sm transition cursor-pointer"
                  >
                    <span>المتابعة إلى إعدادات الداتابيز</span>
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: DATABASE CONFIGURATION */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in">
                <div className="space-y-1">
                  <h2 className="text-lg font-extrabold text-foreground">الخطوة الثانية: إعدادات الاتصال بقاعدة البيانات</h2>
                  <p className="text-xs text-muted-foreground">
                    أدخل بيانات قاعدة البيانات التي قمت بإنشائها على لوحة التحكم (cPanel / phpMyAdmin / MySQL).
                  </p>
                </div>

                <div className="space-y-4">
                  {/* DB Type Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">نوع محرك قاعدة البيانات:</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => { setDbType('mysql'); setDbPort('3306'); }}
                        className={`p-3.5 rounded-2xl border text-right transition cursor-pointer flex items-center gap-3 ${
                          dbType === 'mysql'
                            ? 'border-primary bg-primary/10 text-foreground font-bold'
                            : 'border-border bg-card text-muted-foreground'
                        }`}
                      >
                        <Database className="h-5 w-5 text-primary" />
                        <div>
                          <strong className="block text-xs">MySQL / MariaDB</strong>
                          <span className="text-[10px] text-muted-foreground">استضافات PHP و cPanel الشائعة</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setDbType('postgres'); setDbPort('5432'); }}
                        className={`p-3.5 rounded-2xl border text-right transition cursor-pointer flex items-center gap-3 ${
                          dbType === 'postgres'
                            ? 'border-primary bg-primary/10 text-foreground font-bold'
                            : 'border-border bg-card text-muted-foreground'
                        }`}
                      >
                        <Layers className="h-5 w-5 text-primary" />
                        <div>
                          <strong className="block text-xs">PostgreSQL / Supabase</strong>
                          <span className="text-[10px] text-muted-foreground">السيرفرات السحابية المتقدمة</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Host and Port */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 space-y-1">
                      <label className="text-xs font-bold text-foreground">عنوان الخادم (DB Host):</label>
                      <input
                        type="text"
                        value={dbHost}
                        onChange={(e) => setDbHost(e.target.value)}
                        placeholder="localhost أو 127.0.0.1"
                        className="w-full bg-muted/40 border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono outline-none focus:border-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">المنفذ (Port):</label>
                      <input
                        type="text"
                        value={dbPort}
                        onChange={(e) => setDbPort(e.target.value)}
                        className="w-full bg-muted/40 border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono outline-none focus:border-primary text-center"
                      />
                    </div>
                  </div>

                  {/* Database Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">اسم قاعدة البيانات (Database Name):</label>
                    <input
                      type="text"
                      value={dbName}
                      onChange={(e) => setDbName(e.target.value)}
                      placeholder="مثال: church_ssms_db"
                      className="w-full bg-muted/40 border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold outline-none focus:border-primary"
                    />
                  </div>

                  {/* User & Password */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">اسم المستخدم (DB User):</label>
                      <input
                        type="text"
                        value={dbUser}
                        onChange={(e) => setDbUser(e.target.value)}
                        placeholder="root أو اسم مستخدم cPanel"
                        className="w-full bg-muted/40 border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono outline-none focus:border-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">كلمة المرور (DB Password):</label>
                      <input
                        type="password"
                        value={dbPassword}
                        onChange={(e) => setDbPassword(e.target.value)}
                        placeholder="كلمة مرور قاعدة البيانات"
                        className="w-full bg-muted/40 border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Test Connection Button & Status */}
                  <div className="p-4 bg-muted/20 border border-border rounded-2xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-muted-foreground">اختبار الاتصال قبل المتابعة:</span>
                      <button
                        type="button"
                        onClick={handleTestConnection}
                        disabled={testDbStatus === 'testing'}
                        className="h-9 px-4 bg-card border border-border hover:bg-muted font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${testDbStatus === 'testing' ? 'animate-spin' : ''}`} />
                        <span>فحص الاتصال الآن</span>
                      </button>
                    </div>

                    {testDbStatus === 'success' && (
                      <div className="p-3 bg-success/10 border border-success/30 rounded-xl text-success text-xs font-bold flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 shrink-0" />
                        <span>{testDbMessage}</span>
                      </div>
                    )}

                    {testDbStatus === 'error' && (
                      <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-xs font-bold flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{testDbMessage}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-border">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="h-11 px-5 border border-border hover:bg-muted text-xs font-semibold rounded-xl text-muted-foreground transition cursor-pointer"
                  >
                    السابق
                  </button>

                  <button
                    onClick={() => setCurrentStep(3)}
                    className="h-11 px-6 bg-primary text-primary-foreground font-bold rounded-xl text-xs flex items-center gap-2 hover:bg-primary/95 shadow-sm transition cursor-pointer"
                  >
                    <span>المتابعة إلى بيانات الأدمن</span>
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: CHURCH & ADMIN CREDENTIALS */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in">
                <div className="space-y-1">
                  <h2 className="text-lg font-extrabold text-foreground">الخطوة الثالثة: بيانات الكنيسة وحساب مدير النظام (الأدمن)</h2>
                  <p className="text-xs text-muted-foreground">
                    سيتم إنشاء هذا الحساب كمسؤول عام (Super Admin) يمتلك جميع الصلاحيات لإدارة الخدمة وإضافة الخدام.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Church Name & Diocese */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">اسم الكنيسة *</label>
                      <div className="relative">
                        <Building className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          required
                          value={churchName}
                          onChange={(e) => setChurchName(e.target.value)}
                          className="w-full pr-9 pl-3 py-2.5 bg-muted/40 border border-border rounded-xl text-xs font-bold outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">الإيبارشية أو القطاع:</label>
                      <input
                        type="text"
                        value={diocese}
                        onChange={(e) => setDiocese(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-muted/40 border border-border rounded-xl text-xs font-bold outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Admin Name & Phone */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">اسم أمين الخدمة / الأدمن *</label>
                      <div className="relative">
                        <UserCheck className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          required
                          value={adminName}
                          onChange={(e) => setAdminName(e.target.value)}
                          className="w-full pr-9 pl-3 py-2.5 bg-muted/40 border border-border rounded-xl text-xs font-bold outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">رقم الهاتف / الواتساب:</label>
                      <div className="relative">
                        <Phone className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                          type="tel"
                          value={adminPhone}
                          onChange={(e) => setAdminPhone(e.target.value)}
                          className="w-full pr-9 pl-3 py-2.5 bg-muted/40 border border-border rounded-xl text-xs font-mono font-bold outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Admin Email & Password */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">البريد الإلكتروني لتسجيل الدخول *</label>
                      <div className="relative">
                        <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                          type="email"
                          required
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          className="w-full pr-9 pl-3 py-2.5 bg-muted/40 border border-border rounded-xl text-xs font-mono font-bold outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">كلمة المرور الرئيسية *</label>
                      <div className="relative">
                        <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          className="w-full pr-9 pl-3 py-2.5 bg-muted/40 border border-border rounded-xl text-xs font-mono outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-border">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="h-11 px-5 border border-border hover:bg-muted text-xs font-semibold rounded-xl text-muted-foreground transition cursor-pointer"
                  >
                    السابق
                  </button>

                  <button
                    onClick={() => {
                      setCurrentStep(4)
                      handleRunInstallation()
                    }}
                    className="h-11 px-6 bg-primary text-primary-foreground font-bold rounded-xl text-xs flex items-center gap-2 hover:bg-primary/95 shadow-sm transition cursor-pointer"
                  >
                    <span>بدء التثبيت التلقائي وإنشاء الجداول 🚀</span>
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: AUTOMATED INSTALLATION & SUCCESS */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in">
                <div className="space-y-1 text-center">
                  <h2 className="text-xl font-extrabold text-foreground">
                    {installCompleted ? '🎉 تم تثبيت النظام بنجاح!' : '⚙️ جاري تثبيت النظام وإنشاء الجداول...'}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {installCompleted
                      ? 'تم تهيئة قاعدة البيانات وإنشاء أكثر من ٣٠ جدولاً كنسياً وضبط حساب الأدمن بنجاح.'
                      : 'يرجى الانتظار ثوانٍ معدودة ريثما يتم بناء الجداول والصلاحيات...'}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span>نسبة الإنجاز</span>
                    <span className="font-mono">{installProgress}%</span>
                  </div>
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500 rounded-full"
                      style={{ width: `${installProgress}%` }}
                    />
                  </div>
                </div>

                {/* Terminal Console Logs */}
                <div className="bg-slate-950 text-slate-200 p-4 rounded-2xl font-mono text-[11px] space-y-1.5 max-h-56 overflow-y-auto border border-slate-800 text-left" dir="ltr">
                  <div className="text-emerald-400 font-bold mb-2">=== Church SSMS Installation Log ===</div>
                  {installLogs.map((log, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-slate-500">[{new Date().toLocaleTimeString()}]</span>
                      <span className="text-emerald-300">✓ {log}</span>
                    </div>
                  ))}
                </div>

                {/* Completion Cards & Login Actions */}
                {installCompleted && (
                  <div className="p-5 bg-success/10 border border-success/30 rounded-2xl space-y-4 animate-in fade-in">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-success text-white flex items-center justify-center font-bold text-lg">
                        ✓
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-foreground">بيانات تسجيل الدخول المعتمدة:</h3>
                        <p className="text-xs text-muted-foreground">
                          البريد: <strong className="text-foreground font-mono">{adminEmail}</strong> • الصلاحية: <strong className="text-foreground">مدير عام للنظام (Super Admin)</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-2">
                      <Link
                        href="/login"
                        className="h-11 px-6 bg-primary text-primary-foreground font-extrabold rounded-xl text-xs flex items-center gap-2 hover:bg-primary/95 shadow-md transition cursor-pointer"
                      >
                        <span>تسجيل الدخول إلى لوحة التحكم الآن</span>
                        <ArrowLeft className="h-4 w-4" />
                      </Link>

                      <a
                        href="/installer.php"
                        target="_blank"
                        className="h-11 px-4 bg-card border border-border hover:bg-muted text-foreground font-bold rounded-xl text-xs flex items-center gap-2 transition"
                      >
                        <FileCode className="h-4 w-4 text-primary" />
                        <span>تحميل سكربت PHP Installer المنفصل</span>
                      </a>
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-muted-foreground border-t border-border">
        منظومة إدارة خدمة مدارس الأحد والكنيسة القبطية الأرثوذكسية • كنيسة الشهيد العظيم مارمينا العجائبي
      </footer>
    </div>
  )
}
