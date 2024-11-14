
import Link from 'next/link';
import { MenuClose, MenuIcon } from './svg-icons/icons';

export default function Navbar({ isSidebarOpen, toggleSidebar }) {
  return (
    <nav className="flex items-center justify-between text-white w-full min-[1025px]:hidden">
      <div className={`flex items-center admin-logo bg-customBg space-x-2 w-full px-6 py-2 md:py-5 justify-end min-h-[80px] ${!isSidebarOpen ? 'sidebar-close' : ''}`}>
        <Link href="/dashboard">
          <img src="/images/dash-logo.png" alt="Logo" className="max-w-[155px] max-[1024px]:max-w-[120px]" />
        </Link>
        <button onClick={toggleSidebar}
          className={`w-11 h-11 rounded-full text-center min-[1025px]:hidden ${isSidebarOpen ? 'bg-[#F4F5F7] text-black' : 'bg-[#F4F5F7]'
            }`}
        >
          {isSidebarOpen ? <MenuIcon /> : <MenuClose />}
        </button>
      </div>
    </nav>
  );
}
