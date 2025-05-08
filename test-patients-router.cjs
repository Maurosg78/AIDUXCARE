const express = require('express');
const cors = require('cors');
const app = express();
const port = 3333;

app.use(cors());
app.use(express.json());

// Importar el router de patients
const patientsRouter = require('./routes/patients.cjs');

// Usar el router
app.use('/api/patients', patientsRouter);

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor de prueba corriendo en http://localhost:${port}`);
}); 