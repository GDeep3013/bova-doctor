// import '../styles.css'
import '../globals.css'
import '../custom.css'

import { SessionProvider } from 'next-auth/react';
import { useRouter } from 'next/router';
import { getSession } from 'next-auth/react';
import { useEffect } from 'react';

 
export default function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const checkSession = async () => {
    const guestRoutes = ['/', '/login', '/forget-password','/register', '/reset-password', '/create-password'];
    const session = await getSession();

    // Check if the user is logged in
    if (session) {
      // If on the login page, redirect to the dashboard
      if (guestRoutes.includes(router.pathname)) {
        router.push('/dashboard');
      }
    }
  };
  useEffect(() => {
    checkSession();
  }, [router]);
  return (
    <SessionProvider session={pageProps.session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}