'use client'

import { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { UserRole } from '@/helpers/auth'
import Loading from '@/components/ui/Loading'

interface ProtectedRouteProps {
    children: ReactNode
    allowedRoles?: UserRole[]
    redirectTo?: string
}

/**
 * Componente para proteger rutas que requieren autenticación
 * 
 * @param children - Contenido a mostrar si el usuario está autenticado
 * @param allowedRoles - Roles permitidos (opcional, si no se especifica, cualquier rol autenticado puede acceder)
 * @param redirectTo - Ruta a la que redirigir si no está autenticado (default: '/login')
 */
export default function ProtectedRoute({
    children,
    allowedRoles,
    redirectTo = '/login',
}: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, user } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (isLoading) return

        // Si no está autenticado, redirigir al login
        if (!isAuthenticated || !user) {
            if (typeof window !== 'undefined') {
                window.location.href = redirectTo
            }
            return
        }

        // Si hay roles permitidos, verificar que el usuario tenga uno de esos roles
        if (allowedRoles && allowedRoles.length > 0 && user) {
            const userRole = Number(user.role)
            // Comparar tanto el valor numérico del enum como el número directo
            const hasAllowedRole = allowedRoles.some(role => {
                const roleValue = typeof role === 'number' ? role : Number(role)
                return roleValue === userRole || role === userRole || Number(role) === userRole
            })
            
            if (!hasAllowedRole) {
                // Redirigir según el rol del usuario
                let redirectPath = '/'
                if (userRole === 1 || userRole === UserRole.Client) {
                    redirectPath = '/appointments'
                } else if (userRole === 2 || userRole === UserRole.Barber) {
                    redirectPath = '/dashboard-barber'
                } else if (userRole === 3 || userRole === UserRole.Admin) {
                    redirectPath = '/dashboard-admin'
                }
                
                if (typeof window !== 'undefined' && window.location.pathname !== redirectPath) {
                    window.location.href = redirectPath
                }
                return
            }
        }
    }, [isAuthenticated, isLoading, user, allowedRoles, redirectTo, router])

    // Mostrar loading mientras se verifica la autenticación
    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loading size="lg" text="Verificando autenticación..." />
            </div>
        )
    }

    // Si no está autenticado, no mostrar nada (ya se está redirigiendo)
    if (!isAuthenticated) {
        return null
    }

    // Si hay roles permitidos y el usuario no tiene uno de esos roles, no mostrar nada
    if (allowedRoles && allowedRoles.length > 0 && user) {
        const userRole = Number(user.role)
        const hasAllowedRole = allowedRoles.some(role => {
            const roleValue = typeof role === 'number' ? role : Number(role)
            return roleValue === userRole || role === userRole || Number(role) === userRole
        })
        
        if (!hasAllowedRole) {
            return null
        }
    }

    // Usuario autenticado y con rol permitido, mostrar contenido
    return <>{children}</>
}

