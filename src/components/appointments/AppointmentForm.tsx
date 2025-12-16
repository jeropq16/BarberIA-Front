'use client'

import { useState, useEffect } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Loading from '../ui/Loading'
import { getHaircuts, HairCutResponse } from '@/services/haircuts'
import { getBarbers, UserProfileResponse } from '@/services/users'
import { getAvailability, createAppointment, updateAppointment, CreateAppointmentFormData, UpdateAppointmentFormData, AppointmentResponse } from '@/services/appointments'
import { UserRole } from '@/helpers/auth'
import { showToast } from '@/helpers/toast'
import { showErrorAlert } from '@/helpers/alerts'
import { useAuth } from '@/context/AuthContext'

interface AppointmentFormProps {
    appointment?: AppointmentResponse
    onSuccess: () => void
    onCancel: () => void
    userRole?: UserRole
}

export default function AppointmentForm({
    appointment,
    onSuccess,
    onCancel,
    userRole = UserRole.Client,
}: AppointmentFormProps) {
    const { user } = useAuth()
    const isEditing = !!appointment

    // Estados del formulario
    const [barberId, setBarberId] = useState<number>(appointment?.barberId || 0)
    const [haircutId, setHaircutId] = useState<number>(appointment?.haircutId || 0)
    const [appointmentDate, setAppointmentDate] = useState<string>(
        appointment?.appointmentDate ? appointment.appointmentDate.split('T')[0] : ''
    )
    const [appointmentTime, setAppointmentTime] = useState<string>(
        appointment?.appointmentTime || ''
    )
    const [notes, setNotes] = useState<string>(appointment?.notes || '')

    // Estados de carga
    const [loading, setLoading] = useState(false)
    const [loadingHaircuts, setLoadingHaircuts] = useState(true)
    const [loadingBarbers, setLoadingBarbers] = useState(true)
    const [loadingAvailability, setLoadingAvailability] = useState(false)

    // Datos
    const [haircuts, setHaircuts] = useState<HairCutResponse[]>([])
    const [barbers, setBarbers] = useState<UserProfileResponse[]>([])
    const [availableTimes, setAvailableTimes] = useState<string[]>([])

    // Errores
    const [errors, setErrors] = useState<Record<string, string>>({})

    // Cargar datos iniciales
    useEffect(() => {
        const loadData = async () => {
            try {
                const [haircutsData, barbersData] = await Promise.all([
                    getHaircuts(),
                    getBarbers(),
                ])
                setHaircuts(haircutsData)
                setBarbers(barbersData)
            } catch (error) {
                showErrorAlert('Error', 'No se pudieron cargar los datos necesarios')
            } finally {
                setLoadingHaircuts(false)
                setLoadingBarbers(false)
            }
        }
        loadData()
    }, [])

    // Función para convertir fecha de YYYY-MM-DD (formato input) a YYYY/MM/DD (formato backend)
    const convertDateForBackend = (dateString: string): string => {
        // El input type="date" siempre devuelve YYYY-MM-DD
        // El backend espera YYYY/MM/DD
        return dateString.replace(/-/g, '/')
    }

    // Cargar disponibilidad cuando cambian barbero, fecha o servicio
    useEffect(() => {
        // Limpiar tiempos disponibles si no hay barbero o fecha
        // Nota: El backend puede requerir también el haircutId, pero lo intentamos sin él primero
        if (!barberId || !appointmentDate) {
            setAvailableTimes([])
            setAppointmentTime('')
            return
        }

        // Validar que la fecha esté en formato YYYY-MM-DD (formato del input)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate)) {
            setAvailableTimes([])
            setAppointmentTime('')
            return
        }

        // Agregar un pequeño delay para evitar múltiples llamadas
        const timeoutId = setTimeout(() => {
            loadAvailability(appointmentDate)
        }, 300)

        return () => clearTimeout(timeoutId)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [barberId, appointmentDate, haircutId])

    const loadAvailability = async (date: string) => {
        if (!barberId || !date) {
            setAvailableTimes([])
            return
        }

        // Validar formato YYYY-MM-DD (formato del input)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            setAvailableTimes([])
            return
        }

        setLoadingAvailability(true)
        try {
            // El backend requiere barberId, date y haircutId según Swagger
            // Si no hay haircutId seleccionado, no podemos obtener disponibilidad
            if (!haircutId || haircutId <= 0) {
                setAvailableTimes([])
                setLoadingAvailability(false)
                return
            }

            // Convertir fecha de YYYY-MM-DD a YYYY/MM/DD para el backend
            const dateForBackend = convertDateForBackend(date)

            // Pasar haircutId (requerido por el backend)
            const availability = await getAvailability(barberId, dateForBackend, haircutId)

            // Asegurarse de que availableTimes siempre sea un array
            const times = Array.isArray(availability?.availableTimes)
                ? availability.availableTimes
                : []
            setAvailableTimes(times)

            // Si la hora actual no está disponible, limpiarla
            if (appointmentTime && times.length > 0 && !times.includes(appointmentTime)) {
                setAppointmentTime('')
            }
        } catch (error: any) {
            // Log detallado del error
            if (error.response?.status === 500) {
                console.error('Error 500 del backend al obtener disponibilidad:', {
                    barberId,
                    date,
                    haircutId,
                    error: error.response?.data
                })
                // Si el error dice "Servicio no encontrado", puede ser que el haircutId no exista
                if (error.response?.data?.message?.includes('Servicio') ||
                    error.response?.data?.message?.includes('servicio')) {
                    console.warn('El servicio (haircutId) puede no existir o ser inválido')
                    showToast.error('El servicio seleccionado no es válido')
                } else {
                    showToast.error('No se pudo cargar la disponibilidad')
                }
            } else {
                showToast.error('No se pudo cargar la disponibilidad')
            }
            setAvailableTimes([]) // Asegurar que siempre sea un array vacío
        } finally {
            setLoadingAvailability(false)
        }
    }

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!barberId) {
            newErrors.barberId = 'Debes seleccionar un barbero'
        }

        if (!haircutId) {
            newErrors.haircutId = 'Debes seleccionar un servicio'
        }

        if (!appointmentDate) {
            newErrors.appointmentDate = 'Debes seleccionar una fecha'
        } else {
            // Validar formato YYYY-MM-DD (formato del input)
            if (!/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate)) {
                newErrors.appointmentDate = 'Fecha inválida'
            } else {
                // Validar que no sea fecha pasada
                const selectedDate = new Date(appointmentDate)
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                if (selectedDate < today) {
                    newErrors.appointmentDate = 'No puedes seleccionar una fecha pasada'
                }
            }
        }

        if (!appointmentTime) {
            newErrors.appointmentTime = 'Debes seleccionar una hora'
        } else {
            const times = Array.isArray(availableTimes) ? availableTimes : []
            if (times.length > 0 && !times.includes(appointmentTime)) {
                newErrors.appointmentTime = 'La hora seleccionada no está disponible'
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            showToast.error('Por favor, completa todos los campos correctamente')
            return
        }

        setLoading(true)
        try {
            // Validar que la fecha esté en formato YYYY-MM-DD (formato del input)
            if (!appointmentDate || !/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate)) {
                showToast.error('Fecha inválida')
                setLoading(false)
                return
            }

            if (isEditing) {
                const updateData: UpdateAppointmentFormData = {
                    barberId,
                    haircutId,
                    appointmentDate, // Mantener en formato YYYY-MM-DD para el servicio
                    appointmentTime,
                    notes: notes || undefined,
                }
                await updateAppointment(appointment.id, updateData)
                showToast.success('Cita actualizada correctamente')
            } else {
                // Obtener el clientId del usuario autenticado desde el contexto
                if (!user || !user.id) {
                    showErrorAlert('Error', 'No se encontró información del usuario. Por favor, inicia sesión nuevamente.')
                    setLoading(false)
                    return
                }

                const clientId = Number(user.id)
                if (clientId <= 0) {
                    showErrorAlert('Error', 'ID de usuario inválido')
                    setLoading(false)
                    return
                }

                const createData: CreateAppointmentFormData = {
                    barberId,
                    haircutId,
                    appointmentDate, // Mantener en formato YYYY-MM-DD para el servicio
                    appointmentTime,
                    notes: notes || undefined,
                }
                await createAppointment(createData, clientId)
                showToast.success('Cita creada correctamente')
            }
            onSuccess()
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.message || error.message || 'Error al guardar la cita'
            showErrorAlert('Error', errorMessage)
        } finally {
            setLoading(false)
        }
    }

    if (loadingHaircuts || loadingBarbers) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loading text="Cargando datos..." />
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Selección de Servicio (primero, porque es requerido para disponibilidad) */}
            <div>
                <label className="block mb-2 text-sm font-medium text-white">
                    Servicio *
                </label>
                <select
                    value={haircutId}
                    onChange={(e) => {
                        const newHaircutId = Number(e.target.value)
                        setHaircutId(newHaircutId)
                        // Si cambia el servicio, limpiar la hora seleccionada
                        if (newHaircutId !== haircutId) {
                            setAppointmentTime('')
                        }
                    }}
                    className="w-full px-4 py-2 text-white bg-[#000000] border-2 border-[#dc2626] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dc2626] focus:ring-offset-2 focus:ring-offset-black"
                >
                    <option value={0}>Selecciona un servicio</option>
                    {haircuts.map((haircut) => (
                        <option key={haircut.id} value={haircut.id}>
                            {haircut.name} - ${haircut.price} ({haircut.durationMinutes} min)
                        </option>
                    ))}
                </select>
                {errors.haircutId && (
                    <p className="mt-1 text-sm text-[#ef4444]">{errors.haircutId}</p>
                )}
                {!haircutId && (
                    <p className="mt-1 text-sm text-[#9ca3af]">
                        Selecciona un servicio para ver los horarios disponibles
                    </p>
                )}
            </div>

            {/* Selección de Barbero */}
            <div>
                <label className="block mb-2 text-sm font-medium text-white">
                    Barbero *
                </label>
                <select
                    value={barberId}
                    onChange={(e) => setBarberId(Number(e.target.value))}
                    className="w-full px-4 py-2 text-white bg-[#000000] border-2 border-[#dc2626] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dc2626] focus:ring-offset-2 focus:ring-offset-black"
                >
                    <option value={0}>Selecciona un barbero</option>
                    {barbers.map((barber) => (
                        <option key={barber.id} value={barber.id}>
                            {barber.fullName}
                        </option>
                    ))}
                </select>
                {errors.barberId && (
                    <p className="mt-1 text-sm text-[#ef4444]">{errors.barberId}</p>
                )}
            </div>

            {/* Selección de Fecha */}
            <div>
                <Input
                    label="Fecha *"
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => {
                        // El input type="date" siempre devuelve formato YYYY-MM-DD
                        setAppointmentDate(e.target.value)
                        // Limpiar error si existe
                        if (errors.appointmentDate) {
                            setErrors(prev => {
                                const newErrors = { ...prev }
                                delete newErrors.appointmentDate
                                return newErrors
                            })
                        }
                    }}
                    error={errors.appointmentDate}
                    min={new Date().toISOString().split('T')[0]}
                />
            </div>

            {/* Selección de Hora */}
            <div>
                <label className="block mb-2 text-sm font-medium text-white">
                    Hora *
                </label>
                {loadingAvailability ? (
                    <div className="flex items-center gap-2 text-[#9ca3af]">
                        <Loading size="sm" />
                        <span>Cargando horarios disponibles...</span>
                    </div>
                ) : (Array.isArray(availableTimes) ? availableTimes : []).length === 0 && barberId && appointmentDate ? (
                    <p className="text-sm text-[#ef4444]">
                        No hay horarios disponibles para esta fecha
                    </p>
                ) : (
                    <select
                        value={appointmentTime}
                        onChange={(e) => setAppointmentTime(e.target.value)}
                        disabled={!barberId || !appointmentDate || (Array.isArray(availableTimes) ? availableTimes : []).length === 0}
                        className="w-full px-4 py-2 text-white bg-[#000000] border-2 border-[#dc2626] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dc2626] focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <option value="">Selecciona una hora</option>
                        {(Array.isArray(availableTimes) ? availableTimes : []).map((time) => (
                            <option key={time} value={time}>
                                {time}
                            </option>
                        ))}
                    </select>
                )}
                {errors.appointmentTime && (
                    <p className="mt-1 text-sm text-[#ef4444]">{errors.appointmentTime}</p>
                )}
            </div>

            {/* Notas */}
            <div>
                <label className="block mb-2 text-sm font-medium text-white">
                    Notas (opcional)
                </label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 text-white bg-[#000000] border-2 border-[#dc2626] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dc2626] focus:ring-offset-2 focus:ring-offset-black resize-none"
                    placeholder="Agrega alguna nota adicional..."
                />
            </div>

            {/* Botones */}
            <div className="flex gap-4 justify-end pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={loading}
                >
                    Cancelar
                </Button>
                <Button type="submit" variant="primary" isLoading={loading}>
                    {isEditing ? 'Actualizar Cita' : 'Crear Cita'}
                </Button>
            </div>
        </form>
    )
}

