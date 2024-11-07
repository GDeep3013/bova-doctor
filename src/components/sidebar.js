"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { signOut, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation'
import { HomeIcon, LogoutIcon, PatientIcon, PlanIcon, SettingIcon, ProfileIcon } from './svg-icons/icons';

export default function Sidebar({ isOpen, isSidebarOpen }) {
  const router = useRouter();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPatientsOpen, setIsPatientsOpen] = useState(false);
  const [isPlansOpen, setIsPlansOpen] = useState(false);
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
    <div className={`w-full max-w-[320px] inset-y-0 transition-transform ease-in-out duration-1500 transform sidebar ${isSidebarOpen ? 'translate-x-0 p-4' : '-translate-x-[100%] !max-w-[0] opacity-0 p-0'}`}>
      <nav className="space-y-4 pt-3">
        {session?.user?.userType === 'Admin' ? (
          <Link href="/admin/doctor" className="block text-gray-700 hover:text-gray-900">
            Doctors
          </Link>
        ) : (
          <>
            <Link href="/dashboard" className="block text-gray-700 hover:text-gray-900 text-xl">
              <HomeIcon /> Home
            </Link>            
            <div>
              <button onClick={toggleProfile} className="text-gray-700 hover:text-gray-900 w-full text-left text-xl">
                <ProfileIcon /> Profile
              </button>
              {isProfileOpen && (
                <ul className="pl-0 submenu my-4 space-y-1">
                  <li><Link href="/profile" className="block hover:text-gray-900">Edit</Link></li>
                  <li><Link href="/sales" className="block hover:text-gray-900">Sales</Link></li>
                </ul>
              )}
            </div>

            {/* Patients Dropdown */}
            <div>
              <button onClick={togglePatients} className="text-gray-700 hover:text-gray-900 w-full text-left text-xl">
                <PatientIcon /> Patients
              </button>
              {isPatientsOpen && (
                <ul className="pl-0 submenu my-4 space-y-1">
                  <li><Link href="/patients/listing" className="block hover:text-gray-900">Search</Link></li>
                </ul>
              )}
            </div>

            {/* Plans Dropdown */}
            <div>
              <button onClick={togglePlans} className="text-gray-700 hover:text-gray-900 w-full text-left text-xl">
              <PlanIcon /> Plans
              </button>
              {isPlansOpen && (
                <ul className="pl-0 submenu my-4 space-y-1">
                  <li><Link href="/create-plan" className="block hover:text-gray-900">Create</Link></li>
                  <li><Link href="/review" className="block hover:text-gray-900">Review</Link></li>
                  <li><Link href="/incomplete" className="block hover:text-gray-900">Incomplete</Link></li>
                </ul>
              )}
            </div>
            <Link href="/dashboard" className="block border-t border-[#D4D4D4] !mt-6 pt-5 text-gray-700 hover:text-gray-900 text-xl">
              <SettingIcon /> Settings
            </Link>
          </>
        )}
        <button onClick={handleLogout} className="block text-gray-700 hover:text-gray-900 text-xl">
          <LogoutIcon /> Logout
        </button>
      </nav>
    </div>
  );
}
