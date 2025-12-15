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
                if (token && isAuthenticated()) {
                    const userData = getUserFromToken()
                    if (userData) {
                        // Intentar cargar perfil completo del servidor
                        try {
                            const profile = await getUserProfile()
                            setUser({
                                ...userData,
                                profile,
                            })
                        } catch (error) {
                            // Si falla, usar solo datos del token
                            console.warn('No se pudo cargar perfil completo, usando datos del token')
                            setUser(userData)
                        }
                    }
                }
            } catch (error) {
                console.error('Error loading user session:', error)
                // Limpiar token inválido
                localStorage.removeItem(TOKEN_KEY)
            } finally {
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
        try {
            localStorage.setItem(TOKEN_KEY, token)
            
            const userData = getUserFromToken()
            if (!userData) {
                throw new Error('Error al decodificar el token')
            }

            // Intentar cargar perfil completo
            let profile: UserProfileResponse | null = null
            try {
                profile = await getUserProfile()
            } catch (error) {
                console.warn('No se pudo cargar perfil completo en login')
            }

            setUser({
                ...userData,
                profile,
            })

            showToast.success(`Bienvenido, ${userData.fullName}!`, { autoClose: 2000 })

            // Redirigir según el rol
            let redirectPath = '/'
            if (userData.role === UserRole.Client) {
                redirectPath = '/appointments'
            } else if (userData.role === UserRole.Barber) {
                redirectPath = '/dashboard-barber'
            } else if (userData.role === UserRole.Admin) {
                redirectPath = '/dashboard-admin'
            }

            // Redirigir después de un pequeño delay para que el estado se actualice
            setTimeout(() => {
                try {
                    router.push(redirectPath)
                } catch (err) {
                    // Fallback si router.push falla
                    if (typeof window !== 'undefined') {
                        window.location.href = redirectPath
                    }
                }
            }, 300)
        } catch (error) {
            console.error('Error saving user session:', error)
            showToast.error('Error al iniciar sesión')
            throw error
        }
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

