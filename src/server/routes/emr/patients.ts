throw new Error('💥 TEST: import de patients.ts fue ejecutado');
console.log('🧩 Importación de patients.ts confirmada');
import { Router } from 'express';

console.log('📦 Archivo patients.ts evaluado al importar');

const router = Router();

router.get('/', (req, res) => {
  console.log('🧪 Ruta /api/patients activada');
  res.json({ success: true, message: 'Ruta mínima activa' });
});

console.log('✅ Router de /api/patients cargado');

export default router;
