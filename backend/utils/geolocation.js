/**
 * Calcula la distancia entre dos puntos geográficos usando la fórmula de Haversine
 * @param {number} lat1 - Latitud del primer punto
 * @param {number} lon1 - Longitud del primer punto
 * @param {number} lat2 - Latitud del segundo punto
 * @param {number} lon2 - Longitud del segundo punto
 * @returns {number} Distancia en metros
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
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
};

/**
 * Verifica si un usuario está dentro del radio permitido
 * @param {number} userLat - Latitud del usuario
 * @param {number} userLon - Longitud del usuario
 * @param {number} centerLat - Latitud del centro permitido
 * @param {number} centerLon - Longitud del centro permitido
 * @param {number} radius - Radio permitido en metros
 * @returns {boolean} true si está dentro del radio, false en caso contrario
 */
const isWithinRadius = (userLat, userLon, centerLat, centerLon, radius) => {
  const distance = calculateDistance(userLat, userLon, centerLat, centerLon);
  return distance <= radius;
};

/**
 * Valida que las coordenadas sean válidas
 * @param {number} latitude - Latitud
 * @param {number} longitude - Longitud
 * @returns {boolean} true si las coordenadas son válidas
 */
const isValidCoordinates = (latitude, longitude) => {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    latitude >= -90 && latitude <= 90 &&
    longitude >= -180 && longitude <= 180
  );
};

module.exports = {
  calculateDistance,
  isWithinRadius,
  isValidCoordinates
};
