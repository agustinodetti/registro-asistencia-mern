# Funcionalidad de Geolocalización - Sistema de Asistencia

## Descripción

Se ha implementado una funcionalidad completa de verificación de geolocalización para el sistema de registro de asistencia. Esta característica permite que los empleados solo puedan registrar asistencia cuando se encuentren dentro de un radio de coordenadas permitidas.

## Características Implementadas

### ✅ Funcionalidades Completadas

1. **Verificación de Ubicación en Tiempo Real**
   - Los empleados deben estar dentro de un radio de 20 metros para registrar asistencia
   - Validación tanto en frontend como backend para mayor seguridad
   - Indicadores visuales que muestran el estado de la ubicación

2. **Gestión de Ubicaciones por Administradores**
   - Panel de administración para crear, editar y eliminar ubicaciones permitidas
   - Soporte para múltiples ubicaciones (diferentes oficinas)
   - Configuración de radio personalizable por ubicación

3. **Configuración por Usuario**
   - Posibilidad de desactivar la verificación de ubicación para usuarios específicos
   - Asignación de ubicaciones específicas a usuarios

4. **Interfaz de Usuario Mejorada**
   - Indicadores visuales con colores (verde/rojo) para mostrar el estado de ubicación
   - Mensajes de error personalizados
   - Botón de reintento para obtener ubicación

5. **Almacenamiento de Datos**
   - Las coordenadas del usuario se guardan en cada registro de asistencia
   - Información de la ubicación permitida utilizada para la validación

## Configuración Inicial

### Ubicación por Defecto

El sistema se inicializa automáticamente con una ubicación por defecto:
- **Latitud**: -32.81264055956888
- **Longitud**: -63.87487595198708
- **Radio**: 20 metros
- **Nombre**: "Oficina Principal"

### Estructura de Base de Datos

Se han agregado los siguientes modelos:

1. **Location** - Para gestionar ubicaciones permitidas
2. **Attendance** - Actualizado para incluir coordenadas del usuario
3. **User** - Actualizado para configuraciones de geolocalización

## Uso del Sistema

### Para Empleados

1. **Acceso a la Página de Asistencia**
   - Navegar a `/employee/attendance`
   - El sistema solicitará permisos de ubicación automáticamente

2. **Indicadores de Estado**
   - **Verde**: Ubicación permitida - Puede registrar asistencia
   - **Rojo**: Fuera del área permitida - No puede registrar asistencia
   - **Amarillo**: Error de ubicación - Hacer clic en "Reintentar"

3. **Registro de Asistencia**
   - Los botones se habilitan solo cuando la ubicación es válida
   - Las coordenadas se envían automáticamente con cada registro

### Para Administradores

1. **Gestión de Ubicaciones**
   - Navegar a `/admin/locations`
   - Crear, editar y eliminar ubicaciones permitidas
   - Configurar radio de cada ubicación

2. **Configuración de Usuarios**
   - En la gestión de usuarios, configurar si requiere verificación de ubicación
   - Asignar ubicaciones específicas a usuarios

## API Endpoints

### Ubicaciones (Solo Admin)
- `GET /api/locations` - Obtener todas las ubicaciones
- `POST /api/locations` - Crear nueva ubicación
- `PUT /api/locations/:id` - Actualizar ubicación
- `DELETE /api/locations/:id` - Eliminar ubicación

### Ubicaciones Activas (Empleados)
- `GET /api/locations/active` - Obtener ubicaciones activas

### Asistencia (Actualizado)
- `POST /api/attendance/register` - Ahora incluye coordenadas del usuario

## Configuración Técnica

### Frontend
- **Servicio de Ubicaciones**: `frontend/src/services/locationService.js`
- **Componente de Asistencia**: `frontend/src/pages/employee/Attendance.js`
- **Panel de Administración**: `frontend/src/pages/admin/Locations.js`

### Backend
- **Modelo de Ubicación**: `backend/models/Location.js`
- **Utilidades de Geolocalización**: `backend/utils/geolocation.js`
- **Rutas de Ubicación**: `backend/routes/location.js`
- **Inicialización**: `backend/utils/initDefaultLocation.js`

## Mensajes de Error

### Errores de Ubicación
- **"Ubicación actual fuera del radio habilitado. Por favor intente nuevamente en proximidad al local"** - Usuario fuera del área permitida
- **"Permiso de ubicación denegado"** - Usuario no permitió acceso a ubicación
- **"Tiempo de espera agotado"** - No se pudo obtener ubicación en el tiempo límite

### Errores de Configuración
- **"No hay ubicaciones permitidas configuradas"** - No hay ubicaciones activas en el sistema
- **"Coordenadas de ubicación inválidas"** - Las coordenadas proporcionadas no son válidas

## Consideraciones de Seguridad

1. **Validación Doble**: Verificación tanto en frontend como backend
2. **Almacenamiento Seguro**: Las coordenadas se almacenan de forma segura
3. **Permisos de Usuario**: Solo administradores pueden gestionar ubicaciones
4. **Validación de Coordenadas**: Verificación de que las coordenadas sean válidas

## Personalización

### Cambiar Radio por Defecto
Editar en `backend/utils/initDefaultLocation.js`:
```javascript
radius: 20 // Cambiar por el radio deseado en metros
```

### Cambiar Mensajes de Error
Editar en `backend/routes/attendance.js`:
```javascript
message: 'Ubicación actual fuera del radio habilitado. Por favor intente nuevamente en proximidad al local'
```

### Configurar Tiempo de Espera
Editar en `frontend/src/services/locationService.js`:
```javascript
timeout: 10000, // Cambiar por el tiempo deseado en milisegundos
```

## Próximas Mejoras Sugeridas

1. **Mapa Interactivo**: Mostrar ubicación actual vs ubicación permitida
2. **Múltiples Ubicaciones por Usuario**: Permitir que un usuario pueda registrar en diferentes ubicaciones
3. **Historial de Ubicaciones**: Ver ubicaciones donde se registró asistencia
4. **Notificaciones Push**: Alertar cuando el usuario está cerca del área permitida
5. **Modo Offline**: Permitir registro sin conexión y sincronizar después

## Soporte

Para cualquier problema o consulta sobre la funcionalidad de geolocalización, revisar:
1. Los logs del navegador para errores de JavaScript
2. Los logs del servidor para errores de backend
3. La configuración de permisos de ubicación del navegador
4. La conectividad GPS del dispositivo
