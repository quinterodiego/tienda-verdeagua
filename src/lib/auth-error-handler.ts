// Wrapper para manejar errores de autenticación de forma consistente
export function withAuthErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context: string
) {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error(`❌ Error en ${context}:`, error);
      
      // Log detallado para debugging
      if (error instanceof Error) {
        console.error(`❌ ${context} - Error name:`, error.name);
        console.error(`❌ ${context} - Error message:`, error.message);
        console.error(`❌ ${context} - Error stack:`, error.stack);
      } else {
        console.error(`❌ ${context} - Error no-Error object:`, error);
      }
      
      // No lanzar el error, devolver null para que NextAuth lo maneje
      return null;
    }
  };
}

// Wrapper específico para funciones que devuelven usuarios
export function withUserErrorHandling<T extends any[]>(
  fn: (...args: T) => Promise<any>,
  context: string
) {
  return withAuthErrorHandling(fn, context);
}

// Wrapper para funciones que devuelven boolean
export function withBooleanErrorHandling<T extends any[]>(
  fn: (...args: T) => Promise<boolean>,
  context: string
) {
  return async (...args: T): Promise<boolean> => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error(`❌ Error en ${context}:`, error);
      return false;
    }
  };
}
