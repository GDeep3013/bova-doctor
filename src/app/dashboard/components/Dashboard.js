
'use client'; ;
import AppLayout from '../../../components/Applayout'
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import React, { useState,useEffect } from 'react'

export default function Dashboard() {
    const { data: session } = useSession();

    return (
        <AppLayout>
             <div className="flex flex-col">
                    <h1 className='page-title pt-4 md:pt-2 pb-4 text-2xl'>Home</h1>
                    <div className="w-full max-w-3xl bg-white rounded-lg border border-[#AFAAAC]">
                        <h2 className="text-lg md:text-xl font-semibold p-[16px] md:p-5 border-b border-[#AFAAAC]">BOVA Patient Order Form</h2>
                        <div className="border-b border-[#AFAAAC] flex items-center p-5 pb-4 md:pb-6 max-[767px]:flex-wrap">

                            <div className='patient-details max-w-[300px] w-full'>
                            <div className="flex items-center mb-4">
                                <input type="checkbox" name="patient" className="mr-2" />
                                <span className="text-gray-600">Add Patient</span>
                            </div>
                            <Link href='/patients/create' className="py-2 px-4 bg-customBg2 border border-customBg2 text-white rounded-[8px] hover:text-customBg2 hover:bg-inherit">
                                Add Patient
                            </Link>
                            </div>

                            <p className="text-sm text-gray-500 mt-2 w-full">Add patient button takes you to the patient information form.</p>

                        </div>

                        {/* Existing Patients Section */}
                        <div className="p-5 max-[767px]:pb-4 flex items-center max-[767px]:flex-wrap">
                        <div className='patient-details max-w-[300px] w-full'>
                            <div className="flex items-center mb-4">
                                <input
                                    type="checkbox"
                                    name="patient"
                                    className="mr-2"
                                />
                                <span className="text-gray-600">Alex Smith</span>
                            </div>
                            <div className="flex items-center mb-2">
                                <input
                                    type="checkbox"
                                    name="patient"
                                    className="mr-2"
                                />
                                <span className="text-gray-600">Andrea Gold</span>
                            </div>
                            <button className="py-2 px-4 bg-customBg2 border border-customBg2 text-white rounded-[8px] hover:text-customBg2 hover:bg-inherit">
                                Updates Required
                            </button>

                            </div>

                            <p className="text-sm w-full text-gray-500 mt-2">Select the patients you would like to update/review request.</p>
                        </div>

                        {/* Profit Margin Section */}
                        <div className="border-t border-[#AFAAAC] p-5 pt-4 text-gray-600">
                            <p>Profit Margin: 25%</p>
                        </div>
                    </div>

                    {/* Footer Message */}
                    <div className="w-full max-w-3xl bg-[#d6dee5] p-[20px] md:p-8 mt-6 rounded-lg">
                        <p>Welcome to your BOVA <span className="font-semibold">[Name of Doctor]</span></p>
                        <p className="mt-2">We will be launching the full site access in less than 2 weeks!</p>
                        <p className="mt-2 font-semibold">Stay tuned.<br />Team BOVA</p>
                    </div>
                </div>

        </AppLayout>
    )
}
