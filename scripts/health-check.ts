import axios from 'axios';

const ENDPOINTS = {
  LOGIN: 'https://aiduxcare-test.vercel.app/login',
  EMR: 'https://aiduxcare-test.vercel.app/dashboard/emr',
  FEEDBACK: 'https://aiduxcare-test.vercel.app/dashboard/feedback'
};

const TEST_USERS = [
  { email: 'laura@clinicatest.com', password: 'Test1234!' },
  { email: 'jose@valenciamed.com', password: 'Test1234!' },
  { email: 'ines@movsalud.es', password: 'Test1234!' }
];

const LANGFUSE_API = {
  BASE_URL: 'https://cloud.langfuse.com/api/public',
  PUBLIC_KEY: process.env.LANGFUSE_PUBLIC_KEY || '',
  SECRET_KEY: process.env.LANGFUSE_SECRET_KEY || ''
};

async function checkEndpoint(url: string): Promise<boolean> {
  try {
    const response = await axios.get(url);
    return response.status === 200;
  } catch (error) {
    console.error(`Error checking ${url}:`, error);
    return false;
  }
}

async function checkUserLogin(credentials: typeof TEST_USERS[0]): Promise<boolean> {
  try {
    const response = await axios.post(`${ENDPOINTS.LOGIN}/api/auth`, credentials);
    return response.status === 200;
  } catch (error) {
    console.error(`Error logging in ${credentials.email}:`, error);
    return false;
  }
}

async function checkLangfuseEvents(): Promise<boolean> {
  try {
    const now = new Date();
    const yesterday = new Date(now.setDate(now.getDate() - 1));
    
    const response = await axios.get(`${LANGFUSE_API.BASE_URL}/events`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${LANGFUSE_API.PUBLIC_KEY}:${LANGFUSE_API.SECRET_KEY}`).toString('base64')}`,
        'Content-Type': 'application/json'
      },
      params: {
        startTime: yesterday.toISOString(),
        endTime: new Date().toISOString()
      }
    });

    if (response.status !== 200) {
      throw new Error(`Langfuse API returned status ${response.status}`);
    }

    const events = response.data.events || [];
    const requiredEvents = ['form.update', 'feedback.submitted', 'login.success'];
    const foundEvents = new Set(events.map((e: { name: string }) => e.name));
    
    return requiredEvents.every(event => foundEvents.has(event));
  } catch (error) {
    console.error('Error checking Langfuse events:', error);
    return false;
  }
}

async function runHealthCheck() {
  console.log('🏥 Iniciando revisión del sistema AiDuxCare...');

  // 1. Verificar endpoints
  console.log('\n📡 Verificando endpoints...');
  for (const [name, url] of Object.entries(ENDPOINTS)) {
    const isUp = await checkEndpoint(url);
    console.log(`${isUp ? '✅' : '❌'} ${name}: ${url}`);
  }

  // 2. Verificar login de usuarios
  console.log('\n👥 Verificando acceso de usuarios...');
  for (const user of TEST_USERS) {
    const canLogin = await checkUserLogin(user);
    console.log(`${canLogin ? '✅' : '❌'} ${user.email}`);
  }

  // 3. Verificar eventos de Langfuse
  console.log('\n📊 Verificando eventos de tracking...');
  const hasEvents = await checkLangfuseEvents();
  console.log(`${hasEvents ? '✅' : '❌'} Eventos requeridos en las últimas 24h`);

  // 4. Resumen
  console.log('\n📋 Resumen de la revisión:');
  const allChecks = [
    Object.values(ENDPOINTS).every(url => checkEndpoint(url)),
    TEST_USERS.every(user => checkUserLogin(user)),
    hasEvents
  ];

  const allPassing = allChecks.every(check => check);
  console.log(`Estado general: ${allPassing ? '✅ SALUDABLE' : '❌ REQUIERE ATENCIÓN'}`);

  // 5. Notificar si hay problemas
  if (!allPassing) {
    console.error('⚠️ Se detectaron problemas que requieren atención');
    process.exit(1);
  }
}

// Ejecutar el health check
runHealthCheck().catch(error => {
  console.error('Error ejecutando health check:', error);
  process.exit(1);
}); 