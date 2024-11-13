
import Link from 'next/link';
import { MenuClose, MenuIcon } from './svg-icons/icons';

export default function Navbar({ isSidebarOpen, toggleSidebar }) {
  return (
    <nav className="flex items-center justify-between text-white w-full">
      <div className={`flex items-center admin-logo bg-customBg space-x-2 w-full min-[1025px]:max-w-[300px] px-6 py-2 md:py-5 justify-end min-h-[80px] ${!isSidebarOpen ? 'sidebar-close' : ''}`}>
        <Link href="/dashboard">
          <img src="/images/dash-logo.png" alt="Logo" className="max-w-[155px] max-[992px]:max-w-[120px]" />
        </Link>
        <button onClick={toggleSidebar}
          className={`w-11 h-11 rounded-full text-center min-[992px]:hidden ${isSidebarOpen ? 'bg-[#F4F5F7] text-black' : 'bg-[#F4F5F7]'
            }`}
        >
          {isSidebarOpen ? <MenuIcon /> : <MenuClose />}
        </button>
      </div>
      <div className="relative w-full max-lg:hidden text-right px-[20px] md:px-6 py-5">
      </div>
    </nav>
  );
}
