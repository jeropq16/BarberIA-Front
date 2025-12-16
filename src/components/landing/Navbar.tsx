'use client'

import { useState, ReactElement, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bars3Icon, XMarkIcon, UserIcon } from '@heroicons/react/24/outline'
import Avatar from '@/components/ui/Avatar'
import { useAuth } from '@/context/AuthContext'
import styles from '@/styles/Navbar.module.css'

export interface NavbarProps {
    logo?: string
    menuItems?: Array<{ label: string; href: string }>
}

export default function Navbar({
    logo,
    menuItems = [
        { label: 'INICIO', href: '/' },
        { label: 'SERVICIOS', href: '#servicios' },
        { label: 'EQUIPO', href: '#barberos' },
        { label: 'CONTACTO', href: '#contacto' },
    ],
}: NavbarProps) {
    const router = useRouter()
    const { isAuthenticated, user, logout } = useAuth()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const userMenuRef = useRef<HTMLDivElement>(null)

    // Logo blanco para navbar (fondo oscuro siempre)
    const logoPath = logo || '/img/logo_blanco.png'

    // Cerrar menú de usuario al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false)
            }
        }

        if (isUserMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isUserMenuOpen])

    // Redirigir al login
    const handleLoginClick = () => {
        router.push('/login')
    }

    // Manejar logout
    const handleLogout = () => {
        logout()
        setIsUserMenuOpen(false)
    }

    // Manejar click en perfil
    const handleProfileClick = () => {
        router.push('/profile')
        setIsUserMenuOpen(false)
    }

    const getSocialIcon = (): ReactElement => {
        return (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
        )
    }

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                <div className={styles.content}>
                    {/* Logo - Blanco para fondo oscuro */}
                    <div className={styles.logoContainer}>
                        <Link href="/" className={styles.logoLink}>
                            <Image
                                src={logoPath}
                                alt="Ghetto Barber Logo"
                                width={120}
                                height={60}
                                className={styles.logoImage}
                                priority
                            />
                        </Link>
                    </div>

                    {/* Menu Items - Desktop */}
                    <div className={styles.menuDesktop}>
                        {menuItems.map((item, index) => (
                            <Link
                                key={index}
                                href={item.href}
                                className={styles.menuItem}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {/* Instagram y User Icon - Desktop */}
                    <div className={styles.socialDesktop}>
                        {/* Instagram */}
                        <a
                            href="https://www.instagram.com/ghettobarber1g1/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.socialLink}
                            aria-label="Instagram"
                        >
                            <span className={styles.socialIcon}>
                                {getSocialIcon()}
                            </span>
                        </a>
                        {/* Usuario autenticado: mostrar dropdown, sino: botón de login */}
                        {isAuthenticated && user ? (
                            <div className={styles.userMenuContainer} ref={userMenuRef}>
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className={styles.userButton}
                                    aria-label="Menú de usuario"
                                >
                                    <Avatar
                                        src={user.profile?.profilePhotoUrl || undefined}
                                        alt={user.fullName}
                                        size="sm"
                                    />
                                </button>
                                {isUserMenuOpen && (
                                    <div className={styles.userDropdown}>
                                        <div className={styles.userDropdownHeader}>
                                            <p className={styles.userName}>{user.fullName}</p>
                                            <p className={styles.userEmail}>{user.email}</p>
                                        </div>
                                        <div className={styles.userDropdownDivider} />
                                        <button
                                            onClick={() => {
                                                setIsUserMenuOpen(false)
                                                // Redirigir según el rol
                                                if (user.role === 3) router.push('/dashboard-admin')
                                                else if (user.role === 2) router.push('/dashboard-barber')
                                                else router.push('/appointments')
                                            }}
                                            className={styles.userDropdownItem}
                                        >
                                            Mi Dashboard
                                        </button>
                                        <button
                                            onClick={handleProfileClick}
                                            className={styles.userDropdownItem}
                                        >
                                            Mi Perfil
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className={styles.userDropdownItem}
                                        >
                                            Cerrar Sesión
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={handleLoginClick}
                                className={styles.userButton}
                                aria-label="Iniciar sesión"
                            >
                                <UserIcon className={styles.userIcon} />
                            </button>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={styles.mobileButton}
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? (
                            <XMarkIcon className={styles.mobileIcon} />
                        ) : (
                            <Bars3Icon className={styles.mobileIcon} />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className={styles.mobileMenu}>
                        <div className={styles.mobileMenuContent}>
                            {menuItems.map((item, index) => (
                                <Link
                                    key={index}
                                    href={item.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={styles.mobileMenuItem}
                                >
                                    {item.label}
                                </Link>
                            ))}
                            <div className={styles.mobileSocialContainer}>
                                {/* Instagram - Mobile */}
                                <a
                                    href="https://www.instagram.com/ghettobarber1g1/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.mobileSocialLink}
                                    aria-label="Instagram"
                                >
                                    {getSocialIcon()}
                                </a>
                                {/* Usuario autenticado: mostrar opciones, sino: botón de login - Mobile */}
                                {isAuthenticated && user ? (
                                    <>
                                        <button
                                            onClick={() => {
                                                setIsMenuOpen(false)
                                                handleProfileClick()
                                            }}
                                            className={styles.mobileUserButton}
                                            aria-label="Mi Perfil"
                                        >
                                            <Avatar
                                                src={user.profile?.profilePhotoUrl || undefined}
                                                alt={user.fullName}
                                                size="sm"
                                            />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsMenuOpen(false)
                                                handleLogout()
                                            }}
                                            className={styles.mobileUserButton}
                                            aria-label="Cerrar Sesión"
                                        >
                                            <UserIcon className={styles.mobileUserIcon} />
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setIsMenuOpen(false)
                                            handleLoginClick()
                                        }}
                                        className={styles.mobileUserButton}
                                        aria-label="Iniciar sesión"
                                    >
                                        <UserIcon className={styles.mobileUserIcon} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}
