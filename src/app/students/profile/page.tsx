'use client'

import React, { Suspense } from 'react'
import StudentDetailsClient from '../[id]/StudentDetailsClient'

export default function StudentProfileStandalonePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground font-sans">جاري تحميل ملف المخدوم الشامل...</div>}>
      <StudentDetailsClient />
    </Suspense>
  )
}
