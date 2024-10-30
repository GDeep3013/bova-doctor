// src/pages/dashboard.js
import { Children, useState } from 'react';
import Sidebar from './sidebar';
import Navbar from './navbar';
import { signOut,getSession } from 'next-auth/react';
import Link from 'next/link';

export default function AppLayout({ children }) {

    const [selectedPatient, setSelectedPatient] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="dashboard-outer flex">

            <Sidebar isSidebarOpen={isSidebarOpen} />
            <div className='dashboard-right w-full'>
                <Navbar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                {children}
             
            </div>


        </div>
    )
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}