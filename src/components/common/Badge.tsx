import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'success' | 'error' | 'warning' | 'info' | 'default'
}

const variantClasses = {
  success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  error:   'bg-rose-500/10 text-rose-400 border border-rose-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  info:    'bg-zinc-700/60 text-zinc-400 border border-zinc-600/50',
  default: 'bg-zinc-700/60 text-zinc-400 border border-zinc-600/50',
}

export default function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variantClasses[variant]}`}>
      {children}
    </span>
  )
}
