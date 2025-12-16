'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { showToast } from '@/helpers/toast'
import { getUserFromToken, isAuthenticated, getToken, DecodedToken, UserRole } from '@/helpers/auth'
import { getUserProfile, UserProfileResponse } from '@/services/users'

export interface UserSession extends DecodedToken {
    profile?: UserProfileResponse | null
}

interface AuthContextType {
    user: UserSession | null
    isLoading: boolean
    isAuthenticated: boolean
    isClient: boolean
    isBarber: boolean
    isAdmin: boolean
    login: (token: string) => Promise<void>
    logout: () => void
    refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = 'token'

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserSession | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    /**
     * Cargar usuario desde el token al montar
     */
    useEffect(() => {
        const loadUser = async () => {
            try {
                const token = getToken()
                console.log('🔍 AuthContext - Cargando usuario, token existe:', !!token)

                if (!token) {
                    console.log('⚠️ AuthContext - No hay token, estableciendo isLoading=false')
                    setIsLoading(false)
                    return
                }

                // Decodificar el token directamente sin usar isAuthenticated()
                const userData = getUserFromToken()
                console.log('🔍 AuthContext - Datos decodificados del token:', userData)

                if (userData) {
                    // Establecer los datos del token inmediatamente
                    const userSession = {
                        ...userData,
                        profile: null,
                    }
                    console.log('✅ AuthContext - Estableciendo usuario:', userSession)
                    setUser(userSession)

                    // Intentar cargar perfil completo del servidor en segundo plano
                    getUserProfile()
                        .then(profile => {
                            console.log('✅ AuthContext - Perfil cargado del servidor:', profile)
                            setUser(prev => prev ? { ...prev, profile } : null)
                        })
                        .catch((error) => {
                            console.warn('⚠️ AuthContext - No se pudo cargar perfil completo:', error)
                            // Si falla, el usuario ya tiene los datos del token
                        })
                } else {
                    console.error('❌ AuthContext - No se pudo decodificar el token, limpiando')
                    localStorage.removeItem(TOKEN_KEY)
                }
            } catch (error) {
                console.error('❌ AuthContext - Error loading user session:', error)
                localStorage.removeItem(TOKEN_KEY)
            } finally {
                console.log('✅ AuthContext - Finalizando carga, estableciendo isLoading=false')
                setIsLoading(false)
            }
        }

        loadUser()

        // Escuchar cambios en localStorage (sincronización entre tabs)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === TOKEN_KEY) {
                if (e.newValue) {
                    const userData = getUserFromToken()
                    if (userData) {
                        setUser(userData)
                    }
                } else {
                    setUser(null)
                }
            }
        }

        window.addEventListener('storage', handleStorageChange)

        return () => {
            window.removeEventListener('storage', handleStorageChange)
        }
    }, [])

    const isAuthenticatedState = user !== null
    const isClient = user?.role === UserRole.Client
    const isBarber = user?.role === UserRole.Barber
    const isAdmin = user?.role === UserRole.Admin

    /**
     * Login - Guardar token y cargar datos del usuario
     */
    const login = async (token: string) => {
        let redirectPath = '/'

        try {
            localStorage.setItem(TOKEN_KEY, token)

            const userData = getUserFromToken()
            if (!userData) {
                throw new Error('Error al decodificar el token')
            }

            // Determinar ruta de redirección según el rol
            let roleValue: number
            if (typeof userData.role === 'string') {
                roleValue = parseInt(userData.role, 10)
            } else {
                roleValue = Number(userData.role)
            }

            const roleStr = String(userData.role)
            if (roleValue === 1 || roleValue === UserRole.Client || roleStr === '1') {
                redirectPath = '/appointments'
            } else if (roleValue === 2 || roleValue === UserRole.Barber || roleStr === '2') {
                redirectPath = '/dashboard-barber'
            } else if (roleValue === 3 || roleValue === UserRole.Admin || roleStr === '3') {
                redirectPath = '/dashboard-admin'
            } else {
                console.warn('⚠️ AuthContext - Rol desconocido o no válido:', userData.role)
            }

            setUser({
                ...userData,
                profile: null,
            })

            // Navegar usando el router de Next.js
            router.push(redirectPath)

        } catch (error) {
            console.error('Error saving user session:', error)
            showToast.error('Error al iniciar sesión')
            throw error
        }

        // Intentar cargar perfil completo en segundo plano
        getUserProfile()
            .then(profile => {
                setUser(prev => prev ? { ...prev, profile } : null)
            })
            .catch(() => {
                // Si falla, el usuario ya tiene los datos del token
            })
    }

    /**
     * Logout - Limpiar sesión
     */
    const logout = () => {
        try {
            localStorage.removeItem(TOKEN_KEY)
            setUser(null)
            showToast.info('Sesión cerrada correctamente', { autoClose: 2000 })
            router.push('/')
        } catch (error) {
            console.error('Error during logout:', error)
            showToast.error('Error al cerrar sesión')
        }
    }

    /**
     * Refrescar datos del usuario desde el servidor
     */
    const refreshUser = async () => {
        try {
            if (!isAuthenticated()) {
                setUser(null)
                return
            }

            const profile = await getUserProfile()
            const userData = getUserFromToken()

            if (userData) {
                setUser({
                    ...userData,
                    profile,
                })
            }
        } catch (error) {
            console.error('Error refreshing user:', error)
            // Si falla, puede ser que el token expiró
            logout()
        }
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: isAuthenticatedState,
                isClient,
                isBarber,
                isAdmin,
                login,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

/**
 * Hook para acceder al contexto de autenticación
 * Debe usarse dentro de un AuthProvider
 */
export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

