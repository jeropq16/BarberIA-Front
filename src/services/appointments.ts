import axios from 'axios';

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
 * El backend filtra por rol automáticamente
 */
export const getAllAppointments = async (): Promise<AppointmentResponse[]> => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await axios.get<AppointmentResponse[]>(`${apiUrl}/appointments/all`);
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
 */
export const getAppointmentById = async (id: number): Promise<AppointmentResponse> => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
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
 */
export const createAppointment = async (
    data: CreateAppointmentRequest
): Promise<AppointmentResponse> => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
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
 */
export const updateAppointment = async (
    id: number,
    data: UpdateAppointmentRequest
): Promise<AppointmentResponse> => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await axios.put<AppointmentResponse>(
            `${apiUrl}/appointments/${id}`,
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
 */
export const cancelAppointment = async (id: number): Promise<void> => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        await axios.delete(`${apiUrl}/appointments/${id}`);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw error;
        }
        throw new Error('Error desconocido al cancelar la cita');
    }
};

/**
 * Servicio: Completar una cita (solo para barberos y admin)
 */
export const completeAppointment = async (id: number): Promise<AppointmentResponse> => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await axios.put<AppointmentResponse>(
            `${apiUrl}/appointments/${id}/complete`
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
 */
export const updatePaymentStatus = async (
    id: number,
    data: UpdatePaymentStatusRequest
): Promise<AppointmentResponse> => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await axios.put<AppointmentResponse>(
            `${apiUrl}/appointments/${id}/payment-status`,
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
 */
export const getAvailability = async (
    barberId: number,
    date: string // YYYY-MM-DD
): Promise<AvailabilityResponse> => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
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

