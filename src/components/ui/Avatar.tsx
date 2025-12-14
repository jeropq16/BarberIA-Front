import Image from 'next/image'
import { UserIcon } from '@heroicons/react/24/outline'

export interface AvatarProps {
    src?: string | null
    alt?: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
    fallback?: string // Texto a mostrar si no hay imagen (ej: iniciales)
    className?: string
}

export default function Avatar({
    src,
    alt = 'Avatar',
    size = 'md',
    fallback,
    className = '',
}: AvatarProps) {
    const sizeStyles = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-12 h-12 text-sm',
        lg: 'w-16 h-16 text-base',
        xl: 'w-24 h-24 text-lg',
    }

    const baseStyles = 'rounded-full bg-[#1a1a1a] border-2 border-[#2a2a2a] flex items-center justify-center overflow-hidden'

    if (src) {
        return (
            <div className={`${baseStyles} ${sizeStyles[size]} ${className}`}>
                <Image
                    src={src}
                    alt={alt}
                    width={size === 'sm' ? 32 : size === 'md' ? 48 : size === 'lg' ? 64 : 96}
                    height={size === 'sm' ? 32 : size === 'md' ? 48 : size === 'lg' ? 64 : 96}
                    className="w-full h-full object-cover"
                />
            </div>
        )
    }

    return (
        <div className={`${baseStyles} ${sizeStyles[size]} ${className} text-white`}>
            {fallback ? (
                <span className="font-semibold">{fallback}</span>
            ) : (
                <UserIcon className="w-1/2 h-1/2 text-[#4a4a4a]" />
            )}
        </div>
    )
}
