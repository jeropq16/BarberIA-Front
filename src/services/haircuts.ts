import axios from 'axios';

/**
 * Interfaces para tipar las respuestas del API
 */
export interface HairCutResponse {
    id: number;
    name: string;
    description: string | null;
    price: number;
    durationMinutes: number;
}

/**
 * Servicio: Obtener todos los servicios de corte disponibles
 * No requiere autenticación
 */
export const getHaircuts = async (): Promise<HairCutResponse[]> => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
            throw new Error('NEXT_PUBLIC_API_URL no está configurado');
        }
        const response = await axios.get<HairCutResponse[]>(`${apiUrl}/haircuts`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw error;
        }
        throw new Error('Error desconocido al obtener servicios de corte');
    }
};

