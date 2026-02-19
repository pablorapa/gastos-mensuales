import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const authorizedUsers = process.env.AUTHORIZED_USERS?.split(',').map(e => e.trim()) || [];

      if (!user.email) return false;

      const isAuthorized = authorizedUsers.includes(user.email);
      return isAuthorized;
    },
    async session({ session, token }) {
      if (session.user) {
        // add id from token subject
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).id = token.sub!;
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
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions;
