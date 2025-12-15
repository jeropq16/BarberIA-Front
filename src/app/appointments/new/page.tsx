'use client'

import Card from '@/components/ui/Card'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import AppointmentForm from '@/components/appointments/AppointmentForm'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

export default function NewAppointmentPage() {
    const router = useRouter()
    const { user } = useAuth()
    
    const userRole = user?.role || 1

    const handleSuccess = () => {
        router.push('/appointments')
    }

    const handleCancel = () => {
        router.push('/appointments')
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-black text-white p-6">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-qwigley)' }}>
                            CREAR NUEVA CITA
                        </h1>
                        <p className="text-[#9ca3af] text-lg">
                            Completa el formulario para agendar una nueva cita
                        </p>
                    </div>

                    {/* Formulario */}
                    <Card>
                        <div className="p-6">
                            <AppointmentForm
                                onSuccess={handleSuccess}
                                onCancel={handleCancel}
                                userRole={userRole}
                            />
                        </div>
                    </Card>
                </div>
            </div>
        </ProtectedRoute>
    )
}

