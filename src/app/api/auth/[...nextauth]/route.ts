import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

/**
 * Configuración de NextAuth para autenticación con Google
 * 
 * Requiere las siguientes variables de entorno:
 * - GOOGLE_CLIENT_ID: Client ID de Google OAuth
 * - GOOGLE_CLIENT_SECRET: Client Secret de Google OAuth
 * - NEXTAUTH_SECRET: Secret para encriptar tokens
 * - AUTHORIZED_USERS: Lista de emails autorizados (separados por coma)
 */
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    /**
     * Valida que el usuario esté autorizado antes de permitir el inicio de sesión
     */
    async signIn({ user }) {
      const authorizedUsers = process.env.AUTHORIZED_USERS?.split(',').map(e => e.trim()) || [];
      
      if (!user.email) {
        return false;
      }

      const isAuthorized = authorizedUsers.includes(user.email);
      
      if (!isAuthorized) {
        console.log(`Intento de acceso no autorizado: ${user.email}`);
      }

      return isAuthorized;
    },
    /**
     * Personaliza la sesión del usuario
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
