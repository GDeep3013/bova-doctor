
"use client";

import { useState, useEffect } from "react";
import { getSession, SessionProvider } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation"; // Import usePathname to get the current path


export default function SessionProviderClientComponent({ children }) {
  const router = useRouter();

  const [session, setSession] = useState(null);
  const pathname = usePathname(); // Get the current path
  const guestRoutes = ['/', '/login', '/forget-password', '/register', '/reset-password', '/create-password'];

  useEffect(() => {
    // Fetch session
    const fetchSession = async () => {
      const sessionData = await getSession();
      setSession(sessionData);
    };
    fetchSession();
  }, [router]);

  // Show loading if no session and current path is not in guestRoutes
  if (!session && !guestRoutes.includes(pathname)) {
    return (<div className="loader">
      <img src="https://inventory.webziainfotech.com/images/logo.png" alt="BOVA Logo"/>
    </div>);
  }

  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  );
}