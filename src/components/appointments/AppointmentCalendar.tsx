'use client'

import { useState, useMemo } from 'react'
import Card from '../ui/Card'
import AppointmentCard from './AppointmentCard'
import { AppointmentResponse } from '@/services/appointments'
import { UserRole } from '@/helpers/auth'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale/es'

interface AppointmentCalendarProps {
    appointments: AppointmentResponse[]
    userRole?: UserRole
    userId?: number
    onRefresh: () => void
    onEdit?: (appointment: AppointmentResponse) => void
    view?: 'month' | 'week' | 'day'
}

export default function AppointmentCalendar({
    appointments,
    userRole = UserRole.Client,
    userId,
    onRefresh,
    onEdit,
    view: initialView = 'month',
}: AppointmentCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [view, setView] = useState<'month' | 'week' | 'day'>(initialView)

    // Agrupar citas por fecha
    const appointmentsByDate = useMemo(() => {
        const grouped: Record<string, AppointmentResponse[]> = {}
        appointments.forEach((appointment) => {
            const dateKey = appointment.appointmentDate.split('T')[0]
            if (!grouped[dateKey]) {
                grouped[dateKey] = []
            }
            grouped[dateKey].push(appointment)
        })
        return grouped
    }, [appointments])

    // Obtener días del mes actual
    const monthDays = useMemo(() => {
        const start = startOfMonth(currentDate)
        const end = endOfMonth(currentDate)
        return eachDayOfInterval({ start, end })
    }, [currentDate])

    // Obtener días de la semana actual
    const weekDays = useMemo(() => {
        const start = new Date(currentDate)
        start.setDate(start.getDate() - start.getDay()) // Domingo
        const end = new Date(start)
        end.setDate(end.getDate() + 6) // Sábado
        return eachDayOfInterval({ start, end })
    }, [currentDate])

    const getAppointmentsForDate = (date: Date): AppointmentResponse[] => {
        const dateKey = format(date, 'yyyy-MM-dd')
        return appointmentsByDate[dateKey] || []
    }

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentDate((prev) => {
            const newDate = new Date(prev)
            if (direction === 'prev') {
                newDate.setMonth(newDate.getMonth() - 1)
            } else {
                newDate.setMonth(newDate.getMonth() + 1)
            }
            return newDate
        })
    }

    const navigateWeek = (direction: 'prev' | 'next') => {
        setCurrentDate((prev) => {
            const newDate = new Date(prev)
            if (direction === 'prev') {
                newDate.setDate(newDate.getDate() - 7)
            } else {
                newDate.setDate(newDate.getDate() + 7)
            }
            return newDate
        })
    }

    const navigateDay = (direction: 'prev' | 'next') => {
        setCurrentDate((prev) => {
            const newDate = new Date(prev)
            if (direction === 'prev') {
                newDate.setDate(newDate.getDate() - 1)
            } else {
                newDate.setDate(newDate.getDate() + 1)
            }
            return newDate
        })
    }

    const renderMonthView = () => {
        return (
            <div className="space-y-4">
                {/* Header del calendario */}
                <div className="flex justify-between items-center">
                    <button
                        onClick={() => navigateMonth('prev')}
                        className="px-4 py-2 bg-[#1a1a1a] text-white rounded-lg hover:bg-[#2a2a2a] transition-colors"
                    >
                        ← Anterior
                    </button>
                    <h2 className="text-2xl font-bold text-white">
                        {format(currentDate, 'MMMM yyyy', { locale: es })}
                    </h2>
                    <button
                        onClick={() => navigateMonth('next')}
                        className="px-4 py-2 bg-[#1a1a1a] text-white rounded-lg hover:bg-[#2a2a2a] transition-colors"
                    >
                        Siguiente →
                    </button>
                </div>

                {/* Días de la semana */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                    {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                        <div key={day} className="text-center text-sm font-semibold text-[#9ca3af]">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Días del mes */}
                <div className="grid grid-cols-7 gap-2">
                    {monthDays.map((day) => {
                        const dayAppointments = getAppointmentsForDate(day)
                        const isToday = isSameDay(day, new Date())
                        const isSelected = selectedDate && isSameDay(day, selectedDate)

                        return (
                            <div
                                key={day.toISOString()}
                                onClick={() => setSelectedDate(day)}
                                className={`min-h-[100px] p-2 border-2 rounded-lg cursor-pointer transition-colors ${
                                    isToday
                                        ? 'border-[#dc2626] bg-[#1a0a0a]'
                                        : isSelected
                                        ? 'border-[#dc2626] bg-[#0f0f0f]'
                                        : 'border-[#1a1a1a] hover:border-[#2a2a2a]'
                                }`}
                            >
                                <div
                                    className={`text-sm font-medium mb-1 ${
                                        isToday ? 'text-[#dc2626]' : 'text-white'
                                    }`}
                                >
                                    {format(day, 'd')}
                                </div>
                                <div className="space-y-1">
                                    {dayAppointments.slice(0, 2).map((appointment) => (
                                        <div
                                            key={appointment.id}
                                            className="text-xs bg-[#dc2626] text-white px-1 py-0.5 rounded truncate"
                                        >
                                            {appointment.appointmentTime}
                                        </div>
                                    ))}
                                    {dayAppointments.length > 2 && (
                                        <div className="text-xs text-[#9ca3af]">
                                            +{dayAppointments.length - 2} más
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Detalles de la fecha seleccionada */}
                {selectedDate && (
                    <Card className="mt-4">
                        <div className="p-4">
                            <h3 className="text-lg font-bold text-white mb-4">
                                Citas del {format(selectedDate, "dd 'de' MMMM", { locale: es })}
                            </h3>
                            <div className="space-y-4">
                                {getAppointmentsForDate(selectedDate).length === 0 ? (
                                    <p className="text-[#9ca3af]">No hay citas para esta fecha</p>
                                ) : (
                                    getAppointmentsForDate(selectedDate).map((appointment) => (
                                        <AppointmentCard
                                            key={appointment.id}
                                            appointment={appointment}
                                            userRole={userRole}
                                            userId={userId}
                                            onRefresh={onRefresh}
                                            onEdit={onEdit}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        )
    }

    const renderWeekView = () => {
        return (
            <div className="space-y-4">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <button
                        onClick={() => navigateWeek('prev')}
                        className="px-4 py-2 bg-[#1a1a1a] text-white rounded-lg hover:bg-[#2a2a2a] transition-colors"
                    >
                        ← Semana Anterior
                    </button>
                    <h2 className="text-xl font-bold text-white">
                        {format(weekDays[0], 'dd MMM', { locale: es })} -{' '}
                        {format(weekDays[6], 'dd MMM yyyy', { locale: es })}
                    </h2>
                    <button
                        onClick={() => navigateWeek('next')}
                        className="px-4 py-2 bg-[#1a1a1a] text-white rounded-lg hover:bg-[#2a2a2a] transition-colors"
                    >
                        Siguiente Semana →
                    </button>
                </div>

                {/* Días de la semana */}
                <div className="grid grid-cols-7 gap-4">
                    {weekDays.map((day) => {
                        const dayAppointments = getAppointmentsForDate(day)
                        const isToday = isSameDay(day, new Date())

                        return (
                            <Card key={day.toISOString()} variant="outlined" className="min-h-[300px]">
                                <div className="p-4">
                                    <div
                                        className={`text-lg font-bold mb-4 ${
                                            isToday ? 'text-[#dc2626]' : 'text-white'
                                        }`}
                                    >
                                        {format(day, 'EEEE d', { locale: es })}
                                    </div>
                                    <div className="space-y-2">
                                        {dayAppointments.length === 0 ? (
                                            <p className="text-sm text-[#9ca3af]">Sin citas</p>
                                        ) : (
                                            dayAppointments.map((appointment) => (
                                                <div
                                                    key={appointment.id}
                                                    className="p-2 bg-[#1a1a1a] rounded text-sm"
                                                >
                                                    <p className="text-white font-medium">
                                                        {appointment.appointmentTime}
                                                    </p>
                                                    <p className="text-[#9ca3af] text-xs">
                                                        {appointment.haircut?.name}
                                                    </p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            </div>
        )
    }

    const renderDayView = () => {
        const dayAppointments = getAppointmentsForDate(currentDate)
        const isToday = isSameDay(currentDate, new Date())

        return (
            <div className="space-y-4">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <button
                        onClick={() => navigateDay('prev')}
                        className="px-4 py-2 bg-[#1a1a1a] text-white rounded-lg hover:bg-[#2a2a2a] transition-colors"
                    >
                        ← Día Anterior
                    </button>
                    <h2 className="text-2xl font-bold text-white">
                        {format(currentDate, "EEEE, dd 'de' MMMM yyyy", { locale: es })}
                    </h2>
                    <button
                        onClick={() => navigateDay('next')}
                        className="px-4 py-2 bg-[#1a1a1a] text-white rounded-lg hover:bg-[#2a2a2a] transition-colors"
                    >
                        Día Siguiente →
                    </button>
                </div>

                {/* Citas del día */}
                <div className="space-y-4">
                    {dayAppointments.length === 0 ? (
                        <Card>
                            <div className="p-8 text-center">
                                <p className="text-[#9ca3af] text-lg">No hay citas para este día</p>
                            </div>
                        </Card>
                    ) : (
                        dayAppointments.map((appointment) => (
                            <AppointmentCard
                                key={appointment.id}
                                appointment={appointment}
                                userRole={userRole}
                                userId={userId}
                                onRefresh={onRefresh}
                                onEdit={onEdit}
                            />
                        ))
                    )}
                </div>
            </div>
        )
    }

    return (
        <div>
            {/* Selector de vista */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setView('month')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                        view === 'month'
                            ? 'bg-[#dc2626] text-white'
                            : 'bg-[#1a1a1a] text-white hover:bg-[#2a2a2a]'
                    }`}
                >
                    Mes
                </button>
                <button
                    onClick={() => setView('week')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                        view === 'week'
                            ? 'bg-[#dc2626] text-white'
                            : 'bg-[#1a1a1a] text-white hover:bg-[#2a2a2a]'
                    }`}
                >
                    Semana
                </button>
                <button
                    onClick={() => setView('day')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                        view === 'day'
                            ? 'bg-[#dc2626] text-white'
                            : 'bg-[#1a1a1a] text-white hover:bg-[#2a2a2a]'
                    }`}
                >
                    Día
                </button>
            </div>

            {/* Renderizar vista seleccionada */}
            {view === 'month' && renderMonthView()}
            {view === 'week' && renderWeekView()}
            {view === 'day' && renderDayView()}
        </div>
    )
}

