import React, { Suspense } from 'react'
import StudentDetailsClient from './StudentDetailsClient'

export function generateStaticParams() {
  return [
    { id: 's1' },
    { id: 's2' },
    { id: 's3' },
    { id: 's4' },
    { id: 's5' }
  ]
}

export default function StudentPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground font-sans">جاري تحميل ملف المخدوم...</div>}>
      <StudentDetailsClient />
    </Suspense>
  )
}
