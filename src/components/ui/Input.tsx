import { InputHTMLAttributes, forwardRef, ReactNode } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    helperText?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, className = '', id, ...props }, ref) => {
        const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
        const hasError = !!error

        const baseStyles = 'w-full px-4 py-2 text-white bg-[#000000] border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black'

        const borderStyles = hasError
            ? 'border-[#ef4444] focus:border-[#ef4444] focus:ring-[#ef4444]'
            : 'border-[#dc2626] focus:border-[#dc2626] focus:ring-[#dc2626]'

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block mb-2 text-sm font-medium text-white"
                    >
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={`${baseStyles} ${borderStyles} ${className}`}
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-sm text-[#ef4444]">{error}</p>
                )}
                {helperText && !error && (
                    <p className="mt-1 text-sm text-[#9ca3af]">{helperText}</p>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'

export default Input
