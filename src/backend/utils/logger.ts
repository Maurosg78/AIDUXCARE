/**
 * Logger simple para registrar solicitudes y errores en la API
 */

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

/**
 * Registra un mensaje en la consola con formato para peticiones HTTP
 * @param method Método HTTP (GET, POST, etc.)
 * @param path Ruta de la petición
 * @param statusCode Código de estado HTTP
 * @param time Tiempo de respuesta en ms
 */
export const logRequest = (method: string, path: string, statusCode: number, time: number): void => {
  const timestamp = new Date().toISOString();
  let statusColor = colors.green;
  
  // Determinar color según el código de estado
  if (statusCode >= 500) {
    statusColor = colors.red;
  } else if (statusCode >= 400) {
    statusColor = colors.yellow;
  } else if (statusCode >= 300) {
    statusColor = colors.cyan;
  }

  console.log(
    `${colors.white}[${timestamp}] ${colors.blue}${method}${colors.reset} ${path} ${statusColor}${statusCode}${colors.reset} ${colors.magenta}${time}ms${colors.reset}`
  );
};

/**
 * Registra un error en la consola con formato
 * @param error Objeto de error o mensaje
 * @param context Contexto adicional del error
 */
export const logError = (error: Error | string, context?: Record<string, unknown>): void => {
  const timestamp = new Date().toISOString();
  const errorMessage = typeof error === 'string' ? error : error.message;
  const stack = error instanceof Error ? error.stack : undefined;

  console.error(
    `${colors.white}[${timestamp}] ${colors.red}ERROR: ${errorMessage}${colors.reset}`
  );
  
  if (stack) {
    console.error(`${colors.red}${stack}${colors.reset}`);
  }
  
  if (context) {
    console.error('Context:', context);
  }
};

/**
 * Registra un mensaje informativo
 * @param message Mensaje a registrar
 * @param data Datos adicionales
 */
export const logInfo = (message: string, data?: unknown): void => {
  const timestamp = new Date().toISOString();
  console.log(`${colors.white}[${timestamp}] ${colors.cyan}INFO: ${message}${colors.reset}`);
  
  if (data) {
    console.log(data);
  }
};

export default {
  request: logRequest,
  error: logError,
  info: logInfo
}; 