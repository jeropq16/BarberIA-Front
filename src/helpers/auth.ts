/**
 * Helper para manejar autenticación y tokens JWT
 */

export interface DecodedToken {
    id: number;
    email: string;
    role: number;
    fullName: string;
}

/**
 * Enum para los roles de usuario (coincide con el backend)
 */
export enum UserRole {
    Client = 1,
    Barber = 2,
    Admin = 3
}

/**
 * Decodifica un token JWT sin validar la firma
 * Útil para obtener datos básicos del usuario en el frontend
 */
export const decodeToken = (token: string): DecodedToken | null => {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }

        const payload = parts[1];
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        const decoded = JSON.parse(jsonPayload);

        const roleClaim = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
        const emailClaim = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress';
        const nameIdentifierClaim = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';
        
        let roleValue = decoded[roleClaim] || decoded.role || decoded.Role || decoded.roleid || decoded.RoleId || decoded.roleId || decoded.userRole || decoded.UserRole;
        
        if (typeof roleValue === 'string') {
            if (roleValue.toLowerCase() === 'admin') {
                roleValue = 3;
            } else if (roleValue.toLowerCase() === 'barber' || roleValue.toLowerCase() === 'barbero') {
                roleValue = 2;
            } else if (roleValue.toLowerCase() === 'client' || roleValue.toLowerCase() === 'cliente') {
                roleValue = 1;
            }
        }

        return {
            id: decoded.nameid || decoded[nameIdentifierClaim] || decoded.id || decoded.userId || decoded.sub,
            email: decoded.email || decoded[emailClaim] || decoded.Email || decoded.EmailAddress,
            role: roleValue,
            fullName: decoded.fullName || decoded.FullName || decoded.name || decoded.unique_name || decoded.Name,
        };
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

/**
 * Obtiene el token del localStorage
 */
export const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
};

/**
 * Verifica si el usuario está autenticado
 */
export const isAuthenticated = (): boolean => {
    const token = getToken();
    if (!token) return false;
    const decoded = decodeToken(token);
    return decoded !== null;
};

/**
 * Obtiene los datos del usuario desde el token
 */
export const getUserFromToken = (): DecodedToken | null => {
    const token = getToken();
    if (!token) return null;
    return decodeToken(token);
};

