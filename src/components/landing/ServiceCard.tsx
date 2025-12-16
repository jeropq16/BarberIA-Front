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
  onClick={() => onSelect?.(haircut)}
  className={`
    cursor-pointer
    min-h-[220px]
    flex flex-col
    justify-between
    border border-[#1a1a1a]
    bg-gradient-to-b from-black to-[#0a0a0a]
    hover:border-[#dc2626]
    hover:shadow-[0_0_25px_rgba(220,38,38,0.25)]
    hover:-translate-y-[2px]
    transition-all duration-300 ease-out
    ${className}
  `}
  >
    <CardContent className="p-6 flex flex-col h-full">
      {/* NOMBRE */}
      <h3
        className="text-2xl text-white mb-2 tracking-wide mt-10"
        style={{ fontFamily: 'var(--font-Covered_By_Your_Grace), cursive' }}
      >
        {haircut.name}
      </h3>

      {/* DESCRIPCIÓN */}
      {haircut.description && (
        <p className="text-[#9ca3af] text-sm mb-4 line-clamp-2">
          {haircut.description}
        </p>
      )}

      {/* ESPACIADOR */}
      <div className="flex-1" />

      {/* FOOTER */}
      <div className="pt-4 border-t border-[#1a1a1a] flex items-center justify-between">
        <div>
          <p className="text-[#dc2626] text-2xl font-bold leading-none">
            {formatPrice(haircut.price)}
          </p>
          <p className="text-xs text-[#9ca3af] mt-1">
            Servicio
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-[#9ca3af] uppercase tracking-wide">
            Duración
          </p>
          <p className="text-base font-semibold text-white">
            {formatDuration(haircut.durationMinutes)}
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
)

}
