# Registro de Asistencia - MERN Stack

Aplicación web para registrar ingresos/egresos de empleados.

## 🚀 Instalación

### Backend
```bash
cd backend
npm install
cp env.example .env  # Configura tus variables
node server.js
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## 🔧 Variables de Entorno
- `MONGODB_URI`: Conexión a MongoDB Atlas.
- `JWT_SECRET`: Clave para tokens JWT.

## 📦 Dependencias
Backend: 
- Node.js
- Express
- Mongoose (y MongoDB Atlas)
- JWT (jsonwebtoken)
- bcryptjs (encriptación de contraseñas)
- dotenv (variables de entorno)
- CORS (middleware)
- Geolocalización (cálculo propio y validación de radio)
- Servicio de despliegue Render

Frontend: 
- React
- React Router
- Axios
- Material-UI (MUI) (componentes visuales)
- date-fns (formateo y manipulación de fechas)
- ESLint (linter para código limpio)
- XLSX + file-saver (exportación a Excel)
- Estilos en CSS y theme.js
