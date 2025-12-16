'use client'

import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Loading from '@/components/ui/Loading'
import Card from '@/components/ui/Card'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import AppointmentTable from '@/components/appointments/AppointmentTable'
import AppointmentCalendar from '@/components/appointments/AppointmentCalendar'
import AppointmentCard from '@/components/appointments/AppointmentCard'
import Modal from '@/components/ui/Modal'
import AppointmentForm from '@/components/appointments/AppointmentForm'
import { getAllAppointments, AppointmentResponse } from '@/services/appointments'
import { useAuth } from '@/context/AuthContext'
import { UserRole } from '@/helpers/auth'
import { showErrorAlert } from '@/helpers/alerts'

type ViewMode = 'table' | 'calendar' | 'cards'

export default function DashboardBarberPage() {
    const { user, isLoading: authLoading } = useAuth()
    const [appointments, setAppointments] = useState<AppointmentResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [viewMode, setViewMode] = useState<ViewMode>('table')
    const [editingAppointment, setEditingAppointment] = useState<AppointmentResponse | null>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    const loadAppointments = async () => {
        setLoading(true)
        try {
            const data = await getAllAppointments()
            setAppointments(data)
        } catch (error: any) {
            console.error('Error loading appointments:', error)
            let errorMessage = 'Error al cargar las citas'

            if (error.response) {
                if (error.response.status === 401) {
                    errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.'
                } else {
                    errorMessage = error.response.data?.message ||
                        error.response.data?.error ||
                        `Error ${error.response.status}: ${error.response.statusText}`
                }
            } else if (error.message) {
                errorMessage = error.message
            }

            showErrorAlert('Error', errorMessage)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!authLoading && user) {
            loadAppointments()
        }
    }, [user, authLoading])

    const handleEdit = (appointment: AppointmentResponse) => {
        setEditingAppointment(appointment)
        setIsEditModalOpen(true)
    }

    const handleRefresh = () => {
        loadAppointments()
    }

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loading size="lg" text={authLoading ? "Verificando autenticación..." : "Cargando citas..."} />
            </div>
        )
    }

    return (
        <ProtectedRoute allowedRoles={[UserRole.Barber]}>
            <div className="min-h-screen bg-black text-white p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-covered)' }}>
                            MIS CITAS ASIGNADAS
                        </h1>
                        <p className="text-[#9ca3af] text-lg">
                            Gestiona las citas que te han sido asignadas
                        </p>
                    </div>

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
                    </div>

                    <div className="mt-6">
                        {viewMode === 'table' && (
                            <Card>
                                <div className="p-6">
                                    <AppointmentTable
                                        appointments={appointments}
                                        userRole={UserRole.Barber}
                                        userId={user?.id}
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
                                        userRole={UserRole.Barber}
                                        userId={user?.id}
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
                                        <p className="text-[#9ca3af] text-lg">No hay citas asignadas</p>
                                    </div>
                                ) : (
                                    appointments.map((appointment) => (
                                        <AppointmentCard
                                            key={appointment.id}
                                            appointment={appointment}
                                            userRole={UserRole.Barber}
                                            userId={user?.id}
                                            onRefresh={handleRefresh}
                                            onEdit={handleEdit}
                                        />
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>

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
                            userRole={UserRole.Barber}
                        />
                    )}
                </Modal>
            </div>
        </ProtectedRoute>
    )
}

