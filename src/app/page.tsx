'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/landing/Navbar'
import HeroSection from '@/components/landing/HeroSection'
import Loading from '@/components/ui/Loading'
import { getHaircuts } from '@/services/haircuts'
import { getBarbers } from '@/services/users'
import { type Barber } from '@/components/landing/BarberCard'
import ServicesAutoSlider from '@/components/landing/ServicesAutoSlider'
import { type Haircut } from '@/components/landing/ServiceCard'
import ChatBot from '@/components/ChatBot'
import BarbersAutoSlider from '@/components/landing/BarbersAutoSlider'

export default function Home() {
  const router = useRouter()
  const [haircuts, setHaircuts] = useState<Haircut[]>([])
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [loading, setLoading] = useState(true)

  // Fotos por defecto para barberos (Unsplash)
  const fallbackBarberPhotos = [
    'https://plus.unsplash.com/premium_photo-1673866484792-c5a36a6c025e?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://plus.unsplash.com/premium_photo-1689568126014-06fea9d5d341?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=1200&h=1200&auto=format&fit=crop',
  ]

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
          barbersData.map((b, index) => ({
            id: b.id,
            fullName: b.fullName,
            profilePhotoUrl: b.profilePhotoUrl || fallbackBarberPhotos[index % fallbackBarberPhotos.length],
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

      {/* CONTACTO */}
      <section id="contacto" className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="text-5xl md:text-6xl lg:text-7xl text-white tracking-wider uppercase mb-4"
              style={{ fontFamily: 'var(--font-covered), cursive' }}
            >
              CONTACTO
            </h2>
            <p className="text-[#9ca3af] max-w-2xl mx-auto text-sm md:text-base">
              Agenda tu cita, resuelve tus dudas o pregúntanos por disponibilidad.
              Estamos listos para ponerte al día con el mejor estilo de barrio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Teléfono / WhatsApp */}
            <div className="border border-[#1a1a1a] rounded-xl bg-[#050505] p-6 flex flex-col gap-3">
              <h3 className="text-xl text-white tracking-wide" style={{ fontFamily: 'var(--font-covered), cursive' }}>
                TELÉFONO / WHATSAPP
              </h3>
              <p className="text-[#9ca3af] text-sm">
                Escríbenos o mándanos un audio y coordinamos tu cita al toque.
              </p>
              <a
                href="https://wa.me/000000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#dc2626] text-white text-sm font-medium hover:bg-[#b91c1c] transition-colors"
              >
                Abrir WhatsApp
              </a>
              <p className="text-[#9ca3af] text-xs mt-1">
                También puedes llamarnos al <span className="text-white">000 000 000</span>.
              </p>
            </div>

            {/* Dirección */}
            <div className="border border-[#1a1a1a] rounded-xl bg-[#050505] p-6 flex flex-col gap-3">
              <h3 className="text-xl text-white tracking-wide" style={{ fontFamily: 'var(--font-covered), cursive' }}>
                DIRECCIÓN
              </h3>
              <p className="text-[#9ca3af] text-sm">
                Calle Falsa 123, Barrio Centro, Ciudad.
              </p>
              <p className="text-[#9ca3af] text-sm">
                Lunes a sábado de 10:00 a 20:00.
              </p>
              <a
                href="https://www.google.com/maps"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center justify-center px-4 py-2 rounded-lg border border-[#2a2a2a] text-sm text-white hover:bg-[#111111] transition-colors"
              >
                Ver en Google Maps
              </a>
            </div>

            {/* Redes sociales */}
            <div className="border border-[#1a1a1a] rounded-xl bg-[#050505] p-6 flex flex-col gap-3">
              <h3 className="text-xl text-white tracking-wide" style={{ fontFamily: 'var(--font-covered), cursive' }}>
                REDES
              </h3>
              <p className="text-[#9ca3af] text-sm">
                Síguenos en Instagram para ver los últimos fades, diseños y contenido del barrio.
              </p>
              <a
                href="https://www.instagram.com/ghettobarber1g1/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-[#e5e5e5] transition-colors tracking-widest"
              >
                INSTAGRAM
              </a>
            </div>
          </div>
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
