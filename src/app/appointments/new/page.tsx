'use client'

import { useState } from 'react'
import Card from '@/components/ui/Card'
import AppointmentForm from '@/components/appointments/AppointmentForm'
import { AppointmentResponse } from '@/services/appointments'
import { useRouter } from 'next/navigation'

// TODO: Este valor debería venir del contexto de autenticación
const DEFAULT_USER_ROLE = 1 // 1=Client, 2=Barber, 3=Admin

export default function NewAppointmentPage() {
    const router = useRouter()
    const [userRole] = useState<number>(DEFAULT_USER_ROLE)

    const handleSuccess = () => {
        router.push('/appointments')
    }

    const handleCancel = () => {
        router.push('/appointments')
    }

    return (
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
    )
}

