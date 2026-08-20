'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthContext'
import { Shield, Mail, Lock, LogIn, KeyRound, Church, CheckCircle, HelpCircle } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const { login, user } = useAuth()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const targetHome = typeof window !== 'undefined' && window.location.pathname.includes('/stmina') ? '/stmina/' : '/'
      window.location.href = targetHome
    }
  }, [user, router])

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setErrorMsg('يرجى إدخال البريد الإلكتروني وكلمة المرور.')
      return
    }

    setLoading(true)
    setErrorMsg('')
    try {
      await login(email, password)
      const targetHome = typeof window !== 'undefined' && window.location.pathname.includes('/stmina') ? '/stmina/' : '/'
      window.location.href = targetHome
    } catch (err: any) {
      setErrorMsg('البريد الإلكتروني أو كلمة المرور غير صحيحة.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-muted/50 via-background to-muted/30 flex items-center justify-center p-4 font-sans" dir="rtl">
      <div className="w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-2xl mx-auto shadow-lg shadow-primary/25">
            ☦
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground">
            تسجيل الدخول إلى النظام (SSMS)
          </h2>
          <p className="text-xs text-muted-foreground">
            نظام إدارة مدارس الأحد والافتقاد الكنسي المتكامل
          </p>
        </div>

        {/* Real Production Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4 text-right">
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-primary" />
              <span>البريد الإلكتروني للخادم / المسؤول:</span>
            </label>
            <input
              type="email"
              required
              placeholder="admin@church.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-muted/40 border border-border rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-primary font-mono text-left transition"
              dir="ltr"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-primary" />
              <span>كلمة المرور:</span>
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-muted/40 border border-border rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-primary font-mono text-left transition"
              dir="ltr"
            />
          </div>

          {/* Remember Me & Help */}
          <div className="flex justify-between items-center text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-muted-foreground select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
              />
              <span>تذكرني على هذا الجهاز</span>
            </label>

            <Link
              href="/install"
              className="text-[11px] text-primary hover:underline font-semibold"
            >
              معالج التثبيت / إعادة الضبط
            </Link>
          </div>

          {errorMsg && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-xs font-bold text-center animate-in fade-in">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-primary text-primary-foreground disabled:bg-muted disabled:text-muted-foreground font-bold rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-primary/95 shadow-md transition cursor-pointer mt-3"
          >
            {loading ? (
              <span className="animate-pulse">جاري التحقق وتسجيل الدخول...</span>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                <span>دخول النظام</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Security Badge */}
        <div className="pt-3 border-t border-border/60 text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground font-semibold">
            <Shield className="h-3.5 w-3.5 text-success" />
            <span>نظام محمي ومشفر بالكامل 256-bit SSL</span>
          </div>
          <p className="text-[10px] text-muted-foreground/80">
            كنيسة الشهيد العظيم مارمينا العجائبي
          </p>
        </div>

      </div>
    </div>
  )
}
