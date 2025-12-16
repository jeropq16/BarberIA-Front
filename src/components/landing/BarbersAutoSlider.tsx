'use client'

import { motion } from 'framer-motion'
import BarberCard, { type Barber } from './BarberCard'

interface Props {
  barbers: Barber[]
  onSelect?: () => void
}

export default function BarbersAutoSlider({ barbers, onSelect }: Props) {
  // duplicamos para efecto infinito
  const items = [...barbers, ...barbers]

  return (
    <div className="relative overflow-hidden">
      <motion.div
        className="flex gap-8"
        animate={{ x: ['0%', '-50%'] }}
        transition={{
          duration: 45, // ⏱ lento y legible
          ease: 'linear',
          repeat: Infinity,
        }}
        whileHover={{ animationPlayState: 'paused' }}
      >
        {items.map((barber, index) => (
          <div
            key={`${barber.id}-${index}`}
            className="min-w-[300px] max-w-[300px]"
            onClick={onSelect}
          >
            <BarberCard barber={barber} />
          </div>
        ))}
      </motion.div>
    </div>
  )
}
