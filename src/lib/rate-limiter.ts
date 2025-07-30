// Rate limiter para Google Sheets API
class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests: number;
  private readonly timeWindow: number; // en milisegundos
  
  constructor(maxRequests: number = 60, timeWindowMinutes: number = 1) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindowMinutes * 60 * 1000;
  }
  
  async waitIfNeeded(): Promise<void> {
    const now = Date.now();
    
    // Limpiar requests antiguos
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = this.timeWindow - (now - oldestRequest);
      
      console.log(`⏳ Rate limit alcanzado. Esperando ${Math.ceil(waitTime / 1000)}s...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      // Limpiar requests antiguos después de esperar
      const newNow = Date.now();
      this.requests = this.requests.filter(time => newNow - time < this.timeWindow);
    }
    
    this.requests.push(now);
  }
  
  getRemainingRequests(): number {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    return Math.max(0, this.maxRequests - this.requests.length);
  }
}

// Instancia global del rate limiter
// Google Sheets permite 100 requests por 100 segundos por usuario
export const sheetsRateLimiter = new RateLimiter(90, 1.67); // 90 requests per 100 seconds

// Función wrapper para API calls con rate limiting
export async function withRateLimit<T>(apiCall: () => Promise<T>): Promise<T> {
  await sheetsRateLimiter.waitIfNeeded();
  return apiCall();
}
