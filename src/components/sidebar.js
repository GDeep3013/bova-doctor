"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { HomeIcon, LogoutIcon, PatientIcon, PlanIcon, SettingIcon, ProfileIcon, EarningIcon, CloseIcon ,SummaryIcon} from './svg-icons/icons';
import { useSession } from 'next-auth/react';
export default function Sidebar({ isSidebarOpen, toggleSidebar }) {

  const currentPath = usePathname();
  const { data: session } = useSession();

  const isActive = (path) => currentPath === path;
  const [isProfileOpen, setIsProfileOpen] = useState(isActive('/profile') || isActive('/admin/doctor') || isActive('/sales')); // Start profile section open if on relevant page
  const [isSettingOpen, setIsSettingOpen] = useState(isActive('/admin/products') || isActive('/admin/notification')); // Start profile section open if on relevant page
  const [isPatientsOpen, setIsPatientsOpen] = useState(isActive('/patients/listing') || isActive('/patients/create')); // Patients section based on active route
  const [isPlansOpen, setIsPlansOpen] = useState(isActive('/plans/create-plan') || isActive('/plans/review') || isActive('/plans/saved')); // Plans section if any plan route is active

  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);
  const toggleSetting = () => setIsSettingOpen(!isSettingOpen);
  const togglePatients = () => setIsPatientsOpen(!isPatientsOpen);
  const togglePlans = () => setIsPlansOpen(!isPlansOpen);

  const handleLogout = async () => {
    await signOut({ redirect: true });
    window.location.assign('/login');
  };

  return (
    <div className={`w-full max-[1199px]:max-w-[290px] max-w-[300px] inset-y-0 transition-transform ease-in-out p-[30px] min-[1100px]:p-[50px] duration-1500 bg-customBg transform sidebar ${isSidebarOpen ? 'translate-x-0 sidebar-close' : '-translate-x-[100%] sidebar-open'}`}>
      <button className=' absolute right-0 top-4 pr-5 min-[1025px]:hidden ' onClick={toggleSidebar} >
        <CloseIcon />
      </button>
      <Link href="/dashboard">
        <img src="/images/dash-logo.png" alt="Logo" className="max-w-[155px] max-[992px]:max-w-[120px]" />
      </Link>

      <nav className="space-y-4 pt-7">
        {session && session?.user?.userType === 'Admin' ? (
          <>
            <Link href="/admin/dashboard" className={`block text-xl ${isActive('/admin/dashboard') ? 'text-[#53595B] font-bold' : 'text-[#3a3c3d] hover:text-gray-900'}`}>
              <HomeIcon /> Home
            </Link>
            <div>
              <button onClick={toggleProfile} className={`text-xl font-medium text-[#3a3c3d]`}>
                <ProfileIcon />  Doctors
              </button>
              {isProfileOpen && (
                <ul className="pl-0 submenu my-4 space-y-1">
                  <li>
                    <Link href="/admin/doctor/create" className={`block text-lg ${isActive('/admin/doctor/create') ? 'text-[#53595B] font-bold' : 'text-[#3a3c3d] hover:text-gray-900'}`}>
                      Add Doctor
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin/doctor?pages=1&status=Completed" className={`block text-lg ${isActive('/admin/doctor') ? 'text-[#53595B] font-bold' : 'text-[#3a3c3d] hover:text-gray-900'}`}>
                      Analytics
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin/doctor-commission-summary" className={`block text-lg ${isActive('/admin/patients') ? 'text-[#53595B] font-bold' : 'text-[#3a3c3d] hover:text-gray-900'}`}>
                     Doctor&apos;s Sales Summary
                  </Link>
                  </li>
                </ul>
              )}
            </div>
            <Link href="/admin/patients/" className={`block text-xl ${isActive('/admin/patients') ? 'text-[#53595B] font-bold' : 'text-[#3a3c3d] hover:text-gray-900'}`}>
              <PatientIcon /> Patient Listing
            </Link>
         
            <div>
              <button onClick={toggleSetting} className={`text-xl font-medium text-[#3a3c3d]`}>
                <SettingIcon /> Settings
              </button>
              {isSettingOpen && (
                <ul className="pl-0 submenu my-4 space-y-1">
                  <li>
                    <Link href="/admin/products" className={`block text-lg ${isActive('/admin/products') ? 'text-[#53595B] font-bold' :
                      'text-[#3a3c3d] hover:text-gray-900'}`}>
                      Products
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin/notification" className={`block text-lg ${isActive('/admin/notification') ? 'text-[#53595B] font-bold' :
                      'text-[#3a3c3d] hover:text-gray-900'}`}>
                      Notifications
                    </Link>

                  </li>
                </ul>
              )}
            </div>
          </>
        ) : (
          <>
            <Link href="/dashboard" className={`block text-xl ${isActive('/dashboard') ? 'text-[#53595B] font-bold' : 'text-[#3a3c3d] hover:text-gray-900'}`}>
              <HomeIcon /> Home
            </Link>
            <div>
              <button onClick={toggleProfile} className={`text-xl font-medium text-[#3a3c3d]`}>
                <ProfileIcon /> Profile
              </button>
              {isProfileOpen && (
                <ul className="pl-0 submenu my-4 space-y-1">
                  <li>
                    <Link href="/profile" className={`block text-lg ${isActive('/profile') ? 'text-[#53595B] font-bold' :
                      'text-[#3a3c3d] hover:text-gray-900'}`}>
                      Edit
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy-policies" className={`block text-lg ${isActive('/privacy-policies') ? 'text-[#53595B] font-bold' :
                      'text-[#3a3c3d] hover:text-gray-900'}`}>
                      Privacy & Policies
                    </Link>
                    </li>
                    <li>
                    <Link href="/sales" className={`block text-lg ${isActive('/sales') ? 'text-[#53595B] font-bold' :
                      'text-[#3a3c3d] hover:text-gray-900'}`}>
                      Sales
                    </Link>
                  </li>
                </ul>
              )}
            </div>

            <div>
              <button onClick={togglePatients} className={`text-xl font-medium text-[#3a3c3d]`}>
                <PatientIcon /> Patients
              </button>
              {isPatientsOpen && (
                <ul className="pl-0 submenu my-4 space-y-1">
                  <li>
                    <Link href="/patients/create" onClick={() => togglePatients(true)} className={`block text-lg  ${isActive('/patients/create') ? 'text-[#53595B] font-bold' : 'text-[#3a3c3d] hover:text-gray-900'}`}>
                      Add
                    </Link>
                  </li>
                  <li>
                    <Link href="/patients/listing" onClick={() => togglePatients(true)} className={`block text-lg  ${isActive('/patients/listing') ? 'text-[#53595B] font-bold' : 'text-[#3a3c3d] hover:text-gray-900'}`}>
                      Search
                    </Link>
                  </li>
                </ul>
              )}
            </div>
            <div>
              <button onClick={togglePlans} className={`text-xl font-medium text-[#3a3c3d]`}>
                <PlanIcon /> Plans
              </button>
              {isPlansOpen && (
                <ul className="pl-0 submenu my-4 space-y-1">
                  <li>
                    <Link href="/plans/create-plan" className={`block text-lg ${isActive('/plans/create-plan') ? 'text-[#53595B] font-bold' : 'text-[#3a3c3d] hover:text-gray-900'}`}>
                      Create
                    </Link>
                  </li>
                  <li>
                    <Link href="/plans/review" className={`block text-lg ${isActive('/plans/review') ? 'text-[#53595B] font-bold' : 'text-[#3a3c3d] hover:text-gray-900'}`}>
                      Review
                    </Link>
                  </li>
                  <li>
                    <Link href="/plans/saved" className={`block text-lg ${isActive('/plans/saved') ? 'text-[#53595B] font-bold' : 'text-[#3a3c3d] hover:text-gray-900'}`}>
                      Saved
                    </Link>
                  </li>
                </ul>
              )}
            </div>
            <Link href="/earnings" className={`block text-xl ${isActive('/earnings') ? 'text-[#53595B] font-bold' : 'text-[#3a3c3d] hover:text-gray-900'}`}>
              <EarningIcon /> Earnings
            </Link>
          </>
        )}
        <button onClick={() => { handleLogout() }} className="block text-[#3a3c3d] hover:text-gray-900 text-xl">
          <LogoutIcon /> Logout
        </button>
      </nav>
      <div className='absolute bottom-[20px] need-help'>
        <p className='text-md font-semibold text-[#53595B]'>Need Help?</p>
        <Link href={"mailto:support@bovalabs.com"} className='underline text-[#53595B]'>support@bovalabs.com</Link>
      </div>
    </div>
  );
}
