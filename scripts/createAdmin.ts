import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Cargar variables de entorno desde .env.override.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.override.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variables de entorno de Supabase no encontradas')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createAdminUser() {
  const email = 'admin@gmail.com'
  const password = 'AiDuxAdmin2024#' // Contraseña segura con mayúsculas, números y caracteres especiales

  try {
    // 1. Registrar el usuario
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      throw signUpError
    }

    console.log('✅ Usuario creado exitosamente:', authData)

    // 2. Actualizar el rol en la tabla profiles
    if (authData.user) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', authData.user.id)

      if (updateError) {
        throw updateError
      }

      console.log('✅ Rol de administrador asignado correctamente')
    }

    console.log('\n📧 Credenciales de acceso:')
    console.log('Email:', email)
    console.log('Contraseña:', password)
    console.log('\n⚠️ Por favor, guarda estas credenciales en un lugar seguro.')

  } catch (error) {
    console.error('❌ Error al crear el usuario administrador:', error)
  }
}

createAdminUser() 