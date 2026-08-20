import React, { Suspense } from 'react'
import ServantDetailsClient from './ServantDetailsClient'

export function generateStaticParams() {
  return [
    { id: 'srv_admin' },
    { id: 'srv_1' },
    { id: 'srv_2' },
    { id: 'srv_3' },
    { id: 'srv_4' },
    { id: 'srv_5' }
  ]
}

export default function ServantPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground font-sans">جاري تحميل ملف الخادم...</div>}>
      <ServantDetailsClient />
    </Suspense>
  )
}
