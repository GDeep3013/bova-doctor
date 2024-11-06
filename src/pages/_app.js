// import '../styles.css'
import '../globals.css'
import '../custom.css'

import { SessionProvider } from 'next-auth/react';
import { useRouter } from 'next/router';
import { getSession } from 'next-auth/react';
import { useEffect } from 'react';
import { AppProvider } from '../context/AppContext';

 
export default function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const checkSession = async () => {
    const guestRoutes = ['/', '/login', '/forget-password','/register', '/reset-password', '/create-password'];
    const adminRoutes = ['/admin/doctor/listing', '/admin/doctor/create', '/admin/doctor/edit/[id]'];
    const doctorRoutes = ['/dashboard','/patients/create', '/patients/edit/[id]','/patients/listing','/patients/detail/[id]','/sale','/create-plan','/profile'];
    const session = await getSession();
    
    const currentUrl = router.pathname;   
 
    if (!session) {
      if (!guestRoutes.includes(currentUrl)) {
        // Redirect to login if not authenticated and current page is not a guest route
        router.push('/login');
      }
    } else {
      const user = session.user;
      if (user) {
        if (guestRoutes.includes(currentUrl)) {
          if (user.userType === 'Admin') {
            router.push('/admin/doctor/listing');
          } else {
            router.push('/dashboard');
          }
        }
  
        if (user.userType === 'Admin' && !adminRoutes.includes(currentUrl)) {
          router.push('/admin/doctor/listing'); 
        }
  
        if (user.userType === 'Doctor' && !doctorRoutes.includes(currentUrl)) {      
          router.push('/dashboard'); 
        }
      }
    }
  
  };
  
  useEffect(() => {
    checkSession();
  }, [router]);
  
  return (
    <SessionProvider session={pageProps.session}>
       <AppProvider>
        <Component {...pageProps} />
        </AppProvider>
    </SessionProvider>
  );
}