'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/landing/Navbar'
import HeroSection from '@/components/landing/HeroSection'
import Loading from '@/components/ui/Loading'
import { getHaircuts } from '@/services/haircuts'
import { getBarbers } from '@/services/users'
import ServicesAutoSlider from '@/components/landing/ServicesAutoSlider'
import { type Haircut } from '@/components/landing/ServiceCard'
import ChatBot from '@/components/ChatBot'
import BarbersAutoSlider from '@/components/landing/BarbersAutoSlider'

export default function Home() {
  const router = useRouter()
  const [haircuts, setHaircuts] = useState<Haircut[]>([])
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const haircutsData = await getHaircuts()
        setHaircuts(
          haircutsData.map(h => ({
            id: h.id,
            name: h.name,
            description: h.description,
            price: h.price,
            durationMinutes: h.durationMinutes,
            isActive: true,
          }))
        )

        const barbersData = await getBarbers()
        setBarbers(
          barbersData.map(b => ({
            id: b.id,
            fullName: b.fullName,
            profilePhotoUrl: b.profilePhotoUrl,
            role: b.role,
            email: b.email,
            phoneNumber: b.phoneNumber,
            isActive: true,
          }))
        )
      } catch (error) {
        console.error(error)
        setHaircuts([])
        setBarbers([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const redirectToLogin = () => router.push('/login')

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <HeroSection
        backgroundImage="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2070&auto=format&fit=crop"
        title="Ghetto Barber"
        subtitle="ESTILO URBANO, TRADICIÓN DE BARRIO"
        ctaText="Agendar cita"
        onCtaClick={redirectToLogin}
      />

      {/* SERVICIOS */}
      <section id="servicios" className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-5xl md:text-6xl lg:text-7xl text-white tracking-wider uppercase"
              style={{ fontFamily: 'var(--font-covered), cursive' }}
            >
              NUESTROS SERVICIOS
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loading size="lg" text="Cargando servicios..." />
            </div>
          ) : haircuts.length > 0 ? (
            <ServicesAutoSlider
              haircuts={haircuts}
              onSelect={redirectToLogin}
            />
          ) : (
            <p className="text-center text-gray-400">
              No hay servicios disponibles.
            </p>
          )}
        </div>
      </section>
      {/* BARBEROS */}
<section id="barberos" className="py-20 bg-[#0a0a0a]">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-16">
      <h2
        className="text-5xl md:text-6xl lg:text-7xl text-white tracking-wider uppercase"
        style={{ fontFamily: 'var(--font-covered), cursive' }}
      >
        NUESTRO EQUIPO
      </h2>
    </div>

    {loading ? (
      <div className="flex justify-center py-20">
        <Loading size="lg" text="Cargando barberos..." />
      </div>
    ) : barbers.length > 0 ? (
      <BarbersAutoSlider
        barbers={barbers}
        onSelect={redirectToLogin}
      />
    ) : (
      <p className="text-center text-gray-400">
        No hay barberos disponibles.
      </p>
    )}
  </div>
</section>

      <footer className="bg-black border-t border-white/10 py-12">
        <p className="text-center text-white/50 text-xs tracking-widest">
          © 2025 GHETTO BARBER - ESTILO URBANO, TRADICIÓN DE BARRIO
        </p>
      </footer>

      <ChatBot />
    </div>
  )
}
