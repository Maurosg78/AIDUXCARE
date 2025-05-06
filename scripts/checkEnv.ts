import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno desde .env.local
config({ path: path.resolve(__dirname, '../.env.local') });

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'LANGFUSE_PUBLIC_KEY',
  'LANGFUSE_SECRET_KEY',
  'VITE_API_BASE_URL'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('\n❌ Error: Variables de entorno faltantes:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\nPor favor, agrega estas variables a tu archivo .env.local\n');
  process.exit(1);
}

console.log('🔧 Vite Config - Environment Check:', {
  mode: process.env.NODE_ENV || 'development',
  hasPublicKey: !!process.env.LANGFUSE_PUBLIC_KEY,
  hasSecretKey: !!process.env.LANGFUSE_SECRET_KEY,
  hasBaseUrl: !!process.env.VITE_API_BASE_URL
}); 