// Tipos para Colores
export interface Color {
  id: string;
  nombre: string;
  disponible: boolean;
}

export interface AdminColor extends Color {
  createdAt?: string;
  updatedAt?: string;
}

// Tipos para Motivos
export interface Motivo {
  id: string;
  nombre: string;
  disponible: boolean;
}

export interface AdminMotivo extends Motivo {
  createdAt?: string;
  updatedAt?: string;
}
