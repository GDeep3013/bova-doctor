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
    <div className={`w-full max-w-[300px] min-[1025px]:min-w-[300px] inset-y-0 transition-transform ease-in-out p-4 pt-[40px] duration-1500 bg-customBg transform sidebar ${isSidebarOpen ? 'translate-x-0 sidebar-close' : '-translate-x-[100%] sidebar-open'}`}>
      <Link href="/dashboard">
        <img src="/images/dash-logo.png" alt="Logo" className="max-w-[155px] max-[992px]:max-w-[120px]" />
      </Link>
      <nav className="space-y-4 pt-7">
        {session?.user?.userType === 'Admin' ? (
          <>
            <Link href="/admin/dashboard" className="block text-gray-700 hover:text-gray-900 text-xl">
              <HomeIcon /> Home
            </Link>
            <div>
              <button onClick={toggleProfile} className="text-gray-700 hover:text-gray-900 w-full text-left text-xl">
                <ProfileIcon /> Add Doctor
              </button>
              {isProfileOpen && (
                <ul className="pl-0 submenu my-4 space-y-1">
                  <li><Link href="/admin/doctor" className="block hover:text-gray-900">Doctors Listing</Link></li>
                </ul>
              )}
            </div>
            <Link href="/admin/patients/" className="block text-gray-700 hover:text-gray-900 text-xl">
              <PatientIcon /> Patient Listing
            </Link>

          <Link href="/admin/settings/" className="block text-gray-700 hover:text-gray-900 text-xl">
            <SettingIcon /> Settings
          </Link>

          </>

        ) : (
          <>
            <Link href="/dashboard" className="block text-gray-700 hover:text-gray-900 text-xl">
              <HomeIcon /> Home
            </Link>
            {/* Profile Dropdown */}
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

            <div>
              <button onClick={togglePatients} className="text-gray-700 hover:text-gray-900 w-full text-left text-xl">
                <PatientIcon /> Patients
              </button>
              {isPatientsOpen && (
                <ul className="pl-0 submenu my-4 space-y-1">
                  <li><Link href="/patients/home" className="block hover:text-gray-900">Add Patient</Link></li>
                  <li><Link href="/patients/listing" className="block hover:text-gray-900">Search</Link></li>
                </ul>
              )}
            </div>

            <div>
              <button onClick={togglePlans} className="text-gray-700 hover:text-gray-900 w-full text-left text-xl">
                <PlanIcon /> Plans
              </button>
              {isPlansOpen && (
                <ul className="pl-0 submenu my-4 space-y-1">
                  <li><Link href="/plans/create-plan" className="block hover:text-gray-900">Create</Link></li>
                  <li><Link href="/plans/review" className="block hover:text-gray-900">Review</Link></li>
                  <li><Link href="" className="block hover:text-gray-900">Incomplete</Link></li>
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
