import fetch from 'node-fetch';

const ENDPOINTS = [
  'https://aiduxcare-gbxte11qp-mauricio-sobarzos-projects.vercel.app/api/health',
  'https://aiduxcare-gbxte11qp-mauricio-sobarzos-projects.vercel.app/api/auth/session',
  'https://aiduxcare-gbxte11qp-mauricio-sobarzos-projects.vercel.app/api/emr/stats'
];

const TEST_CREDENTIALS = {
  email: 'laura@clinicatest.com',
  password: 'Test1234!'
};

async function checkEndpoint(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    console.log(`✅ ${url} - OK (${response.status})`);
    return true;
  } catch (error) {
    console.error(`❌ ${url} - Failed: ${(error as Error).message}`);
    return false;
  }
}

async function runHealthCheck() {
  console.log('\n🔍 Iniciando health check de AiDuxCare...\n');

  let allPassed = true;

  // Verificar endpoints
  console.log('🌐 Verificando endpoints...');
  for (const endpoint of ENDPOINTS) {
    const passed = await checkEndpoint(endpoint);
    if (!passed) allPassed = false;
  }

  // Verificar login
  console.log('\n👤 Verificando login...');
  try {
    const loginResponse = await fetch('https://aiduxcare-gbxte11qp-mauricio-sobarzos-projects.vercel.app/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TEST_CREDENTIALS),
    });

    if (loginResponse.ok) {
      console.log('✅ Login exitoso');
    } else {
      console.log('❌ Error en login:', loginResponse.status);
      allPassed = false;
    }
  } catch (error) {
    console.error('❌ Error en login:', (error as Error).message);
    allPassed = false;
  }

  // Resumen final
  console.log('\n📋 Resumen de la revisión:');
  console.log(`Estado general: ${allPassed ? '✅ OK' : '❌ REQUIERE ATENCIÓN'}`);
  if (!allPassed) {
    console.log('⚠️ Se detectaron problemas que requieren atención');
  }
}

runHealthCheck().catch(console.error); 