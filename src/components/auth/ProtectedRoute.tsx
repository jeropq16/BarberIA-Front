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
        if (!isLoading) {
            // Si no está autenticado, redirigir al login
            if (!isAuthenticated) {
                router.push(redirectTo)
                return
            }

            // Si hay roles permitidos, verificar que el usuario tenga uno de esos roles
            if (allowedRoles && user && !allowedRoles.includes(user.role)) {
                // Redirigir según el rol del usuario
                if (user.role === UserRole.Client) {
                    router.push('/appointments')
                } else if (user.role === UserRole.Barber) {
                    router.push('/dashboard-barber')
                } else if (user.role === UserRole.Admin) {
                    router.push('/dashboard-admin')
                } else {
                    router.push('/')
                }
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
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return null
    }

    // Usuario autenticado y con rol permitido, mostrar contenido
    return <>{children}</>
}

