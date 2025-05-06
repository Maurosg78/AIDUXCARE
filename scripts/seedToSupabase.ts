import { patientsSeed } from '../src/core/data/seed/realPatientsSeed';
import { visitsSeed } from '../src/core/data/seed/realVisitsSeed';
import supabase from '../src/core/lib/supabaseClient';

async function seedDatabase() {
  console.log('🌱 Iniciando migración de datos a Supabase...\n');

  try {
    // Limpiar tablas existentes
    console.log('🧹 Limpiando tablas existentes...');
    await supabase.from('visits').delete().neq('id', '');
    await supabase.from('patients').delete().neq('id', '');
    console.log('✅ Tablas limpiadas\n');

    // Insertar pacientes
    console.log('👥 Insertando pacientes...');
    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .insert(patientsSeed)
      .select();

    if (patientsError) {
      throw new Error(`Error al insertar pacientes: ${patientsError.message}`);
    }
    console.log(`✅ ${patients?.length || 0} pacientes insertados\n`);

    // Insertar visitas
    console.log('📋 Insertando visitas...');
    const { data: visits, error: visitsError } = await supabase
      .from('visits')
      .insert(visitsSeed)
      .select();

    if (visitsError) {
      throw new Error(`Error al insertar visitas: ${visitsError.message}`);
    }
    console.log(`✅ ${visits?.length || 0} visitas insertadas\n`);

    console.log('🎉 Migración completada exitosamente!');
    
    // Mostrar resumen
    console.log('\n📊 Resumen de la migración:');
    console.log(`- Pacientes migrados: ${patients?.length || 0}`);
    console.log(`- Visitas migradas: ${visits?.length || 0}`);
    
  } catch (error) {
    console.error('\n❌ Error durante la migración:', error);
    process.exit(1);
  }
}

// Ejecutar la migración
seedDatabase(); 