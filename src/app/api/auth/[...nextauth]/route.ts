import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Configuración de NextAuth para autenticación con Google
 * 
 * Requiere las siguientes variables de entorno:
 * - GOOGLE_CLIENT_ID: Client ID de Google OAuth
 * - GOOGLE_CLIENT_SECRET: Client Secret de Google OAuth
 * - NEXTAUTH_SECRET: Secret para encriptar tokens
 * - AUTHORIZED_USERS: Lista de emails autorizados (separados por coma)
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
