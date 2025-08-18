const Location = require('../models/Location');

const initDefaultLocation = async () => {
  try {
    // Verificar si ya existe una ubicación por defecto
    const existingLocation = await Location.findOne({ name: 'Oficina Principal' });
    
    if (!existingLocation) {
      // Crear ubicación por defecto con las coordenadas proporcionadas
      const defaultLocation = new Location({
        name: 'Oficina Principal',
        latitude: -32.81264055956888,
        longitude: -63.87487595198708,
        radius: 20, // 20 metros como especificado
        isActive: true
      });

      await defaultLocation.save();
      console.log('✅ Ubicación por defecto creada:', defaultLocation.name);
    } else {
      console.log('ℹ️  Ubicación por defecto ya existe');
    }
  } catch (error) {
    console.error('❌ Error al inicializar ubicación por defecto:', error);
  }
};

module.exports = initDefaultLocation;
