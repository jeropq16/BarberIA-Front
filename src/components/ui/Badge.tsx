import { ReactNode } from 'react'

export interface BadgeProps {
    children: ReactNode
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export default function Badge({
    children,
    variant = 'default',
    size = 'md',
    className = '',
}: BadgeProps) {
    const baseStyles = 'inline-flex items-center font-medium rounded-full'

    const variantStyles = {
        default: 'bg-[#1a1a1a] text-white border border-[#2a2a2a]',
        success: 'bg-green-900/30 text-green-400 border border-green-800',
        warning: 'bg-yellow-900/30 text-yellow-400 border border-yellow-800',
        error: 'bg-[#7f1d1d] text-[#ef4444] border border-[#991b1b]',
        info: 'bg-blue-900/30 text-blue-400 border border-blue-800',
    }

    const sizeStyles = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base',
    }

    return (
        <span className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
            {children}
        </span>
    )
}

// Badge específico para estados de citas
export interface AppointmentStatusBadgeProps {
    status: 1 | 2 | 3 | 4 // 1=Pending, 2=Confirmed, 3=Completed, 4=Canceled
    className?: string
}

export function AppointmentStatusBadge({
    status,
    className = '',
}: AppointmentStatusBadgeProps) {
    const statusConfig = {
        1: { label: 'Pendiente', variant: 'warning' as const },
        2: { label: 'Confirmada', variant: 'info' as const },
        3: { label: 'Completada', variant: 'success' as const },
        4: { label: 'Cancelada', variant: 'error' as const },
    }

    const config = statusConfig[status]

    return (
        <Badge variant={config.variant} className={className}>
            {config.label}
        </Badge>
    )
}

// Badge específico para estados de pago
export interface PaymentStatusBadgeProps {
    paymentStatus: 1 | 2 | 3 // 1=Pending, 2=Paid, 3=Failed
    className?: string
}

export function PaymentStatusBadge({
    paymentStatus,
    className = '',
}: PaymentStatusBadgeProps) {
    const statusConfig = {
        1: { label: 'Pendiente', variant: 'warning' as const },
        2: { label: 'Pagado', variant: 'success' as const },
        3: { label: 'Fallido', variant: 'error' as const },
    }

    const config = statusConfig[paymentStatus]

    return (
        <Badge variant={config.variant} className={className}>
            {config.label}
        </Badge>
    )
}
