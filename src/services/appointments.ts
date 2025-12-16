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
    haircutId?: number;
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
 * Requiere autenticación - El backend filtra por rol automáticamente
 */
import { getHaircuts } from './haircuts';
import { getUserById, UserProfileResponse } from './users';

/**
 * Servicio: Obtener todas las citas
 * Requiere autenticación - El backend filtra por rol automáticamente
 * NOTA: Realiza "hydration" manual de datos (Join en frontend) ya que el backend solo devuelve IDs.
 */
export const getAllAppointments = async (): Promise<AppointmentResponse[]> => {
    try {
        // 1. Obtener las citas básicas (solo con IDs)
        const response = await authenticatedAxios.get<any[]>('/appointments/all');
        const rawAppointments = response.data;

        // 2. Extraer IDs únicos para minimizar peticiones
        const haircutIds = new Set<number>();
        const userIds = new Set<number>();

        rawAppointments.forEach((appt: any) => {
            if (appt.haircutId || appt.HaircutId) haircutIds.add(appt.haircutId || appt.HaircutId);
            if (appt.hairCutId || appt.HairCutId) haircutIds.add(appt.hairCutId || appt.HairCutId);

            if (appt.clientId || appt.ClientId) userIds.add(appt.clientId || appt.ClientId);
            if (appt.barberId || appt.BarberId) userIds.add(appt.barberId || appt.BarberId);
        });

        // 3. Cargar datos diccionarios en paralelo
        const [haircutsList, usersList] = await Promise.all([
            getHaircuts().catch(() => []), // Si falla, array vacío
            Promise.all(Array.from(userIds).map(id => getUserById(id).catch(() => null)))
        ]);

        // Crear mapas para acceso rápido
        const haircutMap = new Map(haircutsList.map(h => [h.id, h]));
        const userMap = new Map(usersList.filter(u => u !== null).map(u => [u!.id, u]));

        // 4. Transformar y enriquecer las citas
        const transformedAppointments: AppointmentResponse[] = rawAppointments.map((appointment: any) => {
            // Normalizar fechas (tu lógica existente)
            let appointmentDate = appointment.appointmentDate || '';
            let appointmentTime = appointment.appointmentTime || '';

            if (appointment.startTime || appointment.StartTime) {
                const startTime = appointment.startTime || appointment.StartTime;
                const dateObj = new Date(startTime);

                if (!isNaN(dateObj.getTime())) {
                    const year = dateObj.getFullYear();
                    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                    const day = String(dateObj.getDate()).padStart(2, '0');
                    appointmentDate = `${year}-${month}-${day}`;

                    const hours = String(dateObj.getHours()).padStart(2, '0');
                    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
                    appointmentTime = `${hours}:${minutes}`;
                }
            }

            // Obtener IDs normalizados
            const cId = appointment.clientId || appointment.ClientId || 0;
            const bId = appointment.barberId || appointment.BarberId || 0;
            const hId = appointment.haircutId || appointment.HaircutId || appointment.hairCutId || appointment.HairCutId || 0;

            // Buscar objetos completos en los mapas cargados
            // Prioridad: Objeto que ya venga del backend > Búsqueda en mapa > Fallback

            // Cliente
            let client = appointment.client || appointment.Client;
            if (!client) {
                const userClient = userMap.get(cId);
                if (userClient) {
                    client = {
                        id: userClient.id,
                        fullName: userClient.fullName,
                        email: userClient.email,
                    };
                } else if (appointment.clientName) {
                    client = { id: cId, fullName: appointment.clientName, email: '' };
                } else if (cId > 0) {
                    // Fallback: Si no se encuentra el usuario pero tenemos ID
                    client = { id: cId, fullName: `${cId}`, email: '' };
                }
            }

            // Barbero
            let barber = appointment.barber || appointment.Barber;
            if (!barber) {
                const userBarber = userMap.get(bId);
                if (userBarber) {
                    barber = {
                        id: userBarber.id,
                        fullName: userBarber.fullName,
                        email: userBarber.email,
                    };
                } else if (appointment.barberName) {
                    barber = { id: bId, fullName: appointment.barberName, email: '' }; // Fallback
                } else if (bId > 0) {
                    // Fallback: Si no se encuentra el usuario pero tenemos ID
                    barber = { id: bId, fullName: `${bId}`, email: '' };
                }
            }

            // Servicio
            let haircut = appointment.haircut || appointment.Haircut;
            if (!haircut) {
                const hairCutData = haircutMap.get(hId);
                if (hairCutData) {
                    haircut = {
                        id: hairCutData.id,
                        name: hairCutData.name,
                        price: hairCutData.price,
                        durationMinutes: hairCutData.durationMinutes
                    };
                } else if (hId > 0) {
                    haircut = {
                        id: hId,
                        name: `${hId}`,
                        price: 0,
                        durationMinutes: 0
                    }
                }
            }

            return {
                ...appointment,
                appointmentDate,
                appointmentTime,
                client,
                barber,
                haircut
            } as AppointmentResponse;
        });

        console.log('🔍 Citas enriquecidas en frontend:', transformedAppointments);

        return transformedAppointments;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw error;
        }
        throw new Error('Error desconocido al obtener citas');
    }
};


/**
 * Servicio: Crear una nueva cita
 * Transforma los datos del formulario al formato que espera el backend
 */
/**
 * Servicio: Crear una nueva cita
 * Público - No requiere autenticación según la lógica de negocio
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

        // Construir la fecha y hora en formato ISO 8601 sin milisegundos ni Z
        // Formato esperado: "2024-12-25T10:00:00"
        const dateTimeString = `${formData.appointmentDate}T${formData.appointmentTime}:00`;
        const dateTime = new Date(dateTimeString);
        if (isNaN(dateTime.getTime())) {
            throw new Error('Fecha y hora inválidas');
        }

        // Formatear como YYYY-MM-DDTHH:mm:ss (sin milisegundos ni Z)
        const year = dateTime.getFullYear();
        const month = String(dateTime.getMonth() + 1).padStart(2, '0');
        const day = String(dateTime.getDate()).padStart(2, '0');
        const hours = String(dateTime.getHours()).padStart(2, '0');
        const minutes = String(dateTime.getMinutes()).padStart(2, '0');
        const seconds = String(dateTime.getSeconds()).padStart(2, '0');
        const formattedStartTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;

        console.log('🔍 createAppointment - Datos a enviar:', {
            clientId: Number(clientId),
            barberId: formData.barberId,
            hairCutId: formData.haircutId,
            startTime: formattedStartTime,
            dateTimeString,
        });

        const requestData: CreateAppointmentRequest = {
            clientId: Number(clientId), // Asegurar que sea número
            barberId: formData.barberId,
            hairCutId: formData.haircutId,
            haircutId: formData.haircutId, // Enviar ambas variantes
            startTime: formattedStartTime,
        };

        const response = await authenticatedAxios.post<AppointmentResponse>(
            '/appointments',
            requestData
        );
        return response.data;
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            console.error('❌ Error Backend createAppointment:', error.response.data);
            throw error;
        }
        throw new Error('Error desconocido al crear la cita');
    }
};

/**
 * Servicio: Actualizar una cita
 * Requiere autenticación - OwnerOrAdmin policy
 */
export const updateAppointment = async (
    id: number,
    formData: UpdateAppointmentFormData
): Promise<AppointmentResponse> => {
    try {
        const requestData: UpdateAppointmentRequest = {};

        if (formData.barberId !== undefined) {
            requestData.barberId = formData.barberId;
        }

        if (formData.haircutId !== undefined) {
            requestData.hairCutId = formData.haircutId;
        }

        if (formData.appointmentDate && formData.appointmentTime) {
            const dateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}:00`);
            if (!isNaN(dateTime.getTime())) {
                requestData.startTime = dateTime.toISOString();
            }
        }

        const response = await authenticatedAxios.put<AppointmentResponse>(
            `/appointments/${id}`,
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
            `/appointments/payment-status`,
            { appointmentId: id, ...data }
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
    date: string, // YYYY-MM-DD
    haircutId?: number // ID del servicio (opcional pero puede ser requerido por el backend)
): Promise<AvailabilityResponse> => {
    // Validar y normalizar el formato de fecha (fuera del try para usarlo en el catch)
    let normalizedDate = date.trim();

    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
            throw new Error('NEXT_PUBLIC_API_URL no está configurado');
        }

        // Validar barberId
        if (!barberId || barberId <= 0) {
            throw new Error('barberId inválido');
        }

        // Normalizar el formato de fecha
        // El backend espera YYYY/MM/DD (con slash) según Swagger

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

        const response = await axios.get<any>(
            `${apiUrl}/appointments/availability`,
            {
                params,
            }
        );

        // El backend devuelve un array de objetos con start y end
        // Ejemplo: [{ start: '2025-12-16T09:00:00', end: '2025-12-16T09:25:00' }, ...]
        let availableTimes: string[] = [];

        if (Array.isArray(response.data)) {
            // Extraer hora directamente del string ISO
            availableTimes = response.data.map((slot: any) => {
                if (slot.start) {
                    const isoString = slot.start;
                    if (isoString.includes('T')) {
                        const timePart = isoString.split('T')[1];
                        const timeOnly = timePart.split(':').slice(0, 2).join(':');
                        return timeOnly;
                    }
                    const startDate = new Date(slot.start);
                    const hours = String(startDate.getUTCHours()).padStart(2, '0');
                    const minutes = String(startDate.getUTCMinutes()).padStart(2, '0');
                    return `${hours}:${minutes}`;
                }
                return null;
            }).filter((time: string | null) => time !== null) as string[];
        } else if (response.data?.availableTimes && Array.isArray(response.data.availableTimes)) {
            availableTimes = response.data.availableTimes;
        }

        return {
            date: normalizedDate,
            availableTimes,
        };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            // Log detallado del error para debugging
            if (error.response?.status === 500) {
                console.error('Error del servidor al obtener disponibilidad');
            }
            throw error;
        }
        throw new Error('Error desconocido al obtener disponibilidad');
    }
};

