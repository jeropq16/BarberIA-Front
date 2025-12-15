'use client'

import { useState } from 'react'
import Button from '../ui/Button'
import Badge, { AppointmentStatusBadge, PaymentStatusBadge } from '../ui/Badge'
import Modal from '../ui/Modal'
import AppointmentForm from './AppointmentForm'
import {
    AppointmentResponse,
    AppointmentStatus,
    PaymentStatus,
    cancelAppointment,
    completeAppointment,
    updatePaymentStatus,
} from '@/services/appointments'
import { showToast } from '@/helpers/toast'
import { showCancelAppointmentAlert, showConfirmAlert } from '@/helpers/alerts'
import { format } from 'date-fns'
import { es } from 'date-fns/locale/es'

interface AppointmentTableProps {
    appointments: AppointmentResponse[]
    userRole?: number // 1=Client, 2=Barber, 3=Admin
    onRefresh: () => void
}

export default function AppointmentTable({
    appointments,
    userRole = 1,
    onRefresh,
}: AppointmentTableProps) {
    const [editingAppointment, setEditingAppointment] = useState<AppointmentResponse | null>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [loadingStates, setLoadingStates] = useState<Record<number, string>>({})

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'dd/MM/yyyy', { locale: es })
        } catch {
            return dateString
        }
    }

    const formatDateTime = (dateString: string, timeString: string) => {
        try {
            const date = new Date(`${dateString}T${timeString}`)
            return format(date, "dd/MM/yyyy 'a las' HH:mm", { locale: es })
        } catch {
            return `${dateString} ${timeString}`
        }
    }

    const handleEdit = (appointment: AppointmentResponse) => {
        setEditingAppointment(appointment)
        setIsEditModalOpen(true)
    }

    const handleCancel = async (appointment: AppointmentResponse) => {
        const formattedDate = formatDateTime(
            appointment.appointmentDate,
            appointment.appointmentTime
        )
        const result = await showCancelAppointmentAlert(formattedDate)

        if (!result.isConfirmed) return

        setLoadingStates((prev) => ({ ...prev, [appointment.id]: 'canceling' }))
        try {
            await cancelAppointment(appointment.id)
            showToast.success('Cita cancelada correctamente')
            onRefresh()
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.message || 'Error al cancelar la cita'
            showToast.error(errorMessage)
        } finally {
            setLoadingStates((prev) => {
                const newState = { ...prev }
                delete newState[appointment.id]
                return newState
            })
        }
    }

    const handleComplete = async (appointment: AppointmentResponse) => {
        const result = await showConfirmAlert(
            'Completar cita',
            `¿Estás seguro de que deseas marcar esta cita como completada?`
        )

        if (!result.isConfirmed) return

        setLoadingStates((prev) => ({ ...prev, [appointment.id]: 'completing' }))
        try {
            await completeAppointment(appointment.id)
            showToast.success('Cita completada correctamente')
            onRefresh()
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.message || 'Error al completar la cita'
            showToast.error(errorMessage)
        } finally {
            setLoadingStates((prev) => {
                const newState = { ...prev }
                delete newState[appointment.id]
                return newState
            })
        }
    }

    const handlePaymentStatusChange = async (
        appointment: AppointmentResponse,
        newStatus: PaymentStatus
    ) => {
        setLoadingStates((prev) => ({ ...prev, [appointment.id]: 'updating-payment' }))
        try {
            await updatePaymentStatus(appointment.id, { paymentStatus: newStatus })
            showToast.success('Estado de pago actualizado')
            onRefresh()
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.message || 'Error al actualizar el estado de pago'
            showToast.error(errorMessage)
        } finally {
            setLoadingStates((prev) => {
                const newState = { ...prev }
                delete newState[appointment.id]
                return newState
            })
        }
    }

    const canEdit = (appointment: AppointmentResponse) => {
        return (
            appointment.status !== AppointmentStatus.Completed &&
            appointment.status !== AppointmentStatus.Canceled
        )
    }

    const canCancel = (appointment: AppointmentResponse) => {
        return appointment.status !== AppointmentStatus.Completed
    }

    const canComplete = (appointment: AppointmentResponse) => {
        return (
            (userRole === 2 || userRole === 3) &&
            appointment.status !== AppointmentStatus.Completed &&
            appointment.status !== AppointmentStatus.Canceled
        )
    }

    const canChangePayment = (appointment: AppointmentResponse) => {
        return (
            (userRole === 1 || userRole === 3) &&
            appointment.status !== AppointmentStatus.Completed &&
            appointment.status !== AppointmentStatus.Canceled
        )
    }

    if (appointments.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-[#9ca3af] text-lg">No hay citas registradas</p>
            </div>
        )
    }

    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b border-[#1a1a1a]">
                            <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                                Fecha y Hora
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                                Servicio
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                                Cliente
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                                Barbero
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                                Estado
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                                Pago
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.map((appointment) => (
                            <tr
                                key={appointment.id}
                                className="border-b border-[#1a1a1a] hover:bg-[#0f0f0f] transition-colors"
                            >
                                <td className="px-4 py-3 text-white">
                                    {formatDateTime(appointment.appointmentDate, appointment.appointmentTime)}
                                </td>
                                <td className="px-4 py-3 text-white">
                                    {appointment.haircut?.name || 'N/A'}
                                </td>
                                <td className="px-4 py-3 text-white">
                                    {appointment.client?.fullName || 'N/A'}
                                </td>
                                <td className="px-4 py-3 text-white">
                                    {appointment.barber?.fullName || 'N/A'}
                                </td>
                                <td className="px-4 py-3">
                                    <AppointmentStatusBadge status={appointment.status} />
                                </td>
                                <td className="px-4 py-3">
                                    {canChangePayment(appointment) ? (
                                        <select
                                            value={appointment.paymentStatus}
                                            onChange={(e) =>
                                                handlePaymentStatusChange(
                                                    appointment,
                                                    Number(e.target.value) as PaymentStatus
                                                )
                                            }
                                            disabled={
                                                loadingStates[appointment.id] === 'updating-payment'
                                            }
                                            className="bg-[#0a0a0a] border border-[#1a1a1a] text-white rounded px-2 py-1 text-sm disabled:opacity-50"
                                        >
                                            <option value={PaymentStatus.Pending}>Pendiente</option>
                                            <option value={PaymentStatus.Paid}>Pagado</option>
                                            <option value={PaymentStatus.Failed}>Fallido</option>
                                        </select>
                                    ) : (
                                        <PaymentStatusBadge paymentStatus={appointment.paymentStatus} />
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        {canEdit(appointment) && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleEdit(appointment)}
                                                disabled={!!loadingStates[appointment.id]}
                                            >
                                                Editar
                                            </Button>
                                        )}
                                        {canCancel(appointment) && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleCancel(appointment)}
                                                isLoading={loadingStates[appointment.id] === 'canceling'}
                                                disabled={!!loadingStates[appointment.id]}
                                            >
                                                Cancelar
                                            </Button>
                                        )}
                                        {canComplete(appointment) && (
                                            <Button
                                                size="sm"
                                                variant="primary"
                                                onClick={() => handleComplete(appointment)}
                                                isLoading={loadingStates[appointment.id] === 'completing'}
                                                disabled={!!loadingStates[appointment.id]}
                                            >
                                                Completar
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
                            onRefresh()
                        }}
                        onCancel={() => {
                            setIsEditModalOpen(false)
                            setEditingAppointment(null)
                        }}
                        userRole={userRole}
                    />
                )}
            </Modal>
        </>
    )
}

