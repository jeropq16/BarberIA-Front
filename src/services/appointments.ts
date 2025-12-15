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

// Interfaz interna para el formulario
export interface CreateAppointmentFormData {
    barberId: number;
    haircutId: number;
    appointmentDate: string; // YYYY-MM-DD
    appointmentTime: string; // HH:mm
    notes?: string;
}

// Interfaz para el backend (lo que realmente espera el API)
export interface CreateAppointmentRequest {
    clientId: number;
    barberId: number;
    hairCutId: number; // Nota: el backend usa "hairCutId" (camelCase)
    startTime: string; // ISO 8601 format: "2025-12-15T20:04:42.784Z"
}

// Interfaz interna para el formulario de actualización
export interface UpdateAppointmentFormData {
    barberId?: number;
    haircutId?: number;
    appointmentDate?: string; // YYYY-MM-DD
    appointmentTime?: string; // HH:mm
    notes?: string;
}

// Interfaz para el backend (lo que realmente espera el API)
export interface UpdateAppointmentRequest {
    barberId?: number;
    hairCutId?: number; // Nota: el backend usa "hairCutId" (camelCase)
    startTime?: string; // ISO 8601 format
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
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
            throw new Error('NEXT_PUBLIC_API_URL no está configurado');
        }
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
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
            throw new Error('NEXT_PUBLIC_API_URL no está configurado');
        }
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
 * Transforma los datos del formulario al formato que espera el backend
 */
export const createAppointment = async (
    formData: CreateAppointmentFormData,
    clientId: number
): Promise<AppointmentResponse> => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
            throw new Error('NEXT_PUBLIC_API_URL no está configurado');
        }

        // Combinar fecha y hora en formato ISO
        const dateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}:00`);
        if (isNaN(dateTime.getTime())) {
            throw new Error('Fecha y hora inválidas');
        }

        // Preparar datos en el formato que espera el backend
        const requestData: CreateAppointmentRequest = {
            clientId: clientId,
            barberId: formData.barberId,
            hairCutId: formData.haircutId, // El backend espera "hairCutId"
            startTime: dateTime.toISOString(),
        };

        const response = await axios.post<AppointmentResponse>(
            `${apiUrl}/appointments`,
            requestData
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
 * Transforma los datos del formulario al formato que espera el backend
 */
export const updateAppointment = async (
    id: number,
    formData: UpdateAppointmentFormData
): Promise<AppointmentResponse> => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
            throw new Error('NEXT_PUBLIC_API_URL no está configurado');
        }

        // Preparar datos en el formato que espera el backend
        const requestData: UpdateAppointmentRequest = {};

        if (formData.barberId !== undefined) {
            requestData.barberId = formData.barberId;
        }

        if (formData.haircutId !== undefined) {
            requestData.hairCutId = formData.haircutId; // El backend espera "hairCutId"
        }

        // Si hay fecha y hora, combinarlas en formato ISO
        if (formData.appointmentDate && formData.appointmentTime) {
            const dateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}:00`);
            if (!isNaN(dateTime.getTime())) {
                requestData.startTime = dateTime.toISOString();
            }
        }

        const response = await axios.put<AppointmentResponse>(
            `${apiUrl}/appointments/${id}`,
            requestData
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
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
            throw new Error('NEXT_PUBLIC_API_URL no está configurado');
        }
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
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
            throw new Error('NEXT_PUBLIC_API_URL no está configurado');
        }
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
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
            throw new Error('NEXT_PUBLIC_API_URL no está configurado');
        }
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
    date: string, // YYYY-MM-DD
    haircutId?: number // ID del servicio (opcional pero puede ser requerido por el backend)
): Promise<AvailabilityResponse> => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
            throw new Error('NEXT_PUBLIC_API_URL no está configurado');
        }

        // Validar barberId
        if (!barberId || barberId <= 0) {
            throw new Error('barberId inválido');
        }

        // Validar y normalizar el formato de fecha
        // El backend espera YYYY/MM/DD (con slash) según Swagger
        let normalizedDate = date.trim();

        // Si viene en formato YYYY-MM-DD, convertirlo a YYYY/MM/DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(normalizedDate)) {
            normalizedDate = normalizedDate.replace(/-/g, '/');
        }

        // Verificar que tenga el formato correcto YYYY/MM/DD
        if (!/^\d{4}\/\d{2}\/\d{2}$/.test(normalizedDate)) {
            // Intentar parsear y reformatear
            try {
                const dateObj = new Date(normalizedDate);
                if (isNaN(dateObj.getTime())) {
                    throw new Error('Fecha inválida');
                }
                const year = dateObj.getFullYear();
                // Validar que el año sea razonable (entre 2000 y 2100)
                if (year < 2000 || year > 2100) {
                    throw new Error(`Año inválido: ${year}`);
                }
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                const day = String(dateObj.getDate()).padStart(2, '0');
                normalizedDate = `${year}/${month}/${day}`;
            } catch (err: any) {
                throw new Error(`Formato de fecha inválido: ${date}. ${err.message || 'Se espera YYYY/MM/DD'}`);
            }
        } else {
            // Validar que el año sea razonable incluso si el formato es correcto
            const year = parseInt(normalizedDate.split('/')[0]);
            if (year < 2000 || year > 2100) {
                throw new Error(`Año inválido: ${year}. Debe estar entre 2000 y 2100`);
            }
        }

        // Construir parámetros de la petición
        // El backend requiere: barberId, date, y haircutId (según Swagger)
        const params: Record<string, string | number> = {
            barberId,
            date: normalizedDate,
        };

        // Agregar haircutId si está disponible (puede ser requerido por el backend)
        // Nota: el backend usa "haircutId" (no "hairCutId") según Swagger
        if (haircutId && haircutId > 0) {
            params.haircutId = haircutId;
        }

        const response = await axios.get<AvailabilityResponse>(
            `${apiUrl}/appointments/availability`,
            {
                params,
            }
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            // Log detallado del error para debugging
            if (error.response?.status === 500) {
                console.error('Error 500 del backend al obtener disponibilidad:', {
                    barberId,
                    date,
                    response: error.response?.data,
                    url: error.config?.url,
                });
            }
            throw error;
        }
        throw new Error('Error desconocido al obtener disponibilidad');
    }
};

