import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'success' | 'error' | 'warning' | 'info' | 'default'
}

const variantClasses = {
  success: 'bg-emerald-100 text-emerald-700',
  error: 'bg-rose-100 text-rose-600',
  warning: 'bg-amber-100 text-amber-600',
  info: 'bg-violet-100 text-violet-700',
  default: 'bg-slate-100 text-slate-600',
}

export default function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variantClasses[variant]}`}>
      {children}
    </span>
  )
}
