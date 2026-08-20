'use client'

import React from 'react'
import Link from 'next/link'
import { LucideIcon, Plus } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  secondaryActionLabel,
  onSecondaryAction
}: EmptyStateProps) {
  return (
    <div
      className="bg-card border border-border rounded-3xl p-10 md:p-12 text-center shadow-sm space-y-5 max-w-xl mx-auto my-8 font-sans text-right animate-in fade-in zoom-in-95 duration-200"
      dir="rtl"
    >
      <div className="h-20 w-20 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner border border-primary/20">
        <Icon className="h-10 w-10 text-primary" />
      </div>

      <div className="space-y-2 text-center">
        <h3 className="text-xl font-extrabold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
          {description}
        </p>
      </div>

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {actionHref ? (
            <Link
              href={actionHref}
              className="h-12 px-8 rounded-2xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-2 shadow-lg hover:bg-primary/95 transition-all duration-200 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>{actionLabel}</span>
            </Link>
          ) : actionLabel && onAction ? (
            <button
              type="button"
              onClick={onAction}
              className="h-12 px-8 rounded-2xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-2 shadow-lg hover:bg-primary/95 transition-all duration-200 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>{actionLabel}</span>
            </button>
          ) : null}

          {secondaryActionLabel && onSecondaryAction && (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="h-12 px-6 rounded-2xl border border-border hover:bg-muted font-bold text-xs text-muted-foreground transition cursor-pointer"
            >
              <span>{secondaryActionLabel}</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
