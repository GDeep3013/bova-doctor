"use client";
import { useState } from 'react';
import Link from 'next/link';
import { signOut,getSession } from 'next-auth/react';

export default function Sidebar({ isOpen, isSidebarOpen }) {

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPatientsOpen, setIsPatientsOpen] = useState(false);
  const [isPlansOpen, setIsPlansOpen] = useState(false);
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);
  const togglePatients = () => setIsPatientsOpen(!isPatientsOpen);
  const togglePlans = () => setIsPlansOpen(!isPlansOpen);

  return (
    <div className={`flex ${isSidebarOpen ? 'menu-open' : ''}`}>

      {/* Sidebar */}
      <div
        className={`fixed w-full max-w-[300px] inset-y-0 left-0 bg-[#d6dee5] p-4 transition-transform duration-300 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center space-x-2 mb-4">
          <Link href="/">
            <img src='/images/dash-logo.png' alt='Logo' className='max-w-[187px]'/>
           </Link>
        </div>

        <nav className="space-y-4 pt-3">
          <Link href="/" className="block text-gray-700 hover:text-gray-900">
            Home
          </Link>
          {/* Profile Dropdown */}
          <div>
            <button onClick={toggleProfile} className="text-gray-700 hover:text-gray-900 w-full text-left">
              Profile
            </button>
            {isProfileOpen && (
              <ul className="pl-4 space-y-1">
                <li><Link href="/edit" className="block hover:text-gray-900">Edit</Link></li>
                <li><Link href="/sales" className="block hover:text-gray-900">Sales</Link></li>
              </ul>
            )}
          </div>

          {/* Patients Dropdown */}
          <div>
            <button onClick={togglePatients} className="text-gray-700 hover:text-gray-900 w-full text-left">
              Patients
            </button>
            {isPatientsOpen && (
              <ul className="pl-4 space-y-1">
                <li><Link href="/search" className="block hover:text-gray-900">Search</Link></li>
              </ul>
            )}
          </div>

          {/* Plans Dropdown */}
          <div>
            <button onClick={togglePlans} className="text-gray-700 hover:text-gray-900 w-full text-left">
              Plans
            </button>
            {isPlansOpen && (
              <ul className="pl-4 space-y-1">
                <li><Link href="/create" className="block hover:text-gray-900">Create</Link></li>
                <li><Link href="/review" className="block hover:text-gray-900">Review</Link></li>
                <li><Link href="/incomplete" className="block hover:text-gray-900">Incomplete</Link></li>
              </ul>
            )}
          </div>
          <button  onClick={signOut} className="block text-gray-700 hover:text-gray-900">
            Logout
          </button>
        </nav>
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}