import { jwtDecode } from 'jwt-decode';

export const getToken = () => localStorage.getItem('token');

export const getUserRole = () => {
  const token = getToken();
  return token ? jwtDecode(token).role : null;
};

export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;
  
  try {
    const { exp } = jwtDecode(token);
    return exp * 1000 > Date.now();
  } catch {
    return false;
  }
};