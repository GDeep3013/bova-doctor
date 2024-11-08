'use client'
import React from 'react'
import Link from 'next/link';
import AppLayout from 'components/Applayout';

export default function Profile() {


    return (
        <AppLayout>
            <div className="flex flex-col p-6">

                <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg">

                    <div className="bg-customBg3 p-4 rounded-t-lg w-full flex justify-between items-center"><span className="text-[19px] text-black">Patient Profile</span></div>

                    <div className="p-7 space-y-2 text-gray-700">
                        <div className="bg-[#EBEDEB] p-4 rounded-[8px] flex justify-between items-center">
                            <span className="font-medium text-base text-gray-700">
                            Patient Name: <span>Mary Klein</span>
                            </span>
                            <span className="text-gray-600 text-base">Date Created: 10.21.24</span>
                        </div>
                        <p className='flex justify-between p-2'>
                            <span className="text-textColor text-base">Patient Email:</span> <span className='text-left min-w-[126px]'> mary@gmail.com </span>
                        </p>
                        <p className='flex justify-between p-2'>
                            <span className="text-textColor text-base">Patient Phone Number:</span> <span className='text-left min-w-[126px]'> 1-778-888-9999 </span>
                        </p>
                        <p className='flex justify-between p-2'>
                            <span className="text-textColor text-base">Discount Rate:</span> <span className='text-left min-w-[126px]'> 10% </span>
                        </p>
                        <p className='flex justify-between p-2'>
                            <span className="text-textColor text-base">Current Subscriptions:</span> <span className='text-left min-w-[126px]'> L-01 </span>
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="p-4 flex justify-end">
                        <Link href="/create-plan">
                            <button className="py-2 px-4 bg-black text-white rounded-[8px] hover:bg-customText min-w-[196px] min-h-[50px]">
                                Create Plan
                            </button>
                        </Link>
                    </div>
                </div>

            </div>
        </AppLayout>
    )
}
