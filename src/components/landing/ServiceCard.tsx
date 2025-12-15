import { ReactNode } from 'react'
import Card, { CardContent } from '../ui/Card'

export interface Haircut {
    id: number
    name: string
    description: string | null
    price: number
    durationMinutes: number
    isActive: boolean
}

export interface ServiceCardProps {
    haircut: Haircut
    className?: string
    onSelect?: (haircut: Haircut) => void
}

export default function ServiceCard({
    haircut,
    className = '',
    onSelect,
}: ServiceCardProps) {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-EC', {
            style: 'currency',
            currency: 'USD',
        }).format(price)
    }

    const formatDuration = (minutes: number) => {
        if (minutes < 60) {
            return `${minutes} min`
        }
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
    }

    return (
        <Card
            variant="elevated"
            className={`cursor-pointer hover:border-[#dc2626] transition-all duration-200 ${className}`}
            onClick={() => onSelect?.(haircut)}
        >
            <CardContent className="p-6">
                {/* Nombre del servicio */}
                <h3 className="text-2xl text-white mb-3 tracking-wide" style={{ fontFamily: 'var(--font-qwigley), cursive' }}>
                    {haircut.name}
                </h3>

                {/* Descripción */}
                {haircut.description && (
                    <p className="text-[#9ca3af] text-sm mb-4 line-clamp-3">
                        {haircut.description}
                    </p>
                )}

                {/* Información de precio y duración */}
                <div className="flex items-center justify-between pt-4 border-t border-[#1a1a1a]">
                    <div>
                        <p className="text-2xl font-bold text-[#dc2626]">
                            {formatPrice(haircut.price)}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-[#9ca3af]">Duración</p>
                        <p className="text-base font-semibold text-white">
                            {formatDuration(haircut.durationMinutes)}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
