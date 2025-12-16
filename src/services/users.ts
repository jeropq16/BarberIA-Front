import axios from 'axios';
import { authenticatedAxios } from '@/helpers/api';

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

/**
 * Interfaz para actualizar usuario
 */
export interface UpdateUserRequest {
    fullName: string;
    phoneNumber: string | null;
}

/**
 * Interfaz para respuesta de subida de foto
 */
export interface UploadPhotoResponse {
    url: string;
}

/**
 * Servicio: Obtener el perfil del usuario autenticado
 * Requiere autenticación (Bearer Token)
 */
export const getUserProfile = async (): Promise<UserProfileResponse> => {
    try {
        const response = await authenticatedAxios.get<UserProfileResponse>('/users/profile');
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw error;
        }
        throw new Error('Error desconocido al obtener perfil');
    }
};

/**
 * Servicio: Actualizar información de un usuario
 * Requiere autenticación (Bearer Token)
 * Solo actualiza: fullName y phoneNumber
 */
export const updateUser = async (id: number, data: UpdateUserRequest): Promise<void> => {
    try {
        await authenticatedAxios.put(`/users/${id}`, data);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw error;
        }
        throw new Error('Error desconocido al actualizar usuario');
    }
};

/**
 * Servicio: Subir/actualizar foto de perfil de un usuario
 * Requiere autenticación (Bearer Token)
 * El archivo se sube a Cloudinary automáticamente por el backend
 */
export const uploadUserPhoto = async (id: number, file: File): Promise<string> => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await authenticatedAxios.put<UploadPhotoResponse>(
            `/users/${id}/upload-photo`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        return response.data.url;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw error;
        }
        throw new Error('Error desconocido al subir foto');
    }
};

/**
 * Interfaz para crear staff (Barber o Admin)
 */
export interface CreateStaffRequest {
    fullName: string;
    email: string;
    password: string;
    role: string;
}

/**
 * Servicio: Crear un usuario staff (Admin o Barbero)
 * Público - No requiere autenticación según la lógica de negocio (pero debería estar protegido)
 */
export const createStaff = async (data: CreateStaffRequest): Promise<void> => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
            throw new Error('NEXT_PUBLIC_API_URL no está configurado');
        }
        await axios.post(`${apiUrl}/users/create-staff`, data);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw error;
        }
        throw new Error('Error desconocido al crear staff');
    }
};

