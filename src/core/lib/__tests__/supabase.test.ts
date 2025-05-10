import { describe, it, expect } from 'vitest';
import supabase from '../supabaseClient';

describe('Conexión Supabase', () => {
  it('debería tener las variables de entorno configuradas', () => {
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined();
    expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined();
  });

  it('debería poder conectarse a Supabase', async () => {
    const { data, error } = await supabase.auth.getSession();
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
}); 