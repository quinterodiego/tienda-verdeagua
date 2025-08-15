'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface UserRoleInfo {
  role: string;
  isAdmin: boolean;
  hasModeratorRole: boolean;
  email: string | null;
}

// Cache para evitar múltiples llamadas a la API
const roleCache = new Map<string, { data: UserRoleInfo; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export function useUserRole() {
  const { data: session } = useSession();
  const [roleInfo, setRoleInfo] = useState<UserRoleInfo>({
    role: 'user',
    isAdmin: false,
    hasModeratorRole: false,
    email: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserRole = useCallback(async (email: string) => {
    // Verificar cache primero
    const cached = roleCache.get(email);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('📋 Usando rol desde cache para:', email);
      setRoleInfo(cached.data);
      return cached.data;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Obteniendo rol de usuario para:', email);
      const response = await fetch('/api/auth/user-role', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Rol obtenido exitosamente:', data);
        
        // Guardar en cache
        roleCache.set(email, {
          data,
          timestamp: Date.now()
        });
        
        setRoleInfo(data);
        return data;
      } else {
        throw new Error(`Error API: ${response.status}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('❌ Error al obtener rol:', errorMessage);
      setError(errorMessage);
      
      // Fallback con lista de admins por email
      const adminEmails = ['d86webs@gmail.com', 'sebastianperez6@hotmail.com'];
      const fallbackInfo = {
        role: adminEmails.includes(email) ? 'admin' : 'user',
        isAdmin: adminEmails.includes(email),
        hasModeratorRole: false,
        email
      };
      
      console.log('🔄 Usando fallback para rol:', fallbackInfo);
      setRoleInfo(fallbackInfo);
      return fallbackInfo;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user?.email) {
      fetchUserRole(session.user.email);
    } else {
      // Reset cuando no hay sesión
      setRoleInfo({
        role: 'user',
        isAdmin: false,
        hasModeratorRole: false,
        email: null
      });
      setError(null);
    }
  }, [session?.user?.email, fetchUserRole]);

  // Función para refrescar el rol (limpiar cache)
  const refreshRole = useCallback(() => {
    if (session?.user?.email) {
      roleCache.delete(session.user.email);
      fetchUserRole(session.user.email);
    }
  }, [session?.user?.email, fetchUserRole]);

  return {
    ...roleInfo,
    loading,
    error,
    refreshRole
  };
}

// Hook simplificado solo para verificar si es admin
export function useIsAdmin() {
  const { isAdmin, loading } = useUserRole();
  return { isAdmin, loading };
}
