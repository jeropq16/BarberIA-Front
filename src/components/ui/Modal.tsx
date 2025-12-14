'use client'

import { useEffect, ReactNode } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

export interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title?: string
    children: ReactNode
    footer?: ReactNode
    size?: 'sm' | 'md' | 'lg' | 'xl'
    className?: string
}

/**
 * Reusable Modal Component
 * Provides a centered modal with backdrop
 */
export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    footer,
    size = 'md',
    className = '',
}: ModalProps) {
    // Close on ESC key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose()
            }
        }

        document.addEventListener('keydown', handleEsc)
        return () => document.removeEventListener('keydown', handleEsc)
    }, [isOpen, onClose])

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }

        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    if (!isOpen) return null

    const sizeStyles = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className={`bg-[#0a0a0a] border-2 border-[#1a1a1a] rounded-lg shadow-xl ${sizeStyles[size]} w-full ${className}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#1a1a1a]">
                    {title && (
                        <h2 className="text-xl font-bold text-white">{title}</h2>
                    )}
                    <button
                        onClick={onClose}
                        className="text-[#9ca3af] hover:text-white transition-colors"
                        aria-label="Cerrar"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">{children}</div>

                {/* Footer */}
                {footer && (
                    <div className="p-6 pt-0 border-t border-[#1a1a1a]">{footer}</div>
                )}
            </div>
        </div>
    )
}
