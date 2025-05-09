// Script que se ejecuta después de la construcción para reemplazar 
// los placeholders en env-config.js con valores reales

const fs = require('fs');
const path = require('path');

// Ruta al archivo de configuración de entorno en la carpeta dist
const envConfigPath = path.join(__dirname, '../dist/env-config.js');

// Leer el contenido actual del archivo
let envConfigContent;
try {
  envConfigContent = fs.readFileSync(envConfigPath, 'utf8');
  console.log('✅ Archivo env-config.js encontrado en dist');
} catch (error) {
  // Si el archivo no existe, copiarlo de public a dist
  console.log('⚠️ env-config.js no encontrado en dist, copiando desde public...');
  const publicEnvConfigPath = path.join(__dirname, '../public/env-config.js');
  try {
    envConfigContent = fs.readFileSync(publicEnvConfigPath, 'utf8');
    console.log('✅ Archivo env-config.js encontrado en public');
  } catch (publicError) {
    console.error('❌ No se encontró env-config.js ni en dist ni en public');
    process.exit(1);
  }
}

// Reemplazar placeholders con valores reales
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

console.log(`🔧 Configurando variables de entorno: 
- VITE_SUPABASE_URL: ${supabaseUrl ? supabaseUrl.substring(0, 20) + '...' : 'no definida'}
- VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? 'definida (longitud: ' + supabaseAnonKey.length + ')' : 'no definida'}`);

// Reemplazar los placeholders
let updatedContent = envConfigContent;
updatedContent = updatedContent.replace(/["']%%VITE_SUPABASE_URL%%["']/g, JSON.stringify(supabaseUrl));
updatedContent = updatedContent.replace(/["']%%VITE_SUPABASE_ANON_KEY%%["']/g, JSON.stringify(supabaseAnonKey));

// Guardar el archivo actualizado
try {
  fs.writeFileSync(envConfigPath, updatedContent, 'utf8');
  console.log('✅ Archivo env-config.js actualizado con éxito');
} catch (writeError) {
  console.error('❌ Error al escribir env-config.js:', writeError);
  process.exit(1);
}

// Asegurarse de que el archivo index.html incluya el script
const indexHtmlPath = path.join(__dirname, '../dist/index.html');
try {
  let indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
  
  // Verificar si ya existe el script
  if (!indexHtmlContent.includes('env-config.js')) {
    console.log('⚠️ Agregando referencia a env-config.js en index.html...');
    
    // Insertar el script antes de la primera etiqueta script existente
    const scriptTag = '<script src="/env-config.js"></script>';
    
    // Reemplazar justo después de la etiqueta head
    indexHtmlContent = indexHtmlContent.replace('<head>', '<head>\n    ' + scriptTag);
    
    // Guardar el archivo actualizado
    fs.writeFileSync(indexHtmlPath, indexHtmlContent, 'utf8');
    console.log('✅ Referencia a env-config.js agregada a index.html');
  } else {
    console.log('✅ Referencia a env-config.js ya existe en index.html');
  }
} catch (indexError) {
  console.error('❌ Error al modificar index.html:', indexError);
  // No salir con error ya que esto no es fatal
}

console.log('✅ Proceso de postbuild completado con éxito'); 