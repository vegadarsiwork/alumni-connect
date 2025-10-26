'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { ReactNode, useEffect } from 'react';

function UserIdExposer() {
  const { data: session } = useSession();
  
  useEffect(() => {
    if (session?.user?.id) {
      window.__USER_ID = session.user.id;
    }
  }, [session]);
  
  return null;
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <UserIdExposer />
      {children}
    </SessionProvider>
  );
}