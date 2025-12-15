import axios from 'axios';

/**
 * Interfaces para tipar las respuestas del API
 */
export enum UserRole {
    Client = 1,
    Barber = 2,
    Admin = 3
}

export interface UserProfileResponse {
    id: number;
    fullName: string;
    email: string;
    phoneNumber: string | null;
    role: UserRole;
    profilePhotoUrl: string | null;
}

/**
 * Servicio: Obtener todos los usuarios
 * Nota: El backend actualmente no tiene un endpoint público para obtener todos los usuarios.
 * Este método está preparado para cuando se agregue el endpoint.
 * Por ahora, getBarbers() retornará un array vacío si no hay endpoint disponible.
 */
export const getUsers = async (): Promise<UserProfileResponse[]> => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
            throw new Error('NEXT_PUBLIC_API_URL no está configurado');
        }
        // Intentar obtener usuarios (puede fallar si no existe el endpoint)
        const response = await axios.get<UserProfileResponse[]>(`${apiUrl}/users`);
        return response.data;
    } catch (error) {
        // Si el endpoint no existe, retornar array vacío
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            console.warn('Endpoint /users no disponible. Retornando array vacío.');
            return [];
        }
        if (axios.isAxiosError(error)) {
            throw error;
        }
        throw new Error('Error desconocido al obtener usuarios');
    }
};

/**
 * Servicio: Obtener un usuario por ID
 */
export const getUserById = async (id: number): Promise<UserProfileResponse> => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
            throw new Error('NEXT_PUBLIC_API_URL no está configurado');
        }
        const response = await axios.get<UserProfileResponse>(`${apiUrl}/users/${id}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw error;
        }
        throw new Error('Error desconocido al obtener usuario');
    }
};

/**
 * Servicio: Obtener solo los barberos (rol 2)
 */
export const getBarbers = async (): Promise<UserProfileResponse[]> => {
    try {
        const users = await getUsers();
        return users.filter(user => user.role === UserRole.Barber);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw error;
        }
        throw new Error('Error desconocido al obtener barberos');
    }
};

