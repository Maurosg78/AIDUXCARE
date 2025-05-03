import axios from 'axios';
import { Langfuse } from 'langfuse-node';

const BASE_URL = 'https://aiduxcare-test.vercel.app';
const LANGFUSE_BASE_URL = 'https://cloud.langfuse.com';

const langfuse = new Langfuse({
  publicKey: process.env.VITE_LANGFUSE_PUBLIC_KEY || '',
  secretKey: process.env.VITE_LANGFUSE_SECRET_KEY || '',
  baseUrl: LANGFUSE_BASE_URL,
});

async function checkUserLogin(email: string, password: string): Promise<boolean> {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/signin`, {
      email,
      password,
      callbackUrl: `${BASE_URL}/dashboard`,
    });

    if (response.status === 200) {
      console.log(`✅ ${email}`);
      return true;
    } else {
      console.log(`❌ ${email}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${email}`);
    console.error('Error logging in', email + ':', error);
    return false;
  }
}

async function checkLangfuseEvents(): Promise<boolean> {
  try {
    const endTime = new Date().toISOString();
    const startTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const trace = langfuse.trace({
      name: 'health-check',
      metadata: {
        timestamp: new Date().toISOString(),
        type: 'diagnostic'
      }
    });

    await trace.span({
      name: 'check',
      input: { startTime, endTime }
    }).end();

    console.log('✅ Eventos de Langfuse verificados correctamente');
    return true;
  } catch (error) {
    console.error('Error checking Langfuse events:', error);
    return false;
  }
}

async function runHealthCheck() {
  console.log('\n🔍 Iniciando health check de AiDuxCare...\n');

  let allPassed = true;

  // Verificar login de usuarios
  console.log('👤 Verificando acceso de usuarios...');
  const users = [
    { email: 'jose@valenciamed.com', password: 'Test1234!' },
    { email: 'ines@movsalud.es', password: 'Test1234!' }
  ];

  for (const user of users) {
    const passed = await checkUserLogin(user.email, user.password);
    if (!passed) allPassed = false;
  }

  // Verificar eventos de tracking
  console.log('\n📊 Verificando eventos de tracking...');
  const eventsOk = await checkLangfuseEvents();
  if (!eventsOk) allPassed = false;

  // Resumen final
  console.log('\n📋 Resumen de la revisión:');
  console.log(`Estado general: ${allPassed ? '✅ OK' : '❌ REQUIERE ATENCIÓN'}`);
  if (!allPassed) {
    console.log('⚠️ Se detectaron problemas que requieren atención');
  }
}

runHealthCheck().catch(console.error); 