interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[11px] font-medium uppercase tracking-widest text-[#4f554d]">
          {label}
        </label>
      )}
      <input
        className={`w-full rounded-md bg-[#141714] border px-3 py-[7px] text-[12.5px] text-[#ede8e3] outline-none transition-colors ${
          error
            ? 'border-[rgba(217,135,110,0.4)]'
            : 'border-[#2a2f28] focus:border-[rgba(213,149,126,0.4)]'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-[11px] text-[#d9876e]">{error}</p>}
    </div>
  )
}