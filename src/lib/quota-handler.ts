// Middleware para manejar errores de quota de Google Sheets
export class SheetsQuotaError extends Error {
  constructor(message: string, public retryAfter: number = 60000) {
    super(message);
    this.name = 'SheetsQuotaError';
  }
}

export async function handleSheetsOperation<T>(
  operation: () => Promise<T>,
  retries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Verificar si es un error de quota
      if (error.code === 429 || 
          error.status === 429 || 
          (error.message && error.message.includes('Quota exceeded'))) {
        
        const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
        console.log(`⏳ Quota excedida. Intento ${attempt}/${retries}. Esperando ${delay}ms...`);
        
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        } else {
          throw new SheetsQuotaError(
            `Quota de Google Sheets excedida después de ${retries} intentos`,
            delay
          );
        }
      }
      
      // Si no es error de quota, lanzar inmediatamente
      throw error;
    }
  }
  
  throw lastError;
}

// Función wrapper para operaciones críticas
export async function withQuotaHandling<T>(operation: () => Promise<T>): Promise<T> {
  return handleSheetsOperation(operation, 3, 2000);
}
