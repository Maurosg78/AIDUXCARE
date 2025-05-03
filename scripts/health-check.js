import fetch from 'node-fetch';

const ENDPOINTS = [
  'https://aiduxcare-test.vercel.app/api/health',
  'https://aiduxcare-test.vercel.app/api/auth/session',
  'https://aiduxcare-test.vercel.app/api/emr/stats'
];

const TEST_CREDENTIALS = {
  email: 'laura@clinicatest.com',
  password: 'Test1234!'
};

async function checkEndpoint(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    console.log(`✅ ${url} - OK (${response.status})`);
    return true;
  } catch (error) {
    console.error(`❌ ${url} - Failed: ${error.message}`);
    return false;
  }
}

async function runHealthCheck() {
  console.log('🏥 Running AiDuxCare Health Check...\n');
  
  const results = await Promise.all(ENDPOINTS.map(checkEndpoint));
  const allPassed = results.every(result => result === true);
  
  console.log('\n=== Health Check Summary ===');
  console.log(`Total Endpoints: ${ENDPOINTS.length}`);
  console.log(`Passed: ${results.filter(r => r).length}`);
  console.log(`Failed: ${results.filter(r => !r).length}`);
  
  if (!allPassed) {
    console.error('\n❌ Health check failed!');
    process.exit(1);
  }
  
  console.log('\n✅ All systems operational!');
  process.exit(0);
}

runHealthCheck().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 