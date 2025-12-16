'use client'

import { useState, useEffect, useRef } from 'react'
import { CameraIcon, PencilIcon } from '@heroicons/react/24/outline'
import Card, { CardHeader, CardContent, CardFooter } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Loading from '@/components/ui/Loading'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { getUserProfile, updateUser, uploadUserPhoto, UserProfileResponse, UpdateUserRequest } from '@/services/users'
import { useAuth } from '@/context/AuthContext'
import { showToast } from '@/helpers/toast'

export default function ProfilePage() {
    const { user, refreshUser, isLoading: authLoading } = useAuth()
    const [profile, setProfile] = useState<UserProfileResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
    const [editForm, setEditForm] = useState<UpdateUserRequest>({
        fullName: '',
        phoneNumber: '',
    })
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Cargar perfil
    useEffect(() => {
        const loadProfile = async () => {
            try {
                setLoading(true)
                const userProfile = await getUserProfile()
                setProfile(userProfile)
                setEditForm({
                    fullName: userProfile.fullName,
                    phoneNumber: userProfile.phoneNumber || '',
                })
            } catch (error) {
                console.error('Error loading profile:', error)
                showToast.error('Error al cargar el perfil')
                // No establecer profile como null, para que el usuario pueda ver algo
            } finally {
                setLoading(false)
            }
        }

        // Esperar a que la autenticación termine de cargar
        if (!authLoading) {
            if (user) {
                loadProfile()
            } else {
                // Si no hay usuario después de que termine la carga, establecer loading como false
                setLoading(false)
            }
        }
    }, [user, authLoading])

    // Abrir modal de edición
    const handleOpenEditModal = () => {
        if (profile) {
            setEditForm({
                fullName: profile.fullName,
                phoneNumber: profile.phoneNumber || '',
            })
            setIsEditModalOpen(true)
        }
    }

    // Guardar cambios del perfil
    const handleSaveProfile = async () => {
        if (!profile) return

        try {
            await updateUser(profile.id, editForm)
            setProfile({
                ...profile,
                fullName: editForm.fullName,
                phoneNumber: editForm.phoneNumber || null,
            })
            // Refrescar datos del usuario en el contexto
            await refreshUser()
            setIsEditModalOpen(false)
            showToast.success('Perfil actualizado correctamente')
        } catch (error) {
            console.error('Error updating profile:', error)
            showToast.error('Error al actualizar el perfil')
        }
    }

    // Manejar selección de archivo para foto
    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file || !profile) return

        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
            showToast.error('Por favor selecciona un archivo de imagen')
            return
        }

        // Validar tamaño (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showToast.error('La imagen debe ser menor a 5MB')
            return
        }

        try {
            setIsUploadingPhoto(true)
            const photoUrl = await uploadUserPhoto(profile.id, file)
            setProfile({
                ...profile,
                profilePhotoUrl: photoUrl,
            })
            // Refrescar datos del usuario en el contexto
            await refreshUser()
            showToast.success('Foto actualizada correctamente')
        } catch (error) {
            console.error('Error uploading photo:', error)
            showToast.error('Error al subir la foto')
        } finally {
            setIsUploadingPhoto(false)
            // Limpiar input
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    // Abrir selector de archivo
    const handleChangePhotoClick = () => {
        fileInputRef.current?.click()
    }

    // Obtener rol como texto
    const getRoleText = (role: number): string => {
        switch (role) {
            case 1:
                return 'Cliente'
            case 2:
                return 'Barbero'
            case 3:
                return 'Administrador'
            default:
                return 'Usuario'
        }
    }

    if (loading || authLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loading />
            </div>
        )
    }

    if (!profile) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-black pt-24 pb-12 px-4">
                    <div className="max-w-4xl mx-auto">
                        <Card variant="elevated">
                            <CardContent>
                                <div className="text-center py-8">
                                    <p className="text-white text-lg mb-4">
                                        No se pudo cargar el perfil
                                    </p>
                                    <Button
                                        onClick={() => {
                                            setLoading(true)
                                            getUserProfile()
                                                .then((userProfile) => {
                                                    setProfile(userProfile)
                                                    setEditForm({
                                                        fullName: userProfile.fullName,
                                                        phoneNumber: userProfile.phoneNumber || '',
                                                    })
                                                })
                                                .catch((error) => {
                                                    console.error('Error loading profile:', error)
                                                    showToast.error('Error al cargar el perfil')
                                                })
                                                .finally(() => {
                                                    setLoading(false)
                                                })
                                        }}
                                        variant="primary"
                                    >
                                        Reintentar
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </ProtectedRoute>
        )
    }

    return (
        <ProtectedRoute>
        <div className="min-h-screen bg-black pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-display text-white mb-8 text-center">
                    Mi Perfil
                </h1>

                <Card variant="elevated" className="mb-6">
                    <CardHeader>
                        <div className="flex flex-col items-center gap-6">
                            {/* Avatar con botón de cambiar foto */}
                            <div className="relative">
                                <Avatar
                                    src={profile.profilePhotoUrl}
                                    size="xl"
                                    fallback={profile.fullName.charAt(0).toUpperCase()}
                                />
                                <button
                                    onClick={handleChangePhotoClick}
                                    disabled={isUploadingPhoto}
                                    className="absolute bottom-0 right-0 bg-[#dc2626] text-white p-2 rounded-full hover:bg-[#b91c1c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="Cambiar foto"
                                >
                                    <CameraIcon className="w-5 h-5" />
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                            </div>

                            {/* Nombre y rol */}
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    {profile.fullName}
                                </h2>
                                <p className="text-[#9ca3af] text-sm">
                                    {getRoleText(profile.role)}
                                </p>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="space-y-6">
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-[#9ca3af] mb-2">
                                    Email
                                </label>
                                <div className="px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white">
                                    {profile.email}
                                </div>
                                <p className="mt-1 text-xs text-[#9ca3af]">
                                    El email no se puede modificar
                                </p>
                            </div>

                            {/* Nombre completo */}
                            <div>
                                <label className="block text-sm font-medium text-[#9ca3af] mb-2">
                                    Nombre Completo
                                </label>
                                <div className="px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white">
                                    {profile.fullName}
                                </div>
                            </div>

                            {/* Teléfono */}
                            <div>
                                <label className="block text-sm font-medium text-[#9ca3af] mb-2">
                                    Teléfono
                                </label>
                                <div className="px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white">
                                    {profile.phoneNumber || 'No especificado'}
                                </div>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter>
                        <Button
                            onClick={handleOpenEditModal}
                            variant="primary"
                            size="lg"
                            className="w-full"
                        >
                            <PencilIcon className="w-5 h-5 inline mr-2" />
                            Editar Perfil
                        </Button>
                    </CardFooter>
                </Card>

                {/* Modal de edición */}
                <Modal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    title="Editar Perfil"
                    size="md"
                    footer={
                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="outline"
                                onClick={() => setIsEditModalOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleSaveProfile}
                            >
                                Guardar Cambios
                            </Button>
                        </div>
                    }
                >
                    <div className="space-y-4">
                        <Input
                            label="Nombre Completo"
                            type="text"
                            value={editForm.fullName}
                            onChange={(e) =>
                                setEditForm({ ...editForm, fullName: e.target.value })
                            }
                            placeholder="Ingresa tu nombre completo"
                            required
                        />

                        <Input
                            label="Teléfono"
                            type="tel"
                            value={editForm.phoneNumber ?? ''}
                            onChange={(e) =>
                                setEditForm({ ...editForm, phoneNumber: e.target.value || null })
                            }
                            placeholder="+34 123 456 789"
                            helperText="Opcional"
                        />
                    </div>
                </Modal>
            </div>
        </div>
        </ProtectedRoute>
    )
}

