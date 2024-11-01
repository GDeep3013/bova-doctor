"use client";
import Link from 'next/link';
import { MenuIcon } from './svg-icons/icons';

export default function Navbar({ isSidebarOpen, toggleSidebar }) {
  return (
    <nav className="flex items-center justify-between p-4 text-white w-full">
      <div className="text-2xl font-bold">
      <button onClick={toggleSidebar} className="p-2 text-white rounded-md">
        {/* {isSidebarOpen ? 'Close' : 'Open'} */}
        <MenuIcon />
      </button>
      </div>

      {/* Right side: Review Plan Button */}
      <Link href="/" className='bg-teal-700 text-white px-4 py-2 rounded-md hover:bg-teal-800'>
          Review Plan (2)
      </Link>
    </nav>
  );
}