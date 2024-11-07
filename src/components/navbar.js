import { useState } from 'react';
import Link from 'next/link';
import { MenuClose, MenuIcon } from './svg-icons/icons';
import { useSession } from 'next-auth/react';


export default function Navbar({ isSidebarOpen, toggleSidebar }) {
  const { data: session } = useSession();  
 
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  return (
    <nav className="flex items-center justify-between text-white w-full border-b border-[#D4D4D4]">
       <div className={`flex items-center admin-logo space-x-2 w-full max-w-[320px] px-6 py-6 justify-end border-r border-[#D4D4D4] ${!isSidebarOpen ? 'sidebar-close' : ''}`}>
        <Link href="/dashboard">
          <img src="/images/logo.png" alt="Logo" className="max-w-[100px]" />
        </Link>
        <button onClick={toggleSidebar}
        className={`w-11 h-11 rounded-full text-center ${
          isSidebarOpen ? 'bg-[#F4F5F7] text-black' : 'bg-black text-white'
      }`}
        >
          {isSidebarOpen ? <MenuIcon /> : <MenuClose />}
        </button>
      </div>

      <div className="relative w-full text-right px-6 py-6">
        
          <button
            onClick={toggleDropdown}
            className="flex items-center space-x-2 focus:outline-none ml-auto"
          >
            <img
              src={session?.user?.image || '/images/user-default.png'}
              alt={session?.user?.userName || 'User'}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="text-left">
              <p className="text-slate-950 font-semibold text-base">{session?.user?.userName || 'User'} </p>
              <p className="text-gray-400 text-base">{session?.user?.userType || 'Admin'}</p>
            </div>
          </button>
       

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 text-left">
            <Link href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
              Profile
            </Link>
            <button
              onClick={() => { }}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
