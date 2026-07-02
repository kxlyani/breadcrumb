interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-300">{label}</label>
      )}
      <input
        className={`w-full rounded-lg border bg-white/5 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none transition-colors focus:border-indigo-500 ${
          error ? 'border-red-500/50' : 'border-white/10'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}