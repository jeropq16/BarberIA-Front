import { ButtonHTMLAttributes, ReactNode } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    isLoading?: boolean
    children: ReactNode
}

export default function Button({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    children,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles = 'font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black'

    const variantStyles = {
        primary: 'bg-[#dc2626] text-white hover:bg-[#b91c1c] focus:ring-[#dc2626] disabled:bg-[#7f1d1d] disabled:cursor-not-allowed',
        secondary: 'bg-[#1a1a1a] text-white hover:bg-[#2a2a2a] focus:ring-[#1a1a1a] disabled:bg-[#0a0a0a] disabled:cursor-not-allowed',
        outline: 'border-2 border-[#dc2626] text-[#dc2626] bg-transparent hover:bg-[#dc2626] hover:text-white focus:ring-[#dc2626] disabled:border-[#7f1d1d] disabled:text-[#7f1d1d] disabled:cursor-not-allowed',
        ghost: 'text-white hover:bg-[#1a1a1a] focus:ring-[#1a1a1a] disabled:text-[#4a4a4a] disabled:cursor-not-allowed',
    }

    const sizeStyles = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    }

    const loadingStyles = isLoading ? 'cursor-wait opacity-75' : ''

    return (
        <button
            className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${loadingStyles} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                    <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                    Cargando...
                </span>
            ) : (
                children
            )}
        </button>
    )
}
