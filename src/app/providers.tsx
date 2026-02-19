'use client';

import { SessionProvider } from 'next-auth/react';

/**
 * Provider para NextAuth y otros contextos globales
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
