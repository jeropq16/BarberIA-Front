'use client'

import Navbar from '@/components/landing/Navbar'
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
import { createStaff, CreateStaffRequest } from '@/services/users'
import { showToast } from '@/helpers/toast'
import { useForm } from 'react-hook-form'

type ViewMode = 'table' | 'calendar' | 'cards' | 'users'

export default function DashboardAdminPage() {
    const { user, isLoading: authLoading } = useAuth()
    const [appointments, setAppointments] = useState<AppointmentResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [viewMode, setViewMode] = useState<ViewMode>('table')
    const [editingAppointment, setEditingAppointment] = useState<AppointmentResponse | null>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    // Estados para gestión de personal
    const [isCreateStaffModalOpen, setIsCreateStaffModalOpen] = useState(false)

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
        // Esperar a que termine la carga de autenticación
        if (authLoading) return

        // Si hay usuario, cargar citas
        if (user) {
            loadAppointments()
        } else {
            setLoading(false)
        }
    }, [user, authLoading])

    const handleEdit = (appointment: AppointmentResponse) => {
        setEditingAppointment(appointment)
        setIsEditModalOpen(true)
    }

    const handleRefresh = () => {
        loadAppointments()
    }

    // Mostrar loading si está cargando autenticación o citas
    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loading size="lg" text={authLoading ? "Verificando autenticación..." : "Cargando citas..."} />
            </div>
        )
    }

    return (
        <ProtectedRoute allowedRoles={[UserRole.Admin]}>
            <div className="min-h-screen bg-black text-white">
                {/* Navbar para Admin */}
                <Navbar
                    menuItems={[]}
                />

                <div className="p-6 max-w-7xl mx-auto pt-24">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-covered)' }}>
                            ADMINISTRACIÓN DE CITAS
                        </h1>
                        <p className="text-[#9ca3af] text-lg">
                            Gestiona todas las citas del sistema
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
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsCreateStaffModalOpen(true)}
                            >
                                + Registrar Personal
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => setIsCreateModalOpen(true)}
                            >
                                + Nueva Cita
                            </Button>
                        </div>
                    </div>

                    <div className="mt-6">
                        {viewMode === 'table' && (
                            <Card>
                                <div className="p-6">
                                    <AppointmentTable
                                        appointments={appointments}
                                        userRole={UserRole.Admin}
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
                                        userRole={UserRole.Admin}
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
                                        <p className="text-[#9ca3af] text-lg">No hay citas registradas</p>
                                    </div>
                                ) : (
                                    appointments.map((appointment) => (
                                        <AppointmentCard
                                            key={appointment.id}
                                            appointment={appointment}
                                            userRole={UserRole.Admin}
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
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    title="Crear Nueva Cita"
                    size="lg"
                >
                    <AppointmentForm
                        onSuccess={() => {
                            setIsCreateModalOpen(false)
                            handleRefresh()
                        }}
                        onCancel={() => setIsCreateModalOpen(false)}
                        userRole={UserRole.Admin}
                    />
                </Modal>

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
                            userRole={UserRole.Admin}
                        />
                    )}
                </Modal>

                {/* Modal para crear staff */}
                <Modal
                    isOpen={isCreateStaffModalOpen}
                    onClose={() => setIsCreateStaffModalOpen(false)}
                    title="Registrar Personal (Admin / Barbero)"
                    size="md"
                >
                    <StaffRegistrationForm
                        onSuccess={() => setIsCreateStaffModalOpen(false)}
                        onCancel={() => setIsCreateStaffModalOpen(false)}
                    />
                </Modal>
            </div>
        </ProtectedRoute>
    )
}

function StaffRegistrationForm({ onSuccess, onCancel }: { onSuccess: () => void, onCancel: () => void }) {
    const { register, handleSubmit, formState: { errors } } = useForm<CreateStaffRequest>()
    const [isLoading, setIsLoading] = useState(false)

    const onSubmit = async (data: CreateStaffRequest) => {
        setIsLoading(true)
        try {
            // Enviar datos tal cual (rol como string)
            await createStaff(data)
            showToast.success(`Usuario creado exitosamente`)
            onSuccess()
        } catch (error: any) {
            console.error("Error creating staff:", error)

            if (error.response?.data?.errors) {
                // Manejar errores de validación estructurados (ej: .NET)
                const apiErrors = error.response.data.errors
                // Obtener el primer mensaje de error que encontremos
                const errorKey = Object.keys(apiErrors)[0]
                const errorMessages = apiErrors[errorKey]
                const firstErrorMessage = Array.isArray(errorMessages) ? errorMessages[0] : "Error de validación"
                showToast.error(`${errorKey}: ${firstErrorMessage}`)
            } else {
                const msg = error.response?.data?.message || "Error al crear staff"
                showToast.error(msg)
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Nombre Completo</label>
                <input
                    {...register("fullName", { required: "El nombre es requerido" })}
                    className="w-full p-2 rounded bg-[#1a1a1a] border border-[#333] text-white focus:border-red-500 outline-none transition-colors"
                />
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input
                    type="email"
                    {...register("email", { required: "El email es requerido" })}
                    className="w-full p-2 rounded bg-[#1a1a1a] border border-[#333] text-white focus:border-red-500 outline-none transition-colors"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Contraseña</label>
                <input
                    type="password"
                    {...register("password", {
                        required: "La contraseña es requerida",
                        minLength: { value: 6, message: "Mínimo 6 caracteres" },
                        pattern: {
                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                            message: "Debe contener mayúscula, minúscula y número"
                        }
                    })}
                    className="w-full p-2 rounded bg-[#1a1a1a] border border-[#333] text-white focus:border-red-500 outline-none transition-colors"
                    placeholder="Ej: Password123!"
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Rol</label>
                <select
                    {...register("role", { required: "El rol es requerido" })}
                    className="w-full p-2 rounded bg-[#1a1a1a] border border-[#333] text-white focus:border-red-500 outline-none transition-colors"
                >
                    <option value="Barber">Barbero</option>
                    <option value="Admin">Administrador</option>
                </select>
                {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
            </div>

            <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" type="button" onClick={onCancel}>Cancelar</Button>
                <Button variant="primary" type="submit" isLoading={isLoading} disabled={isLoading}>Registrar</Button>
            </div>
        </form>
    )
}
