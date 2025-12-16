'use client'

import { motion, useAnimation } from 'framer-motion'
import { useEffect } from 'react'
import ServiceCard, { Haircut } from './ServiceCard'

interface Props {
  haircuts: Haircut[]
  onSelect: (haircut: Haircut) => void
}

export default function ServicesAutoSlider({ haircuts, onSelect }: Props) {
  const controls = useAnimation()

  // Duplicamos para loop infinito
  const items = [...haircuts, ...haircuts]

  useEffect(() => {
    controls.start({
      x: ['0%', '-50%'],
      transition: {
        ease: 'linear',
        duration: 90, // ⏳ velocidad (ajústala)
        repeat: Infinity,
      },
    })
  }, [controls])

  return (
    <div className="overflow-hidden relative">
      <motion.div
        className="flex gap-6"
        animate={controls}
      >
        {items.map((haircut, index) => (
          <div
            key={`${haircut.id}-${index}`}
            className="min-w-[300px] max-w-[300px] flex-shrink-0"
            onMouseEnter={() => controls.stop()}     //pausa
            onMouseLeave={() =>
              controls.start({
                x: ['0%', '-50%'],
                transition: {
                  ease: 'linear',
                  duration: 90,
                  repeat: Infinity,
                },
              })
            }
          >
            <ServiceCard haircut={haircut} onSelect={onSelect} />
          </div>
        ))}
      </motion.div>
    </div>
  )
}
