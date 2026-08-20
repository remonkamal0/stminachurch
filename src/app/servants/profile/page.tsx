'use client'

import React, { Suspense } from 'react'
import ServantDetailsClient from '../[id]/ServantDetailsClient'

export default function ServantProfileStandalonePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground font-sans">جاري تحميل ملف الخادم الشامل...</div>}>
      <ServantDetailsClient />
    </Suspense>
  )
}
