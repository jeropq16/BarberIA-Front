'use client'

import { useState } from 'react'
import Card, { CardHeader, CardContent, CardFooter } from '../ui/Card'
import Button from '../ui/Button'
import Badge, { AppointmentStatusBadge, PaymentStatusBadge } from '../ui/Badge'
import {
    AppointmentResponse,
    AppointmentStatus,
    PaymentStatus,
    cancelAppointment,
    completeAppointment,
    updatePaymentStatus,
} from '@/services/appointments'
import { UserRole } from '@/helpers/auth'
import { showToast } from '@/helpers/toast'
import { showCancelAppointmentAlert, showConfirmAlert } from '@/helpers/alerts'
import { format } from 'date-fns'
import { es } from 'date-fns/locale/es'

interface AppointmentCardProps {
    appointment: AppointmentResponse
    userRole?: UserRole
    userId?: number
    onRefresh: () => void
    onEdit?: (appointment: AppointmentResponse) => void
}

export default function AppointmentCard({
    appointment,
    userRole = UserRole.Client,
    userId,
    onRefresh,
    onEdit,
}: AppointmentCardProps) {
    const [loadingState, setLoadingState] = useState<string>('')

    const formatDateTime = (dateString: string, timeString: string) => {
        try {
            const date = new Date(`${dateString}T${timeString}`)
            return format(date, "EEEE, dd 'de' MMMM 'a las' HH:mm", { locale: es })
        } catch {
            return `${dateString} ${timeString}`
        }
    }

    const handleCancel = async () => {
        const formattedDate = formatDateTime(
            appointment.appointmentDate,
            appointment.appointmentTime
        )
        const result = await showCancelAppointmentAlert(formattedDate)

        if (!result.isConfirmed) return

        setLoadingState('canceling')
        try {
            await cancelAppointment(appointment.id)
            showToast.success('Cita cancelada correctamente')
            onRefresh()
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.message || 'Error al cancelar la cita'
            showToast.error(errorMessage)
        } finally {
            setLoadingState('')
        }
    }

    const handleComplete = async () => {
        const result = await showConfirmAlert(
            'Completar cita',
            `¿Estás seguro de que deseas marcar esta cita como completada?`
        )

        if (!result.isConfirmed) return

        setLoadingState('completing')
        try {
            await completeAppointment(appointment.id)
            showToast.success('Cita completada correctamente')
            onRefresh()
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.message || 'Error al completar la cita'
            showToast.error(errorMessage)
        } finally {
            setLoadingState('')
        }
    }

    const handlePaymentStatusChange = async (newStatus: PaymentStatus) => {
        setLoadingState('updating-payment')
        try {
            await updatePaymentStatus(appointment.id, { paymentStatus: newStatus })
            showToast.success('Estado de pago actualizado')
            onRefresh()
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.message || 'Error al actualizar el estado de pago'
            showToast.error(errorMessage)
        } finally {
            setLoadingState('')
        }
    }

    const canEdit = () => {
        if (appointment.status === AppointmentStatus.Completed || 
            appointment.status === AppointmentStatus.Canceled) {
            return false
        }
        
        if (userRole === UserRole.Admin) {
            return true
        }
        
        if (userRole === UserRole.Client && userId && appointment.clientId === userId) {
            return true
        }
        
        if (userRole === UserRole.Barber && userId && appointment.barberId === userId) {
            return true
        }
        
        return false
    }

    const canCancel = () => {
        if (appointment.status === AppointmentStatus.Completed) {
            return false
        }
        
        if (userRole === UserRole.Admin) {
            return true
        }
        
        if (userRole === UserRole.Client && userId && appointment.clientId === userId) {
            return true
        }
        
        return false
    }

    const canComplete = () => {
        if (appointment.status === AppointmentStatus.Completed || 
            appointment.status === AppointmentStatus.Canceled) {
            return false
        }
        
        if (userRole === UserRole.Admin) {
            return true
        }
        
        if (userRole === UserRole.Barber && userId && appointment.barberId === userId) {
            return true
        }
        
        return false
    }

    const canChangePayment = () => {
        if (appointment.status === AppointmentStatus.Completed || 
            appointment.status === AppointmentStatus.Canceled) {
            return false
        }
        
        if (userRole === UserRole.Admin) {
            return true
        }
        
        if (userRole === UserRole.Client && userId && appointment.clientId === userId) {
            return true
        }
        
        return false
    }

    return (
        <Card variant="elevated" className="hover:shadow-xl transition-shadow">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">
                            {appointment.haircut?.name || 'Servicio'}
                        </h3>
                        <p className="text-[#9ca3af] text-sm">
                            {formatDateTime(appointment.appointmentDate, appointment.appointmentTime)}
                        </p>
                    </div>
                    <AppointmentStatusBadge status={appointment.status} />
                </div>
            </CardHeader>

            <CardContent>
                <div className="space-y-3">
                    <div>
                        <p className="text-sm text-[#9ca3af]">Cliente</p>
                        <p className="text-white font-medium">
                            {appointment.client?.fullName || 'N/A'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-[#9ca3af]">Barbero</p>
                        <p className="text-white font-medium">
                            {appointment.barber?.fullName || 'N/A'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-[#9ca3af]">Precio</p>
                        <p className="text-white font-medium">
                            ${appointment.haircut?.price || 'N/A'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-[#9ca3af]">Duración</p>
                        <p className="text-white font-medium">
                            {appointment.haircut?.durationMinutes || 'N/A'} minutos
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-[#9ca3af] mb-2">Estado de Pago</p>
                        {canChangePayment() ? (
                            <select
                                value={appointment.paymentStatus}
                                onChange={(e) =>
                                    handlePaymentStatusChange(Number(e.target.value) as PaymentStatus)
                                }
                                disabled={loadingState === 'updating-payment'}
                                className="bg-[#0a0a0a] border border-[#1a1a1a] text-white rounded px-2 py-1 text-sm disabled:opacity-50"
                            >
                                <option value={PaymentStatus.Pending}>Pendiente</option>
                                <option value={PaymentStatus.Paid}>Pagado</option>
                                <option value={PaymentStatus.Failed}>Fallido</option>
                            </select>
                        ) : (
                            <PaymentStatusBadge paymentStatus={appointment.paymentStatus} />
                        )}
                    </div>
                    {appointment.notes && (
                        <div>
                            <p className="text-sm text-[#9ca3af]">Notas</p>
                            <p className="text-white text-sm">{appointment.notes}</p>
                        </div>
                    )}
                </div>
            </CardContent>

            <CardFooter>
                <div className="flex gap-2 flex-wrap w-full">
                    {canEdit() && onEdit && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEdit(appointment)}
                            disabled={!!loadingState}
                        >
                            Editar
                        </Button>
                    )}
                    {canCancel() && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancel}
                            isLoading={loadingState === 'canceling'}
                            disabled={!!loadingState}
                        >
                            Cancelar
                        </Button>
                    )}
                    {canComplete() && (
                        <Button
                            size="sm"
                            variant="primary"
                            onClick={handleComplete}
                            isLoading={loadingState === 'completing'}
                            disabled={!!loadingState}
                        >
                            Completar
                        </Button>
                    )}
                </div>
            </CardFooter>
        </Card>
    )
}

