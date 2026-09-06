import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

/** Mini design-system : composants cohérents pour tout le site.
 *  Palette : forest (vert EKBF #0a3d2a) + gold (#c9a84c). */

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
}) {
  const styles: Record<string, string> = {
    primary: 'bg-forest-500 text-white hover:bg-forest-600',
    secondary: 'bg-gold-400 text-forest-800 hover:bg-gold-300',
    outline: 'border border-forest-500 text-forest-500 hover:bg-forest-50',
    ghost: 'text-forest-600 hover:bg-forest-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-forest-100 bg-white p-6 shadow-sm ${className}`}>{children}</div>
}

export function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  error?: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-forest-700">
        {label} {required && <span className="text-gold-500">*</span>}
      </span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-forest-700/60">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-medium text-red-600">{error}</span>}
    </label>
  )
}

const inputBase =
  'w-full rounded-lg border border-forest-200 bg-white px-3 py-2 text-sm text-forest-800 placeholder:text-forest-700/40 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-300/40 disabled:bg-forest-50'

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${inputBase} ${className}`} {...props} />
}

export function Textarea({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${inputBase} min-h-24 ${className}`} {...props} />
}

export function Select({ className = '', children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`${inputBase} ${className}`} {...props}>
      {children}
    </select>
  )
}

export function Badge({ children, tone = 'forest' }: { children: ReactNode; tone?: 'forest' | 'gold' | 'red' | 'gray' | 'green' }) {
  const tones: Record<string, string> = {
    forest: 'bg-forest-100 text-forest-700',
    gold: 'bg-gold-300/30 text-gold-500',
    red: 'bg-red-100 text-red-700',
    gray: 'bg-gray-100 text-gray-600',
    green: 'bg-emerald-100 text-emerald-700',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  )
}

export function SectionTitle({ children, subtitle }: { children: ReactNode; subtitle?: string }) {
  return (
    <div className="mb-8">
      <h2 className="font-serif text-2xl font-bold text-forest-500 md:text-3xl">{children}</h2>
      {subtitle && <p className="mt-2 text-forest-700/70">{subtitle}</p>}
    </div>
  )
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-forest-200 bg-forest-50/40 px-6 py-10 text-center text-sm text-forest-700/70">
      {message}
    </div>
  )
}

export function LoadingState({ label = 'Chargement…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-sm text-forest-700/70">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-forest-300 border-t-forest-500" />
      {label}
    </div>
  )
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <h1 className="font-serif text-3xl font-bold text-forest-500 md:text-4xl">{title}</h1>
      {subtitle && <p className="mt-2 text-forest-700/70">{subtitle}</p>}
    </div>
  )
}

export function Spinner({ className = 'h-5 w-5' }: { className?: string }) {
  return <span className={`inline-block animate-spin rounded-full border-2 border-forest-300 border-t-forest-500 ${className}`} />
}
