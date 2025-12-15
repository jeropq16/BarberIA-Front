import Swal, { SweetAlertOptions, SweetAlertResult } from 'sweetalert2';

/**
 * Configuración por defecto para los botones
 * Adaptada a la paleta de colores del proyecto (rojos del logo)
 */
const defaultConfirmColor = '#dc2626'; // Rojo principal del logo
const defaultCancelColor = '#6b7280'; // Gris
const defaultConfirmText = 'Aceptar';
const defaultCancelText = 'Cancelar';

/**
 * Success alert
 * Muestra una alerta de éxito
 * 
 * @example
 * showSuccessAlert('Operación exitosa', 'Los datos se guardaron correctamente')
 */
export const showSuccessAlert = (
    title: string,
    text?: string,
    options?: SweetAlertOptions
): Promise<SweetAlertResult> => {
    return Swal.fire({
        icon: 'success',
        title,
        text,
        confirmButtonColor: defaultConfirmColor,
        confirmButtonText: defaultConfirmText,
        background: '#0a0a0a',
        color: '#ffffff',
        ...options,
    });
};

/**
 * Error alert
 * Muestra una alerta de error
 * 
 * @example
 * showErrorAlert('Error', 'No se pudo completar la operación')
 */
export const showErrorAlert = (
    title: string,
    text?: string,
    options?: SweetAlertOptions
): Promise<SweetAlertResult> => {
    return Swal.fire({
        icon: 'error',
        title,
        text,
        confirmButtonColor: defaultConfirmColor,
        confirmButtonText: defaultConfirmText,
        background: '#0a0a0a',
        color: '#ffffff',
        ...options,
    });
};

/**
 * Warning alert
 * Muestra una alerta de advertencia
 * 
 * @example
 * showWarningAlert('Advertencia', 'Esta acción puede tener consecuencias')
 */
export const showWarningAlert = (
    title: string,
    text?: string,
    options?: SweetAlertOptions
): Promise<SweetAlertResult> => {
    return Swal.fire({
        icon: 'warning',
        title,
        text,
        confirmButtonColor: defaultConfirmColor,
        confirmButtonText: defaultConfirmText,
        background: '#0a0a0a',
        color: '#ffffff',
        ...options,
    });
};

/**
 * Info alert
 * Muestra una alerta informativa
 * 
 * @example
 * showInfoAlert('Información', 'Este es un mensaje informativo')
 */
export const showInfoAlert = (
    title: string,
    text?: string,
    options?: SweetAlertOptions
): Promise<SweetAlertResult> => {
    return Swal.fire({
        icon: 'info',
        title,
        text,
        confirmButtonColor: defaultConfirmColor,
        confirmButtonText: defaultConfirmText,
        background: '#0a0a0a',
        color: '#ffffff',
        ...options,
    });
};

/**
 * Confirmation alert (with Yes/No buttons)
 * Muestra una alerta de confirmación con botones de Sí/Cancelar
 * Retorna una promesa que se resuelve con el resultado de la acción del usuario
 * 
 * @example
 * const result = await showConfirmAlert('¿Estás seguro?', 'Esta acción no se puede deshacer');
 * if (result.isConfirmed) {
 *   // Usuario hizo clic en "Sí"
 * }
 */
export const showConfirmAlert = (
    title: string,
    text?: string,
    options?: SweetAlertOptions
): Promise<SweetAlertResult> => {
    return Swal.fire({
        icon: 'question',
        title,
        text,
        showCancelButton: true,
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: defaultCancelText,
        confirmButtonColor: defaultConfirmColor,
        cancelButtonColor: defaultCancelColor,
        background: '#0a0a0a',
        color: '#ffffff',
        ...options,
    });
};

/**
 * Delete/close confirmation alert
 * Alerta específica para confirmar eliminación o cancelación
 * 
 * @example
 * const result = await showDeleteConfirmAlert('esta cita');
 * if (result.isConfirmed) {
 *   // Eliminar la cita
 * }
 */
export const showDeleteConfirmAlert = (
    itemName: string = 'este elemento',
    options?: SweetAlertOptions
): Promise<SweetAlertResult> => {
    return Swal.fire({
        icon: 'warning',
        title: '¿Estás seguro?',
        text: `Esta acción afectará ${itemName}. Esta acción no se puede deshacer.`,
        showCancelButton: true,
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: defaultCancelText,
        confirmButtonColor: '#ef4444', // Rojo más intenso para acciones destructivas
        cancelButtonColor: defaultCancelColor,
        background: '#0a0a0a',
        color: '#ffffff',
        ...options,
    });
};

/**
 * Cancel appointment confirmation alert
 * Alerta específica para cancelar citas
 * 
 * @example
 * const result = await showCancelAppointmentAlert();
 * if (result.isConfirmed) {
 *   // Cancelar la cita
 * }
 */
export const showCancelAppointmentAlert = (
    appointmentDate?: string,
    options?: SweetAlertOptions
): Promise<SweetAlertResult> => {
    const text = appointmentDate 
        ? `¿Estás seguro de que deseas cancelar la cita del ${appointmentDate}?`
        : '¿Estás seguro de que deseas cancelar esta cita?';
    
    return Swal.fire({
        icon: 'warning',
        title: 'Cancelar cita',
        text,
        showCancelButton: true,
        confirmButtonText: 'Sí, cancelar cita',
        cancelButtonText: defaultCancelText,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: defaultCancelColor,
        background: '#0a0a0a',
        color: '#ffffff',
        ...options,
    });
};

