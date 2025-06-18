import axios from 'axios';

const API_URL = 'http://localhost:5000/api/admin';

// Helper para configurar headers con token
const getAuthHeaders = (token) => ({
  headers: { 'x-auth-token': token }
});

export const adminService = {
  // Obtener todos los usuarios
  getUsers: async (token) => {
    try {
      const response = await axios.get(`${API_URL}/users`, getAuthHeaders(token));
      return response.data;
    } catch (error) {
      console.error('Error al obtener usuarios:', error.response?.data?.message || error.message);
      throw error;
    }
  },

  // Crear nuevo usuario
  createUser: async (userData, token) => {
    try {
      const response = await axios.post(
        `${API_URL}/users`,
        userData,
        getAuthHeaders(token)
      );
      return response.data;
    } catch (error) {
      console.error('Error al crear usuario:', error.response?.data?.message || error.message);
      throw error;
    }
  },

  // Actualizar usuario
  updateUser: async (user, userData, token) => {
    try {
      const response = await axios.put(
        `${API_URL}/users/${user}`,
        userData,
        getAuthHeaders(token)
      );
      return response.data;
    } catch (error) {
      console.error('Error al actualizar usuario:', error.response?.data?.message || error.message);
      throw error;
    }
  },

  // Eliminar usuario
  deleteUser: async (user, token) => {
    try {
      const response = await axios.delete(
        `${API_URL}/users/${user}`,
        getAuthHeaders(token)
      );
      return response.data;
    } catch (error) {
      console.error('Error al eliminar usuario:', error.response?.data?.message || error.message);
      throw error;
    }
  },

  // Obtener estadísticas
  getStats: async (token) => {
    try {
      const response = await axios.get(`${API_URL}/stats`, getAuthHeaders(token));
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error.response?.data?.message || error.message);
      throw error;
    }
  }
};