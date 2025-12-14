import { HTMLAttributes, ReactNode } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode
    variant?: 'default' | 'elevated' | 'outlined'
}

export default function Card({
    children,
    className = '',
    variant = 'default',
    ...props
}: CardProps) {
    const baseStyles = 'rounded-lg transition-all duration-200'

    const variantStyles = {
        default: 'bg-[#0a0a0a] border border-[#1a1a1a]',
        elevated: 'bg-[#0a0a0a] shadow-lg border border-[#1a1a1a]',
        outlined: 'bg-transparent border-2 border-[#2a2a2a]',
    }

    return (
        <div className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
            {children}
        </div>
    )
}

export interface CardHeaderProps {
    children: ReactNode
    className?: string
}

export function CardHeader({
    children,
    className = '',
}: CardHeaderProps) {
    return (
        <div className={`p-6 pb-4 ${className}`}>
            {children}
        </div>
    )
}

export interface CardContentProps {
    children: ReactNode
    className?: string
}

export function CardContent({
    children,
    className = '',
}: CardContentProps) {
    return (
        <div className={`p-6 pt-0 ${className}`}>
            {children}
        </div>
    )
}

export interface CardFooterProps {
    children: ReactNode
    className?: string
}

export function CardFooter({
    children,
    className = '',
}: CardFooterProps) {
    return (
        <div className={`p-6 pt-4 border-t border-[#1a1a1a] ${className}`}>
            {children}
        </div>
    )
}
