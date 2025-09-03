'use client';

import { useTheme } from '@/hooks/useTheme';
import { ReactNode } from 'react';

interface ThemeProviderProps {
  children: ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  // El hook useTheme se encarga de cargar y aplicar el tema automáticamente
  useTheme();
  
  return <>{children}</>;
}
