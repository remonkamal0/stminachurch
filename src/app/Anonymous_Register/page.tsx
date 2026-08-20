'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Sparkles, Camera, CheckCircle2, AlertCircle } from 'lucide-react'

export default function AnonymousRegisterPage() {
  const router = useRouter()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Form states
  const [firstName, setFirstName] = useState('')
  const [secondName, setSecondName] = useState('')
  const [thirdName, setThirdName] = useState('')
  const [lastName, setLastName] = useState('')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [birthDate, setBirthDate] = useState('')
  const [fatherPhone, setFatherPhone] = useState('')
  const [motherPhone, setMotherPhone] = useState('')
  const [area, setArea] = useState('')
  const [houseNumber, setHouseNumber] = useState('')
  const [floor, setFloor] = useState('')
  const [address, setAddress] = useState('')
  const [landmark, setLandmark] = useState('')
  const [confessionFather, setConfessionFather] = useState('')
  const [talentsInput, setTalentsInput] = useState('')
  
  // Avatar states
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setAvatarFile(file)
      setAvatarUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate inputs
    if (!firstName || !secondName || !thirdName || !lastName || !birthDate) {
      setError('يرجى تعبئة كافة الحقول الأساسية المطلوبة بالكامل.')
      return
    }

    setError('')
    setSuccess(true)
  }

  return (
    <div className="min-h-screen bg-muted/30 py-10 px-4 flex flex-col items-center font-sans" dir="rtl">
      <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-xl overflow-hidden text-right">
        {/* Banner */}
        <div className="bg-primary text-primary-foreground p-6 text-center space-y-2 relative">
          <div className="absolute top-4 right-4 text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">
            استمارة عامة
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">استمارة تسجيل مخدوم جديد</h2>
          <p className="text-xs text-primary-foreground/80">يرجى ملء البيانات بدقة لتسجيل الابن/الابنة في قاعدة بيانات مدارس الأحد</p>
        </div>

        {success ? (
          <div className="p-10 text-center space-y-6 animate-in zoom-in-95">
            <div className="h-16 w-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-lg text-foreground">تم إرسال بياناتك بنجاح!</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                شكراً لك. لقد استلمنا طلب تسجيل المخدوم وجاري مراجعته وتدقيقه من قبل أمين الخدمة وسيتم اعتماده قريباً.
              </p>
            </div>
            <button
              onClick={() => {
                setSuccess(false)
                setFirstName('')
                setSecondName('')
                setThirdName('')
                setLastName('')
                setGender('male')
                setBirthDate('')
                setFatherPhone('')
                setMotherPhone('')
                setArea('')
                setHouseNumber('')
                setFloor('')
                setAddress('')
                setLandmark('')
                setConfessionFather('')
                setTalentsInput('')
                setAvatarUrl(null)
                setAvatarFile(null)
              }}
              className="h-9 px-4 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/95 shadow transition"
            >
              تسجيل مخدوم آخر
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            {error && (
              <div className="p-3.5 bg-destructive/15 text-destructive border border-destructive/20 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Profile Photo Picker */}
            <div className="flex flex-col items-center space-y-3 pb-4 border-b border-border">
              <div className="relative group h-24 w-24">
                <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-border bg-muted/60 flex items-center justify-center font-bold text-muted-foreground text-sm relative">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <span>صورة المخدوم</span>
                  )}
                </div>
                <label className="absolute bottom-0 left-0 bg-primary text-primary-foreground p-1.5 rounded-full cursor-pointer shadow hover:scale-105 transition duration-150">
                  <Camera className="h-4 w-4" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              </div>
              <p className="text-[10px] text-muted-foreground">أضف صورة واضحة لتسهيل التعرف على المخدوم</p>
            </div>

            {/* Name Fields */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-primary border-b border-border pb-1.5">الاسم بالكامل (باللغة العربية)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground font-bold">الاسم الأول</label>
                  <input
                    type="text" required placeholder="مثال: كيرلس"
                    value={firstName} onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground font-bold">اسم الأب</label>
                  <input
                    type="text" required placeholder="مثال: جرجس"
                    value={secondName} onChange={(e) => setSecondName(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground font-bold">الجد</label>
                  <input
                    type="text" required placeholder="مثال: حبيب"
                    value={thirdName} onChange={(e) => setThirdName(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground font-bold">اللقب/العائلة</label>
                  <input
                    type="text" required placeholder="مثال: عزيز"
                    value={lastName} onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Birth Date and Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-bold">تاريخ الميلاد</label>
                <input
                  type="date" required
                  value={birthDate} onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-bold block mb-1">النوع</label>
                <div className="flex gap-2">
                  {['male', 'female'].map((g) => (
                    <button
                      key={g} type="button" onClick={() => setGender(g as any)}
                      className={`flex-1 py-2 text-xs font-bold border rounded-lg transition ${
                        gender === g ? 'bg-primary text-primary-foreground border-primary shadow' : 'bg-card border-border text-muted-foreground'
                      }`}
                    >
                      {g === 'male' ? 'ولد' : 'بنت'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Parent Details and Address Breakdown */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-primary border-b border-border pb-1.5">بيانات الوالدين والعنوان بالتفصيل</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground font-bold">رقم هاتف الأب</label>
                  <input
                    type="tel" placeholder="مثال: 01234567890"
                    value={fatherPhone} onChange={(e) => setFatherPhone(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground font-bold">رقم هاتف الأم</label>
                  <input
                    type="tel" placeholder="مثال: 01234567891"
                    value={motherPhone} onChange={(e) => setMotherPhone(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition font-bold"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground font-bold">منطقة السكن:</label>
                  <select
                    value={['شبرا', 'العباسية', 'الظاهر', 'مصر الجديدة', 'مدينة نصر', 'وسط البلد', 'حدائق القبة', 'الزيتون', ''].includes(area) ? area : 'أخرى'}
                    onChange={(e) => {
                      const val = e.target.value
                      if (val === 'أخرى') {
                        setArea('أخرى')
                      } else {
                        setArea(val)
                      }
                    }}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition font-bold"
                  >
                    <option value="">-- اختر المنطقة --</option>
                    <option value="شبرا">شبرا</option>
                    <option value="العباسية">العباسية</option>
                    <option value="الظاهر">الظاهر</option>
                    <option value="مصر الجديدة">مصر الجديدة</option>
                    <option value="مدينة نصر">مدينة نصر</option>
                    <option value="وسط البلد">وسط البلد</option>
                    <option value="حدائق القبة">حدائق القبة</option>
                    <option value="الزيتون">الزيتون</option>
                    <option value="أخرى">منطقة أخرى...</option>
                  </select>

                  {/* Custom area text entry */}
                  {(!['شبرا', 'العباسية', 'الظاهر', 'مصر الجديدة', 'مدينة نصر', 'وسط البلد', 'حدائق القبة', 'الزيتون', ''].includes(area) || area === 'أخرى') && (
                    <div className="mt-2 animate-in slide-in-from-top-1 duration-150">
                      <input
                        type="text" placeholder="اكتب اسم المنطقة الجديدة..."
                        value={area === 'أخرى' ? '' : area}
                        onChange={(e) => setArea(e.target.value)}
                        className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition font-bold"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground font-bold">رقم المنزل:</label>
                  <input
                    type="text" placeholder="مثال: ١٢ أ"
                    value={houseNumber} onChange={(e) => setHouseNumber(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground font-bold">الدور / الشقة:</label>
                  <input
                    type="text" placeholder="مثال: الدور الثالث - شقة ٥"
                    value={floor} onChange={(e) => setFloor(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground font-bold">العنوان بالتفصيل:</label>
                  <input
                    type="text" placeholder="اسم الشارع والمنطقة..."
                    value={address} onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition font-bold"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs text-muted-foreground font-bold">علامة مميزة:</label>
                  <input
                    type="text" placeholder="مثال: بجوار صيدلية الرجاء..."
                    value={landmark} onChange={(e) => setLandmark(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Confession Father and Talents */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-primary border-b border-border pb-1.5">الرعاية والمواهب</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground font-bold">أب الاعتراف</label>
                  <select
                    value={confessionFather} onChange={(e) => setConfessionFather(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition font-bold"
                  >
                    <option value="">اختر أب الاعتراف...</option>
                    <option value="أبونا مرقس كمال">أبونا مرقس كمال (كنيسة مارجرجس)</option>
                    <option value="أبونا بطرس صليب">أبونا بطرس صليب (كنيسة الأنبا بيشوي)</option>
                    <option value="أبونا أنطونيوس صبحي">أبونا أنطونيوس صبحي (كنيسة العذراء مريم)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground font-bold">الهوايات والمواهب (افصل بفاصلة)</label>
                  <input
                    type="text" placeholder="رسم، ترانيم، تمثيل..."
                    value={talentsInput} onChange={(e) => setTalentsInput(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 transition font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Form submit actions */}
            <div className="flex gap-3 justify-end pt-6 border-t border-border">
              <button
                type="submit"
                className="h-10 px-6 bg-primary text-primary-foreground font-bold rounded-lg text-xs hover:bg-primary/95 shadow transition flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                إرسال البيانات والتسجيل
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
