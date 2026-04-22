import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'success' | 'error' | 'warning' | 'info' | 'default'
}

const variantClasses = {
  success: 'bg-emerald-500/15 text-emerald-400',
  error: 'bg-rose-500/15 text-rose-400',
  warning: 'bg-amber-500/15 text-amber-400',
  info: 'bg-zinc-700 text-zinc-400',
  default: 'bg-zinc-700 text-zinc-400',
}

export default function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variantClasses[variant]}`}>
      {children}
    </span>
  )
}
