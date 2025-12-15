'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/landing/Navbar'
import HeroSection from '@/components/landing/HeroSection'
import ServiceCard, { type Haircut } from '@/components/landing/ServiceCard'
import BarberCard, { type Barber } from '@/components/landing/BarberCard'
import Loading from '@/components/ui/Loading'
import { getHaircuts, type HairCutResponse } from '@/services/haircuts'
import { getBarbers, type UserProfileResponse } from '@/services/users'
import ChatBot from "@/components/ChatBot"

export default function Home() {
  const router = useRouter();
  const [haircuts, setHaircuts] = useState<Haircut[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch servicios (haircuts) usando el servicio
        const haircutsData = await getHaircuts();
        // Convertir HairCutResponse a Haircut (agregando isActive si no viene)
        const formattedHaircuts: Haircut[] = haircutsData.map(h => ({
          id: h.id,
          name: h.name,
          description: h.description,
          price: h.price,
          durationMinutes: h.durationMinutes,
          isActive: true // Asumimos que todos los que vienen del API están activos
        }));
        setHaircuts(formattedHaircuts);
        
        // Fetch barberos usando el servicio (filtra por rol 2)
        const barbersData = await getBarbers();
        // Convertir UserProfileResponse a Barber
        const formattedBarbers: Barber[] = barbersData.map(b => ({
          id: b.id,
          fullName: b.fullName,
          profilePhotoUrl: b.profilePhotoUrl,
          role: b.role,
          email: b.email,
          phoneNumber: b.phoneNumber,
          isActive: true // Asumimos que todos los que vienen del API están activos
        }));
        setBarbers(formattedBarbers);
      } catch (error) {
        console.error("Error fetching data:", error);
        setHaircuts([]);
        setBarbers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Función para redirigir al login
  const redirectToLogin = () => {
    router.push('/login');
  };

  const handleServiceSelect = () => {
    redirectToLogin();
  };

  const handleBarberSelect = () => {
    redirectToLogin();
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection
        backgroundImage="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2070&auto=format&fit=crop"
        title="Ghetto Barber"
        subtitle="ESTILO URBANO, TRADICIÓN DE BARRIO"
        ctaText="Agendar cita"
        onCtaClick={redirectToLogin}
      />

      {/* Sección de Servicios */}
      <section id="servicios" className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl lg:text-7xl text-white mb-6 tracking-wider uppercase" style={{ fontFamily: 'var(--font-covered), cursive' }}>
              NUESTROS SERVICIOS
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loading size="lg" text="Cargando servicios..." />
            </div>
          ) : haircuts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {haircuts.map((haircut) => (
                <ServiceCard
                  key={haircut.id}
                  haircut={haircut}
                  onSelect={handleServiceSelect}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-[#9ca3af] text-lg">
                No hay servicios disponibles en este momento.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Sección de Barberos */}
      <section id="barberos" className="py-20 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl lg:text-7xl text-white mb-6 tracking-wider uppercase" style={{ fontFamily: 'var(--font-covered), cursive' }}>
              NUESTRO EQUIPO
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loading size="lg" text="Cargando barberos..." />
            </div>
          ) : barbers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {barbers.map((barber) => (
                <div 
                  key={barber.id} 
                  onClick={handleBarberSelect}
                  className="cursor-pointer"
                >
                  <BarberCard barber={barber} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-[#9ca3af] text-lg">
                No hay barberos disponibles en este momento.
              </p>
            </div>
          )}
        </div>
      </section>

      <footer className="bg-black border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mt-8 pt-8 border-t border-white/10 text-center">
            <p className="text-white/50 text-xs tracking-widest">
              © 2025 GHETTO BARBER - ESTILO URBANO, TRADICIÓN DE BARRIO
            </p>
          </div>
        </div>
      </footer>
      {/*CHATBOT*/}
      <ChatBot/>
    </div>
  );
}