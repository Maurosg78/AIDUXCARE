import express from 'express';
import cors from 'cors';
import patientRoutes from './server/routes/api/patient';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rutas de la API
app.use('/api/patient', patientRoutes);

app.listen(port, () => {
  console.log(`🚀 API server corriendo en http://localhost:${port}`);
}); 