
"use client";

import { useState, useEffect } from "react";
import { getSession, SessionProvider } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation"; // Import usePathname to get the current path


export default function SessionProviderClientComponent({ children }) {
  const router = useRouter();

  const [session, setSession] = useState(null);
  const pathname = usePathname(); 
  const guestRoutes = ['/', '/login', '/forget-password', '/register', '/reset-password', '/create-password','/terms-services','/not-found','/doctor-confirmation'];

  useEffect(() => {
    
    const fetchSession = async () => {
      const sessionData = await getSession();
      setSession(sessionData);
    };
    fetchSession();
  }, [router]);
 
  if (!session && !guestRoutes.includes(pathname)) {  
    return (<div className="loader">
      <img src="/images/logo.png" alt="BOVA Logo"/>
    </div>);
  }

  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  );
}
