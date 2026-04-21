import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const titleId = `modal-title-${title.replace(/\s+/g, '-').toLowerCase()}`
  const firstFocusRef = useRef<HTMLButtonElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    // Focus trap
    const focusable = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab') return
      const els = Array.from(containerRef.current?.querySelectorAll<HTMLElement>(focusable) ?? [])
      if (!els.length) return
      const first = els[0]
      const last = els[els.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }

    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    // Auto-focus close button on open
    setTimeout(() => firstFocusRef.current?.focus(), 50)

    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={containerRef}
        className={`relative sm:rounded-2xl rounded-t-2xl w-full ${sizeClasses[size]} max-h-[92vh] sm:max-h-[90vh] flex flex-col`}
        style={{
          background: '#1a1a1a',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 24px 64px -12px rgba(0,0,0,0.8)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <h2 id={titleId} className="text-[15px] font-semibold text-zinc-100">{title}</h2>
          <button
            ref={firstFocusRef}
            onClick={onClose}
            aria-label="Cerrar"
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/8 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  )
}
