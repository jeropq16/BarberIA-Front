'use client'

import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Loading from '@/components/ui/Loading'
import Card from '@/components/ui/Card'
import AppointmentTable from '@/components/appointments/AppointmentTable'
import AppointmentCalendar from '@/components/appointments/AppointmentCalendar'
import AppointmentCard from '@/components/appointments/AppointmentCard'
import Modal from '@/components/ui/Modal'
import AppointmentForm from '@/components/appointments/AppointmentForm'
import { getAllAppointments, AppointmentResponse } from '@/services/appointments'
import { showToast } from '@/helpers/toast'
import { showErrorAlert } from '@/helpers/alerts'
import Link from 'next/link'

// TODO: Este valor debería venir del contexto de autenticación
// Por ahora se usa un valor por defecto o se puede pasar como prop
const DEFAULT_USER_ROLE = 1 // 1=Client, 2=Barber, 3=Admin

type ViewMode = 'table' | 'calendar' | 'cards'

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState<AppointmentResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [viewMode, setViewMode] = useState<ViewMode>('table')
    const [userRole, setUserRole] = useState<number>(DEFAULT_USER_ROLE)
    const [editingAppointment, setEditingAppointment] = useState<AppointmentResponse | null>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    const loadAppointments = async () => {
        setLoading(true)
        try {
            const data = await getAllAppointments()
            setAppointments(data)
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.message || 'Error al cargar las citas'
            showErrorAlert('Error', errorMessage)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadAppointments()
        // TODO: Obtener el rol del usuario del contexto de autenticación
        // Por ahora se mantiene el valor por defecto
    }, [])

    const handleEdit = (appointment: AppointmentResponse) => {
        setEditingAppointment(appointment)
        setIsEditModalOpen(true)
    }

    const handleRefresh = () => {
        loadAppointments()
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loading size="lg" text="Cargando citas..." />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-qwigley)' }}>
                        GESTIÓN DE CITAS
                    </h1>
                    <p className="text-[#9ca3af] text-lg">
                        Administra y visualiza todas tus citas
                    </p>
                </div>

                {/* Acciones y controles */}
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                    <div className="flex gap-2">
                        <Button
                            variant={viewMode === 'table' ? 'primary' : 'outline'}
                            onClick={() => setViewMode('table')}
                        >
                            Tabla
                        </Button>
                        <Button
                            variant={viewMode === 'calendar' ? 'primary' : 'outline'}
                            onClick={() => setViewMode('calendar')}
                        >
                            Calendario
                        </Button>
                        <Button
                            variant={viewMode === 'cards' ? 'primary' : 'outline'}
                            onClick={() => setViewMode('cards')}
                        >
                            Tarjetas
                        </Button>
                    </div>
                    <Link href="/appointments/new">
                        <Button variant="primary">
                            + Nueva Cita
                        </Button>
                    </Link>
                </div>

                {/* Contenido según el modo de vista */}
                <div className="mt-6">
                    {viewMode === 'table' && (
                        <Card>
                            <div className="p-6">
                                <AppointmentTable
                                    appointments={appointments}
                                    userRole={userRole}
                                    onRefresh={handleRefresh}
                                />
                            </div>
                        </Card>
                    )}

                    {viewMode === 'calendar' && (
                        <Card>
                            <div className="p-6">
                                <AppointmentCalendar
                                    appointments={appointments}
                                    userRole={userRole}
                                    onRefresh={handleRefresh}
                                    onEdit={handleEdit}
                                />
                            </div>
                        </Card>
                    )}

                    {viewMode === 'cards' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {appointments.length === 0 ? (
                                <div className="col-span-full text-center py-12">
                                    <p className="text-[#9ca3af] text-lg">No hay citas registradas</p>
                                </div>
                            ) : (
                                appointments.map((appointment) => (
                                    <AppointmentCard
                                        key={appointment.id}
                                        appointment={appointment}
                                        userRole={userRole}
                                        onRefresh={handleRefresh}
                                        onEdit={handleEdit}
                                    />
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de edición */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false)
                    setEditingAppointment(null)
                }}
                title="Editar Cita"
                size="lg"
            >
                {editingAppointment && (
                    <AppointmentForm
                        appointment={editingAppointment}
                        onSuccess={() => {
                            setIsEditModalOpen(false)
                            setEditingAppointment(null)
                            handleRefresh()
                        }}
                        onCancel={() => {
                            setIsEditModalOpen(false)
                            setEditingAppointment(null)
                        }}
                        userRole={userRole}
                    />
                )}
            </Modal>
        </div>
    )
}

