import { toast, ToastOptions, TypeOptions } from 'react-toastify';

/**
 * Configuración por defecto para los toasts
 * Adaptada a la paleta de colores del proyecto (rojos, negros, grises)
 */
const defaultOptions: ToastOptions = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "dark", // Tema oscuro para coincidir con el diseño
};

/**
 * Función helper para mostrar toasts
 */
const createToast = (type: TypeOptions) => {
    return (message: string, options?: ToastOptions) => {
        toast(message, {
            ...defaultOptions,
            ...options,
            type,
        });
    };
};

/**
 * Objeto con métodos para cada tipo de toast
 * Uso: showToast.success('Mensaje'), showToast.error('Error'), etc.
 */
export const showToast = {
    success: createToast('success'),
    error: createToast('error'),
    info: createToast('info'),
    warning: createToast('warning'),
    default: createToast('default'),
};

/**
 * Toast de promesa (útil para operaciones asíncronas)
 * Muestra un toast mientras se ejecuta la promesa y otro cuando se resuelve o rechaza
 * 
 * @example
 * toastPromise(
 *   fetch('/api/data'),
 *   {
 *     pending: 'Cargando datos...',
 *     success: 'Datos cargados correctamente',
 *     error: 'Error al cargar los datos'
 *   }
 * )
 */
export const toastPromise = <T,>(
    promise: Promise<T>,
    messages: {
        pending: string;
        success: string;
        error: string;
    }
) => {
    return toast.promise(promise, {
        pending: messages.pending,
        success: messages.success,
        error: messages.error,
    }, defaultOptions);
};

