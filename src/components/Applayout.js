 'use client'
import { useState } from 'react';
import Sidebar from './sidebar';
import Navbar from './navbar';


export default function AppLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    return (
        <>
            <Navbar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <div className="dashboard-outer flex">
                <Sidebar isSidebarOpen={isSidebarOpen} />
                <div className='dashboard-right w-full transition ease-in-out delay-150 bg-[#EBEDEB]'>
                    <div className='dashboard-inner min-h p-[46px]'>
                        {children}
                    </div>
                    <footer className='text-center p-5 bg-[#EBEDEB]'>
                        <p>BOVA LABS 2024©</p>
                    </footer>
                </div>


            </div>
        </>
    )
}
