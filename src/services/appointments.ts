import axios from 'axios';
import { authenticatedAxios } from '@/helpers/api';

/**
 * Interfaces para tipar las respuestas del API
 */

export enum AppointmentStatus {
    Pending = 1,
    Confirmed = 2,
    Completed = 3,
    Canceled = 4
}

export enum PaymentStatus {
    Pending = 1,
    Paid = 2,
    Failed = 3
}

export interface AppointmentResponse {
    id: number;
    clientId: number;
    barberId: number;
    haircutId: number;
    appointmentDate: string; // ISO date string
    appointmentTime: string; // HH:mm format
    status: AppointmentStatus;
    paymentStatus: PaymentStatus;
    notes?: string | null;
    createdAt: string;
    updatedAt: string;
    // Relaciones (pueden venir del backend)
    client?: {
        id: number;
        fullName: string;
        email: string;
    };
    barber?: {
        id: number;
        fullName: string;
        email: string;
    };
    haircut?: {
        id: number;
        name: string;
        price: number;
        durationMinutes: number;
    };
}

export interface CreateAppointmentRequest {
    barberId: number;
    haircutId: number;
    appointmentDate: string; // YYYY-MM-DD
    appointmentTime: string; // HH:mm
    notes?: string;
}

export interface UpdateAppointmentRequest {
    barberId?: number;
    haircutId?: number;
    appointmentDate?: string; // YYYY-MM-DD
    appointmentTime?: string; // HH:mm
    notes?: string;
}

export interface AvailabilityResponse {
    date: string; // YYYY-MM-DD
    availableTimes: string[]; // Array de horas disponibles en formato HH:mm
}

export interface UpdatePaymentStatusRequest {
    paymentStatus: PaymentStatus;
}

/**
 * Servicio: Obtener todas las citas
 * Requiere autenticación - El backend filtra por rol automáticamente
 */
export const getAllAppointments = async (): Promise<AppointmentResponse[]> => {
    try {
        const response = await authenticatedAxios.get<AppointmentResponse[]>('/appointments/all');
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw error;
        }
        throw new Error('Error desconocido al obtener citas');
    }
};

/**
 * Servicio: Obtener una cita por ID
 * Nota: Verificar si este endpoint requiere autenticación según el backend
 */
export const getAppointmentById = async (id: number): Promise<AppointmentResponse> => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await axios.get<AppointmentResponse>(`${apiUrl}/appointments/${id}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw error;
        }
        throw new Error('Error desconocido al obtener la cita');
    }
};

/**
 * Servicio: Crear una nueva cita
 * Público - No requiere autenticación según la lógica de negocio
 */
export const createAppointment = async (
    data: CreateAppointmentRequest
): Promise<AppointmentResponse> => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await axios.post<AppointmentResponse>(
            `${apiUrl}/appointments`,
            data
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw error;
        }
        throw new Error('Error desconocido al crear la cita');
    }
};

/**
 * Servicio: Actualizar una cita
 * Requiere autenticación - Requiere política OwnerOrAdmin
 */
export const updateAppointment = async (
    id: number,
    data: UpdateAppointmentRequest
): Promise<AppointmentResponse> => {
    try {
        const response = await authenticatedAxios.put<AppointmentResponse>(
            `/appointments/${id}`,
            data
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw error;
        }
        throw new Error('Error desconocido al actualizar la cita');
    }
};

/**
 * Servicio: Cancelar una cita
 * Requiere autenticación - Cliente: solo sus citas, Admin: cualquier cita
 */
export const cancelAppointment = async (id: number): Promise<void> => {
    try {
        await authenticatedAxios.delete(`/appointments/${id}`);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw error;
        }
        throw new Error('Error desconocido al cancelar la cita');
    }
};

/**
 * Servicio: Completar una cita
 * Requiere autenticación - Barbero: solo sus citas, Admin: cualquier cita
 */
export const completeAppointment = async (id: number): Promise<AppointmentResponse> => {
    try {
        const response = await authenticatedAxios.put<AppointmentResponse>(
            `/appointments/${id}/complete`
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw error;
        }
        throw new Error('Error desconocido al completar la cita');
    }
};

/**
 * Servicio: Actualizar estado de pago
 * Requiere autenticación - Cliente: solo sus citas, Admin: cualquier cita
 */
export const updatePaymentStatus = async (
    id: number,
    data: UpdatePaymentStatusRequest
): Promise<AppointmentResponse> => {
    try {
        const response = await authenticatedAxios.put<AppointmentResponse>(
            `/appointments/${id}/payment-status`,
            data
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw error;
        }
        throw new Error('Error desconocido al actualizar el estado de pago');
    }
};

/**
 * Servicio: Obtener horarios disponibles
 * Público - No requiere autenticación según la lógica de negocio
 */
export const getAvailability = async (
    barberId: number,
    date: string // YYYY-MM-DD
): Promise<AvailabilityResponse> => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await axios.get<AvailabilityResponse>(
            `${apiUrl}/appointments/availability`,
            {
                params: {
                    barberId,
                    date,
                },
            }
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw error;
        }
        throw new Error('Error desconocido al obtener disponibilidad');
    }
};

