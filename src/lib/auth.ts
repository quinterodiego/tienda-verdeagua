import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verifyCredentialsFromSheets, getUserFromSheets } from './users-sheets';
import { saveUserToSheets } from './users-sheets';
import { withUserErrorHandling, withBooleanErrorHandling } from './auth-error-handler';

// Funciones envueltas para manejo seguro de errores
const safeVerifyCredentials = withUserErrorHandling(verifyCredentialsFromSheets, 'verifyCredentialsFromSheets');
const safeGetUserFromSheets = withUserErrorHandling(getUserFromSheets, 'getUserFromSheets');
const safeSaveUserToSheets = withUserErrorHandling(saveUserToSheets, 'saveUserToSheets');

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Credenciales faltantes');
          return null;
        }

        try {
          console.log('🔍 Verificando credenciales para:', credentials.email);
          const user = await safeVerifyCredentials(credentials.email, credentials.password);
          
          if (user) {
            console.log('✅ Usuario autenticado:', user.email);
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
            };
          }
          
          console.log('❌ Credenciales inválidas para:', credentials.email);
          return null;
        } catch (error) {
          console.error('❌ Error en authorize:', error);
          return null;
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('🔍 SignIn callback ejecutado:', { 
        user: user?.email, 
        provider: account?.provider,
        name: user?.name 
      });
      
      // Si es login con Google, guardar el usuario en Sheets de forma segura
      if (account?.provider === 'google' && user.email && user.name) {
        try {
          console.log('💾 Intentando guardar usuario en Google Sheets...');
          const result = await safeSaveUserToSheets({
            name: user.name,
            email: user.email,
            image: user.image || undefined,
            role: 'user', // Por defecto, se ajustará automáticamente si es admin
            createdAt: new Date().toISOString(),
          });
          
          if (result) {
            console.log('✅ Usuario guardado en Google Sheets:', user.email);
          } else {
            console.log('⚠️ No se pudo guardar usuario en Sheets (sin error):', user.email);
          }
        } catch (error) {
          console.error('❌ Error al guardar usuario en Sheets:', error);
          // No bloquear el login si falla el guardado en Sheets
        }
      }
      
      console.log('✅ SignIn callback retornando true');
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        
        // Cargar el rol del usuario desde Google Sheets de forma segura
        try {
          console.log('🔍 Cargando rol para usuario:', session.user.email);
          const userFromSheets = await safeGetUserFromSheets(session.user.email!);
          if (userFromSheets) {
            (session.user as any).role = userFromSheets.role;
            console.log('✅ Rol cargado:', userFromSheets.role);
          } else {
            console.log('⚠️ No se pudo cargar rol del usuario');
            (session.user as any).role = 'user'; // Rol por defecto
          }
        } catch (error) {
          console.error('❌ Error al cargar rol del usuario:', error);
          (session.user as any).role = 'user'; // Rol por defecto en caso de error
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log('🔄 NextAuth redirect callback:', { url, baseUrl });
      
      // Si la URL ya es absoluta y del mismo dominio, usarla
      if (url.startsWith(baseUrl)) {
        console.log('✅ Redirigiendo a URL absoluta:', url);
        return url;
      }
      
      // Si la URL es relativa, convertirla a absoluta
      if (url.startsWith('/')) {
        const redirectUrl = `${baseUrl}${url}`;
        console.log('✅ Redirigiendo a URL relativa convertida:', redirectUrl);
        return redirectUrl;
      }
      
      // Fallback a la home
      console.log('🏠 Fallback: redirigiendo a home');
      return baseUrl;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
};
