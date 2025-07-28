import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verifyCredentialsFromSheets } from './users-sheets';
import { saveUserToSheets } from './users-sheets';

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
          return null;
        }

        try {
          const user = await verifyCredentialsFromSheets(credentials.email, credentials.password);
          
          if (user) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
            };
          }
          
          return null;
        } catch (error) {
          console.error('Auth error:', error);
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
      
      // Si es login con Google, guardar el usuario en Sheets
      if (account?.provider === 'google' && user.email && user.name) {
        try {
          console.log('💾 Intentando guardar usuario en Google Sheets...');
          const result = await saveUserToSheets({
            name: user.name,
            email: user.email,
            image: user.image || undefined,
            role: 'user', // Por defecto, se ajustará automáticamente si es admin
            createdAt: new Date().toISOString(),
          });
          console.log('✅ Usuario guardado en Google Sheets:', user.email, 'Resultado:', result);
        } catch (error) {
          console.error('❌ Error al guardar usuario en Sheets:', error);
          // No bloquear el login si falla el guardado en Sheets
        }
      }
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
      }
      return session;
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
