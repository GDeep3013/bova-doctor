import { useState } from 'react';
import Link from 'next/link';
import { MenuClose, MenuIcon } from './svg-icons/icons';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation'


export default function Navbar({ isSidebarOpen, toggleSidebar }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };
  return (
    <nav className="flex items-center justify-between text-white w-full">
      <div className={`flex items-center admin-logo bg-customBg space-x-2 w-full max-w-[320px] px-6 py-5 justify-end ${!isSidebarOpen ? 'sidebar-close' : ''}`}>
        <Link href="/dashboard">
          <img src="/images/dash-logo.png" alt="Logo" className="max-w-[155px]" />
        </Link>
        <button onClick={toggleSidebar}
          className={`w-11 h-11 rounded-full text-center ${isSidebarOpen ? 'bg-[#F4F5F7] text-black' : 'bg-black text-white'
            }`}
        >
          {isSidebarOpen ? <MenuIcon /> : <MenuClose />}
        </button>
      </div>

      <div className="relative w-full text-right px-6 py-5">

      <button class="bg-[#25464F] text-white font-medium px-4 py-2 rounded-[8px]">Review Plan (2)</button>

      </div>
    </nav>
  );
}
