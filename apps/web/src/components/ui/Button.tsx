interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-medium rounded-md transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border-0'

  const variants = {
    primary: 'bg-[#D5957E] text-[#1c0f09] font-semibold hover:opacity-90',
    ghost:   'bg-transparent text-[#a8a89e] border border-[#2a2f28] hover:bg-[#1a1e19] hover:text-[#ede8e3]',
    danger:  'bg-transparent text-[#d9876e] border border-[rgba(217,135,110,0.2)] hover:bg-[rgba(217,135,110,0.08)]',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-3.5 py-[7px] text-[12.5px]',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  )
}