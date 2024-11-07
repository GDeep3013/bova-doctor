
'use client'; ;
import AppLayout from '../../../components/Applayout'
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import React, { useState,useEffect } from 'react'

export default function Dashboard() {
    const { data: session } = useSession();
 
    return (
        <AppLayout>
            <div className="min-h bg-[#EBEDEB] flex flex-col p-6">
                <div className="w-full bg-black relative text-white rounded-lg flex flex-col md:flex-row items-center py-12 px-16 mb-11 min-h-[293px] mt-4">
                    <div className="flex-1 mb-4 md:mb-0">
                        <h1 className="text-2xl font-semibold mb-2">Welcome to your BOVA {session?.user?.userName}</h1>
                        <p className="text-sm mb-4">
                            We will be launching the full site access in less than 2 weeks! Stay tuned.
                        </p>
                        <p className="italic mb-6">- Team BOVA</p>
                        <button className="bg-white text-black font-medium px-4 py-2 rounded min-w-[196px] min-h-[50px]">
                            Invite Patients
                        </button>
                    </div>
                    <div className="md:w-1/3 flex justify-center absolute right-0 bottom-0">
                        <img src="/images/doctor-img.png" alt="Doctor" />
                    </div>
                </div>
                <div className="w-full bg-[#CDD3CC] order-form flex justify-between items-center p-4 mb-4">
                    <p className="text-black font-medium">BOVA Patient Order Form</p>
                    <button className="bg-black text-white font-semibold px-4 py-2 rounded">
                        Review Plan (2)
                    </button>
                </div>

                <div className='order-outer'>
                    <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Left Card */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <p className="text-gray-500 mb-4">
                                Add a new patient button takes you to the patient information form.
                            </p>
                            <label className="flex items-center mb-6">
                                <input type="radio" name="patient" className="mr-2" />
                                <span className="text-black">Add New Patient</span>
                            </label>
                            Link
                            <div className='text-right pt-4'>
                                <Link  href='/patients/create'className="bg-black text-white px-4 py-2 rounded ml-auto">
                                    Add Patient
                                </Link>
                            </div>
                        </div>

                        {/* Right Card */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <p className="text-gray-500 mb-4">
                                Select the patients you would like to update/review request.
                            </p>
                            <label className="flex items-center mb-2">
                                <input type="radio" name="patient" className="mr-2" />
                                <span className="text-black">Alex Smith</span>
                            </label>
                            <label className="flex items-center mb-6">
                                <input type="radio" name="patient" className="mr-2" />
                                <span className="text-black">Andrea Gold</span>
                            </label>
                            <div className='flex justify-between items-center'>
                                <p className="text-gray-500">Profit Margin: 25%</p>
                                <button className="bg-black text-white px-4 py-2 rounded">
                                    Updates Required
                                </button>
                            </div>
                        </div>

                    </div>
                </div>




            </div>
            <footer className='text-center p-5 bg-[#EBEDEB]'>
                <p>BOVA LABS 2024©</p>
              </footer>
        </AppLayout>
    )
}
