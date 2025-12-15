## **REGLAS DE NEGOCIO - BARBER API**

**ROLES DEL SISTEMA**

1. Client (Cliente) - Valor: 1
2. Barber (Barbero) - Valor: 2
3. Admin (Administrador) - Valor: 3

---

## **AUTENTICACIÓN Y AUTORIZACIÓN**

### **Endpoints públicos (sin autenticación)**

- POST /auth/login - Login
- POST /auth/register - Registro (solo crea usuarios con rol Client)
- POST /auth/google/login - Login con Google
- GET /haircuts - Listar servicios
- GET /appointments/availability - Ver horarios disponibles
- POST /appointments - Crear cita (público)
- GET /users/{id} - Ver perfil de usuario
- POST /users/create-staff - Crear staff (público, pero debería estar protegido)

### **Endpoints que requieren autenticación ([Authorize])**

- GET /users/profile - Perfil del usuario autenticado
- PUT /users/{id} - Actualizar usuario
- PUT /users/{id}/upload-photo - Subir foto
- GET /appointments/all - Listar citas
- GET /appointments/filter - Filtrar citas
- PUT /appointments/payment-status - Actualizar estado de pago
- DELETE /appointments/{id} - Cancelar cita
- PUT /appointments/{id}/complete - Completar cita

### **Endpoints con políticas especiales**

- PUT /appointments/{id} - Requiere política OwnerOrAdmin
- Admin: puede actualizar cualquier cita
- Cliente: solo sus propias citas
- Barbero: solo citas asignadas a él

---

## **REGLAS DE NEGOCIO POR MÓDULO**

**1. AUTENTICACIÓN (/auth)**

### Registro (POST /auth/register)

- Crea usuarios con rol Client
- Retorna token JWT automáticamente
- No requiere autenticación

### Login (POST /auth/login)

- Retorna: token, fullName, role
- El token debe enviarse en header: Authorization: Bearer {token}

---

**2. USUARIOS (/users)**

### Crear Staff (POST /users/create-staff)

- Público (debería estar protegido)
- Permite crear usuarios con roles: "Client", "Barber", "Admin"
- Valida que el email no exista

### Obtener Perfil (GET /users/profile)

- Requiere autenticación
- Retorna el perfil del usuario autenticado
- Cualquier usuario autenticado puede ver su propio perfil

### Actualizar Usuario (PUT /users/{id})

- Requiere autenticación
- No hay validación de permisos en el controlador (revisar)
- Solo actualiza: fullName y phoneNumber

### Subir Foto (PUT /users/{id}/upload-photo)

- Requiere autenticación
- No hay validación de permisos (cualquier usuario puede subir foto de cualquier usuario)

---

**3. CITAS (/appointments)**

### Crear Cita (POST /appointments)

- Público (no requiere autenticación)
- Validaciones:
- Cliente debe existir y estar activo
- Barbero debe existir, ser rol "Barber" y estar activo
- Servicio (haircut) debe existir
- Fecha no puede ser en el pasado
- No puede haber conflicto de horarios con otras citas del barbero
- Estado inicial: Status = Pending, PaymentStatus = Pending
- Envía emails al cliente y al barbero

### Ver Disponibilidad (GET /appointments/availability)

- Público
- Parámetros: barberId, date, haircutId
- Horario de trabajo: 9:00 AM - 6:00 PM
- Intervalos de 30 minutos
- Excluye horarios ocupados y horas pasadas (si es hoy)

### Actualizar Cita (PUT /appointments/{id})

- Requiere política OwnerOrAdmin
- Permisos:
- Admin: puede actualizar cualquier cita
- Cliente: solo sus propias citas
- Barbero: solo citas asignadas a él
- Validaciones:
- No se puede modificar si Status = Completed
- No se puede modificar si Status = Canceled
- Nueva fecha no puede ser en el pasado
- No puede haber conflicto de horarios

### Actualizar Estado de Pago (PUT /appointments/payment-status)

- Requiere autenticación
- Permisos:
- Cliente: solo sus propias citas
- Admin: cualquier cita
- Barbero: no puede cambiar estado de pago
- Validaciones:
- No se puede cambiar si Status = Canceled
- No se puede cambiar si Status = Completed
- Estados: 1 = Pending, 2 = Paid, 3 = Failed

### Cancelar Cita (DELETE /appointments/{id})

- Requiere autenticación
- Permisos:
- Cliente: solo sus propias citas
- Admin: cualquier cita
- Barbero: no puede cancelar citas
- Validaciones:
- No se puede cancelar si Status = Completed
- Si ya está cancelada, no hace nada (idempotente)

### Completar Cita (PUT /appointments/{id}/complete)

- Requiere autenticación
- Permisos:
- Barbero: solo citas asignadas a él
- Admin: cualquier cita
- Cliente: no puede completar citas
- Validaciones:
- No se puede completar si ya está completada
- No se puede completar si está cancelada

### Listar Todas las Citas (GET /appointments/all)

- Requiere autenticación
- Filtrado por rol:
- Client: solo sus citas (ClientId = userId)
- Barber: solo citas asignadas (BarberId = userId)
- Admin: todas las citas

### Filtrar Citas (GET /appointments/filter)

- Requiere autenticación
- Aplica el mismo filtrado por rol que /all
- Filtros opcionales (query parameters):
- barberId - Filtrar por barbero
- clientId - Filtrar por cliente
- date - Filtrar por fecha (yyyy-MM-dd)
- status - Filtrar por estado (1-4)
- paymentStatus - Filtrar por estado de pago (1-3)
- hairCutId - Filtrar por servicio

---

## **ESTADOS Y ENUMS**

### **AppointmentStatus (Estado de Cita)**

- 1 = Pending - Pendiente
- 2 = Confirmed - Confirmada
- 3 = Completed - Completada
- 4 = Canceled - Cancelada

### **PaymentStatus (Estado de Pago)**

- 1 = Pending - Pendiente
- 2 = Paid - Pagado
- 3 = Failed - Fallido

### **UserRole (Rol de Usuario)**

- 1 = Client - Cliente
- 2 = Barber - Barbero
- 3 = Admin - Administrador

---

## **REGLAS DE VISUALIZACIÓN PARA EL FRONTEND**

**Vistas según rol**

### Cliente (Client)

- Ver:
- Su perfil (/users/profile)
- Sus citas (/appointments/all)
- Servicios disponibles (/haircuts)
- Horarios disponibles (/appointments/availability)
- Acciones:
- Crear citas (POST /appointments)
- Cancelar sus citas (DELETE /appointments/{id})
- Actualizar su perfil (PUT /users/{id})
- Actualizar estado de pago de sus citas (PUT /appointments/payment-status)
- No puede:
- Completar citas
- Ver citas de otros clientes
- Actualizar citas de otros

### Barbero (Barber)

- Ver:
- Su perfil
- Sus citas asignadas (/appointments/all - filtrado automático)
- Servicios disponibles
- Acciones:
- Completar sus citas asignadas (PUT /appointments/{id}/complete)
- Actualizar su perfil
- Actualizar citas asignadas a él (PUT /appointments/{id})
- No puede:
- Cancelar citas
- Cambiar estado de pago
- Ver citas de otros barberos (excepto admin)

### Administrador (Admin)

- Ver:
- Todas las citas (/appointments/all)
- Perfiles de usuarios
- Servicios
- Acciones:
- Actualizar cualquier cita (PUT /appointments/{id})
- Cancelar cualquier cita (DELETE /appointments/{id})
- Completar cualquier cita (PUT /appointments/{id}/complete)
- Cambiar estado de pago de cualquier cita (PUT /appointments/payment-status)
- Crear usuarios del staff (POST /users/create-staff)
- Filtrar citas con todos los parámetros

---

## **VALIDACIONES IMPORTANTES PARA EL FRONTEND**

### **Al crear una cita**

- Validar que la fecha no sea en el pasado
- Mostrar solo horarios disponibles del barbero seleccionado
- Validar que cliente y barbero estén activos

### **Al actualizar una cita**

- Ocultar botón si Status = Completed o Status = Canceled
- Validar permisos antes de mostrar opción de editar
- Mostrar solo horarios disponibles

### **Al cancelar una cita**

- Ocultar botón si Status = Completed
- Mostrar confirmación antes de cancelar

### **Al completar una cita**

- Solo visible para barberos (sus citas) y admins
- Ocultar si Status = Canceled o Status = Completed

### **Al cambiar estado de pago**

- Solo visible para clientes (sus citas) y admins
- Ocultar si Status = Canceled o Status = Completed

---

## **RECOMENDACIONES PARA EL FRONTEND**

1. Guardar el token JWT en localStorage/sessionStorage
2. Incluir el token en todas las peticiones: Authorization: Bearer {token}
3. Ocultar/mostrar botones según el rol del usuario
4. Validar permisos antes de mostrar opciones de edición
5. Mostrar mensajes de error claros según las validaciones del backend
6. Filtrar citas según el rol automáticamente
7. Mostrar estados de citas con colores/iconos diferenciados