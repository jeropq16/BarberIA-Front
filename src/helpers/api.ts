import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { getToken } from './auth';

/**
 * Crea una instancia de axios configurada con el token de autenticación
 * Versión básica - TODO: Pablo completará esta funcionalidad
 */
export const createAuthenticatedAxios = (config?: AxiosRequestConfig): AxiosInstance => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    const instance = axios.create({
        baseURL: apiUrl,
        ...config,
    });

    // Interceptor para agregar el token a todas las peticiones
    instance.interceptors.request.use(
        (config) => {
            const token = getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Interceptor para manejar errores de autenticación
    instance.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                console.error('Unauthorized: Token inválido o expirado');
            }
            return Promise.reject(error);
        }
    );

    return instance;
};

/**
 * Instancia de axios preconfigurada para peticiones autenticadas
 */
export const authenticatedAxios = createAuthenticatedAxios();

