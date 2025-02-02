'use client'
import { useEffect, useState } from 'react';
import Sidebar from './sidebar';
import Navbar from './navbar';
export default function AppLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    return (
        <>
            <Navbar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <div className="dashboard-outer flex">
                <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar } />
                <div className='dashboard-right overflow-hidden relative w-full transition ease-in-out delay-150'>
                    <div className='dashboard-inner min-h pt-[20px] p-[20px] xl:p-[40px] md:pt-[30px]'>
                        {children}
                    </div>
                </div>
            </div>
        </>
    )
}
