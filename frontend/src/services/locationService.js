import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Obtener token de autenticación
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { 'x-auth-token': token };
};

export const locationService = {
  // Obtener todas las ubicaciones (solo admin)
  getAllLocations: async () => {
    const response = await axios.get(`${API_URL}/api/locations`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  // Obtener ubicaciones activas (para empleados)
  getActiveLocations: async () => {
    const response = await axios.get(`${API_URL}/api/locations/active`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  // Crear nueva ubicación (solo admin)
  createLocation: async (locationData) => {
    const response = await axios.post(`${API_URL}/api/locations`, locationData, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  // Actualizar ubicación (solo admin)
  updateLocation: async (id, locationData) => {
    const response = await axios.put(`${API_URL}/api/locations/${id}`, locationData, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  // Eliminar ubicación (solo admin)
  deleteLocation: async (id) => {
    const response = await axios.delete(`${API_URL}/api/locations/${id}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  // Calcular distancia entre dos puntos
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  },

  // Verificar si está dentro del radio permitido
  isWithinRadius: (userLat, userLon, centerLat, centerLon, radius) => {
    const distance = locationService.calculateDistance(userLat, userLon, centerLat, centerLon);
    return distance <= radius;
  },

  // Obtener ubicación actual del navegador
  getCurrentLocation: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('La geolocalización no está disponible en este navegador'));
        return;
      }

      console.log('📍 Configurando opciones de geolocalización...');
      
      const options = {
        enableHighAccuracy: false, // No necesitamos alta precisión
        timeout: 15000, // 15 segundos de timeout
        maximumAge: 300000 // 5 minutos de cache
      };

      console.log('📍 Opciones de geolocalización:', options);
      console.log('📍 Iniciando getCurrentPosition...');

      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('📍 Posición obtenida exitosamente:', position);
          console.log('📍 Coordenadas:', position.coords.latitude, position.coords.longitude);
          console.log('📍 Precisión:', position.coords.accuracy, 'metros');
          
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.error('📍 Error en getCurrentPosition:', error);
          console.error('📍 Código de error:', error.code);
          console.error('📍 Mensaje de error:', error.message);
          reject(error);
        },
        options
      );
    });
  }
};
