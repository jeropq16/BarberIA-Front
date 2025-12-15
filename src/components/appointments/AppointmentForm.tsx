'use client'

import { useState, useEffect } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Loading from '../ui/Loading'
import { getHaircuts, HairCutResponse } from '@/services/haircuts'
import { getBarbers, UserProfileResponse } from '@/services/users'
import { getAvailability, createAppointment, updateAppointment, CreateAppointmentRequest, UpdateAppointmentRequest, AppointmentResponse } from '@/services/appointments'
import { showToast } from '@/helpers/toast'
import { showErrorAlert } from '@/helpers/alerts'

interface AppointmentFormProps {
    appointment?: AppointmentResponse
    onSuccess: () => void
    onCancel: () => void
    userRole?: number // 1=Client, 2=Barber, 3=Admin
}

export default function AppointmentForm({
    appointment,
    onSuccess,
    onCancel,
    userRole = 1,
}: AppointmentFormProps) {
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

    // Cargar disponibilidad cuando cambian barbero o fecha
    useEffect(() => {
        if (barberId && appointmentDate) {
            loadAvailability()
        } else {
            setAvailableTimes([])
            setAppointmentTime('')
        }
    }, [barberId, appointmentDate])

    const loadAvailability = async () => {
        if (!barberId || !appointmentDate) return

        setLoadingAvailability(true)
        try {
            const availability = await getAvailability(barberId, appointmentDate)
            setAvailableTimes(availability.availableTimes)

            // Si la hora actual no está disponible, limpiarla
            if (appointmentTime && !availability.availableTimes.includes(appointmentTime)) {
                setAppointmentTime('')
            }
        } catch (error) {
            showToast.error('No se pudo cargar la disponibilidad')
            setAvailableTimes([])
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
            // Validar que no sea fecha pasada
            const selectedDate = new Date(appointmentDate)
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            if (selectedDate < today) {
                newErrors.appointmentDate = 'No puedes seleccionar una fecha pasada'
            }
        }

        if (!appointmentTime) {
            newErrors.appointmentTime = 'Debes seleccionar una hora'
        } else if (availableTimes.length > 0 && !availableTimes.includes(appointmentTime)) {
            newErrors.appointmentTime = 'La hora seleccionada no está disponible'
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
            if (isEditing) {
                const updateData: UpdateAppointmentRequest = {
                    barberId,
                    haircutId,
                    appointmentDate,
                    appointmentTime,
                    notes: notes || undefined,
                }
                await updateAppointment(appointment.id, updateData)
                showToast.success('Cita actualizada correctamente')
            } else {
                const createData: CreateAppointmentRequest = {
                    barberId,
                    haircutId,
                    appointmentDate,
                    appointmentTime,
                    notes: notes || undefined,
                }
                await createAppointment(createData)
                showToast.success('Cita creada correctamente')
            }
            onSuccess()
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.message || 'Error al guardar la cita'
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

            {/* Selección de Servicio */}
            <div>
                <label className="block mb-2 text-sm font-medium text-white">
                    Servicio *
                </label>
                <select
                    value={haircutId}
                    onChange={(e) => setHaircutId(Number(e.target.value))}
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
            </div>

            {/* Selección de Fecha */}
            <div>
                <Input
                    label="Fecha *"
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
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
                ) : availableTimes.length === 0 && barberId && appointmentDate ? (
                    <p className="text-sm text-[#ef4444]">
                        No hay horarios disponibles para esta fecha
                    </p>
                ) : (
                    <select
                        value={appointmentTime}
                        onChange={(e) => setAppointmentTime(e.target.value)}
                        disabled={!barberId || !appointmentDate || availableTimes.length === 0}
                        className="w-full px-4 py-2 text-white bg-[#000000] border-2 border-[#dc2626] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dc2626] focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <option value="">Selecciona una hora</option>
                        {availableTimes.map((time) => (
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

