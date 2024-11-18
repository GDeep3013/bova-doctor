"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { signOut, getSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { HomeIcon, LogoutIcon, PatientIcon, PlanIcon, SettingIcon, ProfileIcon } from './svg-icons/icons';

export default function Sidebar({ isOpen, isSidebarOpen }) {
  const router = useRouter();
  const currentPath = usePathname();

  // Helper function to check if the link is active
  const isActive = (path) => currentPath === path;

  const [isProfileOpen, setIsProfileOpen] = useState(isActive('/profile') || isActive('/admin/doctor') ||isActive('/sales')); // Start profile section open if on relevant page
  const [isPatientsOpen, setIsPatientsOpen] = useState(isActive('/patients/listing')); // Patients section based on active route
  const [isPlansOpen, setIsPlansOpen] = useState(isActive('/plans/create-plan') || isActive('/plans/review') || isActive('/plans/incomplete')); // Plans section if any plan route is active

  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);
  const togglePatients = () => setIsPatientsOpen(!isPatientsOpen);
  const togglePlans = () => setIsPlansOpen(!isPlansOpen);

  const [session, setSession] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      const sessionData = await getSession();
      setSession(sessionData);
    };
    fetchSession();
  }, []);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  return (
    <div className={`w-full max-[1100px]:max-w-[250px] max-w-[300px] min-[1101px]:min-w-[300px] inset-y-0 transition-transform ease-in-out p-4 pt-[40px] duration-1500 bg-customBg transform sidebar ${isSidebarOpen ? 'translate-x-0 sidebar-close' : '-translate-x-[100%] sidebar-open'}`}>
      <Link href="/dashboard">
        <img src="/images/dash-logo.png" alt="Logo" className="max-w-[155px] max-[992px]:max-w-[120px]" />
      </Link>
      <nav className="space-y-4 pt-7">
        {session?.user?.userType === 'Admin' ? (
          <>
            <Link href="/admin/dashboard" className={`block text-xl ${isActive('/admin/dashboard') ? 'text-black font-semibold' : 'text-gray-700 hover:text-gray-900'}`}>
              <HomeIcon /> Home
            </Link>
            <div>
              <button onClick={toggleProfile} className={`text-xl `}>
                <ProfileIcon /> Add Doctor
              </button>
              {isProfileOpen && (
                <ul className="pl-0 submenu my-4 space-y-1">
                  <li>
                    <Link href="/admin/doctor" className={`block ${isActive('/admin/doctor') ? 'text-black font-semibold' : 'hover:text-gray-900'}`}>
                      Doctors Listing
                    </Link>
                  </li>
                </ul>
              )}
            </div>
            <Link href="/admin/patients/" className={`block text-xl ${isActive('/admin/patients') ? 'text-black font-semibold' : 'text-gray-700 hover:text-gray-900'}`}>
              <PatientIcon /> Patient Listing
            </Link>

            <Link href="/admin/settings/" className={`block text-xl ${isActive('/admin/settings') ? 'text-black font-semibold' : 'text-gray-700 hover:text-gray-900'}`}>
              <SettingIcon /> Settings
            </Link>
          </>
        ) : (
          <>
            <Link href="/dashboard" className={`block text-xl ${isActive('/dashboard') ? 'text-black font-semibold' : 'text-gray-700 hover:text-gray-900'}`}>
              <HomeIcon /> Home
            </Link>
            <div>
              <button onClick={toggleProfile} className={`text-xl`}>
                <ProfileIcon /> Profile
              </button>
              {isProfileOpen && (
                <ul className="pl-0 submenu my-4 space-y-1">
                  <li>
                    <Link href="/profile" className={`block ${isActive('/profile') ? 'text-black font-semibold' : 'hover:text-gray-900'}`}>
                      Edit
                    </Link>
                  </li>
                  <li>
                    <Link href="/sales" className={`block ${isActive('/sales') ? 'text-black font-semibold' : 'hover:text-gray-900'}`}>
                      Sales
                    </Link>
                  </li>
                </ul>
              )}
            </div>

            <div>
              <button onClick={togglePatients} className={`text-xl`}>
                <PatientIcon /> Patients
              </button>
              {isPatientsOpen && (
                <ul className="pl-0 submenu my-4 space-y-1">
                  <li>
                    <Link href="/patients/listing" onClick={() => togglePatients(true)} className={`block ${isActive('/patients/listing') ? 'text-black font-semibold' : 'hover:text-gray-900'}`}>
                      Search
                    </Link>
                  </li>
                </ul>
              )}
            </div>

            <div>
              <button onClick={togglePlans} className={`text-xl `}>
                <PlanIcon /> Plans
              </button>
              {isPlansOpen && (
                <ul className="pl-0 submenu my-4 space-y-1">
                  <li>
                    <Link href="/plans/create-plan" className={`block ${isActive('/plans/create-plan') ? 'text-black font-semibold' : 'hover:text-gray-900'}`}>
                      Create
                    </Link>
                  </li>
                  <li>
                    <Link href="/plans/review" className={`block ${isActive('/plans/review') ? 'text-black font-semibold' : 'hover:text-gray-900'}`}>
                      Review
                    </Link>
                  </li>
                  <li>
                    <Link href="/" className={`block ${isActive('/plans/incomplete') ? 'text-black font-semibold' : 'hover:text-gray-900'}`}>
                      Incomplete
                    </Link>
                  </li>
                </ul>
              )}
            </div>
          </>
        )}
        <button onClick={handleLogout} className="block text-gray-700 hover:text-gray-900 text-xl">
          <LogoutIcon /> Logout
        </button>
      </nav>
    </div>
  );
}
