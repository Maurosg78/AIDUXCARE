/**
 * Módulo para gestión de tokens CSRF en el frontend
 * 
 * Proporciona funciones para obtener y gestionar tokens CSRF
 * que se utilizan en peticiones de mutación (POST, PUT, DELETE)
 */

import axios from 'axios';

// Almacén temporal para el token CSRF activo
let csrfToken: string | null = null;
let csrfExpiry: number | null = null;

// URL base para API MCP (configurable según entorno)
const MCP_BASE_URL = process.env.NEXT_PUBLIC_MCP_API_URL || 'http://localhost:8001';

/**
 * Obtiene un token CSRF del servidor
 * 
 * @returns Promise<string> Token CSRF
 */
export async function fetchCsrfToken(): Promise<string> {
  try {
    // Verificar si ya tenemos un token válido
    if (csrfToken && csrfExpiry && Date.now() < csrfExpiry) {
      return csrfToken;
    }
    
    // Obtener nuevo token del endpoint CSRF
    const response = await axios.get(`${MCP_BASE_URL}/api/csrf-token`, {
      withCredentials: true // Importante para recibir y enviar cookies
    });
    
    if (response.data?.token) {
      const token: string = response.data.token;
      csrfToken = token;
      
      // Calcular expiración (90% del tiempo total para renovar antes)
      const expiresInMs = (response.data.expires_in || 86400) * 1000 * 0.9;
      csrfExpiry = Date.now() + expiresInMs;
      
      return token;
    } else {
      throw new Error('No se pudo obtener token CSRF del servidor');
    }
  } catch (error) {
    console.error('Error al obtener token CSRF:', error);
    throw new Error('Error al obtener token CSRF');
  }
}

/**
 * Aplica el token CSRF a una instancia de Axios o a una configuración
 * 
 * @param config Configuración de Axios o instancia
 * @returns Promise<AxiosRequestConfig> Configuración con CSRF token
 */
export async function applyCsrfToken(config: any): Promise<any> {
  try {
    const token = await fetchCsrfToken();
    
    // Si es una instancia de Axios
    if (config.defaults && typeof config.defaults.headers === 'object') {
      config.defaults.headers['X-CSRF-Token'] = token;
      config.defaults.withCredentials = true;
      return config;
    }
    
    // Si es una configuración de petición
    if (!config.headers) {
      config.headers = {};
    }
    
    config.headers['X-CSRF-Token'] = token;
    config.withCredentials = true;
    
    return config;
  } catch (error) {
    console.error('Error al aplicar token CSRF:', error);
    return config; // Devolver config original si hay error
  }
}

/**
 * Crea un interceptor Axios para aplicar automáticamente tokens CSRF
 * 
 * @param axiosInstance Instancia de Axios
 */
export function setupCsrfInterceptor(axiosInstance: any): void {
  axiosInstance.interceptors.request.use(async (config: any) => {
    // Solo aplicar en métodos de mutación
    if (['post', 'put', 'delete', 'patch'].includes(config.method.toLowerCase())) {
      try {
        const token = await fetchCsrfToken();
        if (!config.headers) {
          config.headers = {};
        }
        config.headers['X-CSRF-Token'] = token;
        config.withCredentials = true;
      } catch (error) {
        console.error('Error en interceptor CSRF:', error);
      }
    }
    return config;
  });
}

/**
 * Crea una instancia de Axios con protección CSRF integrada
 * 
 * @param baseURL URL base para las peticiones
 * @returns Instancia de Axios configurada
 */
export function createCsrfProtectedAxios(baseURL: string): any {
  const instance = axios.create({
    baseURL,
    withCredentials: true
  });
  
  setupCsrfInterceptor(instance);
  
  return instance;
}

// Crear una instancia lista para usar con MCP
export const mcpApiClient = createCsrfProtectedAxios(MCP_BASE_URL); 